import { Avatar, AvatarFallback, ScrollArea, cn } from '@/shared';
import { Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import type { AssistantMessage } from '../types';
import { AssistantImageCard } from './AssistantImageCard';

interface AssistantMessagesProps {
	messages: AssistantMessage[];
	isLoading: boolean;
}

const markdownComponents = {
	img: ({ src, alt }: { src?: string; alt?: string }) => {
		if (!src) return null;
		return <AssistantImageCard imageUrl={src} alt={alt} />;
	},
};

export function AssistantMessages({
	messages,
	isLoading,
}: AssistantMessagesProps) {
	return (
		<ScrollArea className='flex-1 min-w-0 overflow-x-hidden p-3 sm:p-4'>
			<div className='space-y-4'>
				{messages.map(message => (
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
										<span>{message.statusText ?? 'Thinking...'}</span>
									</div>
								)}
							{!!message.content && (
								<div className='min-w-0 max-w-full whitespace-pre-wrap wrap-break-word text-[13px] sm:text-sm'>
									<ReactMarkdown components={markdownComponents}>
										{message.content}
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
				))}
			</div>
		</ScrollArea>
	);
}
