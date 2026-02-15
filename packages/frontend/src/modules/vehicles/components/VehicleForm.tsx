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
import { vehicleStatusOptions } from '../constants/vehicle-status.constans';
import { VehicleStatus } from '../enums/vehicle-status.enum';
import { AddVehicleData } from '../interfaces/add-vehicle.interface';

export function VehicleForm({ form }: { form: UseFormReturn<AddVehicleData> }) {
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
					<Label>Owner *</Label>

					<AutoComplete
						value={selectedOwnerId}
						selectedOption={selectedClient}
						options={clientOptions}
						isLoading={isLoadingClients}
						onSearch={setSearchQuery}
						onSelect={id => {
							form.setValue('ownerId', id || '', { shouldValidate: true });
						}}
						placeholder='Select client...'
						emptyMessage='No clients found.'
					/>

					{form.formState.errors.ownerId && (
						<span className='text-red-500 text-xs'>
							{form.formState.errors.ownerId.message}
						</span>
					)}
				</div>

				<div className='grid grid-cols-2 gap-4'>
					<div className='grid gap-2'>
						<Label htmlFor='brand'>Brand *</Label>
						<Input
							id='brand'
							placeholder='BMW'
							{...form.register('brand', { required: true })}
						/>
						{form.formState.errors.brand && (
							<span className='text-red-500 text-xs'>
								{form.formState.errors.brand.message || 'Brand is required'}
							</span>
						)}
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='model'>Model *</Label>
						<Input
							id='model'
							placeholder='X5'
							{...form.register('model', { required: true })}
						/>
						{form.formState.errors.model && (
							<span className='text-red-500 text-xs'>
								{form.formState.errors.model.message || 'Model is required'}
							</span>
						)}
					</div>
				</div>
				<div className='grid grid-cols-2 gap-4'>
					<div className='grid gap-2'>
						<Label htmlFor='year'>Year *</Label>
						<Input
							id='year'
							placeholder='2023'
							type='number'
							{...form.register('year', {
								required: true,
								valueAsNumber: true,
							})}
						/>
						{form.formState.errors.year && (
							<span className='text-red-500 text-xs'>
								{form.formState.errors.year.message || 'Year is required'}
							</span>
						)}
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='color'>Color</Label>
						<Input id='color' placeholder='Black' {...form.register('color')} />
					</div>
				</div>
				<div className='grid gap-2'>
					<Label htmlFor='plate'>License Plate *</Label>
					<Input
						id='plate'
						placeholder='ABC-1234'
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
								'License plate is required'}
						</span>
					)}
				</div>
				<div className='grid gap-2'>
					<Label htmlFor='vin'>VIN</Label>
					<Input
						id='vin'
						placeholder='WBAPH5C55BA123456'
						{...form.register('vin')}
					/>
				</div>
				<div className='grid grid-cols-2 gap-4'>
					<div className='grid gap-2'>
						<Label htmlFor='mileage'>Mileage (km)</Label>
						<Input
							id='mileage'
							placeholder='35000'
							type='number'
							{...form.register('mileage')}
						/>
					</div>
					<div className='grid gap-2'>
						<Label>Status</Label>
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
										{status.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className='grid gap-2'>
					<Label htmlFor='notes'>Notes</Label>
					<Textarea
						id='notes'
						placeholder='Additional notes about the vehicle...'
						rows={3}
						{...form.register('notes')}
					/>
				</div>
			</div>
		</ScrollArea>
	);
}
