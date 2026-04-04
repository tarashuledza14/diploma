import { Badge, CardHeader, CardTitle } from '@/shared';
import { Bot, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AssistantChatHeader() {
	const { t } = useTranslation();
	return (
		<CardHeader className='border-b px-3 py-3 sm:px-6 sm:py-4'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2.5 sm:gap-3'>
					<div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary sm:h-10 sm:w-10'>
						<Bot className='h-4 w-4 text-primary-foreground sm:h-5 sm:w-5' />
					</div>
					<div>
						<CardTitle className='text-sm sm:text-base'>
							{t('aiAssistant.chatHeader.title')}
						</CardTitle>
						<div className='flex items-center gap-1'>
							<span className='h-2 w-2 rounded-full bg-green-500' />
							<span className='text-xs text-muted-foreground'>
								{t('aiAssistant.chatHeader.online')}
							</span>
						</div>
					</div>
				</div>
				<Badge variant='secondary' className='hidden sm:inline-flex'>
					<Sparkles className='mr-1 h-3 w-3' />
					{t('aiAssistant.chatHeader.aiPowered')}
				</Badge>
			</div>
		</CardHeader>
	);
}
