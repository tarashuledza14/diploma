import { Avatar, AvatarFallback, ScrollArea, cn } from '@/shared';
import { Bot, Loader2 } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import type { AssistantMessage } from '../types';
import { AssistantImageCard } from './AssistantImageCard';
import { DynamicDataTable, TableSkeletonLoader } from './DynamicDataTable.tsx';

interface AssistantMessagesProps {
	messages: AssistantMessage[];
	isLoading: boolean;
}

type MarkdownCodeNode = {
	data?: {
		meta?: string;
	};
	properties?: {
		meta?: string;
		metastring?: string;
	};
};

function getCodeMeta(node: unknown): string {
	const typedNode = node as MarkdownCodeNode | undefined;
	const fromData = typedNode?.data?.meta;
	if (typeof fromData === 'string') {
		return fromData;
	}

	const fromProperties =
		typedNode?.properties?.metastring ?? typedNode?.properties?.meta;
	return typeof fromProperties === 'string' ? fromProperties : '';
}

function getCodeText(children: ReactNode): string {
	if (typeof children === 'string') {
		return children;
	}

	if (Array.isArray(children)) {
		return children
			.map(child => (typeof child === 'string' ? child : ''))
			.join('');
	}

	return '';
}

function normalizeMarkdownSpacing(content: string): string {
	// Collapse accidental 3+ blank lines from model/tool output into standard paragraph breaks.
	return content.replace(/\n{3,}/g, '\n\n');
}

function createMarkdownComponents(
	isStreamingMessage: boolean,
	t: (key: string) => string,
) {
	return {
		p: ({ children }: { children?: ReactNode }) => (
			<p className='mb-3 last:mb-0'>{children}</p>
		),
		img: ({ src, alt }: { src?: string; alt?: string }) => {
			if (!src) return null;
			return <AssistantImageCard imageUrl={src} alt={alt} />;
		},
		code: ({
			node,
			inline,
			className,
			children,
			...props
		}: {
			node?: unknown;
			inline?: boolean;
			className?: string;
			children?: ReactNode;
		}) => {
			const languageMatch = /language-([\w-]+)/.exec(className || '');
			const language = languageMatch?.[1] ?? '';
			const codeMeta = getCodeMeta(node);
			const isDataTableBlock =
				(!inline && language === 'data-table') ||
				(!inline &&
					language === 'json' &&
					codeMeta.split(/\s+/).filter(Boolean).includes('data-table'));

			if (isDataTableBlock) {
				try {
					const tableData = JSON.parse(getCodeText(children).trim()) as unknown;
					if (!Array.isArray(tableData) || tableData.length === 0) {
						return (
							<div className='mt-2 text-sm text-muted-foreground'>
								{t('aiAssistant.messages.noData')}
							</div>
						);
					}

					return <DynamicDataTable data={tableData} />;
				} catch {
					if (isStreamingMessage) {
						return <TableSkeletonLoader />;
					}

					return (
						<div className='mt-2 text-sm text-destructive'>
							{t('aiAssistant.messages.tableRenderError')}
						</div>
					);
				}
			}

			return (
				<code className={className} {...props}>
					{children}
				</code>
			);
		},
	};
}

export function AssistantMessages({
	messages,
	isLoading,
}: AssistantMessagesProps) {
	const { t } = useTranslation();
	const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		bottomAnchorRef.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'end',
		});
	}, [messages, isLoading]);

	return (
		<ScrollArea className='flex-1 min-h-0 min-w-0 overflow-x-hidden p-3 sm:p-4'>
			<div className='space-y-4'>
				{messages.map((message, index) => {
					const isStreamingMessage =
						message.role === 'assistant' &&
						isLoading &&
						index === messages.length - 1;
					const markdownComponents = createMarkdownComponents(
						isStreamingMessage,
						t,
					);

					return (
						<div
							key={message.id}
							className={cn(
								'flex min-w-0 gap-2 sm:gap-3',
								message.role === 'user' && 'flex-row-reverse',
							)}
						>
							<Avatar className='h-7 w-7 shrink-0 sm:h-8 sm:w-8'>
								<AvatarFallback
									className={cn(
										message.role === 'assistant'
											? 'bg-primary text-primary-foreground'
											: 'bg-muted',
									)}
								>
									{message.role === 'assistant' ? (
										<Bot className='h-4 w-4' />
									) : (
										'U'
									)}
								</AvatarFallback>
							</Avatar>
							<div
								className={cn(
									'min-w-0 max-w-[calc(100%-2.5rem)] rounded-lg px-3 py-2 sm:max-w-[80%] sm:p-3',
									message.role === 'assistant'
										? 'bg-muted'
										: 'bg-primary text-primary-foreground',
								)}
							>
								{message.role === 'assistant' &&
									isLoading &&
									!message.content && (
										<div className='flex items-center gap-2 text-[13px] text-muted-foreground sm:text-sm'>
											<Loader2 className='h-4 w-4 animate-spin' />
											<span>
												{message.statusText ??
													t('aiAssistant.messages.thinking')}
											</span>
										</div>
									)}
								{!!message.content && (
									<div className='min-w-0 max-w-full wrap-break-word text-[13px] sm:text-sm'>
										<ReactMarkdown components={markdownComponents}>
											{normalizeMarkdownSpacing(message.content)}
										</ReactMarkdown>
									</div>
								)}
								<span className='mt-1 block text-[11px] opacity-60 sm:text-xs'>
									{message.timestamp.toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit',
									})}
								</span>
							</div>
						</div>
					);
				})}
				<div ref={bottomAnchorRef} />
			</div>
		</ScrollArea>
	);
}
