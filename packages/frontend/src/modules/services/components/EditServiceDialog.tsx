import {
	Badge,
	Button,
	Checkbox,
	Input,
	Label,
	Popover,
	PopoverContent,
	PopoverTrigger,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from '@/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ServicesService } from '../api/services.service';
import { Service, ServiceDictionaries } from '../interfaces/services.interface';
import { serviceKeys } from '../queries/keys';

interface EditServiceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	service: Service | null;
	dictionaries: ServiceDictionaries | undefined;
}

interface ServiceFormValues {
	name: string;
	description: string;
	price: number;
	estimatedTime: number;
	categoryId: string;
	requiredCategoryIds: string[];
	status: boolean;
}

export function EditServiceDialog({
	open,
	onOpenChange,
	service,
	dictionaries,
}: EditServiceDialogProps) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const {
		control,
		register,
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = useForm<ServiceFormValues>({
		defaultValues: {
			name: '',
			description: '',
			price: 0,
			estimatedTime: 0,
			categoryId: '',
			requiredCategoryIds: [],
			status: true,
		},
	});

	useEffect(() => {
		if (service) {
			reset({
				name: service.name ?? '',
				description: service.description ?? '',
				price: service.price ?? 0,
				estimatedTime: service.estimatedTime ?? 0,
				categoryId:
					(service.category && service.category.id) ||
					(service.categoryId != null ? String(service.categoryId) : ''),
				requiredCategoryIds: service.requiredCategories?.map(c => c.id) ?? [],
				status: service.status ?? true,
			});
		}
	}, [service, reset]);

	const { mutateAsync } = useMutation({
		mutationFn: (values: ServiceFormValues) => {
			if (!service) {
				return Promise.resolve(null);
			}

			return ServicesService.update({
				id: service.id,
				name: values.name,
				description: values.description,
				price: values.price,
				estimatedTime: values.estimatedTime,
				status: values.status,
				categoryId: values.categoryId || undefined,
				requiredCategoryIds: values.requiredCategoryIds,
			});
		},
		mutationKey: ['services', 'update', service?.id],
		onSuccess: () => {
			toast.success(t('services.messages.updateSuccess'));
			queryClient.invalidateQueries({ queryKey: serviceKeys.all });
			onOpenChange(false);
		},
		onError: () => {
			toast.error(t('services.messages.updateError'));
		},
	});

	if (!open || !service || !dictionaries) {
		return null;
	}

	const onSubmit = async (values: ServiceFormValues) => {
		await mutateAsync(values);
	};

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='max-w-2xl'>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>
						{t('services.dialogs.editTitle')}
					</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						{t('services.dialogs.editDescription')}
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				<form
					className='space-y-4'
					onSubmit={handleSubmit(onSubmit)}
					id='edit-service-form'
				>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='service-name'>{t('services.columns.name')}</Label>
							<Input
								id='service-name'
								placeholder={t('services.placeholders.name')}
								{...register('name', { required: true })}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='service-category'>
								{t('services.columns.category')}
							</Label>
							<Controller
								control={control}
								name='categoryId'
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger id='service-category'>
											<SelectValue
												placeholder={t('services.placeholders.selectCategory')}
											/>
										</SelectTrigger>
										<SelectContent>
											{dictionaries.serviceCategories.map(category => (
												<SelectItem
													key={category.id}
													value={String(category.id)}
												>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
						</div>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='service-price'>
								{t('services.columns.price')}
							</Label>
							<Input
								id='service-price'
								type='number'
								step='0.01'
								{...register('price', { valueAsNumber: true })}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='service-time'>
								{t('services.fields.estimatedTimeHours')}
							</Label>
							<Input
								id='service-time'
								type='number'
								step='0.1'
								{...register('estimatedTime', { valueAsNumber: true })}
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='service-description'>
							{t('services.fields.description')}
						</Label>
						<Textarea
							id='service-description'
							placeholder={t('services.placeholders.description')}
							rows={4}
							{...register('description')}
						/>
					</div>

					<div className='space-y-2'>
						<Label>{t('services.columns.partsIncluded')}</Label>
						<Controller
							control={control}
							name='requiredCategoryIds'
							render={({ field }) => (
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant='outline'
											className='w-full justify-start font-normal'
										>
											{field.value.length > 0 ? (
												<span className='flex flex-wrap gap-1'>
													{field.value.slice(0, 2).map(id => {
														const cat = dictionaries.partCategories.find(
															c => c.id === id,
														);
														return cat ? (
															<Badge
																key={id}
																variant='secondary'
																className='text-xs'
															>
																{cat.name}
															</Badge>
														) : null;
													})}
													{field.value.length > 2 && (
														<Badge variant='outline'>
															+{field.value.length - 2}
														</Badge>
													)}
												</span>
											) : (
												<span className='text-muted-foreground'>
													{t('services.placeholders.selectPartCategories')}
												</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className='w-auto max-w-[min(90vw,20rem)] p-3'
										align='start'
									>
										<div className='flex flex-col gap-2 max-h-60 overflow-y-auto'>
											{dictionaries.partCategories.map(cat => (
												<label
													key={cat.id}
													className='flex items-center gap-2 cursor-pointer'
												>
													<Checkbox
														checked={field.value.includes(cat.id)}
														onCheckedChange={checked => {
															if (checked) {
																field.onChange([...field.value, cat.id]);
															} else {
																field.onChange(
																	field.value.filter(id => id !== cat.id),
																);
															}
														}}
													/>
													<span className='text-sm'>{cat.name}</span>
												</label>
											))}
										</div>
									</PopoverContent>
								</Popover>
							)}
						/>
					</div>

					<div className='flex items-center gap-2'>
						<Controller
							control={control}
							name='status'
							render={({ field }) => (
								<Checkbox
									checked={field.value}
									onCheckedChange={value => field.onChange(Boolean(value))}
								/>
							)}
						/>
						<Label className='cursor-pointer'>
							{t('services.status.active')}
						</Label>
					</div>
				</form>
				<ResponsiveDialogFooter>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						type='button'
					>
						{t('common.cancel')}
					</Button>
					<Button
						form='edit-service-form'
						type='submit'
						disabled={isSubmitting}
					>
						{t('common.saveChanges')}
					</Button>
				</ResponsiveDialogFooter>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
