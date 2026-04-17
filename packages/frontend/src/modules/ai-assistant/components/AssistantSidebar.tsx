import { Button, Card, CardContent, cn } from '@/shared';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ChatSessionSummary } from '../types';

interface AssistantSidebarProps {
	inModal?: boolean;
	chatSessions: ChatSessionSummary[];
	activeChatId: string | null;
	onSelectChat: (chatId: string) => void;
	onCreateChat: () => void;
	onDeleteChat: (chatId: string) => void;
	deletingChatId?: string | null;
}

export function AssistantSidebar({
	inModal = false,
	chatSessions,
	activeChatId,
	onSelectChat,
	onCreateChat,
	onDeleteChat,
	deletingChatId,
}: AssistantSidebarProps) {
	const { t } = useTranslation();
	const sortedSessions = [...chatSessions].sort(
		(a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
	);

	return (
		<div
			className={cn(
				'h-full min-h-0 w-full min-w-0 overflow-hidden',
				!inModal && 'order-2 lg:order-1 lg:col-span-1',
			)}
		>
			<Card
				className={cn(
					'flex min-h-0 w-full min-w-0 flex-col overflow-hidden',
					inModal
						? 'h-[70dvh] max-h-[70dvh]'
						: 'max-h-[45vh] lg:h-full lg:max-h-none',
				)}
			>
				<CardContent className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4'>
					<div className='space-y-2'>
						<Button
							variant='outline'
							className='h-9 w-full justify-start gap-2 bg-transparent'
							onClick={onCreateChat}
						>
							<Plus className='h-4 w-4' />
							{t('aiAssistant.newChat')}
						</Button>

						{sortedSessions.length === 0 && (
							<div className='flex h-full min-h-24 items-center justify-center'>
								<p className='text-center text-sm text-muted-foreground'>
									{t('aiAssistant.noChats')}
								</p>
							</div>
						)}

						{sortedSessions.map(session => {
							const isDeleting = deletingChatId === session.id;
							return (
								<div
									key={session.id}
									className={cn(
										'flex items-start gap-2 rounded-md border border-border p-2.5 transition-colors hover:bg-muted sm:p-3',
										activeChatId === session.id && 'bg-muted',
									)}
								>
									<button
										type='button'
										onClick={() => onSelectChat(session.id)}
										className='min-w-0 flex-1 text-left'
									>
										<p className='truncate text-sm font-medium'>
											{session.title}
										</p>
										<p className='mt-1 text-xs text-muted-foreground'>
											{session.updatedAt.toLocaleDateString()}{' '}
											{session.updatedAt.toLocaleTimeString([], {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</p>
									</button>
									<Button
										type='button'
										variant='ghost'
										size='icon'
										onClick={() => onDeleteChat(session.id)}
										disabled={isDeleting}
										className='h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive'
										aria-label={t('aiAssistant.deleteChatAria')}
									>
										{isDeleting ? (
											<Loader2 className='h-4 w-4 animate-spin' />
										) : (
											<Trash2 className='h-4 w-4' />
										)}
									</Button>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
