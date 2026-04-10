import { useUserStore } from '@/modules/auth';
import {
	DeleteManualModal,
	ManualsService,
	type ManualItem,
} from '@/modules/manuals';
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, FileText, RefreshCw, Trash2 } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function ManualsPage() {
	const { t } = useTranslation();
	const role = useUserStore(state => state.user?.role);
	const canManageManuals = role === 'ADMIN' || role === 'MANAGER';
	const [carModel, setCarModel] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [search, setSearch] = useState('');
	const [openingManualId, setOpeningManualId] = useState<string | null>(null);
	const [manualToDelete, setManualToDelete] = useState<ManualItem | null>(null);
	const [deletingManualId, setDeletingManualId] = useState<string | null>(null);
	const deferredSearch = useDeferredValue(search.trim());

	const {
		data: manuals,
		isLoading,
		isError,
		isFetching,
		refetch,
	} = useQuery({
		queryKey: ['manuals', deferredSearch],
		queryFn: () =>
			ManualsService.getAll(
				deferredSearch ? { search: deferredSearch } : undefined,
			),
	});

	const handleOpenManual = async (manual: ManualItem) => {
		setOpeningManualId(manual.id);
		try {
			const response = await ManualsService.getOpenLink(manual.id);
			window.open(response.url, '_blank', 'noopener,noreferrer');
		} catch {
			toast.error(t('manuals.openFailed'));
		} finally {
			setOpeningManualId(null);
		}
	};

	const handleUploadManual = async () => {
		const normalizedModel = carModel.trim();

		if (!selectedFile) {
			toast.error(t('manuals.upload.errors.noFile'));
			return;
		}

		if (!normalizedModel) {
			toast.error(t('manuals.upload.errors.noCarModel'));
			return;
		}

		const isPdf =
			selectedFile.type === 'application/pdf' ||
			selectedFile.name.toLowerCase().endsWith('.pdf');

		if (!isPdf) {
			toast.error(t('manuals.upload.errors.onlyPdf'));
			return;
		}

		setIsUploading(true);
		try {
			await ManualsService.uploadManual(selectedFile, normalizedModel);
			toast.success(t('manuals.upload.success'));
			setSelectedFile(null);
			setCarModel('');
			await refetch();
		} catch {
			toast.error(t('manuals.upload.errors.failed'));
		} finally {
			setIsUploading(false);
		}
	};

	const handleDeleteManual = async () => {
		if (!manualToDelete) {
			return;
		}

		setDeletingManualId(manualToDelete.id);
		try {
			const response = await ManualsService.deleteManual(manualToDelete.id);
			if (response.storageCleanupPending) {
				toast.warning(t('manuals.delete.storageCleanupPending'));
			} else {
				toast.success(t('manuals.delete.success'));
			}
			setManualToDelete(null);
			await refetch();
		} catch {
			toast.error(t('manuals.delete.error'));
		} finally {
			setDeletingManualId(null);
		}
	};

	return (
		<div className='space-y-4'>
			<div>
				<h1 className='text-2xl font-semibold'>{t('manuals.title')}</h1>
				<p className='text-sm text-muted-foreground'>{t('manuals.subtitle')}</p>
			</div>

			{canManageManuals && (
				<Card>
					<CardHeader className='space-y-1'>
						<CardTitle>{t('manuals.upload.title')}</CardTitle>
						<p className='text-sm text-muted-foreground'>
							{t('manuals.upload.subtitle')}
						</p>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='grid gap-3 md:grid-cols-2'>
							<Input
								type='text'
								value={carModel}
								onChange={event => setCarModel(event.target.value)}
								placeholder={t('manuals.upload.carModelPlaceholder')}
							/>
							<Input
								type='file'
								accept='application/pdf,.pdf'
								onChange={event =>
									setSelectedFile(event.target.files?.[0] || null)
								}
							/>
						</div>
						<div className='flex items-center justify-between gap-3'>
							<p className='truncate text-sm text-muted-foreground'>
								{selectedFile
									? selectedFile.name
									: t('manuals.upload.noFileSelected')}
							</p>
							<Button
								type='button'
								onClick={() => void handleUploadManual()}
								disabled={isUploading}
							>
								{isUploading
									? t('manuals.upload.uploading')
									: t('manuals.upload.action')}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader className='space-y-3'>
					<CardTitle>{t('manuals.listTitle')}</CardTitle>
					<div className='flex flex-col gap-2 sm:flex-row'>
						<Input
							value={search}
							onChange={event => setSearch(event.target.value)}
							placeholder={t('manuals.searchPlaceholder')}
						/>
						<Button
							type='button'
							variant='outline'
							onClick={() => void refetch()}
							disabled={isFetching}
						>
							<RefreshCw className='mr-2 h-4 w-4' />
							{t('manuals.refresh')}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<p className='text-sm text-muted-foreground'>
							{t('manuals.loading')}
						</p>
					) : isError ? (
						<p className='text-sm text-destructive'>{t('manuals.loadError')}</p>
					) : !manuals || manuals.length === 0 ? (
						<div className='flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center text-muted-foreground'>
							<FileText className='h-5 w-5' />
							<p>{t('manuals.empty')}</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t('manuals.table.filename')}</TableHead>
									<TableHead>{t('manuals.table.carModel')}</TableHead>
									<TableHead>{t('manuals.table.uploadedAt')}</TableHead>
									<TableHead className='text-right'>
										{t('manuals.table.actions')}
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{manuals.map(manual => (
									<TableRow key={manual.id}>
										<TableCell className='font-medium'>
											{manual.filename}
										</TableCell>
										<TableCell>
											{manual.carModel || t('manuals.unknownModel')}
										</TableCell>
										<TableCell>
											{new Date(manual.createdAt).toLocaleString()}
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end gap-2'>
												<Button
													type='button'
													variant='outline'
													onClick={() => void handleOpenManual(manual)}
													disabled={
														openingManualId === manual.id ||
														deletingManualId === manual.id
													}
												>
													<ExternalLink className='mr-2 h-4 w-4' />
													{openingManualId === manual.id
														? t('manuals.opening')
														: t('manuals.open')}
												</Button>
												{canManageManuals && (
													<Button
														type='button'
														variant='destructive'
														onClick={() => setManualToDelete(manual)}
														disabled={
															deletingManualId === manual.id ||
															openingManualId === manual.id
														}
													>
														<Trash2 className='mr-2 h-4 w-4' />
														{deletingManualId === manual.id
															? t('manuals.delete.deleting')
															: t('manuals.delete.action')}
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<DeleteManualModal
				open={Boolean(manualToDelete)}
				onOpenChange={open => {
					if (!open && !deletingManualId) {
						setManualToDelete(null);
					}
				}}
				selectedManual={manualToDelete}
				isDeleting={Boolean(deletingManualId)}
				onConfirm={() => void handleDeleteManual()}
			/>
		</div>
	);
}
