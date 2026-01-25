import { Card, CardContent } from '@/shared/components/ui';
import { MediaDropzone } from './MediaDropzone';
import { MediaGrid } from './MediaGrid';

interface MediaFile {
	id: string;
	name: string;
	type: string;
	size: string;
	uploadedAt: string;
	uploadedBy: string;
	url: string;
}

interface MediaGalleryProps {
	media: MediaFile[];
	onUpload?: (files: FileList) => void;
	onDelete?: (id: string) => void;
	onDownload?: (id: string) => void;
}

export function MediaGallery({
	media,
	onUpload,
	onDelete,
	onDownload,
}: MediaGalleryProps) {
	return (
		<Card>
			<MediaDropzone onUpload={onUpload} />
			<CardContent>
				<MediaGrid media={media} onDelete={onDelete} onDownload={onDownload} />
			</CardContent>
		</Card>
	);
}
