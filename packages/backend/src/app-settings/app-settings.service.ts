import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { DmsService } from 'src/dms/dms.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateAppBrandingDto } from './dto/update-app-branding.dto';

@Injectable()
export class AppSettingsService {
	private readonly defaultAppName = 'AutoCRM';

	constructor(
		private readonly db: PrismaService,
		private readonly dmsService: DmsService,
	) {}

	async getBranding(organizationId: string | null | undefined) {
		const tenantId = this.assertOrganizationId(organizationId);
		const settings = await this.ensureTenantSettings(tenantId);
		return this.toBrandingResponse(
			settings.appName,
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

		const updated = await this.db.appSettings.upsert({
			where: { organizationId: tenantId },
			update: {
				appName,
			},
			create: {
				organizationId: tenantId,
				appName,
			},
			select: {
				appName: true,
				logoKey: true,
			},
		});

		return this.toBrandingResponse(updated.appName, updated.logoKey, tenantId);
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

		const { key } = await this.dmsService.uploadTenantFile(
			file,
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
				logoKey: key,
			},
			select: {
				appName: true,
				logoKey: true,
			},
		});

		return this.toBrandingResponse(updated.appName, updated.logoKey, tenantId);
	}

	private async ensureTenantSettings(organizationId: string) {
		await this.ensureOrganizationExists(organizationId);

		return this.db.appSettings.upsert({
			where: { organizationId },
			update: {},
			create: {
				organizationId,
				appName: this.defaultAppName,
				logoKey: null,
			},
			select: {
				appName: true,
				logoKey: true,
			},
		});
	}

	private async toBrandingResponse(
		appName: string,
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
}
