import { Document } from "@langchain/core/documents";
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PDFDocument } from "pdf-lib";
import { PDFParse } from "pdf-parse";
import { DmsService } from "src/dms/dms.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UnstructuredClient } from "unstructured-client";

import { v4 as uuidv4 } from "uuid";
import { ManualIngestionPipelineService } from "./manual-ingestion-pipeline.service";
import { QdrantService } from "./qdrant.service";
import { SmartPdfProcessingResult, SmartPdfService } from "./smart-pdf.service";

interface ManualExternalMetadata {
  s3Key: string | null;
  carModel: string | null;
  vectorRef: string | null;
  organizationId: string | null;
}

@Injectable()
export class DocumentParserService {
  private readonly logger = new Logger(DocumentParserService.name);
  private readonly qdrantBatchSize = 64;
  private readonly maxPageContentLength = 3500;
  private readonly maxHtmlMetadataLength = 6000;
  private unstructuredClient: UnstructuredClient;

  constructor(
    private readonly dmsService: DmsService,
    private readonly qdrantService: QdrantService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly smartPdfService: SmartPdfService,
    private readonly manualIngestionPipelineService: ManualIngestionPipelineService,
  ) {
    const serverURL =
      this.configService.get<string>("UNSTRUCTURED_API_URL") ||
      "http://localhost:8000";
    this.unstructuredClient = new UnstructuredClient({
      serverURL,
      retryConfig: { strategy: "none" },
    });
  }

  async processAndStoreManual(
    file: Express.Multer.File,
    carModel: string,
    organizationId: string,
  ) {
    this.logger.log(
      `Починаємо AI-парсинг посібника для: ${carModel} через Unstructured...`,
    );
    const manualVectorRef = uuidv4();
    let vectorsIndexed = false;
    let indexedChunks = 0;
    const debugSinglePageOnly = this.isFlagEnabled(
      "RAG_DEBUG_SINGLE_PAGE_ONLY",
    );
    const debugLogsOnly = this.isFlagEnabled("RAG_DEBUG_LOGS_ONLY");

    try {
      const optimizedPdf = debugSinglePageOnly
        ? await this.buildSinglePageOptimizedPdf(file.buffer)
        : await this.smartPdfService.processSmartPdf(file.buffer);

      if (debugSinglePageOnly) {
        this.logger.warn(
          "[DEBUG] RAG_DEBUG_SINGLE_PAGE_ONLY=true -> Smart ToC filtering is bypassed; only page 1 is processed.",
        );
      }

      if (debugLogsOnly) {
        this.logger.warn(
          "[DEBUG] RAG_DEBUG_LOGS_ONLY=true -> S3/Qdrant/DB writes are disabled; logging only.",
        );
      }

      const keptRanges = optimizedPdf.ranges;
      const keptPages = this.expandRangesToPages(keptRanges);
      const discardedRanges = this.getDiscardedRanges(
        optimizedPdf.originalPages,
        keptRanges,
      );
      const discardedPages = this.expandRangesToPages(discardedRanges);

      this.logger.log(
        `Original pages: ${optimizedPdf.originalPages}, Filtered pages: ${optimizedPdf.filteredPages}. Reduction: ${optimizedPdf.reductionPercent}%.`,
      );
      this.logger.log(
        `[SMART FILTER DEBUG] Kept ranges: ${this.formatRanges(keptRanges)}`,
      );
      this.logger.log(
        `[SMART FILTER DEBUG] Discarded ranges: ${this.formatRanges(discardedRanges)}`,
      );
      this.logger.log(
        `[SMART FILTER DEBUG] Kept pages (${keptPages.length}): ${keptPages.join(", ")}`,
      );
      this.logger.log(
        `[SMART FILTER DEBUG] Discarded pages (${discardedPages.length}): ${discardedPages.join(", ")}`,
      );

      if (optimizedPdf.mode === "safe") {
        this.logger.warn(
          `Smart filter fallback applied for ${file.originalname}. ${optimizedPdf.reasoning}`,
        );
      }

      const { elements, mode: partitionMode } =
        await this.partitionWithFallback(
          optimizedPdf.filteredBuffer,
          file.originalname,
        );

      this.logger.log(
        `Unstructured (${partitionMode}) повернув ${elements.length} інтелектуальних блоків. Обробляємо...`,
      );

      const langchainDocs: Document[] = [];

      for (const element of elements) {
        const filteredPageNumber = this.normalizePageNumber(
          element.metadata?.page_number,
        );
        const originalPageNumber = this.mapFilteredPageToOriginalPage(
          filteredPageNumber,
          keptRanges,
        );
        const pageNumber = originalPageNumber ?? filteredPageNumber;
        const metadata: Record<string, any> = {
          vectorRef: manualVectorRef,
          carModel,
          organizationId,
          source: file.originalname,
          pageNumber,
          originalPageNumber: pageNumber,
          filteredPageNumber,
          type: element.type,
        };

        let pageContent = element.text || "";

        if (element.type === "Table" && element.metadata?.text_as_html) {
          metadata.html = this.truncateText(
            element.metadata.text_as_html,
            this.maxHtmlMetadataLength,
          );
          pageContent = `Таблиця з посібника ${carModel}:\n${element.text}`;
        }

        if (element.type === "Image") {
          continue;
        }

        if (pageContent.trim().length > 0) {
          const normalizedPageContent = this.truncateText(
            pageContent,
            this.maxPageContentLength,
          );

          langchainDocs.push(
            new Document({
              pageContent: normalizedPageContent,
              metadata,
            }),
          );
        }
      }

      if (debugLogsOnly) {
        this.logLangchainDocsDebugPreview(langchainDocs);
      }

      this.logger.log(
        `Генеруємо retrieval-summary для ${langchainDocs.length} блоків і зберігаємо в Multi-Vector сховище...`,
      );

      if (langchainDocs.length > 0) {
        const indexingSummary =
          await this.manualIngestionPipelineService.indexManualChunks({
            chunks: langchainDocs,
            vectorRef: manualVectorRef,
            carModel,
            organizationId,
            source: file.originalname,
          });
        indexedChunks = indexingSummary.indexedChunks;
        vectorsIndexed = indexedChunks > 0;

        if (indexingSummary.skippedChunks > 0) {
          this.logger.warn(
            `Skipped ${indexingSummary.skippedChunks} chunks during summary/vector indexing due to malformed payload/content.`,
          );
        }
      } else {
        this.logger.warn(
          `Після smart filtering і partition не знайдено текстових блоків для ${file.originalname}.`,
        );
      }

      if (debugLogsOnly) {
        return {
          success: true,
          debugMode: true,
          chunksProcessed: indexedChunks,
          manual: {
            id: null,
            filename: file.originalname,
            carModel,
            createdAt: new Date(),
          },
          smartFilter: {
            mode: optimizedPdf.mode,
            originalPages: optimizedPdf.originalPages,
            filteredPages: optimizedPdf.filteredPages,
            reductionPercent: optimizedPdf.reductionPercent,
            keptRanges,
            discardedRanges,
            keptPages,
            discardedPages,
            reasoning: optimizedPdf.reasoning,
          },
          note: "Logs-only debug mode enabled: no S3/Qdrant/DB writes were executed.",
        };
      }

      const manualUpload = await this.dmsService.uploadSingleFile({
        file,
        isPublic: false,
        tenantId: organizationId,
        folder: "manuals/files",
      });

      const extractedPreview = langchainDocs
        .map((doc) => doc.pageContent)
        .join("\n\n")
        .slice(0, 20000);

      const manualRecord = await this.prismaService.document.create({
        data: {
          filename: file.originalname,
          content: extractedPreview || `Manual for ${carModel}`,
          organizationId,
          externalId: this.encodeManualExternalMetadata({
            s3Key: manualUpload.key,
            carModel,
            vectorRef: manualVectorRef,
            organizationId,
          }),
        },
      });

      this.logger.log(
        `Посібник ${carModel} успішно оброблено. Вектори збережено в Qdrant.`,
      );

      return {
        success: true,
        debugMode: false,
        chunksProcessed: indexedChunks,
        manual: {
          id: manualRecord.id,
          filename: manualRecord.filename,
          carModel,
          createdAt: manualRecord.createdAt,
        },
        smartFilter: {
          mode: optimizedPdf.mode,
          originalPages: optimizedPdf.originalPages,
          filteredPages: optimizedPdf.filteredPages,
          reductionPercent: optimizedPdf.reductionPercent,
          keptRanges,
          discardedRanges,
          keptPages,
          discardedPages,
          reasoning: optimizedPdf.reasoning,
        },
      };
    } catch (error) {
      if (vectorsIndexed) {
        await this.qdrantService.deleteManualVectors({
          vectorRef: manualVectorRef,
          filename: file.originalname,
          carModel,
        });
        await this.manualIngestionPipelineService.deleteManualOriginals(
          manualVectorRef,
        );
        this.logger.warn(
          `Виконано rollback векторів і docstore-оригіналів для ${file.originalname} після помилки обробки.`,
        );
      }

      this.logger.error("Помилка під час AI-парсингу PDF:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        "Не вдалося розпарсити посібник через Unstructured",
      );
    }
  }

  async getManuals(organizationId: string, search?: string) {
    const normalizedSearch = search?.trim().toLowerCase();

    const documents = await this.prismaService.document.findMany({
      where: {
        organizationId,
        externalId: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 200,
    });

    return documents
      .map((doc) => {
        const metadata = this.parseManualExternalMetadata(doc.externalId);
        return {
          id: doc.id,
          filename: doc.filename,
          carModel: metadata.carModel,
          createdAt: doc.createdAt,
          s3Key: metadata.s3Key,
        };
      })
      .filter((item) => Boolean(item.s3Key))
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        const filename = item.filename.toLowerCase();
        const carModel = item.carModel?.toLowerCase() || "";

        return (
          filename.includes(normalizedSearch) ||
          carModel.includes(normalizedSearch)
        );
      })
      .map(({ s3Key, ...item }) => item);
  }

  async getManualOpenLink(id: string, organizationId: string) {
    const manual = await this.prismaService.document.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!manual) {
      throw new NotFoundException("Посібник не знайдено");
    }

    const metadata = this.parseManualExternalMetadata(manual.externalId);

    if (!metadata.s3Key) {
      throw new NotFoundException("Для цього посібника не знайдено PDF-файл");
    }

    const { url } = await this.dmsService.getPresignedSignedUrl(metadata.s3Key);

    return {
      url,
      filename: manual.filename,
      carModel: metadata.carModel,
    };
  }

  async deleteManual(id: string, organizationId: string) {
    const manual = await this.prismaService.document.findFirst({
      where: { id, organizationId },
    });

    if (!manual) {
      throw new NotFoundException("Посібник не знайдено");
    }

    const metadata = this.parseManualExternalMetadata(manual.externalId);
    let storageCleanupPending = false;

    if (metadata.s3Key) {
      try {
        await this.dmsService.deleteFile(metadata.s3Key);
      } catch (error) {
        if (this.isS3DeleteAccessDenied(error)) {
          storageCleanupPending = true;
          this.logger.warn(
            `Manual ${manual.id}: S3 object cleanup is pending due to missing DeleteObject permission.`,
          );
        } else {
          throw error;
        }
      }
    }

    await this.qdrantService.deleteManualVectors({
      vectorRef: metadata.vectorRef,
      filename: manual.filename,
      carModel: metadata.carModel,
    });

    await this.manualIngestionPipelineService.deleteManualOriginals(
      metadata.vectorRef,
    );

    await this.prismaService.document.delete({
      where: { id },
    });

    return {
      id: manual.id,
      filename: manual.filename,
      carModel: metadata.carModel,
      storageCleanupPending,
    };
  }

  private encodeManualExternalMetadata(metadata: {
    s3Key: string;
    carModel: string;
    vectorRef: string;
    organizationId: string;
  }) {
    return JSON.stringify(metadata);
  }

  private parseManualExternalMetadata(
    externalId: string | null,
  ): ManualExternalMetadata {
    if (!externalId) {
      return {
        s3Key: null,
        carModel: null,
        vectorRef: null,
        organizationId: null,
      };
    }

    try {
      const parsed = JSON.parse(externalId);
      if (parsed && typeof parsed === "object") {
        return {
          s3Key: typeof parsed.s3Key === "string" ? parsed.s3Key : null,
          carModel:
            typeof parsed.carModel === "string" ? parsed.carModel : null,
          vectorRef:
            typeof parsed.vectorRef === "string" ? parsed.vectorRef : null,
          organizationId:
            typeof parsed.organizationId === "string"
              ? parsed.organizationId
              : null,
        };
      }
    } catch {}

    return {
      s3Key: externalId.toLowerCase().includes(".pdf") ? externalId : null,
      carModel: null,
      vectorRef: null,
      organizationId: null,
    };
  }

  private expandRangesToPages(ranges: Array<[number, number]>) {
    const pages: number[] = [];
    for (const [start, end] of ranges) {
      for (let page = start; page <= end; page++) {
        pages.push(page);
      }
    }
    return pages;
  }

  private getDiscardedRanges(
    totalPages: number,
    keptRanges: Array<[number, number]>,
  ) {
    if (totalPages <= 0) {
      return [];
    }

    if (!keptRanges.length) {
      return [[1, totalPages]] as Array<[number, number]>;
    }

    const discarded: Array<[number, number]> = [];
    let cursor = 1;

    for (const [start, end] of keptRanges) {
      if (cursor < start) {
        discarded.push([cursor, start - 1]);
      }
      cursor = Math.max(cursor, end + 1);
    }

    if (cursor <= totalPages) {
      discarded.push([cursor, totalPages]);
    }

    return discarded;
  }

  private formatRanges(ranges: Array<[number, number]>) {
    if (!ranges.length) {
      return "none";
    }

    return ranges.map(([start, end]) => `${start}-${end}`).join(", ");
  }

  private truncateText(value: unknown, maxLength: number) {
    if (typeof value !== "string") {
      return "";
    }

    if (value.length <= maxLength) {
      return value;
    }

    return `${value.slice(0, maxLength)}...`;
  }

  private normalizePageNumber(value: unknown): number | null {
    const pageNumber = Number(value);
    if (!Number.isFinite(pageNumber) || pageNumber <= 0) {
      return null;
    }

    return Math.floor(pageNumber);
  }

  private mapFilteredPageToOriginalPage(
    filteredPageNumber: number | null,
    keptRanges: Array<[number, number]>,
  ): number | null {
    if (filteredPageNumber === null) {
      return null;
    }

    if (!keptRanges.length) {
      return filteredPageNumber;
    }

    let filteredCursor = 1;

    for (const [start, end] of keptRanges) {
      const rangeLength = end - start + 1;
      const filteredRangeEnd = filteredCursor + rangeLength - 1;

      if (
        filteredPageNumber >= filteredCursor &&
        filteredPageNumber <= filteredRangeEnd
      ) {
        return start + (filteredPageNumber - filteredCursor);
      }

      filteredCursor = filteredRangeEnd + 1;
    }

    return filteredPageNumber;
  }

  private async addDocumentsToQdrantInBatches(documents: Document[]) {
    const totalBatches = Math.ceil(documents.length / this.qdrantBatchSize);
    let indexedDocs = 0;
    let skippedDocs = 0;

    for (let i = 0; i < documents.length; i += this.qdrantBatchSize) {
      const batchIndex = Math.floor(i / this.qdrantBatchSize) + 1;
      const batch = documents.slice(i, i + this.qdrantBatchSize);
      const batchResult = await this.addDocumentsBatchWithFallback(
        batch,
        batchIndex,
        totalBatches,
      );
      indexedDocs += batchResult.indexedDocs;
      skippedDocs += batchResult.skippedDocs;
      this.logger.log(
        `Qdrant batch ${batchIndex}/${totalBatches} processed: indexed=${batchResult.indexedDocs}, skipped=${batchResult.skippedDocs}.`,
      );
    }

    return {
      indexedDocs,
      skippedDocs,
    };
  }

  private async addDocumentsBatchWithFallback(
    batch: Document[],
    batchIndex: number,
    totalBatches: number,
  ) {
    const sanitizedBatch = batch.map((doc) =>
      this.sanitizeDocumentForEmbedding(doc),
    );

    try {
      await this.qdrantService.vectorStore.addDocuments(sanitizedBatch);
      return {
        indexedDocs: sanitizedBatch.length,
        skippedDocs: 0,
      };
    } catch (error) {
      if (!this.isOpenAiJsonPayloadError(error)) {
        throw error;
      }

      this.logger.warn(
        `Batch ${batchIndex}/${totalBatches} failed with malformed JSON payload error. Retrying per-document fallback.`,
      );

      let indexedDocs = 0;
      let skippedDocs = 0;

      for (const document of sanitizedBatch) {
        try {
          await this.qdrantService.vectorStore.addDocuments([document]);
          indexedDocs += 1;
        } catch (docError) {
          skippedDocs += 1;
          this.logger.warn(
            `Skipping one chunk after per-document fallback failure: ${this.formatErrorForLog(docError)}`,
          );
        }
      }

      if (indexedDocs === 0) {
        throw error;
      }

      return {
        indexedDocs,
        skippedDocs,
      };
    }
  }

  private sanitizeDocumentForEmbedding(document: Document) {
    return new Document({
      pageContent: this.sanitizeTextForEmbedding(document.pageContent),
      metadata: document.metadata,
    });
  }

  private sanitizeTextForEmbedding(value: string) {
    if (!value) {
      return "";
    }

    return value
      .replace(/\u0000/g, " ")
      .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private isOpenAiJsonPayloadError(error: unknown) {
    const message = this.formatErrorForLog(error).toLowerCase();
    return (
      message.includes("could not parse the json body of your request") ||
      message.includes("not valid json") ||
      message.includes("invalid json")
    );
  }

  private async partitionWithFallback(pdfBuffer: Buffer, fileName: string) {
    const chunkingConfig = this.resolveUnstructuredChunkingConfig();
    const totalPages = await this.getPdfPageCount(pdfBuffer);
    const localTextFallbackEnabled = this.isFlagEnabled(
      "RAG_UNSTRUCTURED_LOCAL_TEXT_FALLBACK",
    );
    const partitionBatchThresholdPages = this.resolvePositiveIntegerConfig(
      "RAG_UNSTRUCTURED_PARTITION_BATCH_THRESHOLD_PAGES",
      180,
    );
    const partitionBatchPageSize = 2;
    const partitionBatchRetryCount = this.resolvePositiveIntegerConfig(
      "RAG_UNSTRUCTURED_PARTITION_BATCH_RETRY_COUNT",
      2,
    );
    const partitionBatchRetryDelayMs = this.resolvePositiveIntegerConfig(
      "RAG_UNSTRUCTURED_PARTITION_BATCH_RETRY_DELAY_MS",
      1200,
    );
    const partitionMinSplitPageSize = this.resolvePositiveIntegerConfig(
      "RAG_UNSTRUCTURED_PARTITION_MIN_SPLIT_PAGE_SIZE",
      10,
    );
    const shouldUseBatchedPartition = totalPages > partitionBatchThresholdPages;

    const attempts: Array<{
      mode: "hi_res" | "ocr_only" | "fast";
      params: {
        strategy: any;
        coordinates: boolean;
        splitPdfPage: false;
        pdfInferTableStructure: boolean;
        extractImageBlockTypes: string[];
        chunkingStrategy: string;
        maxCharacters: number;
        combineUnderNChars: number;
        newAfterNChars: number;
        multipageSections: boolean;
        includeOrigElements: boolean;
      };
    }> = [
      {
        mode: "hi_res",
        params: {
          strategy: "hi_res" as any,
          coordinates: true,
          splitPdfPage: false,
          pdfInferTableStructure: true,
          extractImageBlockTypes: ["Image"],
          ...chunkingConfig,
        },
      },
      {
        mode: "ocr_only",
        params: {
          strategy: "ocr_only" as any,
          coordinates: true,
          splitPdfPage: false,
          pdfInferTableStructure: false,
          extractImageBlockTypes: [],
          ...chunkingConfig,
        },
      },
      {
        mode: "fast",
        params: {
          strategy: "fast" as any,
          coordinates: false,
          splitPdfPage: false,
          pdfInferTableStructure: false,
          extractImageBlockTypes: [],
          ...chunkingConfig,
        },
      },
    ];

    let lastError: unknown = null;

    for (const attempt of attempts) {
      try {
        this.logger.log(
          `Partition attempt: mode=${attempt.mode}, splitPdfPage=false, chunkingStrategy=${attempt.params.chunkingStrategy}, maxCharacters=${attempt.params.maxCharacters}, combineUnderNChars=${attempt.params.combineUnderNChars}, newAfterNChars=${attempt.params.newAfterNChars}, totalPages=${totalPages}, batched=${shouldUseBatchedPartition}`,
        );

        if (shouldUseBatchedPartition) {
          const elements = await this.partitionPdfInBatches({
            pdfBuffer,
            fileName,
            attemptMode: attempt.mode,
            attemptParams: attempt.params,
            totalPages,
            batchPageSize: partitionBatchPageSize,
            retryCount: partitionBatchRetryCount,
            retryDelayMs: partitionBatchRetryDelayMs,
            minSplitPageSize: partitionMinSplitPageSize,
          });

          return {
            elements,
            mode: attempt.mode,
          };
        }

        const response = await this.unstructuredClient.general.partition({
          partitionParameters: {
            files: {
              content: new Uint8Array(pdfBuffer),
              fileName,
            },
            ...attempt.params,
          },
        });

        const rawResponse: any = response;
        const elements =
          rawResponse?.elements ||
          (Array.isArray(rawResponse) ? rawResponse : []);

        return {
          elements,
          mode: attempt.mode,
        };
      } catch (error) {
        if (
          !shouldUseBatchedPartition &&
          totalPages > 1 &&
          this.isRetryableUnstructuredError(error)
        ) {
          this.logger.warn(
            `Partition attempt failed for mode=${attempt.mode}. Retrying in batched mode due to retryable upstream error.`,
          );

          try {
            const elements = await this.partitionPdfInBatches({
              pdfBuffer,
              fileName,
              attemptMode: attempt.mode,
              attemptParams: attempt.params,
              totalPages,
              batchPageSize: partitionBatchPageSize,
              retryCount: partitionBatchRetryCount,
              retryDelayMs: partitionBatchRetryDelayMs,
              minSplitPageSize: partitionMinSplitPageSize,
            });

            return {
              elements,
              mode: attempt.mode,
            };
          } catch (batchedError) {
            lastError = batchedError;
            this.logger.warn(
              `Partition batched retry failed for mode=${attempt.mode}: ${this.formatErrorForLog(batchedError)}`,
            );
            continue;
          }
        }

        lastError = error;
        this.logger.warn(
          `Partition attempt failed for mode=${attempt.mode}: ${this.formatErrorForLog(error)}`,
        );
      }
    }

    if (localTextFallbackEnabled) {
      try {
        this.logger.warn(
          `All Unstructured partition attempts failed. Activating local text fallback for ${fileName}.`,
        );
        const elements = await this.partitionWithLocalPdfText(
          pdfBuffer,
          totalPages,
        );
        return {
          elements,
          mode: "local_pdfparse",
        };
      } catch (localFallbackError) {
        this.logger.warn(
          `Local text fallback failed: ${this.formatErrorForLog(localFallbackError)}`,
        );
      }
    }

    throw lastError || new Error("All partition attempts failed");
  }

  private async partitionWithLocalPdfText(
    pdfBuffer: Buffer,
    totalPages: number,
  ) {
    const parser = new PDFParse({
      data: new Uint8Array(pdfBuffer),
    });

    try {
      const textResult = await parser.getText();
      const rawText =
        typeof textResult?.text === "string" ? textResult.text : "";
      const elements = this.buildLocalTextFallbackElements(rawText, totalPages);

      if (elements.length === 0) {
        throw new Error("Local parser extracted empty text payload");
      }

      this.logger.log(
        `Local text fallback extracted ${elements.length} elements from PDF text.`,
      );

      return elements;
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  }

  private buildLocalTextFallbackElements(rawText: string, totalPages: number) {
    if (!rawText || rawText.trim().length === 0) {
      return [] as any[];
    }

    const targetChunkSize = this.resolvePositiveIntegerConfig(
      "RAG_LOCAL_TEXT_FALLBACK_CHARS_PER_ELEMENT",
      1800,
    );
    const cleanedText = rawText
      .replace(/\u0000/g, " ")
      .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
      .replace(/\r/g, "\n");
    const blocks = cleanedText
      .split(/\n\s*\n+/)
      .map((block) => block.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const sourceBlocks =
      blocks.length > 0 ? blocks : [cleanedText.replace(/\s+/g, " ").trim()];
    const chunks: string[] = [];
    let currentChunk = "";

    for (const block of sourceBlocks) {
      const candidate = currentChunk ? `${currentChunk}\n\n${block}` : block;

      if (candidate.length <= targetChunkSize || !currentChunk) {
        currentChunk = candidate;
        continue;
      }

      chunks.push(currentChunk);
      currentChunk = block;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    const totalChars = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const charsPerPageEstimate =
      totalPages > 0 && totalChars > 0
        ? Math.max(600, Math.floor(totalChars / totalPages))
        : 0;
    const elements: any[] = [];
    let consumedChars = 0;

    for (const chunk of chunks) {
      if (!chunk.trim()) {
        continue;
      }

      const estimatedPageNumber =
        charsPerPageEstimate > 0
          ? Math.min(
              totalPages,
              Math.max(1, Math.floor(consumedChars / charsPerPageEstimate) + 1),
            )
          : undefined;

      elements.push({
        type: "NarrativeText",
        text: chunk,
        metadata: {
          page_number: estimatedPageNumber,
          extraction_source: "local_pdfparse_fallback",
        },
      });

      consumedChars += chunk.length;
    }

    return elements;
  }

  private async partitionPdfInBatches(params: {
    pdfBuffer: Buffer;
    fileName: string;
    attemptMode: "hi_res" | "ocr_only" | "fast";
    attemptParams: any;
    totalPages: number;
    batchPageSize: number;
    retryCount: number;
    retryDelayMs: number;
    minSplitPageSize: number;
  }) {
    const pageRanges = this.buildPageRanges(
      params.totalPages,
      Math.max(1, params.batchPageSize),
    );
    const allElements: any[] = [];

    this.logger.log(
      `Partitioning in batches: mode=${params.attemptMode}, totalPages=${params.totalPages}, batches=${pageRanges.length}, pageSize=${params.batchPageSize}.`,
    );

    for (let i = 0; i < pageRanges.length; i += 1) {
      const [startPage, endPage] = pageRanges[i];
      const batchElements = await this.partitionRangeResilient({
        pdfBuffer: params.pdfBuffer,
        fileName: params.fileName,
        attemptParams: params.attemptParams,
        startPage,
        endPage,
        retryCount: params.retryCount,
        retryDelayMs: params.retryDelayMs,
        minSplitPageSize: params.minSplitPageSize,
      });
      allElements.push(...batchElements);

      this.logger.log(
        `Partition batch ${i + 1}/${pageRanges.length} completed for pages ${startPage}-${endPage}: elements=${batchElements.length}.`,
      );
    }

    return allElements;
  }

  private async partitionRangeResilient(params: {
    pdfBuffer: Buffer;
    fileName: string;
    attemptParams: any;
    startPage: number;
    endPage: number;
    retryCount: number;
    retryDelayMs: number;
    minSplitPageSize: number;
  }): Promise<any[]> {
    let lastError: unknown = null;

    for (
      let attemptIndex = 0;
      attemptIndex <= params.retryCount;
      attemptIndex += 1
    ) {
      try {
        const batchBuffer = await this.extractPdfPageRange(
          params.pdfBuffer,
          params.startPage,
          params.endPage,
        );

        const response = await this.unstructuredClient.general.partition({
          partitionParameters: {
            files: {
              content: new Uint8Array(batchBuffer),
              fileName: this.buildPartitionBatchFileName(
                params.fileName,
                params.startPage,
                params.endPage,
              ),
            },
            ...params.attemptParams,
          },
        });

        const rawResponse: any = response;
        const elements =
          rawResponse?.elements ||
          (Array.isArray(rawResponse) ? rawResponse : []);
        const offset = params.startPage - 1;
        this.applyPageNumberOffset(elements, offset);

        return elements;
      } catch (error) {
        lastError = error;
        if (
          !this.isRetryableUnstructuredError(error) ||
          attemptIndex >= params.retryCount
        ) {
          break;
        }

        const waitMs = params.retryDelayMs * (attemptIndex + 1);
        this.logger.warn(
          `Retrying partition range ${params.startPage}-${params.endPage} after retryable error (attempt ${attemptIndex + 1}/${params.retryCount + 1}, wait=${waitMs}ms): ${this.formatErrorForLog(error)}`,
        );
        await this.delay(waitMs);
      }
    }

    const pageCount = params.endPage - params.startPage + 1;
    if (
      lastError &&
      this.isRetryableUnstructuredError(lastError) &&
      pageCount > params.minSplitPageSize
    ) {
      const midPage = Math.floor((params.startPage + params.endPage) / 2);
      if (midPage <= params.startPage || midPage >= params.endPage) {
        throw lastError;
      }

      this.logger.warn(
        `Splitting overloaded partition range ${params.startPage}-${params.endPage} into ${params.startPage}-${midPage} and ${midPage + 1}-${params.endPage}.`,
      );

      const left = await this.partitionRangeResilient({
        ...params,
        startPage: params.startPage,
        endPage: midPage,
      });
      const right = await this.partitionRangeResilient({
        ...params,
        startPage: midPage + 1,
        endPage: params.endPage,
      });

      return [...left, ...right];
    }

    throw lastError || new Error("Partition range processing failed");
  }

  private async delay(ms: number) {
    if (ms <= 0) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildPageRanges(totalPages: number, pageSize: number) {
    if (totalPages <= 0) {
      return [] as Array<[number, number]>;
    }

    const ranges: Array<[number, number]> = [];
    for (let start = 1; start <= totalPages; start += pageSize) {
      const end = Math.min(totalPages, start + pageSize - 1);
      ranges.push([start, end]);
    }

    return ranges;
  }

  private async getPdfPageCount(pdfBuffer: Buffer) {
    const pdf = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });
    return pdf.getPageCount();
  }

  private async extractPdfPageRange(
    pdfBuffer: Buffer,
    startPage: number,
    endPage: number,
  ) {
    const source = await PDFDocument.load(pdfBuffer, {
      ignoreEncryption: true,
    });
    const totalPages = source.getPageCount();
    const clampedStart = Math.max(1, Math.min(totalPages, startPage));
    const clampedEnd = Math.max(clampedStart, Math.min(totalPages, endPage));
    const output = await PDFDocument.create();

    const pageIndexes = Array.from(
      { length: clampedEnd - clampedStart + 1 },
      (_, index) => clampedStart - 1 + index,
    );
    const copiedPages = await output.copyPages(source, pageIndexes);
    for (const page of copiedPages) {
      output.addPage(page);
    }

    const bytes = await output.save();
    return Buffer.from(bytes);
  }

  private applyPageNumberOffset(elements: any[], offset: number) {
    if (!offset || !Array.isArray(elements) || elements.length === 0) {
      return;
    }

    for (const element of elements) {
      if (!element || typeof element !== "object") {
        continue;
      }

      const metadata = (element as { metadata?: any }).metadata;
      if (!metadata || typeof metadata !== "object") {
        continue;
      }

      const rawPageNumber = Number(metadata.page_number);
      if (!Number.isFinite(rawPageNumber) || rawPageNumber <= 0) {
        continue;
      }

      metadata.page_number = Math.floor(rawPageNumber) + offset;
    }
  }

  private buildPartitionBatchFileName(
    fileName: string,
    startPage: number,
    endPage: number,
  ) {
    const sanitizedName = fileName.replace(/\.pdf$/i, "");
    return `${sanitizedName}_pages_${startPage}-${endPage}.pdf`;
  }

  private isRetryableUnstructuredError(error: unknown) {
    const message = this.formatErrorForLog(error).toLowerCase();
    return (
      message.includes("server is under heavy load") ||
      message.includes("service unavailable") ||
      message.includes("status code 503") ||
      message.includes("fetch failed") ||
      message.includes("timeout")
    );
  }

  private resolveUnstructuredChunkingConfig() {
    return {
      chunkingStrategy:
        (
          this.configService.get<string>(
            "RAG_UNSTRUCTURED_CHUNKING_STRATEGY",
          ) || "by_title"
        ).trim() || "by_title",
      maxCharacters: this.resolvePositiveIntegerConfig(
        "RAG_UNSTRUCTURED_MAX_CHARACTERS",
        1500,
      ),
      combineUnderNChars: this.resolvePositiveIntegerConfig(
        "RAG_UNSTRUCTURED_COMBINE_UNDER_N_CHARS",
        500,
      ),
      newAfterNChars: this.resolvePositiveIntegerConfig(
        "RAG_UNSTRUCTURED_NEW_AFTER_N_CHARS",
        1200,
      ),
      multipageSections: this.isFlagEnabled(
        "RAG_UNSTRUCTURED_MULTIPAGE_SECTIONS",
      ),
      includeOrigElements: false,
    };
  }

  private resolvePositiveIntegerConfig(name: string, defaultValue: number) {
    const parsed = Number(this.configService.get<string>(name));

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return defaultValue;
    }

    return Math.floor(parsed);
  }

  private formatErrorForLog(error: unknown) {
    if (!error) {
      return "Unknown error";
    }

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }

  private isS3DeleteAccessDenied(error: unknown) {
    if (!error || typeof error !== "object") {
      return false;
    }

    const e = error as {
      response?: {
        statusCode?: number;
      };
      message?: string;
    };

    const message = (e.message || "").toLowerCase();

    return (
      e.response?.statusCode === 403 ||
      message.includes("deleteobject access denied") ||
      message.includes("access denied")
    );
  }

  private isFlagEnabled(name: string) {
    const value = (this.configService.get<string>(name) || "")
      .trim()
      .toLowerCase();
    return (
      value === "1" || value === "true" || value === "yes" || value === "on"
    );
  }

  private async buildSinglePageOptimizedPdf(
    fileBuffer: Buffer,
  ): Promise<SmartPdfProcessingResult> {
    const source = await PDFDocument.load(fileBuffer, {
      ignoreEncryption: true,
    });
    const originalPages = source.getPageCount();

    if (originalPages === 0) {
      return {
        filteredBuffer: fileBuffer,
        originalPages: 0,
        filteredPages: 0,
        reductionPercent: 0,
        ranges: [],
        reasoning: "Single-page debug mode: input PDF has no pages.",
        mode: "safe",
      };
    }

    const output = await PDFDocument.create();
    const copiedPages = await output.copyPages(source, [0]);
    output.addPage(copiedPages[0]);
    const bytes = await output.save();
    const filteredBuffer = Buffer.from(bytes);

    return {
      filteredBuffer,
      originalPages,
      filteredPages: 1,
      reductionPercent: Number(
        (((originalPages - 1) / originalPages) * 100).toFixed(2),
      ),
      ranges: [[1, 1]],
      reasoning:
        "Single-page debug mode: ToC search is disabled and only page 1 is processed.",
      mode: "safe",
    };
  }

  private logLangchainDocsDebugPreview(docs: Document[]) {
    if (!docs.length) {
      this.logger.warn("[DEBUG] No extracted text chunks to preview.");
      return;
    }

    const previewLimit = this.resolveDebugPreviewLimit();
    const previewCount = Math.min(previewLimit, docs.length);

    this.logger.log(
      `[DEBUG] Extracted chunks preview (showing ${previewCount} of ${docs.length}).`,
    );

    docs.slice(0, previewLimit).forEach((doc, index) => {
      const metadata = doc.metadata as Record<string, unknown>;
      this.logger.log(
        `[DEBUG][CHUNK ${index + 1}] page=${String(metadata.pageNumber ?? "unknown")} type=${String(metadata.type ?? "unknown")} text="${doc.pageContent.slice(0, 500)}"`,
      );
    });

    this.logDebugKeywordMatches(docs);
  }

  private resolveDebugPreviewLimit() {
    const rawValue = Number(
      this.configService.get<string>("RAG_DEBUG_PREVIEW_LIMIT") || 3,
    );

    if (!Number.isFinite(rawValue) || rawValue <= 0) {
      return 3;
    }

    return Math.min(Math.floor(rawValue), 100);
  }

  private logDebugKeywordMatches(docs: Document[]) {
    const keyword = (
      this.configService.get<string>("RAG_DEBUG_FIND_TEXT") || ""
    ).trim();

    if (!keyword) {
      return;
    }

    const normalizedKeyword = keyword.toLowerCase();
    const matchedDocs = docs.filter((doc) =>
      doc.pageContent.toLowerCase().includes(normalizedKeyword),
    );

    this.logger.log(
      `[DEBUG] Keyword scan for "${keyword}": matched ${matchedDocs.length} of ${docs.length} chunks.`,
    );

    const matchPreviewCount = Math.min(5, matchedDocs.length);
    for (let i = 0; i < matchPreviewCount; i += 1) {
      const doc = matchedDocs[i];
      const metadata = doc.metadata as Record<string, unknown>;
      this.logger.log(
        `[DEBUG][KEYWORD MATCH ${i + 1}] page=${String(metadata.pageNumber ?? "unknown")} type=${String(metadata.type ?? "unknown")} text="${doc.pageContent.slice(0, 500)}"`,
      );
    }
  }
}
