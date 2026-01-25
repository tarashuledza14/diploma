import { Button, Card, CardContent } from '@/shared/components/ui';
import { Download, FileText, Trash2 } from 'lucide-react';

interface MediaFile {
	id: string;
	name: string;
	type: string;
	size: string;
	uploadedAt: string;
	uploadedBy: string;
	url: string;
}

interface MediaGridProps {
	media: MediaFile[];
	onDelete?: (id: string) => void;
	onDownload?: (id: string) => void;
}

export function MediaGrid({ media, onDelete, onDownload }: MediaGridProps) {
	return (
		<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
			{media.map(file => (
				<Card key={file.id} className='overflow-hidden'>
					<div className='relative aspect-video bg-muted'>
						{file.type === 'image' ? (
							<div className='flex h-full items-center justify-center'>
								{/* TODO: Display actual image thumbnail */}
							</div>
						) : (
							<div className='flex h-full items-center justify-center'>
								<FileText className='h-12 w-12 text-muted-foreground' />
							</div>
						)}
					</div>
					<CardContent className='p-3'>
						<p className='truncate text-sm font-medium'>{file.name}</p>
						<p className='text-xs text-muted-foreground'>
							{file.size} • {new Date(file.uploadedAt).toLocaleDateString()}
						</p>
						<div className='mt-2 flex items-center justify-between'>
							<span className='text-xs text-muted-foreground'>
								By {file.uploadedBy}
							</span>
							<div className='flex gap-1'>
								<Button
									variant='ghost'
									size='icon'
									className='h-8 w-8'
									onClick={() => onDownload && onDownload(file.id)}
								>
									<Download className='h-4 w-4' />
									<span className='sr-only'>Download</span>
								</Button>
								<Button
									variant='ghost'
									size='icon'
									className='h-8 w-8 text-destructive hover:text-destructive'
									onClick={() => onDelete && onDelete(file.id)}
								>
									<Trash2 className='h-4 w-4' />
									<span className='sr-only'>Delete</span>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
