import { createCroppedSquareImageFile } from '@/modules/app-settings/lib/createCroppedImageFile';
import {
	Button,
	Cropper,
	CropperArea,
	CropperAreaData,
	CropperImage,
	CropperSize,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Label,
	Slider,
} from '@/shared';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

type LogoCropperDialogProps = {
	open: boolean;
	file: File | null;
	onOpenChange: (open: boolean) => void;
	onApply: (file: File) => void;
};

type CropperMedia = {
	width: number;
	height: number;
};

export function LogoCropperDialog({
	open,
	file,
	onOpenChange,
	onApply,
}: LogoCropperDialogProps) {
	const { t } = useTranslation();
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [baseZoom, setBaseZoom] = useState(1);
	const [mediaSize, setMediaSize] = useState<CropperMedia | null>(null);
	const [cropSize, setCropSize] = useState<CropperSize | null>(null);
	const [isBaseZoomReady, setIsBaseZoomReady] = useState(false);
	const [croppedAreaPixels, setCroppedAreaPixels] =
		useState<CropperAreaData | null>(null);
	const [isApplying, setIsApplying] = useState(false);

	const sourceUrl = useMemo(() => {
		if (!file) {
			return null;
		}

		return URL.createObjectURL(file);
	}, [file]);

	useEffect(() => {
		if (!sourceUrl) {
			return;
		}

		return () => {
			URL.revokeObjectURL(sourceUrl);
		};
	}, [sourceUrl]);

	useEffect(() => {
		if (!open) {
			return;
		}

		setCrop({ x: 0, y: 0 });
		setZoom(1);
		setBaseZoom(1);
		setMediaSize(null);
		setCropSize(null);
		setIsBaseZoomReady(false);
		setCroppedAreaPixels(null);
	}, [open, sourceUrl]);

	useEffect(() => {
		if (!open || isBaseZoomReady || !mediaSize || !cropSize) {
			return;
		}

		const fitZoom = Math.max(
			cropSize.width / mediaSize.width,
			cropSize.height / mediaSize.height,
			1,
		);

		setBaseZoom(fitZoom);
		setZoom(fitZoom);
		setCrop({ x: 0, y: 0 });
		setIsBaseZoomReady(true);
	}, [open, isBaseZoomReady, mediaSize, cropSize]);

	const uiZoom = zoom / baseZoom;

	const onZoomSliderChange = (value: number[]) => {
		const requestedUiZoom = value[0] ?? 1;
		setZoom(requestedUiZoom * baseZoom);
	};

	const handleApply = async () => {
		if (!sourceUrl || !file || !croppedAreaPixels) {
			return;
		}

		setIsApplying(true);

		try {
			const croppedFile = await createCroppedSquareImageFile({
				sourceUrl,
				sourceFile: file,
				croppedArea: croppedAreaPixels,
			});

			onApply(croppedFile);
		} catch {
			toast.error(t('brandingSettings.errors.cropFailed'));
		} finally {
			setIsApplying(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle>{t('brandingSettings.cropper.title')}</DialogTitle>
					<DialogDescription>
						{t('brandingSettings.cropper.description')}
					</DialogDescription>
				</DialogHeader>

				{sourceUrl ? (
					<div className='space-y-4'>
						<div className='relative h-90 w-full overflow-hidden rounded-md border bg-black/80'>
							<Cropper
								aspectRatio={1}
								crop={crop}
								zoom={zoom}
								minZoom={baseZoom}
								maxZoom={baseZoom * 4}
								onCropChange={setCrop}
								onZoomChange={setZoom}
								onCropSizeChange={setCropSize}
								onMediaLoaded={nextMediaSize =>
									setMediaSize({
										width: nextMediaSize.width,
										height: nextMediaSize.height,
									})
								}
								onCropComplete={(_, areaPixels) =>
									setCroppedAreaPixels(areaPixels)
								}
								withGrid
							>
								<CropperImage
									src={sourceUrl}
									alt={t('brandingSettings.cropper.alt')}
								/>
								<CropperArea withGrid />
							</Cropper>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='logoCropZoom'>
								{t('brandingSettings.cropper.zoom')}: {uiZoom.toFixed(2)}x
							</Label>
							<Slider
								id='logoCropZoom'
								min={1}
								max={4}
								step={0.01}
								value={[uiZoom]}
								onValueChange={onZoomSliderChange}
							/>
						</div>
					</div>
				) : null}

				<DialogFooter>
					<Button
						type='button'
						variant='outline'
						onClick={() => onOpenChange(false)}
					>
						{t('common.cancel')}
					</Button>
					<Button
						type='button'
						onClick={() => void handleApply()}
						disabled={!croppedAreaPixels || isApplying}
					>
						{isApplying
							? t('brandingSettings.cropper.applying')
							: t('brandingSettings.cropper.apply')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
