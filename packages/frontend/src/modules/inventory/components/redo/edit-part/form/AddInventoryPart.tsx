import { InventoryService } from '@/modules/inventory/api/inventory.service';
import {
	InventoryDictionaries,
	InventoryPart,
} from '@/modules/inventory/interfaces/inventory.interfaces';
import { inventoryKeys } from '@/modules/inventory/query/keys';
import { Button, ResponsiveDialogFooter } from '@/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { EditPartForm } from './EditPartForm';

interface AddInventoryPartProps {
	dictionaries: InventoryDictionaries;
	onCancel: () => void;
}

export function AddInventoryPart({
	dictionaries,
	onCancel,
}: AddInventoryPartProps) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (data: Partial<InventoryPart>) =>
			InventoryService.createPart(data),
		onSuccess: part => {
			queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
			queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
			toast.success(`Part "${part.name}" added successfully!`);
			onCancel();
		},
		onError: error => {
			console.error('Failed to create part:', error);
			toast.error('Failed to create part. Please try again.');
		},
	});

	const handleSubmit = (data: Partial<InventoryPart>) => {
		mutation.mutate(data);
	};

	return (
		<>
			<EditPartForm
				onSubmit={handleSubmit}
				isSubmitting={mutation.isPending}
				dictionaries={dictionaries}
			/>

			<ResponsiveDialogFooter>
				<Button
					type='button'
					variant='outline'
					disabled={mutation.isPending}
					onClick={onCancel}
				>
					Cancel
				</Button>
				<Button
					type='submit'
					form='edit-part-form' // Має збігатися з ID форми всередині EditPartForm
					disabled={mutation.isPending}
				>
					{mutation.isPending ? 'Adding...' : 'Add Part'}
				</Button>
			</ResponsiveDialogFooter>
		</>
	);
}
