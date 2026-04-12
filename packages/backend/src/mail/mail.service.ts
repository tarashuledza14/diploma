import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { InviteLanguage } from 'prisma/generated/prisma/client';
import { buildTeamInviteEmailContent } from './team-invite-email.templates';

interface TeamInviteEmailInput {
	to: string;
	fullName: string;
	role: string;
	language: InviteLanguage;
	inviteToken: string;
	expiresAt: Date;
}

@Injectable()
export class MailService {
	constructor(private readonly configService: ConfigService) {}

	private getFrontendUrl(): string {
		return (
			this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173'
		);
	}

	private buildInviteUrl(
		inviteToken: string,
		language: InviteLanguage,
	): string {
		const frontendUrl = this.getFrontendUrl();
		const url = new URL('/register', frontendUrl);
		url.searchParams.set('inviteToken', inviteToken);
		url.searchParams.set('lang', this.toAppLanguage(language));
		return url.toString();
	}

	private toAppLanguage(language: InviteLanguage): 'uk' | 'en' {
		return language === InviteLanguage.EN ? 'en' : 'uk';
	}

	private createTransporter() {
		const host = this.configService.get<string>('SMTP_HOST');
		const port = Number(this.configService.get<string>('SMTP_PORT') || '587');
		const user = this.configService.get<string>('SMTP_USER');
		const pass = this.configService.get<string>('SMTP_PASS');
		const secureConfig = this.configService.get<string>('SMTP_SECURE');
		const secure = secureConfig ? secureConfig === 'true' : port === 465;

		if (!host || !port || !user || !pass) {
			throw new InternalServerErrorException(
				'SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS',
			);
		}

		return nodemailer.createTransport({
			host,
			port,
			secure,
			auth: {
				user,
				pass,
			},
		});
	}

	async sendTeamInviteEmail(input: TeamInviteEmailInput): Promise<string> {
		const from =
			this.configService.get<string>('SMTP_FROM') ||
			'AutoCRM <no-reply@autocrm.local>';
		const inviteUrl = this.buildInviteUrl(input.inviteToken, input.language);
		const transporter = this.createTransporter();

		const dateLocale = input.language === InviteLanguage.EN ? 'en-US' : 'uk-UA';
		const expiresAtFormatted = input.expiresAt.toLocaleString(dateLocale, {
			timeZone: 'Europe/Kyiv',
		});

		const content = buildTeamInviteEmailContent({
			fullName: input.fullName,
			role: input.role,
			inviteUrl,
			expiresAtFormatted,
			language: input.language,
		});

		await transporter.sendMail({
			from,
			to: input.to,
			subject: content.subject,
			text: content.text,
			html: content.html,
		});

		return inviteUrl;
	}
}
