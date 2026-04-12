import { InviteLanguage } from 'prisma/generated/prisma/client';

interface TeamInviteEmailTemplateInput {
	fullName: string;
	role: string;
	inviteUrl: string;
	expiresAtFormatted: string;
	language: InviteLanguage;
}

interface TeamInviteEmailContent {
	subject: string;
	text: string;
	html: string;
}

export function buildTeamInviteEmailContent(
	input: TeamInviteEmailTemplateInput,
): TeamInviteEmailContent {
	if (input.language === InviteLanguage.EN) {
		return {
			subject: 'Invitation to AutoCRM',
			text: [
				`Hello, ${input.fullName}!`,
				`You were added to the AutoCRM team with role ${input.role}.`,
				`To complete registration, open this link: ${input.inviteUrl}`,
				`This link is valid until: ${input.expiresAtFormatted}`,
			].join('\n'),
			html: `
				<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
					<h2 style="margin-bottom: 12px;">Hello, ${input.fullName}!</h2>
					<p style="margin-bottom: 12px;">You were added to the <b>AutoCRM</b> team with role <b>${input.role}</b>.</p>
					<p style="margin-bottom: 16px;">Click the button below to complete registration:</p>
					<a href="${input.inviteUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">Complete registration</a>
					<p style="margin-top: 16px;">Or open this link manually:</p>
					<p><a href="${input.inviteUrl}">${input.inviteUrl}</a></p>
					<p style="margin-top: 16px; color: #6b7280;">This link is valid until: ${input.expiresAtFormatted}</p>
				</div>
			`,
		};
	}

	return {
		subject: 'Запрошення до AutoCRM',
		text: [
			`Вітаємо, ${input.fullName}!`,
			`Вас додано до команди AutoCRM з роллю ${input.role}.`,
			`Щоб завершити реєстрацію, відкрийте посилання: ${input.inviteUrl}`,
			`Посилання дійсне до: ${input.expiresAtFormatted}`,
		].join('\n'),
		html: `
			<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
				<h2 style="margin-bottom: 12px;">Вітаємо, ${input.fullName}!</h2>
				<p style="margin-bottom: 12px;">Вас додано до команди <b>AutoCRM</b> з роллю <b>${input.role}</b>.</p>
				<p style="margin-bottom: 16px;">Натисніть кнопку нижче, щоб завершити реєстрацію:</p>
				<a href="${input.inviteUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px;">Завершити реєстрацію</a>
				<p style="margin-top: 16px;">Або відкрийте це посилання вручну:</p>
				<p><a href="${input.inviteUrl}">${input.inviteUrl}</a></p>
				<p style="margin-top: 16px; color: #6b7280;">Посилання дійсне до: ${input.expiresAtFormatted}</p>
			</div>
		`,
	};
}
