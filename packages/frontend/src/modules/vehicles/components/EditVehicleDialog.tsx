import {
	Button,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from '@/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod/v3';
import { VehicleService } from '../api/vehicles.service';
import { VehicleStatus } from '../enums/vehicle-status.enum';
import { AddVehicleData } from '../interfaces/add-vehicle.interface';
import { VehicleWithOwnerInfo } from '../interfaces/get-vehicle.interface';
import { vehicleKeys } from '../query/keys';
import { VehicleForm } from './VehicleForm';

const editVehicleSchema = z.object({
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

interface EditVehicleDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedVehicle?: VehicleWithOwnerInfo;
}

export function EditVehicleDialog({
	open,
	onOpenChange,
	selectedVehicle,
}: EditVehicleDialogProps) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const form = useForm<AddVehicleData>({
		resolver: zodResolver(editVehicleSchema),
		mode: 'onChange',
		defaultValues: {
			ownerId: '',
			brand: '',
			model: '',
			year: new Date().getFullYear(),
			color: '',
			plateNumber: '',
			vin: '',
			mileage: '',
			status: VehicleStatus.OUT,
			notes: '',
		},
	});

	useEffect(() => {
		if (!selectedVehicle || !open) {
			return;
		}

		form.reset({
			ownerId: selectedVehicle.ownerId,
			brand: selectedVehicle.brand,
			model: selectedVehicle.model,
			year: selectedVehicle.year,
			color: selectedVehicle.color || '',
			plateNumber: selectedVehicle.plateNumber || '',
			vin: selectedVehicle.vin,
			mileage: String(selectedVehicle.mileage ?? ''),
			status: selectedVehicle.status,
			notes: selectedVehicle.notes || '',
		});
	}, [selectedVehicle, open, form]);

	const { mutate: updateVehicle, isPending } = useMutation({
		mutationKey: vehicleKeys.mutations.update(selectedVehicle?.id ?? ''),
		mutationFn: async (data: AddVehicleData) => {
			if (!selectedVehicle) return null;
			return VehicleService.updateVehicle(selectedVehicle.id, data);
		},
		onSuccess: () => {
			onOpenChange(false);
			toast.success(t('vehicles.messages.updateSuccess'));
			queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
		},
		onError: () => {
			toast.error(t('vehicles.messages.updateError'));
		},
	});

	const handleUpdateVehicle = form.handleSubmit(
		(data: AddVehicleData) => {
			if (!selectedVehicle) return;
			updateVehicle(data);
		},
		() => {
			toast.error(t('vehicles.messages.formHasErrors'));
		},
	);

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='max-w-lg'>
				<form onSubmit={handleUpdateVehicle}>
					<ResponsiveDialogHeader>
						<ResponsiveDialogTitle>
							{t('vehicles.dialogs.editTitle')}
						</ResponsiveDialogTitle>
						<ResponsiveDialogDescription>
							{t('vehicles.dialogs.editDescription')}
						</ResponsiveDialogDescription>
					</ResponsiveDialogHeader>
					<VehicleForm form={form} />
					<ResponsiveDialogFooter>
						<Button
							variant='outline'
							onClick={() => onOpenChange(false)}
							type='button'
						>
							{t('common.cancel')}
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
							{t('common.saveChanges')}
						</Button>
					</ResponsiveDialogFooter>
				</form>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
