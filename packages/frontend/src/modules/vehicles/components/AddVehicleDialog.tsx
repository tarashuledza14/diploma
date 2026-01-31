import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/components/ui';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { VehicleService } from '../api/vehicles.service';
import { AddVehicleData } from '../interfaces/add-vehicle.interface';
import { VehicleForm } from './VehicleForm';

export function AddVehicleDialog() {
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [addLoading, setAddLoading] = useState(false);
	const form = useForm<AddVehicleData>({
		defaultValues: {
			ownerId: '',
			brand: '',
			model: '',
			year: '',
			color: '',
			plate: '',
			vin: '',
			mileage: '',
			status: 'PENDING',
			notes: '',
		},
		mode: 'onChange',
	});

	const { mutate: addVehicle } = useMutation({
		mutationKey: ['add-vehicle'],
		mutationFn: async (data: AddVehicleData) => VehicleService.add(data),
		onSuccess: () => {
			// setAddLoading(false);
			// setAddModalOpen(false);
			// form.reset();
		},
	});

	const handleAddVehicle = form.handleSubmit((data: AddVehicleData) => {
		setAddLoading(true);
		console.log('data:', data);
		// addVehicle(data);
	});

	return (
		<Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className='mr-2 h-4 w-4' />
					Add Vehicle
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-lg'>
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
						onClick={handleAddVehicle}
						disabled={
							addLoading ||
							!form.watch('brand') ||
							!form.watch('model') ||
							!form.watch('year') ||
							!form.watch('plate') ||
							!form.watch('ownerId')
						}
						type='submit'
					>
						{addLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
						Add Vehicle
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
