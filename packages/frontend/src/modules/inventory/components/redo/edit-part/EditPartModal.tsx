import { InventoryService } from '@/modules/inventory/api/inventory.service';
import {
	InventoryDictionaries,
	InventoryPart,
} from '@/modules/inventory/interfaces/inventory.interfaces';
import { inventoryKeys } from '@/modules/inventory/query/keys';
import {
	Button,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ScrollArea,
} from '@/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { EditPartForm } from './form/EditPartForm';

interface EditPartModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	inventoryPart: InventoryPart | null;
	dictionaries: InventoryDictionaries | undefined;
}
export function EditPartModal({
	open,
	onOpenChange,
	inventoryPart,
	dictionaries,
}: EditPartModalProps) {
	if (!inventoryPart || !open || !dictionaries) return null;
	const queryClient = useQueryClient();
	const [loading, setLoading] = useState(false);
	const { mutate } = useMutation({
		mutationFn: (data: InventoryPart) => InventoryService.updatePart(data),
		mutationKey: inventoryKeys.mutations.update(inventoryPart.id ?? ''),
		onSuccess: () => {
			onOpenChange(false);
			toast.success('Part updated successfully');
			queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
		},
		onError: () => {
			toast.error('Failed to update part');
		},
	});
	const handleSubmit = async (data: InventoryPart) => {
		setLoading(true);
		try {
			if (inventoryPart) {
				mutate(data);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='max-w-2xl max-h-[90vh] overflow-hidden'>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>Edit Part</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Update the part information. Changes will be saved immediately.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				<ScrollArea className='max-h-[55vh] pr-2'>
					<div className='pr-2'>
						<EditPartForm
							inventoryPart={inventoryPart}
							dictionaries={dictionaries}
							onSubmit={handleSubmit}
							isSubmitting={loading}
						/>
					</div>
				</ScrollArea>
				<ResponsiveDialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button form='edit-part-form' type='submit' disabled={loading}>
						Save Changes
					</Button>
				</ResponsiveDialogFooter>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
