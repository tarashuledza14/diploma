import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DmsService {
	private client: S3Client;
	private bucketName: string;
	private readonly logger = new Logger(DmsService.name);

	constructor(private configService: ConfigService) {
		const s3_region = this.configService.get<string>('S3_REGION');
		this.bucketName = this.configService.get<string>('S3_BUCKET_NAME');

		if (!s3_region || !this.bucketName) {
			throw new Error(
				'S3_REGION or S3_BUCKET_NAME not found in environment variables',
			);
		}

		this.client = new S3Client({
			region: s3_region,
			credentials: {
				accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
				secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY'),
			},
			// Keep bucket private and serve access via presigned URLs.
			// forcePathStyle: true, // Uncomment for local MinIO, keep commented for AWS S3
		});
	}

	async uploadTenantFile(
		file: Express.Multer.File,
		tenantId: string,
		folder = 'branding',
	) {
		if (!tenantId?.trim()) {
			throw new BadRequestException('tenantId is required');
		}

		if (!file) {
			throw new BadRequestException('file is required');
		}

		const key = this.buildTenantKey(tenantId, folder, file.originalname);

		try {
			await this.client.send(
				new PutObjectCommand({
					Bucket: this.bucketName,
					Key: key,
					Body: file.buffer,
					ContentType: file.mimetype,
					Metadata: {
						originalName: encodeURIComponent(file.originalname),
						tenantId,
					},
				}),
			);

			this.logger.log(`Tenant file uploaded: ${key}`);
			return { key };
		} catch (error) {
			this.logger.error('S3 tenant upload error:', error);
			throw new InternalServerErrorException('File upload to storage failed');
		}
	}

	async getPresignedUrl(key: string, expiresInSeconds = 3600) {
		if (!key?.trim()) {
			throw new BadRequestException('key is required');
		}

		try {
			await this.client.send(
				new HeadObjectCommand({
					Bucket: this.bucketName,
					Key: key,
				}),
			);

			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			});

			const url = await getSignedUrl(this.client, command, {
				expiresIn: expiresInSeconds,
			});

			return { url };
		} catch (error) {
			if (this.isGetAccessDenied(error)) {
				this.logger.warn(
					`S3 get access denied for key ${key}: ${this.formatErrorForLog(error)}`,
				);
				throw new ForbiddenException('S3 GetObject access denied');
			}

			this.logger.error('S3 presigned URL error:', error);
			throw new InternalServerErrorException('Failed to generate file link');
		}
	}

	async uploadSingleFile({
		file,
		isPublic = false,
	}: {
		file: Express.Multer.File;
		isPublic?: boolean;
	}) {
		try {
			const safeOriginalName = file.originalname.replace(/\s+/g, '_');
			const key = `${uuidv4()}-${safeOriginalName}`;

			const command = new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: file.buffer,
				ContentType: file.mimetype,
				...(isPublic && { ACL: 'public-read' }),
				Metadata: {
					originalName: encodeURIComponent(file.originalname),
				},
			});

			await this.client.send(command);
			this.logger.log(`File uploaded: ${key}`);

			return {
				url: isPublic
					? await this.getFileUrl(key)
					: (await this.getPresignedSignedUrl(key)).url,
				key,
				isPublic,
			};
		} catch (error) {
			this.logger.error('S3 upload error:', error);
			throw new InternalServerErrorException('File upload to storage failed');
		}
	}

	async getFileUrl(key: string) {
		const region = this.configService.get<string>('S3_REGION');
		return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
	}

	async getPresignedSignedUrl(key: string) {
		return this.getPresignedUrl(key, 60 * 60 * 24);
	}

	private buildTenantKey(
		tenantId: string,
		folder: string,
		originalName: string,
	) {
		const safeTenant = tenantId.replace(/[^a-zA-Z0-9_-]/g, '');
		const safeFolder = (folder || 'branding').replace(/[^a-zA-Z0-9/_-]/g, '');
		const fileName =
			originalName
				.replace(/\\/g, '/')
				.split('/')
				.pop()
				?.replace(/\s+/g, '_')
				.replace(/[^a-zA-Z0-9._-]/g, '') || 'file';

		return `tenants/${safeTenant}/${safeFolder}/${uuidv4()}-${fileName}`;
	}

	async deleteFile(key: string) {
		try {
			const command = new DeleteObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			});

			await this.client.send(command);
			this.logger.log(`File deleted: ${key}`);

			return { message: 'File deleted successfully' };
		} catch (error) {
			if (this.isDeleteAccessDenied(error)) {
				this.logger.warn(
					`S3 delete access denied for key ${key}: ${this.formatErrorForLog(error)}`,
				);
				throw new ForbiddenException('S3 DeleteObject access denied');
			}

			this.logger.error('S3 delete error:', error);
			throw new InternalServerErrorException('Failed to delete file');
		}
	}

	private isDeleteAccessDenied(error: unknown) {
		if (!error || typeof error !== 'object') {
			return false;
		}

		const e = error as {
			name?: string;
			message?: string;
		};

		const message = (e.message || '').toLowerCase();

		return (
			e.name === 'AccessDenied' ||
			(message.includes('accessdenied') && message.includes('deleteobject')) ||
			(message.includes('not authorized') && message.includes('deleteobject'))
		);
	}

	private isGetAccessDenied(error: unknown) {
		if (!error || typeof error !== 'object') {
			return false;
		}

		const e = error as {
			name?: string;
			message?: string;
		};

		const message = (e.message || '').toLowerCase();

		return (
			e.name === 'AccessDenied' ||
			(message.includes('accessdenied') && message.includes('getobject')) ||
			(message.includes('not authorized') && message.includes('getobject'))
		);
	}

	private formatErrorForLog(error: unknown) {
		if (!error) {
			return 'Unknown error';
		}

		if (error instanceof Error) {
			return error.message;
		}

		return String(error);
	}
}
