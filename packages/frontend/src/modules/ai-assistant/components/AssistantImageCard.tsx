import { Expand } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AssistantImageViewer } from './AssistantImageViewer';

interface AssistantImageCardProps {
	imageUrl: string;
	alt?: string;
}

export function AssistantImageCard({ imageUrl, alt }: AssistantImageCardProps) {
	const { t } = useTranslation();
	const [isLoaded, setIsLoaded] = useState(false);
	const [hasLoadError, setHasLoadError] = useState(false);
	const [isViewerOpen, setIsViewerOpen] = useState(false);
	const resolvedAlt = alt ?? t('aiAssistant.image.technicalDiagramAlt');

	return (
		<>
			<div className='mt-3 overflow-hidden rounded-lg border border-border bg-background/60'>
				<div className='border-b border-border px-3 py-2'>
					<p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
						{t('aiAssistant.image.manualDiagram')}
					</p>
				</div>
				<button
					type='button'
					onClick={() => setIsViewerOpen(true)}
					className='group relative block aspect-video w-full bg-muted/40 text-left transition-colors hover:bg-muted/50'
					aria-label={t('aiAssistant.image.openInViewer')}
				>
					{!isLoaded && (
						<div className='absolute inset-0 animate-pulse bg-muted'>
							<div className='h-full w-full bg-linear-to-r from-muted via-muted/70 to-muted' />
						</div>
					)}
					<img
						src={imageUrl}
						alt={resolvedAlt}
						className='h-full w-full object-contain'
						onLoad={() => setIsLoaded(true)}
						onError={() => {
							setHasLoadError(true);
							setIsLoaded(true);
						}}
					/>

					<div className='pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded bg-black/55 px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100'>
						<Expand className='h-3.5 w-3.5' />
						<span>{t('aiAssistant.image.openInViewer')}</span>
					</div>

					{hasLoadError && (
						<div className='absolute inset-x-2 bottom-2 rounded-md bg-black/65 px-2 py-1.5 text-xs text-white'>
							<p>{t('aiAssistant.image.previewLoadFailed')}</p>
						</div>
					)}
				</button>
			</div>

			<AssistantImageViewer
				open={isViewerOpen}
				onOpenChange={setIsViewerOpen}
				imageUrl={imageUrl}
				alt={resolvedAlt}
			/>
		</>
	);
}
