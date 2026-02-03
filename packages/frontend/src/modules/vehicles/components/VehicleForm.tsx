import { mockClients } from '@/modules/clients';
import {
	Button,
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	Input,
	Label,
	Popover,
	PopoverContent,
	PopoverTrigger,
	ScrollArea,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { VehicleStatusType } from '../enums/vehicle-status.enum';
import { AddVehicleData } from '../interfaces/add-vehicle.interface';

const statusOptions = [
	{ value: 'active', label: 'Active' },
	{ value: 'inactive', label: 'Inactive' },
];

export function VehicleForm({ form }: { form: UseFormReturn<AddVehicleData> }) {
	const [clientOpen, setClientOpen] = useState(false);
	const selectedClient = mockClients.find(c => c.id === form.watch('ownerId'));

	return (
		<ScrollArea className='max-h-[60vh]'>
			<div className='grid gap-4 py-4 pr-4'>
				{/* Client Selection */}
				<div className='grid gap-2'>
					<Label>Owner *</Label>
					<Popover open={clientOpen} onOpenChange={setClientOpen}>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								role='combobox'
								aria-expanded={clientOpen}
								className='justify-between bg-transparent'
								type='button'
							>
								{selectedClient ? (
									<div className='flex items-center gap-2'>
										<User className='h-4 w-4 text-muted-foreground' />
										<span>{selectedClient.name}</span>
									</div>
								) : (
									<span className='text-muted-foreground'>
										Select client...
									</span>
								)}
								<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-full p-0' align='start'>
							<Command>
								<CommandInput placeholder='Search clients...' />
								<CommandList>
									<CommandEmpty>No client found.</CommandEmpty>
									<CommandGroup>
										{mockClients.map(client => (
											<CommandItem
												key={client.id}
												value={client.name}
												onSelect={() => {
													form.setValue('ownerId', client.id, {
														shouldValidate: true,
													});
													setClientOpen(false);
												}}
											>
												<Check
													className={cn(
														'mr-2 h-4 w-4',
														form.watch('ownerId') === client.id
															? 'opacity-100'
															: 'opacity-0',
													)}
												/>
												<div className='flex flex-col'>
													<span>{client.name}</span>
													<span className='text-xs text-muted-foreground'>
														{client.email}
													</span>
												</div>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>
				<div className='grid grid-cols-2 gap-4'>
					<div className='grid gap-2'>
						<Label htmlFor='brand'>Brand *</Label>
						<Input
							id='brand'
							placeholder='BMW'
							{...form.register('brand', { required: true })}
						/>
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='model'>Model *</Label>
						<Input
							id='model'
							placeholder='X5'
							{...form.register('model', { required: true })}
						/>
					</div>
				</div>
				<div className='grid grid-cols-2 gap-4'>
					<div className='grid gap-2'>
						<Label htmlFor='year'>Year *</Label>
						<Input
							id='year'
							placeholder='2023'
							type='number'
							{...form.register('year', { required: true })}
						/>
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
						{...form.register('plate', {
							required: true,
							onChange: e => {
								const upper = e.target.value.toUpperCase();
								form.setValue('plate', upper, { shouldValidate: true });
							},
						})}
					/>
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
							onValueChange={(v: VehicleStatusType) =>
								form.setValue('status', v)
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{statusOptions.map(status => (
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
