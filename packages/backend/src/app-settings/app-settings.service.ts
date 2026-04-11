import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { Currency } from 'prisma/generated/prisma/client';
import sharp from 'sharp';
import { DmsService } from 'src/dms/dms.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateAppBrandingDto } from './dto/update-app-branding.dto';

@Injectable()
export class AppSettingsService {
	private readonly defaultAppName = 'AutoCRM';
	private readonly processedLogoSize = 256;
	private readonly processedLogoRadius = 56;

	constructor(
		private readonly db: PrismaService,
		private readonly dmsService: DmsService,
	) {}

	async getBranding(organizationId: string | null | undefined) {
		const tenantId = this.assertOrganizationId(organizationId);
		const settings = await this.ensureTenantSettings(tenantId);
		return this.toBrandingResponse(
			settings.appName,
			settings.currency,
			settings.logoKey,
			tenantId,
		);
	}

	async updateBranding(
		organizationId: string | null | undefined,
		dto: UpdateAppBrandingDto,
	) {
		const tenantId = this.assertOrganizationId(organizationId);
		await this.ensureOrganizationExists(tenantId);

		const appName = dto.appName.trim();
		if (!appName) {
			throw new BadRequestException('appName cannot be empty');
		}

		const currency = dto.currency;

		const updated = await this.db.appSettings.upsert({
			where: { organizationId: tenantId },
			update: {
				appName,
				currency,
			},
			create: {
				organizationId: tenantId,
				appName,
				currency,
			},
			select: {
				appName: true,
				currency: true,
				logoKey: true,
			},
		});

		return this.toBrandingResponse(
			updated.appName,
			updated.currency,
			updated.logoKey,
			tenantId,
		);
	}

	async uploadLogo(
		organizationId: string | null | undefined,
		file: Express.Multer.File,
	) {
		const tenantId = this.assertOrganizationId(organizationId);
		await this.ensureOrganizationExists(tenantId);

		if (!file) {
			throw new BadRequestException('Logo file is required');
		}

		if (!file.mimetype?.startsWith('image/')) {
			throw new BadRequestException('Only image files are allowed');
		}

		const processedFile = await this.prepareRoundedLogo(file);

		const { key } = await this.dmsService.uploadTenantFile(
			processedFile,
			tenantId,
			'branding',
		);

		const updated = await this.db.appSettings.upsert({
			where: { organizationId: tenantId },
			update: {
				logoKey: key,
			},
			create: {
				organizationId: tenantId,
				appName: this.defaultAppName,
				currency: Currency.UAH,
				logoKey: key,
			},
			select: {
				appName: true,
				currency: true,
				logoKey: true,
			},
		});

		return this.toBrandingResponse(
			updated.appName,
			updated.currency,
			updated.logoKey,
			tenantId,
		);
	}

	private async ensureTenantSettings(organizationId: string) {
		await this.ensureOrganizationExists(organizationId);

		return this.db.appSettings.upsert({
			where: { organizationId },
			update: {},
			create: {
				organizationId,
				appName: this.defaultAppName,
				currency: Currency.UAH,
				logoKey: null,
			},
			select: {
				appName: true,
				currency: true,
				logoKey: true,
			},
		});
	}

	private async toBrandingResponse(
		appName: string,
		currency: Currency,
		logoKey: string | null,
		organizationId: string,
	) {
		let logoUrl: string | null = null;

		if (logoKey) {
			this.assertTenantKeyOwnership(logoKey, organizationId);
			logoUrl = (await this.dmsService.getPresignedUrl(logoKey)).url;
		}

		return {
			appName,
			currency,
			logoUrl,
		};
	}

	private assertTenantKeyOwnership(key: string, organizationId: string) {
		const tenantPrefix = `tenants/${organizationId}/`;
		if (!key.startsWith(tenantPrefix)) {
			throw new ForbiddenException('Cross-tenant file access is forbidden');
		}
	}

	private assertOrganizationId(organizationId: string | null | undefined) {
		if (!organizationId?.trim()) {
			throw new BadRequestException('organizationId is missing for user');
		}

		return organizationId;
	}

	private async ensureOrganizationExists(organizationId: string) {
		const organization = await this.db.organization.findUnique({
			where: { id: organizationId },
			select: { id: true },
		});

		if (!organization) {
			throw new NotFoundException('Organization not found');
		}
	}

	private async prepareRoundedLogo(file: Express.Multer.File) {
		try {
			const roundedMask = Buffer.from(
				`<svg width="${this.processedLogoSize}" height="${this.processedLogoSize}"><rect x="0" y="0" width="${this.processedLogoSize}" height="${this.processedLogoSize}" rx="${this.processedLogoRadius}" ry="${this.processedLogoRadius}" /></svg>`,
			);

			const buffer = await sharp(file.buffer)
				.rotate()
				.ensureAlpha()
				.resize(this.processedLogoSize, this.processedLogoSize, {
					fit: 'cover',
					position: 'centre',
				})
				.composite([
					{
						input: roundedMask,
						blend: 'dest-in',
					},
				])
				.png({ compressionLevel: 9 })
				.toBuffer();

			const baseName = file.originalname.replace(/\.[^.]+$/, '');

			return {
				...file,
				buffer,
				mimetype: 'image/png',
				originalname: `${baseName || 'logo'}.png`,
			};
		} catch {
			throw new BadRequestException('Failed to process logo image');
		}
	}
}
