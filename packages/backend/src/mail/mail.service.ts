import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface TeamInviteEmailInput {
	to: string;
	fullName: string;
	role: string;
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

	private buildInviteUrl(inviteToken: string): string {
		const frontendUrl = this.getFrontendUrl();
		const url = new URL('/register', frontendUrl);
		url.searchParams.set('inviteToken', inviteToken);
		return url.toString();
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
		const inviteUrl = this.buildInviteUrl(input.inviteToken);
		const transporter = this.createTransporter();

		const expiresAtFormatted = input.expiresAt.toLocaleString('uk-UA', {
			timeZone: 'Europe/Kyiv',
		});

		await transporter.sendMail({
			from,
			to: input.to,
			subject: 'Запрошення до AutoCRM',
			text: [
				`Вітаємо, ${input.fullName}!`,
				`Вас додано до команди AutoCRM з роллю ${input.role}.`,
				`Щоб завершити реєстрацію, відкрийте посилання: ${inviteUrl}`,
				`Посилання дійсне до: ${expiresAtFormatted}`,
			].join('\n'),
			html: `
				<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
					<h2 style="margin-bottom: 12px;">Вітаємо, ${input.fullName}!</h2>
					<p style="margin-bottom: 12px;">Вас додано до команди <b>AutoCRM</b> з роллю <b>${input.role}</b>.</p>
					<p style="margin-bottom: 16px;">Натисніть кнопку нижче, щоб завершити реєстрацію:</p>
					<a href="${inviteUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">Завершити реєстрацію</a>
					<p style="margin-top: 16px;">Або відкрийте це посилання вручну:</p>
					<p><a href="${inviteUrl}">${inviteUrl}</a></p>
					<p style="margin-top: 16px; color: #6b7280;">Посилання дійсне до: ${expiresAtFormatted}</p>
				</div>
			`,
		});

		return inviteUrl;
	}
}
