import { cn } from '@/lib/utils';
import {
	Button,
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	Label,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/shared/components/ui';
import { Car, Check, ChevronsUpDown } from 'lucide-react';
import React from 'react';

export interface VehicleSelectProps {
	vehicles: any[];
	selectedVehicle: string;
	setSelectedVehicle: (id: string) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
	disabled?: boolean;
	selectedClient?: string;
}

export const VehicleSelect: React.FC<VehicleSelectProps> = ({
	vehicles,
	selectedVehicle,
	setSelectedVehicle,
	open,
	setOpen,
	disabled,
	selectedClient,
}) => {
	const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);
	return (
		<div className='space-y-2'>
			<Label>Vehicle *</Label>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						role='combobox'
						aria-expanded={open}
						className='w-full justify-between bg-transparent'
						disabled={disabled}
					>
						{selectedVehicleData ? (
							<div className='flex items-center gap-2'>
								<Car className='h-4 w-4 text-muted-foreground' />
								<span>
									{selectedVehicleData.year} {selectedVehicleData.make}{' '}
									{selectedVehicleData.model}
								</span>
								<span className='text-muted-foreground'>
									({selectedVehicleData.plate})
								</span>
							</div>
						) : (
							<span className='text-muted-foreground'>
								{selectedClient
									? 'Select a vehicle...'
									: 'Select a client first...'}
							</span>
						)}
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-125 p-0' align='start'>
					<Command>
						<CommandInput placeholder='Search vehicles...' />
						<CommandList>
							<CommandEmpty>No vehicle found.</CommandEmpty>
							<CommandGroup>
								{vehicles.map(vehicle => (
									<CommandItem
										key={vehicle.id}
										value={`${vehicle.make} ${vehicle.model} ${vehicle.plate}`}
										onSelect={() => {
											setSelectedVehicle(vehicle.id);
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												'mr-2 h-4 w-4',
												selectedVehicle === vehicle.id
													? 'opacity-100'
													: 'opacity-0',
											)}
										/>
										<div className='flex flex-col'>
											<span>
												{vehicle.year} {vehicle.make} {vehicle.model}
											</span>
											<span className='text-xs text-muted-foreground'>
												Plate: {vehicle.plate}
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
	);
};
