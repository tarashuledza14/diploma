import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
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
			// forcePathStyle: true, // Uncomment for local MinIO, keep commented for AWS S3
		});
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
		try {
			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: key,
			});

			const url = await getSignedUrl(this.client, command, {
				expiresIn: 60 * 60 * 24,
			});

			return { url };
		} catch (error) {
			this.logger.error('S3 presigned URL error:', error);
			throw new InternalServerErrorException('Failed to generate file link');
		}
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
			this.logger.error('S3 delete error:', error);
			throw new InternalServerErrorException('Failed to delete file');
		}
	}
}
