import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ManualRetrieverService } from 'src/langchain-integration/services/manual-retriever.service';
import { AgentState } from '../../state';
import { handleToolCalls } from '../../utils/tool-calls';
import { getRagNodeSystemPrompt } from './prompts/rag-node-system.prompt';
import { createSearchManualsTool } from './tools/search-manuals.tool';

interface ManualSourceLink {
	label: string;
	url: string;
}

type SupportedResponseLanguage = 'uk' | 'en';

function readContentText(content: unknown): string {
	if (typeof content === 'string') {
		return content;
	}

	if (Array.isArray(content)) {
		return content
			.map(part => {
				if (typeof part === 'string') {
					return part;
				}

				if (part && typeof part === 'object' && 'text' in part) {
					const text = (part as { text?: unknown }).text;
					return typeof text === 'string' ? text : '';
				}

				return '';
			})
			.join('');
	}

	if (content && typeof content === 'object' && 'content' in content) {
		const nested = content as { content?: unknown };
		return readContentText(nested.content);
	}

	return '';
}

function extractManualSourceLinks(text: string): ManualSourceLink[] {
	const linkRegex =
		/\[((?:Відкрити PDF на сторінці|Open PDF on page)\s+[^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
	const links: ManualSourceLink[] = [];
	let match: RegExpExecArray | null = null;

	while ((match = linkRegex.exec(text)) !== null) {
		const label = match[1]?.trim();
		const url = match[2]?.trim();
		if (!label || !url) {
			continue;
		}

		links.push({ label, url });
	}

	return links;
}

function hasManualSourceLinks(text: string): boolean {
	return extractManualSourceLinks(text).length > 0;
}

function hasAnyPdfPageLink(text: string): boolean {
	return /\[[^\]]+\]\((https?:\/\/[^\s)]+(?:#|&)page=\d+[^\s)]*)\)/i.test(text);
}

function uniqueManualSourceLinks(
	links: ManualSourceLink[],
): ManualSourceLink[] {
	const seen = new Set<string>();
	const output: ManualSourceLink[] = [];

	for (const link of links) {
		const key = `${link.label}|${link.url}`;
		if (seen.has(key)) {
			continue;
		}

		seen.add(key);
		output.push(link);
	}

	return output;
}

function formatSourceLinks(links: ManualSourceLink[], maxLinks = 4): string {
	const sliced = links.slice(0, maxLinks);
	if (!sliced.length) {
		return '';
	}

	return sliced.map(link => `[${link.label}](${link.url})`).join('\n');
}

function stripPlainSourceLines(text: string): string {
	if (!text) {
		return '';
	}

	const lines = text.split('\n');
	const filtered: string[] = [];
	let skippingSourceTail = false;

	for (const line of lines) {
		const trimmed = line.trim();

		if (
			/^(найрелевантніш[а-яіїє\s]+сторінк[а-яіїє]*|most\s+relevant\s+page)\b[:\s\-–—]*/i.test(
				trimmed,
			)
		) {
			continue;
		}

		if (/^(джерел(о|а)|sources?)\b[:\s\-–—]*/i.test(trimmed)) {
			skippingSourceTail = true;
			continue;
		}

		if (
			/^(?:[-*]\s*)?\[(джерел(о|а)|sources?)\]\(https?:\/\/[^\s)]+\)\s*$/i.test(
				trimmed,
			)
		) {
			continue;
		}

		if (skippingSourceTail) {
			if (!trimmed) {
				continue;
			}

			if (
				/^(відкрити pdf на сторінці|open pdf on page)\b/i.test(trimmed) ||
				/^(?:[-*]\s*)?\[(джерел(о|а)|sources?)\]\(https?:\/\/[^\s)]+\)\s*$/i.test(
					trimmed,
				)
			) {
				continue;
			}

			skippingSourceTail = false;
		}

		filtered.push(line);
	}

	return filtered
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function getLatestUserMessageText(messages: unknown[]): string {
	for (let i = messages.length - 1; i >= 0; i -= 1) {
		const message = messages[i] as
			| {
					_getType?: () => string;
					role?: string;
					content?: unknown;
			  }
			| undefined;

		const messageType =
			typeof message?._getType === 'function'
				? message._getType()
				: message?.role;

		if (messageType !== 'human' && messageType !== 'user') {
			continue;
		}

		return readContentText(message?.content).trim();
	}

	return '';
}

function detectPreferredLanguage(
	messages: unknown[],
): SupportedResponseLanguage {
	const userText = getLatestUserMessageText(messages);
	if (!userText) {
		return 'uk';
	}

	const cyrillicMatches = userText.match(/[\u0400-\u04FF]/g) ?? [];
	const latinMatches = userText.match(/[A-Za-z]/g) ?? [];

	if (latinMatches.length > cyrillicMatches.length) {
		return 'en';
	}

	return 'uk';
}

@Injectable()
export class RagNodeService {
	private model = '';
	private llm: ChatOpenAI;

	constructor(
		private readonly configService: ConfigService,
		private readonly manualRetrieverService: ManualRetrieverService,
	) {
		this.model = this.configService.get('OPENAI_MODEL') || 'gpt-5-mini';
		this.llm = new ChatOpenAI({
			modelName: this.model,
		});
	}

	async process(state: typeof AgentState.State) {
		const preferredLanguage = detectPreferredLanguage(state.messages);
		const latestUserMessage = getLatestUserMessageText(state.messages);
		const searchTool = createSearchManualsTool(
			this.manualRetrieverService,
			state.organizationId,
			preferredLanguage,
			latestUserMessage,
		);
		const llmWithTools = this.llm.bindTools([searchTool]);

		const input = [
			new SystemMessage(
				getRagNodeSystemPrompt({
					language: preferredLanguage,
				}),
			),
			...state.messages,
		];

		const response = await llmWithTools.invoke(input);
		const toolMessages = await handleToolCalls(response, {
			search_manuals: searchTool,
		});
		const finalResponse = await this.llm.invoke([
			...input,
			response,
			...toolMessages,
		]);

		const finalText = readContentText(finalResponse.content).trim();
		const linksFromTools = uniqueManualSourceLinks(
			toolMessages.flatMap(message =>
				extractManualSourceLinks(readContentText(message)),
			),
		);
		const formattedSources = formatSourceLinks(linksFromTools, 1);
		const cleanedFinalText = stripPlainSourceLines(finalText);
		const sourcesHeading = preferredLanguage === 'en' ? 'Sources' : 'Джерела';

		const augmentedFinalText =
			formattedSources &&
			!hasManualSourceLinks(cleanedFinalText) &&
			!hasAnyPdfPageLink(cleanedFinalText)
				? `${cleanedFinalText}\n\n${sourcesHeading}:\n${formattedSources}`.trim()
				: cleanedFinalText;

		const finalAssistantMessage =
			augmentedFinalText && augmentedFinalText !== finalText
				? new AIMessage(augmentedFinalText)
				: finalResponse;

		return {
			messages: [response, ...toolMessages, finalAssistantMessage],
			next: 'supervisor',
		};
	}
}
