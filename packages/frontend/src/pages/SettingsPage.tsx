import {
	AppCurrency,
	DEFAULT_APP_NAME,
	LogoCropperDialog,
	useAppBrandingQuery,
	useUpdateBrandingMutation,
	useUploadLogoMutation,
} from '@/modules/app-settings';
import { AuthAPI } from '@/modules/auth/api/auth.api';
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared';
import { useMutation } from '@tanstack/react-query';
import { Car } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const currencyOptions: AppCurrency[] = ['UAH', 'USD', 'EUR'];

export function SettingsPage() {
	const { t } = useTranslation();
	const { data, isLoading, isError, refetch } = useAppBrandingQuery();
	const { mutateAsync: updateBranding, isPending } =
		useUpdateBrandingMutation();
	const { mutateAsync: uploadLogo, isPending: isUploadingLogo } =
		useUploadLogoMutation();
	const { mutateAsync: changePassword, isPending: isChangingPassword } =
		useMutation({
			mutationFn: ({
				currentPassword,
				newPassword,
			}: {
				currentPassword: string;
				newPassword: string;
			}) => AuthAPI.changePassword(currentPassword, newPassword),
		});

	const [appName, setAppName] = useState('');
	const [currency, setCurrency] = useState<AppCurrency>('UAH');
	const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
	const [isCropperOpen, setIsCropperOpen] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		if (data && !isInitialized) {
			setAppName(data.appName);
			setCurrency(data.currency);
			setIsInitialized(true);
		}
	}, [data, isInitialized]);

	const hasChanges = useMemo(() => {
		if (!data) {
			return false;
		}

		return (
			appName.trim() !== data.appName ||
			currency !== data.currency ||
			selectedLogoFile !== null
		);
	}, [appName, currency, data, selectedLogoFile]);

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const trimmedAppName = appName.trim();
		if (!trimmedAppName) {
			toast.error(t('brandingSettings.errors.appNameRequired'));
			return;
		}

		try {
			if (trimmedAppName !== data?.appName || currency !== data?.currency) {
				await updateBranding({
					appName: trimmedAppName,
					currency,
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

	const onPasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!currentPassword || !newPassword || !confirmPassword) {
			toast.error(t('passwordSettings.errors.requiredFields'));
			return;
		}

		if (newPassword.length < 8) {
			toast.error(t('passwordSettings.errors.minLength'));
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error(t('passwordSettings.errors.passwordMismatch'));
			return;
		}

		try {
			await changePassword({ currentPassword, newPassword });
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			toast.success(t('passwordSettings.messages.updated'));
		} catch {
			toast.error(t('passwordSettings.errors.updateFailed'));
		}
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
					<div className='space-y-6'>
						<Card>
							<CardHeader>
								<CardTitle>{t('passwordSettings.title')}</CardTitle>
							</CardHeader>
							<CardContent>
								<form className='space-y-4' onSubmit={onPasswordSubmit}>
									<div className='space-y-2'>
										<Label htmlFor='currentPassword'>
											{t('passwordSettings.form.currentPasswordLabel')}
										</Label>
										<Input
											id='currentPassword'
											type='password'
											value={currentPassword}
											onChange={event => setCurrentPassword(event.target.value)}
											autoComplete='current-password'
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='newPassword'>
											{t('passwordSettings.form.newPasswordLabel')}
										</Label>
										<Input
											id='newPassword'
											type='password'
											value={newPassword}
											onChange={event => setNewPassword(event.target.value)}
											autoComplete='new-password'
										/>
									</div>

									<div className='space-y-2'>
										<Label htmlFor='confirmPassword'>
											{t('passwordSettings.form.confirmPasswordLabel')}
										</Label>
										<Input
											id='confirmPassword'
											type='password'
											value={confirmPassword}
											onChange={event => setConfirmPassword(event.target.value)}
											autoComplete='new-password'
										/>
									</div>

									<div className='flex justify-end'>
										<Button type='submit' disabled={isChangingPassword}>
											{isChangingPassword
												? t('common.savingChanges')
												: t('passwordSettings.actions.update')}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>

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
											<Label htmlFor='currency'>
												{t('brandingSettings.form.currencyLabel')}
											</Label>
											<Select
												value={currency}
												onValueChange={value =>
													setCurrency(value as AppCurrency)
												}
											>
												<SelectTrigger id='currency'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{currencyOptions.map(option => (
														<SelectItem key={option} value={option}>
															{t(
																`brandingSettings.form.currencyOptions.${option}`,
															)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
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
