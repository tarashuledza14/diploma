// import { mockClients } from '@/modules/clients';
import { ClientService } from '@/modules/clients';
import { AutoComplete } from '@/shared';
import {
	Input,
	Label,
	ScrollArea,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from '@/shared/components/ui';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { vehicleStatusOptions } from '../constants/vehicle-status.constans';
import { VehicleStatus } from '../enums/vehicle-status.enum';
import { AddVehicleData } from '../interfaces/add-vehicle.interface';

export function VehicleForm({ form }: { form: UseFormReturn<AddVehicleData> }) {
	const { t } = useTranslation();
	const [searchQuery, setSearchQuery] = useState('');

	const { data: clientOptions = [], isLoading: isLoadingClients } = useQuery({
		queryKey: ['clients-list', searchQuery],
		queryFn: async () => {
			const { data } = await ClientService.getClients({
				filters: [
					{
						id: 'fullName',
						value: searchQuery,
						operator: 'iLike',
						variant: 'text',
					},
					{
						id: 'email',
						value: searchQuery,
						operator: 'iLike',
						variant: 'text',
					},
					{
						id: 'phone',
						value: searchQuery,
						operator: 'iLike',
						variant: 'text',
					},
				],
				joinOperator: 'or',
				perPage: 20,
				page: 1,
			});

			return data.map(client => ({
				id: client.id,
				label: client.fullName,
				description: [client.email, client.phone].filter(Boolean).join(' | '),
			}));
		},
		placeholderData: prev => prev,
	});

	const selectedOwnerId = form.watch('ownerId');

	const { data: selectedClient } = useQuery({
		queryKey: ['client-detail', selectedOwnerId],
		queryFn: async () => {
			const res = await ClientService.getClientDetails(selectedOwnerId);
			return {
				id: res.id,
				label: res.fullName,
				description: [res.email, res.phone].filter(Boolean).join(' | '),
			};
		},
		enabled: !!selectedOwnerId,
	});

	return (
		<ScrollArea>
			<div className='grid gap-4 py-4 pr-4'>
				<div className='grid gap-2'>
					<Label>{t('vehicles.fields.owner')} *</Label>

					<AutoComplete
						value={selectedOwnerId}
						selectedOption={selectedClient}
						options={clientOptions}
						isLoading={isLoadingClients}
						onSearch={setSearchQuery}
						onSelect={id => {
							form.setValue('ownerId', id || '', { shouldValidate: true });
						}}
						placeholder={t('vehicles.placeholders.selectClient')}
						emptyMessage={t('vehicles.empty.noClients')}
					/>

					{form.formState.errors.ownerId && (
						<span className='text-red-500 text-xs'>
							{form.formState.errors.ownerId.message}
						</span>
					)}
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div className='grid gap-2'>
						<Label htmlFor='brand'>{t('vehicles.fields.brand')} *</Label>
						<Input
							id='brand'
							placeholder={t('vehicles.placeholders.examples.brand')}
							{...form.register('brand', { required: true })}
						/>
						{form.formState.errors.brand && (
							<span className='text-red-500 text-xs'>
								{form.formState.errors.brand.message ||
									t('vehicles.errors.brandRequired')}
							</span>
						)}
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='model'>{t('vehicles.fields.model')} *</Label>
						<Input
							id='model'
							placeholder={t('vehicles.placeholders.examples.model')}
							{...form.register('model', { required: true })}
						/>
						{form.formState.errors.model && (
							<span className='text-red-500 text-xs'>
								{form.formState.errors.model.message ||
									t('vehicles.errors.modelRequired')}
							</span>
						)}
					</div>
				</div>
				<div className='grid grid-cols-2 gap-4'>
					<div className='grid gap-2'>
						<Label htmlFor='year'>{t('vehicles.fields.year')} *</Label>
						<Input
							id='year'
							placeholder={t('vehicles.placeholders.examples.year')}
							type='number'
							{...form.register('year', {
								required: true,
								valueAsNumber: true,
							})}
						/>
						{form.formState.errors.year && (
							<span className='text-red-500 text-xs'>
								{form.formState.errors.year.message ||
									t('vehicles.errors.yearRequired')}
							</span>
						)}
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='color'>{t('vehicles.fields.color')}</Label>
						<Input
							id='color'
							placeholder={t('vehicles.placeholders.examples.color')}
							{...form.register('color')}
						/>
					</div>
				</div>
				<div className='grid gap-2'>
					<Label htmlFor='plate'>{t('vehicles.fields.licensePlate')} *</Label>
					<Input
						id='plate'
						placeholder={t('vehicles.placeholders.examples.licensePlate')}
						style={{ textTransform: 'uppercase' }}
						{...form.register('plateNumber', {
							required: true,
							onChange: e => {
								const upper = e.target.value.toUpperCase();
								form.setValue('plateNumber', upper, { shouldValidate: true });
							},
						})}
					/>
					{form.formState.errors.plateNumber && (
						<span className='text-red-500 text-xs'>
							{form.formState.errors.plateNumber.message ||
								t('vehicles.errors.licensePlateRequired')}
						</span>
					)}
				</div>
				<div className='grid gap-2'>
					<Label htmlFor='vin'>{t('vehicles.fields.vin')}</Label>
					<Input
						id='vin'
						placeholder={t('vehicles.placeholders.examples.vin')}
						{...form.register('vin')}
					/>
				</div>
				<div className='grid grid-cols-2 gap-4'>
					<div className='grid gap-2'>
						<Label htmlFor='mileage'>{t('vehicles.fields.mileageKm')}</Label>
						<Input
							id='mileage'
							placeholder={t('vehicles.placeholders.examples.mileage')}
							type='number'
							{...form.register('mileage')}
						/>
					</div>
					<div className='grid gap-2'>
						<Label>{t('common.status')}</Label>
						<Select
							value={form.watch('status')}
							onValueChange={(v: VehicleStatus) => form.setValue('status', v)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent defaultValue={vehicleStatusOptions[1].value}>
								{vehicleStatusOptions.map(status => (
									<SelectItem key={status.value} value={status.value}>
										{t(`vehicleStatus.${status.value}`)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className='grid gap-2'>
					<Label htmlFor='notes'>{t('common.notes')}</Label>
					<Textarea
						id='notes'
						placeholder={t('vehicles.placeholders.notes')}
						rows={3}
						{...form.register('notes')}
					/>
				</div>
			</div>
		</ScrollArea>
	);
}
