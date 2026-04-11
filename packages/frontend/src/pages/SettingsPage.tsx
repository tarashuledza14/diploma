import {
	DEFAULT_APP_NAME,
	LogoCropperDialog,
	useAppBrandingQuery,
	useUpdateBrandingMutation,
	useUploadLogoMutation,
} from '@/modules/app-settings';
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Label,
} from '@/shared';
import { Car } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function SettingsPage() {
	const { t } = useTranslation();
	const { data, isLoading, isError, refetch } = useAppBrandingQuery();
	const { mutateAsync: updateBranding, isPending } =
		useUpdateBrandingMutation();
	const { mutateAsync: uploadLogo, isPending: isUploadingLogo } =
		useUploadLogoMutation();

	const [appName, setAppName] = useState('');
	const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
	const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
	const [isCropperOpen, setIsCropperOpen] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		if (data && !isInitialized) {
			setAppName(data.appName);
			setIsInitialized(true);
		}
	}, [data, isInitialized]);

	const hasChanges = useMemo(() => {
		if (!data) {
			return false;
		}

		return appName.trim() !== data.appName || selectedLogoFile !== null;
	}, [appName, data, selectedLogoFile]);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedAppName = appName.trim();
		if (!trimmedAppName) {
			toast.error(t('brandingSettings.errors.appNameRequired'));
			return;
		}

		try {
			if (trimmedAppName !== data?.appName) {
				await updateBranding({
					appName: trimmedAppName,
				});
			}

			if (selectedLogoFile) {
				await uploadLogo(selectedLogoFile);
				setSelectedLogoFile(null);
			}

			toast.success(t('brandingSettings.messages.saved'));
		} catch {
			toast.error(t('brandingSettings.errors.saveFailed'));
		}
	};

	const previewName = appName.trim() || DEFAULT_APP_NAME;
	const temporaryPreviewLogo = useMemo(
		() => (selectedLogoFile ? URL.createObjectURL(selectedLogoFile) : null),
		[selectedLogoFile],
	);

	useEffect(() => {
		return () => {
			if (temporaryPreviewLogo) {
				URL.revokeObjectURL(temporaryPreviewLogo);
			}
		};
	}, [temporaryPreviewLogo]);

	const previewLogo = temporaryPreviewLogo ?? data?.logoUrl ?? null;
	const isSaving = isPending || isUploadingLogo;

	const onLogoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null;

		// Allow selecting the same file again after closing cropper.
		event.target.value = '';

		if (!file) {
			return;
		}

		if (!file.type.startsWith('image/')) {
			toast.error(t('brandingSettings.errors.logoTypeInvalid'));
			return;
		}

		setCropSourceFile(file);
		setIsCropperOpen(true);
	};

	const onCropperOpenChange = (open: boolean) => {
		setIsCropperOpen(open);

		if (!open) {
			setCropSourceFile(null);
		}
	};

	const onLogoCropped = (file: File) => {
		setSelectedLogoFile(file);
		onCropperOpenChange(false);
	};

	return (
		<>
			<div className='space-y-6'>
				<div>
					<h1 className='text-2xl font-semibold'>
						{t('brandingSettings.title')}
					</h1>
					<p className='text-sm text-muted-foreground'>
						{t('brandingSettings.subtitle')}
					</p>
				</div>

				{isLoading ? (
					<p className='text-sm text-muted-foreground'>{t('common.loading')}</p>
				) : isError ? (
					<div className='rounded-md border border-destructive/30 bg-destructive/5 p-4'>
						<p className='text-sm text-destructive'>
							{t('brandingSettings.errors.loadFailed')}
						</p>
						<Button
							type='button'
							variant='outline'
							size='sm'
							className='mt-3'
							onClick={() => void refetch()}
						>
							{t('brandingSettings.actions.retry')}
						</Button>
					</div>
				) : (
					<div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
						<Card>
							<CardHeader>
								<CardTitle>{t('brandingSettings.form.title')}</CardTitle>
							</CardHeader>
							<CardContent>
								<form className='space-y-4' onSubmit={onSubmit}>
									<div className='space-y-2'>
										<Label htmlFor='appName'>
											{t('brandingSettings.form.appNameLabel')}
										</Label>
										<Input
											id='appName'
											value={appName}
											onChange={event => setAppName(event.target.value)}
											maxLength={80}
											required
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='logoFile'>
											{t('brandingSettings.form.logoLabel')}
										</Label>
										<Input
											id='logoFile'
											type='file'
											accept='image/*'
											onChange={onLogoInputChange}
										/>
										<p className='text-xs text-muted-foreground'>
											{t('brandingSettings.form.logoHint')}
										</p>
										{selectedLogoFile ? (
											<p className='text-xs text-primary'>
												{t('brandingSettings.form.logoSelected', {
													name: selectedLogoFile.name,
												})}
											</p>
										) : null}
									</div>

									<div className='flex justify-end'>
										<Button type='submit' disabled={isSaving || !hasChanges}>
											{isSaving
												? t('common.savingChanges')
												: t('common.saveChanges')}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{t('brandingSettings.previewTitle')}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='flex items-center gap-3 rounded-lg border p-3'>
									<div className='flex size-10 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground'>
										{previewLogo ? (
											<img
												src={previewLogo}
												alt={previewName}
												className='h-full w-full object-cover'
											/>
										) : (
											<Car className='size-5' />
										)}
									</div>
									<div className='min-w-0'>
										<p className='truncate text-sm font-semibold'>
											{previewName}
										</p>
										<p className='text-xs text-muted-foreground'>
											{t('sidebar.brand.plan')}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				)}
			</div>

			<LogoCropperDialog
				open={isCropperOpen}
				file={cropSourceFile}
				onOpenChange={onCropperOpenChange}
				onApply={onLogoCropped}
			/>
		</>
	);
}
