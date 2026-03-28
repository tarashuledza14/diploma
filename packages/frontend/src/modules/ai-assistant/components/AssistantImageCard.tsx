import { useState } from 'react';

interface AssistantImageCardProps {
	imageUrl: string;
	alt?: string;
}

export function AssistantImageCard({ imageUrl, alt }: AssistantImageCardProps) {
	const [isLoaded, setIsLoaded] = useState(false);

	return (
		<div className='mt-3 overflow-hidden rounded-lg border border-border bg-background/60'>
			<div className='border-b border-border px-3 py-2'>
				<p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
					Manual Diagram
				</p>
			</div>
			<div className='relative aspect-video w-full bg-muted/40'>
				{!isLoaded && (
					<div className='absolute inset-0 animate-pulse bg-muted'>
						<div className='h-full w-full bg-linear-to-r from-muted via-muted/70 to-muted' />
					</div>
				)}
				<img
					src={imageUrl}
					alt={alt ?? 'Technical diagram from manual'}
					className='h-full w-full object-contain'
					onLoad={() => setIsLoaded(true)}
					onError={() => setIsLoaded(true)}
				/>
			</div>
		</div>
	);
}
