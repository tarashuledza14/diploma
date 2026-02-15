import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod/v3';
import { VehicleService } from '../api/vehicles.service';
import { VehicleStatus } from '../enums/vehicle-status.enum';
import { AddVehicleData } from '../interfaces/add-vehicle.interface';
import { vehicleKeys } from '../query/keys';
import { VehicleForm } from './VehicleForm';

const addVehicleSchema = z.object({
	ownerId: z.string().min(1, 'Owner is required'),
	brand: z.string().min(1, 'Brand is required'),
	model: z.string().min(1, 'Model is required'),
	year: z
		.number()
		.min(1886, 'Year must be valid')
		.max(new Date().getFullYear() + 1, 'Year is too far in the future'),
	color: z.string(),
	plateNumber: z.string().min(1, 'Plate is required'),
	vin: z.string(),
	mileage: z.string(),
	status: z.nativeEnum(VehicleStatus),
	notes: z.string(),
});

export function AddVehicleDialog() {
	const [addModalOpen, setAddModalOpen] = useState(false);
	const queryClient = useQueryClient();
	const form = useForm<AddVehicleData>({
		resolver: zodResolver(addVehicleSchema),
		mode: 'onChange',
	});

	const { mutate: addVehicle, isPending } = useMutation({
		mutationKey: vehicleKeys.mutations.add(),
		mutationFn: async (data: AddVehicleData) => VehicleService.add(data),
		onSuccess: () => {
			setAddModalOpen(false);
			toast.success('Vehicle added successfully');
			form.reset();
			queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
		},
		onError: () => {
			toast.error('Failed to add vehicle');
		},
	});

	const handleAddVehicle = form.handleSubmit(
		(data: AddVehicleData) => {
			console.log('data:', data);
			addVehicle(data);
		},
		error => {
			toast.error(
				'Error: ' + error.root?.message || 'Please check the form for errors',
			);
		},
	);

	return (
		<Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className='mr-2 h-4 w-4' />
					Add Vehicle
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-lg'>
				<form onSubmit={handleAddVehicle}>
					<DialogHeader>
						<DialogTitle>Add New Vehicle</DialogTitle>
						<DialogDescription>
							Enter the vehicle details below.
						</DialogDescription>
					</DialogHeader>
					<VehicleForm form={form} />
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() => setAddModalOpen(false)}
							type='button'
						>
							Cancel
						</Button>
						<Button
							disabled={
								isPending ||
								!form.watch('brand') ||
								!form.watch('model') ||
								!form.watch('year') ||
								!form.watch('plateNumber') ||
								!form.watch('ownerId')
							}
							type='submit'
						>
							{isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
							Add Vehicle
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
