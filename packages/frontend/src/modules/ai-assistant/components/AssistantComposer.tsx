import { Button, Input } from '@/shared';
import { Send } from 'lucide-react';

interface AssistantComposerProps {
	input: string;
	onInputChange: (value: string) => void;
	onSubmit: () => void;
	isLoading: boolean;
}

export function AssistantComposer({
	input,
	onInputChange,
	onSubmit,
	isLoading,
}: AssistantComposerProps) {
	return (
		<div className='w-full min-w-0 border-t p-3 sm:p-4'>
			<form
				onSubmit={e => {
					e.preventDefault();
					onSubmit();
				}}
				className='flex w-full min-w-0 items-end gap-2'
			>
				<Input
					value={input}
					onChange={e => onInputChange(e.target.value)}
					placeholder='Ask me anything about your auto service business...'
					className='min-w-0 flex-1 text-sm'
					disabled={isLoading}
				/>
				<Button
					type='submit'
					disabled={!input.trim() || isLoading}
					className='h-10 w-10 shrink-0 sm:h-10 sm:w-auto sm:px-4'
				>
					<Send className='h-4 w-4' />
					<span className='sr-only sm:not-sr-only sm:ml-2'>Send</span>
				</Button>
			</form>
			<p className='mt-2 hidden text-center text-xs text-muted-foreground sm:block'>
				AI responses are generated based on your CRM data. Always verify
				important information.
			</p>
		</div>
	);
}
