import { Button, Input } from '@/shared';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation();
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
					placeholder={t('aiAssistant.composer.placeholder')}
					className='min-w-0 flex-1 text-sm'
					disabled={isLoading}
				/>
				<Button
					type='submit'
					disabled={!input.trim() || isLoading}
					className='h-10 w-10 shrink-0 sm:h-10 sm:w-auto sm:px-4'
				>
					<Send className='h-4 w-4' />
					<span className='sr-only sm:not-sr-only sm:ml-2'>
						{t('aiAssistant.composer.send')}
					</span>
				</Button>
			</form>
			<p className='mt-2 hidden text-center text-xs text-muted-foreground sm:block'>
				{t('aiAssistant.composer.disclaimer')}
			</p>
		</div>
	);
}
