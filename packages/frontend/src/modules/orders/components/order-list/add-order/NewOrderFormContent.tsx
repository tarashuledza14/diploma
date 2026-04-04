import {
	OrderPartItem,
	OrderServiceItem,
} from '@/modules/orders/interfaces/new-order.interface';
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	DialogFooter,
	Input,
	Label,
	ScrollArea,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
	Textarea,
} from '@/shared/components/ui';
import { Loader2, Package, Plus, Wrench } from 'lucide-react';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { OrderPriority, OrderStatus } from '../../../interfaces/order.enums';
import { PartRow } from './PartRow';
import { ServiceRow } from './ServiceRow';

interface NewOrderFormContentProps {
	form: UseFormReturn<any>;
	handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
	clients: any[];
	clientId: string;
	clientVehicles: any[];
	servicesMeta: any[];
	mechanics: any[];
	parts: any[];
	serviceFields: any[];
	partFields: any[];
	addNewService: () => void;
	addNewPart: () => void;
	handleServiceChange: (
		index: number,
		field: keyof OrderServiceItem,
		value: string,
	) => void;
	handlePartChange: (
		index: number,
		field: keyof OrderPartItem,
		value: string | number,
	) => void;
	handleRemoveService: (index: number) => void;
	handleRemovePart: (index: number) => void;
	servicesTotal: number;
	partsTotal: number;
	totalAmount: number;
	isPending: boolean;
	onCancel: () => void;
	submitLabel?: string;
	pendingSubmitLabel?: string;
	showStatusField?: boolean;
	showEndDateField?: boolean;
	minMileage?: number;
}

export const NewOrderFormContent: React.FC<NewOrderFormContentProps> = ({
	form,
	handleSubmit,
	clients,
	clientId,
	clientVehicles,
	servicesMeta,
	mechanics,
	parts,
	serviceFields,
	partFields,
	addNewService,
	addNewPart,
	handleServiceChange,
	handlePartChange,
	handleRemoveService,
	handleRemovePart,
	servicesTotal,
	partsTotal,
	totalAmount,
	isPending,
	onCancel,
	submitLabel,
	pendingSubmitLabel,
	showStatusField = false,
	showEndDateField = false,
	minMileage = 0,
}) => {
	const { t } = useTranslation();
	const resolvedSubmitLabel =
		submitLabel ?? t('orders.newOrder.actions.createWorkOrder');
	const resolvedPendingSubmitLabel =
		pendingSubmitLabel ?? t('orders.newOrder.actions.creatingWorkOrder');

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<ScrollArea className='h-[calc(90vh-200px)] pr-4'>
					<div className='space-y-6 py-4'>
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>
									{t('orders.newOrder.sections.vehicleClientDetails')}
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label>{t('orders.newOrder.fields.client')} *</Label>
										<Select
											onValueChange={value => {
												form.setValue('clientId', value);
												form.setValue('vehicleId', '');
											}}
											value={form.watch('clientId')}
										>
											<SelectTrigger>
												<SelectValue
													placeholder={t(
														'orders.newOrder.placeholders.selectClient',
													)}
												/>
											</SelectTrigger>
											<SelectContent>
												{clients.map(client => (
													<SelectItem key={client.id} value={client.id}>
														{client.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{form.formState.errors.clientId && (
											<p className='text-sm text-red-500'>
												{form.formState.errors.clientId.message as string}
											</p>
										)}
									</div>

									<div className='space-y-2'>
										<Label>{t('orders.newOrder.fields.vehicle')} *</Label>
										<Select
											onValueChange={value => form.setValue('vehicleId', value)}
											value={form.watch('vehicleId')}
											disabled={!clientId || clientVehicles.length === 0}
										>
											<SelectTrigger>
												<SelectValue
													placeholder={t(
														'orders.newOrder.placeholders.selectVehicle',
													)}
												/>
											</SelectTrigger>
											<SelectContent>
												{clientVehicles.map(vehicle => (
													<SelectItem key={vehicle.id} value={vehicle.id}>
														{vehicle.year} {vehicle.make} {vehicle.model} -{' '}
														{vehicle.licensePlate}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{form.formState.errors.vehicleId && (
											<p className='text-sm text-red-500'>
												{form.formState.errors.vehicleId.message as string}
											</p>
										)}
									</div>
								</div>

								<div className='grid grid-cols-2 gap-4'>
									<div className='space-y-2'>
										<Label>
											{t('orders.newOrder.fields.currentMileage')} *
											{minMileage > 0 && (
												<span className='ml-1 text-xs text-muted-foreground'>
													{t('orders.newOrder.labels.minMileage', {
														min: minMileage.toLocaleString(),
													})}
												</span>
											)}
										</Label>
										<Input
											type='number'
											min={minMileage || 1}
											placeholder={t(
												'orders.newOrder.placeholders.currentMileage',
											)}
											value={form.watch('mileage') || ''}
											className={
												form.formState.errors.mileage
													? 'border-red-500 focus-visible:ring-red-500'
													: ''
											}
											onChange={e => {
												const val = parseInt(e.target.value);
												const numVal = isNaN(val) ? 0 : val;
												form.setValue('mileage', numVal, { shouldDirty: true });
												if (numVal < 1) {
													form.setError('mileage', {
														message: t(
															'orders.newOrder.messages.mileageGreaterThanZero',
														),
													});
												} else if (minMileage > 0 && numVal < minMileage) {
													form.setError('mileage', {
														message: t(
															'orders.newOrder.messages.minMileageError',
															{
																min: minMileage.toLocaleString(),
															},
														),
													});
												} else {
													form.clearErrors('mileage');
												}
											}}
										/>
										{form.formState.errors.mileage && (
											<p className='text-sm text-red-500'>
												{form.formState.errors.mileage.message as string}
											</p>
										)}
									</div>

									<div className='space-y-2'>
										<Label>{t('common.priority')}</Label>
										<Select
											onValueChange={value =>
												form.setValue('priority', value as OrderPriority)
											}
											value={form.watch('priority')}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Object.values(OrderPriority).map(priority => (
													<SelectItem key={priority} value={priority}>
														{t(`orderPriority.${priority}`)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										{form.formState.errors.priority && (
											<p className='text-sm text-red-500'>
												{form.formState.errors.priority.message as string}
											</p>
										)}
									</div>
								</div>

								{showStatusField && (
									<div className='grid grid-cols-1 gap-4'>
										<div className='space-y-2'>
											<Label>{t('common.status')}</Label>
											<Select
												onValueChange={value =>
													form.setValue('status', value as OrderStatus)
												}
												value={form.watch('status')}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{Object.values(OrderStatus).map(status => (
														<SelectItem key={status} value={status}>
															{t(`orderStatus.${status}`)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{form.formState.errors.status && (
												<p className='text-sm text-red-500'>
													{form.formState.errors.status.message as string}
												</p>
											)}
										</div>
									</div>
								)}

								{showEndDateField && (
									<div className='grid grid-cols-1 gap-4'>
										<div className='space-y-2'>
											<Label>{t('orders.newOrder.fields.endDate')}</Label>
											<Input
												type='date'
												value={form.watch('endDate') || ''}
												onChange={e => form.setValue('endDate', e.target.value)}
											/>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>
									{t('orders.newOrder.sections.orderItems')}
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-6'>
								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<h3 className='text-base font-medium flex items-center gap-2'>
											<Wrench className='h-4 w-4 text-blue-500' />
											{t('orders.columns.services')}
										</h3>
										<Button
											type='button'
											variant='outline'
											size='sm'
											onClick={addNewService}
										>
											<Plus className='h-4 w-4 mr-2' />
											{t('orders.newOrder.actions.addService')}
										</Button>
									</div>

									{serviceFields.length === 0 ? (
										<div className='text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg'>
											<Wrench className='h-8 w-8 mx-auto mb-2 opacity-50' />
											<p>{t('orders.newOrder.empty.noServices')}</p>
											<p className='text-sm'>
												{t('orders.newOrder.empty.clickAddService')}
											</p>
										</div>
									) : (
										<div className='space-y-3'>
											{serviceFields.map((field, index) => (
												<ServiceRow
													key={field.id}
													index={index}
													service={field}
													services={servicesMeta}
													mechanics={mechanics}
													onRemove={() => handleRemoveService(index)}
													onChange={(fieldName, value) =>
														handleServiceChange(index, fieldName, value)
													}
												/>
											))}
										</div>
									)}
								</div>

								<Separator />

								<div className='space-y-4'>
									<div className='flex items-center justify-between'>
										<h3 className='text-base font-medium flex items-center gap-2'>
											<Package className='h-4 w-4 text-green-500' />
											{t('orders.newOrder.fields.parts')}
										</h3>
										<Button
											type='button'
											variant='outline'
											size='sm'
											onClick={addNewPart}
										>
											<Plus className='h-4 w-4 mr-2' />
											{t('orders.newOrder.actions.addPart')}
										</Button>
									</div>

									{partFields.length === 0 ? (
										<div className='text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg'>
											<Package className='h-8 w-8 mx-auto mb-2 opacity-50' />
											<p>{t('orders.newOrder.empty.noParts')}</p>
											<p className='text-sm'>
												{t('orders.newOrder.empty.clickAddPart')}
											</p>
										</div>
									) : (
										<div className='space-y-3'>
											{partFields.map((field, index) => (
												<PartRow
													key={field.id}
													index={index}
													part={field}
													parts={parts}
													onRemove={() => handleRemovePart(index)}
													onChange={(fieldName, value) =>
														handlePartChange(index, fieldName, value)
													}
												/>
											))}
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>
									{t('orders.newOrder.sections.orderSummary')}
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='space-y-2'>
									<Label>{t('common.notes')}</Label>
									<Textarea
										placeholder={t(
											'orders.newOrder.placeholders.additionalNotes',
										)}
										rows={3}
										value={form.watch('notes')}
										onChange={e => form.setValue('notes', e.target.value)}
									/>
									{form.formState.errors.notes && (
										<p className='text-sm text-red-500'>
											{form.formState.errors.notes.message as string}
										</p>
									)}
								</div>

								<Separator />

								<div className='space-y-2'>
									<div className='flex justify-between text-sm'>
										<span>{t('orders.newOrder.summary.servicesTotal')}</span>
										<span className='font-medium'>
											${servicesTotal.toFixed(2)}
										</span>
									</div>
									<div className='flex justify-between text-sm'>
										<span>{t('orders.newOrder.summary.partsTotal')}</span>
										<span className='font-medium'>
											${partsTotal.toFixed(2)}
										</span>
									</div>
									<Separator />
									<div className='flex justify-between text-base font-semibold'>
										<span>{t('orders.newOrder.summary.totalAmount')}</span>
										<span>${totalAmount.toFixed(2)}</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</ScrollArea>

				<DialogFooter className='border-t pt-4'>
					<Button
						type='button'
						variant='outline'
						onClick={onCancel}
						disabled={isPending}
					>
						{t('common.cancel')}
					</Button>
					<Button type='submit' disabled={isPending || !form.formState.isValid}>
						{isPending ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								{resolvedPendingSubmitLabel}
							</>
						) : (
							<>
								<Plus className='mr-2 h-4 w-4' />
								{resolvedSubmitLabel}
							</>
						)}
					</Button>
				</DialogFooter>
			</form>
		</div>
	);
};
