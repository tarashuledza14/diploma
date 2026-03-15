import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MediaDropzoneProps {
	onUpload?: (files: FileList) => void;
}

export function MediaDropzone({ onUpload }: MediaDropzoneProps) {
	const { t } = useTranslation();
	return (
		<div className='mb-6 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center transition-colors hover:border-muted-foreground/50'>
			<Upload className='mx-auto h-12 w-12 text-muted-foreground/50' />
			<p className='mt-2 text-sm font-medium'>
				{t('orders.media.dropzoneTitle')}
			</p>
			<p className='text-xs text-muted-foreground'>
				{t('orders.media.dropzoneHint')}
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
