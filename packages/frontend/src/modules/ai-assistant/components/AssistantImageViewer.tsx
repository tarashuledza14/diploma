import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AssistantImageViewerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	imageUrl: string;
	alt: string;
}

export function AssistantImageViewer({
	open,
	onOpenChange,
	imageUrl,
	alt,
}: AssistantImageViewerProps) {
	const { t } = useTranslation();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-h-[92vh] w-[96vw] max-w-6xl border-border/60 bg-background/95 p-2 sm:p-4'>
				<div className='flex items-center justify-between gap-3 border-b border-border/60 px-2 pb-2 sm:px-1'>
					<p className='truncate text-xs font-medium uppercase tracking-wide text-muted-foreground'>
						{t('aiAssistant.image.manualDiagram')}
					</p>
					<a
						href={imageUrl}
						target='_blank'
						rel='noreferrer'
						className='inline-flex items-center gap-1 text-xs text-primary hover:underline'
					>
						<ExternalLink className='h-3.5 w-3.5' />
						{t('aiAssistant.image.openOriginal')}
					</a>
				</div>

				<div className='mt-2 flex max-h-[78vh] min-h-70 w-full items-center justify-center rounded-md bg-black/55 p-2 sm:p-4'>
					<img
						src={imageUrl}
						alt={alt}
						className='max-h-[72vh] w-auto max-w-full object-contain'
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
