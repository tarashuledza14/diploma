import { useEffect, useRef, useState } from 'react';

import {
	Button,
	Card,
	DeleteConfirmationModal,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from '@/shared';
import { PanelLeftOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ChatService } from './api/chat.service';
import { streamChatMessage } from './api/chatSse.service';
import { AssistantChatHeader } from './components/AssistantChatHeader';
import { AssistantComposer } from './components/AssistantComposer';
import { AssistantMessages } from './components/AssistantMessages';
import { AssistantSidebar } from './components/AssistantSidebar';
import type { AssistantMessage, ChatSessionSummary } from './types';
import { sanitizeAssistantContent } from './utils/sanitize-assistant-content';

export function AIAssistantPage() {
	const { t } = useTranslation();
	const [messages, setMessages] = useState<AssistantMessage[]>([]);
	const [chatSessions, setChatSessions] = useState<ChatSessionSummary[]>([]);
	const [activeChatId, setActiveChatId] = useState<string | null>(null);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isDeletingChat, setIsDeletingChat] = useState(false);
	const [chatIdToDelete, setChatIdToDelete] = useState<string | null>(null);
	const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
	const streamCleanupRef = useRef<null | (() => void)>(null);
	const titleRefreshTimeoutRef = useRef<number | null>(null);

	useEffect(() => {
		const loadInitialChats = async () => {
			try {
				const sessions = await ChatService.getSessions();
				setChatSessions(sessions);

				if (sessions.length > 0) {
					const firstChatId = sessions[0].id;
					setActiveChatId(firstChatId);
					const chatMessages = await ChatService.getMessages(firstChatId);
					setMessages(chatMessages);
				}
			} catch {
				setChatSessions([]);
				setMessages([]);
				setActiveChatId(null);
			}
		};

		void loadInitialChats();

		return () => {
			streamCleanupRef.current?.();
			streamCleanupRef.current = null;
			if (titleRefreshTimeoutRef.current !== null) {
				window.clearTimeout(titleRefreshTimeoutRef.current);
				titleRefreshTimeoutRef.current = null;
			}
		};
	}, []);

	const refreshSessions = async (nextActiveChatId?: string) => {
		try {
			const sessions = await ChatService.getSessions();
			setChatSessions(sessions);

			if (nextActiveChatId) {
				setActiveChatId(nextActiveChatId);
			}
		} catch {
			// Keep the current UI state if the sessions refresh fails.
		}
	};

	const handleCreateChat = async () => {
		const reusableEmptySession = [...chatSessions]
			.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
			.find(
				session =>
					!session.lastMessage ||
					!session.lastMessage.content ||
					session.lastMessage.content.trim().length === 0,
			);

		if (reusableEmptySession) {
			streamCleanupRef.current?.();
			streamCleanupRef.current = null;
			setIsLoading(false);
			setActiveChatId(reusableEmptySession.id);
			setIsSidebarOpenMobile(false);

			const chatMessages = await ChatService.getMessages(
				reusableEmptySession.id,
			);
			setMessages(chatMessages);
			return;
		}

		const created = await ChatService.createSession(t('aiAssistant.newChat'));
		setActiveChatId(created.id);
		setMessages([]);
		setIsSidebarOpenMobile(false);
		await refreshSessions(created.id);
	};

	const handleSelectChat = async (chatId: string) => {
		if (chatId === activeChatId) return;

		streamCleanupRef.current?.();
		streamCleanupRef.current = null;
		setIsLoading(false);

		setActiveChatId(chatId);
		const chatMessages = await ChatService.getMessages(chatId);
		setMessages(chatMessages);
		setIsSidebarOpenMobile(false);
	};

	const handleDeleteChat = (chatId: string) => {
		setChatIdToDelete(chatId);
	};

	const confirmDeleteChat = async () => {
		if (!chatIdToDelete) {
			return;
		}

		setIsDeletingChat(true);
		streamCleanupRef.current?.();
		streamCleanupRef.current = null;
		setIsLoading(false);

		try {
			await ChatService.deleteSession(chatIdToDelete);

			const remainingSessions = chatSessions.filter(
				session => session.id !== chatIdToDelete,
			);
			setChatSessions(remainingSessions);

			if (activeChatId === chatIdToDelete) {
				if (remainingSessions.length === 0) {
					setActiveChatId(null);
					setMessages([]);
				} else {
					const nextChatId = remainingSessions[0].id;
					setActiveChatId(nextChatId);
					const nextChatMessages = await ChatService.getMessages(nextChatId);
					setMessages(nextChatMessages);
				}
			}

			setChatIdToDelete(null);
			toast.success(t('aiAssistant.toast.chatDeleted'));
		} catch {
			toast.error(t('aiAssistant.toast.chatDeleteFailed'));
		} finally {
			setIsDeletingChat(false);
		}
	};

	const chatPendingDeletion = chatIdToDelete
		? chatSessions.find(session => session.id === chatIdToDelete) || null
		: null;

	const handleSend = async () => {
		if (!input.trim()) return;

		streamCleanupRef.current?.();
		streamCleanupRef.current = null;

		let chatId = activeChatId;
		if (!chatId) {
			const created = await ChatService.createSession(t('aiAssistant.newChat'));
			chatId = created.id;
			setActiveChatId(chatId);
			await refreshSessions(chatId);
		}

		const query = input;
		const isFirstExchange = messages.length === 0;
		const assistantMessageId = `${Date.now()}-assistant`;
		const userMessage: AssistantMessage = {
			id: Date.now().toString(),
			role: 'user',
			content: query,
			timestamp: new Date(),
		};
		const assistantMessage: AssistantMessage = {
			id: assistantMessageId,
			role: 'assistant',
			content: '',
			timestamp: new Date(),
		};

		setMessages(prev => [...prev, userMessage, assistantMessage]);
		setInput('');
		setIsLoading(true);

		streamCleanupRef.current = streamChatMessage(chatId, query, {
			onChunk: textChunk => {
				setMessages(prev =>
					prev.map(message =>
						message.id === assistantMessageId
							? {
									...message,
									content: message.content + textChunk,
									statusText: undefined,
								}
							: message,
					),
				);
			},
			onStatus: statusMessage => {
				setMessages(prev =>
					prev.map(message =>
						message.id === assistantMessageId
							? { ...message, statusText: statusMessage }
							: message,
					),
				);
			},
			onDone: () => {
				setIsLoading(false);
				setMessages(prev =>
					prev.map(message =>
						message.id === assistantMessageId &&
						!sanitizeAssistantContent(message.content)
							? {
									...message,
									content: t('aiAssistant.messages.noResponse'),
									statusText: undefined,
								}
							: message.id === assistantMessageId
								? { ...message, statusText: undefined }
								: message,
					),
				);
				streamCleanupRef.current = null;
				void refreshSessions(chatId);

				if (isFirstExchange) {
					if (titleRefreshTimeoutRef.current !== null) {
						window.clearTimeout(titleRefreshTimeoutRef.current);
					}
					titleRefreshTimeoutRef.current = window.setTimeout(() => {
						void refreshSessions(chatId);
						titleRefreshTimeoutRef.current = null;
					}, 2000);
				}
			},
			onError: errorMessage => {
				setIsLoading(false);
				setMessages(prev =>
					prev.map(message =>
						message.id === assistantMessageId
							? { ...message, content: errorMessage, statusText: undefined }
							: message,
					),
				);
				streamCleanupRef.current = null;
				void refreshSessions(chatId);
			},
		});
	};

	return (
		<div className='flex h-full min-h-0 w-full min-w-0 flex-col gap-4 overflow-x-hidden overflow-y-auto sm:gap-6'>
			<div className='flex items-start justify-between gap-3'>
				{/* <div>
					<h1 className='flex items-center gap-2 text-xl font-bold sm:text-2xl'>
						<Bot className='h-7 w-7' />
						{t('aiAssistant.title')}
					</h1>
					<p className='hidden text-sm text-muted-foreground sm:block sm:text-base'>
						{t('aiAssistant.subtitle')}
					</p>
				</div> */}
				<Button
					type='button'
					variant='outline'
					className='h-9 shrink-0 px-3 lg:hidden'
					onClick={() => setIsSidebarOpenMobile(true)}
				>
					<PanelLeftOpen className='h-4 w-4' />
					<span className='ml-2'>{t('aiAssistant.chats')}</span>
				</Button>
			</div>

			<div className='grid min-h-0 w-full min-w-0 flex-1 gap-4 overflow-hidden lg:grid-cols-4 lg:grid-rows-[minmax(0,1fr)] lg:gap-6'>
				<div className='hidden min-h-0 lg:block'>
					<AssistantSidebar
						chatSessions={chatSessions}
						activeChatId={activeChatId}
						onSelectChat={handleSelectChat}
						onCreateChat={handleCreateChat}
						onDeleteChat={handleDeleteChat}
						deletingChatId={isDeletingChat ? chatIdToDelete : null}
					/>
				</div>

				<Card className='order-1 flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden lg:order-2 lg:col-span-3'>
					<AssistantChatHeader />
					<AssistantMessages messages={messages} isLoading={isLoading} />
					<AssistantComposer
						input={input}
						onInputChange={setInput}
						onSubmit={handleSend}
						isLoading={isLoading}
					/>
				</Card>
			</div>

			<ResponsiveDialog
				open={isSidebarOpenMobile}
				onOpenChange={setIsSidebarOpenMobile}
			>
				<ResponsiveDialogContent className='w-full max-w-none p-0 sm:max-w-lg'>
					<ResponsiveDialogHeader className='border-b px-4 py-3 text-left'>
						<ResponsiveDialogTitle>
							{t('aiAssistant.chats')}
						</ResponsiveDialogTitle>
					</ResponsiveDialogHeader>
					<div className='p-3'>
						<AssistantSidebar
							inModal
							chatSessions={chatSessions}
							activeChatId={activeChatId}
							onSelectChat={handleSelectChat}
							onCreateChat={handleCreateChat}
							onDeleteChat={handleDeleteChat}
							deletingChatId={isDeletingChat ? chatIdToDelete : null}
						/>
					</div>
				</ResponsiveDialogContent>
			</ResponsiveDialog>

			<DeleteConfirmationModal
				open={Boolean(chatIdToDelete)}
				onOpenChange={open => {
					if (!open && !isDeletingChat) {
						setChatIdToDelete(null);
					}
				}}
				title={t('aiAssistant.deleteDialog.title')}
				description={t('aiAssistant.deleteDialog.description')}
				confirmText={t('aiAssistant.deleteDialog.confirm')}
				cancelText={t('aiAssistant.deleteDialog.cancel')}
				loadingText={t('aiAssistant.deleteDialog.loading')}
				isLoading={isDeletingChat}
				onConfirm={confirmDeleteChat}
			>
				{chatPendingDeletion && (
					<div className='min-w-0'>
						<p className='truncate text-sm font-medium'>
							{chatPendingDeletion.title}
						</p>
					</div>
				)}
			</DeleteConfirmationModal>
		</div>
	);
}
