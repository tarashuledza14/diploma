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
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
	ServiceDictionaries,
} from '../interfaces/services.interface';
import { ServicesService } from '../api/services.service';
import { serviceKeys } from '../queries/keys';

interface AddServiceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
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

export function AddServiceDialog({
	open,
	onOpenChange,
	dictionaries,
}: AddServiceDialogProps) {
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

	const { mutateAsync, isPending } = useMutation({
		mutationFn: (values: ServiceFormValues) =>
			ServicesService.create({
				name: values.name,
				description: values.description,
				price: values.price,
				estimatedTime: values.estimatedTime,
				status: values.status,
				categoryId: values.categoryId || undefined,
				requiredCategoryIds: values.requiredCategoryIds,
			}),
		mutationKey: serviceKeys.mutations.create(),
		onSuccess: () => {
			toast.success('Service added successfully');
			queryClient.invalidateQueries({ queryKey: serviceKeys.all });
			onOpenChange(false);
			reset();
		},
		onError: () => {
			toast.error('Failed to add service');
		},
	});

	const onSubmit = async (values: ServiceFormValues) => {
		await mutateAsync(values);
	};

	if (!dictionaries) return null;

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='max-w-2xl'>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>Add Service</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Create a new service. Fill in the details below.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				<form
					className='space-y-4'
					onSubmit={handleSubmit(onSubmit)}
					id='add-service-form'
				>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='add-service-name'>Name</Label>
							<Input
								id='add-service-name'
								placeholder='Service name'
								{...register('name', { required: true })}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='add-service-category'>Category</Label>
							<Controller
								control={control}
								name='categoryId'
								render={({ field }) => (
									<Select
										value={field.value}
										onValueChange={field.onChange}
									>
										<SelectTrigger id='add-service-category'>
											<SelectValue placeholder='Select category' />
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
							<Label htmlFor='add-service-price'>Price</Label>
							<Input
								id='add-service-price'
								type='number'
								step='0.01'
								{...register('price', { valueAsNumber: true })}
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='add-service-time'>
								Estimated Time (hours)
							</Label>
							<Input
								id='add-service-time'
								type='number'
								step='0.1'
								{...register('estimatedTime', { valueAsNumber: true })}
							/>
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='add-service-description'>Description</Label>
						<Textarea
							id='add-service-description'
							placeholder='Short description of the service'
							rows={4}
							{...register('description')}
						/>
					</div>

					<div className='space-y-2'>
						<Label>Parts Included</Label>
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
														const cat =
															dictionaries.partCategories.find(
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
													Select part categories
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
																field.onChange([
																	...field.value,
																	cat.id,
																]);
															} else {
																field.onChange(
																	field.value.filter(
																		id => id !== cat.id,
																	),
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
									onCheckedChange={value =>
										field.onChange(Boolean(value))
									}
								/>
							)}
						/>
						<Label className='cursor-pointer'>Active</Label>
					</div>
				</form>
				<ResponsiveDialogFooter>
					<Button
						variant='outline'
						onClick={() => onOpenChange(false)}
						type='button'
					>
						Cancel
					</Button>
					<Button
						form='add-service-form'
						type='submit'
						disabled={isSubmitting || isPending}
					>
						{isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
						Add Service
					</Button>
				</ResponsiveDialogFooter>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
