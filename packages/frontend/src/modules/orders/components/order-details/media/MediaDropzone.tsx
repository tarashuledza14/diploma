import { Upload } from 'lucide-react';

interface MediaDropzoneProps {
	onUpload?: (files: FileList) => void;
}

export function MediaDropzone({ onUpload }: MediaDropzoneProps) {
	return (
		<div className='mb-6 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors hover:border-muted-foreground/50'>
			<Upload className='mx-auto h-12 w-12 text-muted-foreground/50' />
			<p className='mt-2 text-sm font-medium'>Drag and drop files here</p>
			<p className='text-xs text-muted-foreground'>
				or click to browse (Max 10MB per file)
			</p>
			<input
				type='file'
				className='hidden'
				multiple
				accept='image/*,.pdf,.doc,.docx'
				onChange={e => onUpload && e.target.files && onUpload(e.target.files)}
			/>
		</div>
	);
}
