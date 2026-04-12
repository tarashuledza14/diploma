import {
	Button,
	FileUpload,
	FileUploadDropzone,
	FileUploadTrigger,
} from '@/shared';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MediaDropzoneProps {
	onUpload?: (files: FileList) => void;
}

export function MediaDropzone({ onUpload }: MediaDropzoneProps) {
	const { t } = useTranslation();

	const handleAccept = (files: File[]) => {
		if (!onUpload || files.length === 0) {
			return;
		}

		const dataTransfer = new DataTransfer();
		files.forEach(file => dataTransfer.items.add(file));
		onUpload(dataTransfer.files);
	};

	return (
		<FileUpload
			onAccept={handleAccept}
			accept='image/*,.pdf,.doc,.docx'
			maxSize={10 * 1024 * 1024}
			multiple
		>
			<FileUploadDropzone className='mb-6 border-muted-foreground/25 p-8 text-center transition-colors hover:border-muted-foreground/50'>
				<Upload className='mx-auto h-12 w-12 text-muted-foreground/50' />
				<p className='mt-2 text-sm font-medium'>
					{t('orders.media.dropzoneTitle')}
				</p>
				<p className='text-xs text-muted-foreground'>
					{t('orders.media.dropzoneHint')}
				</p>
				<FileUploadTrigger asChild>
					<Button type='button' size='sm' variant='outline' className='mt-2'>
						{t('common.select')}
					</Button>
				</FileUploadTrigger>
			</FileUploadDropzone>
		</FileUpload>
	);
}
