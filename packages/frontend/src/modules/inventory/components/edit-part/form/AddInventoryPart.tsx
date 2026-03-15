import { InventoryService } from '@/modules/inventory/api/inventory.service';
import {
	InventoryDictionaries,
	InventoryPart,
} from '@/modules/inventory/interfaces/inventory.interfaces';
import { inventoryKeys } from '@/modules/inventory/query/keys';
import { Button, ResponsiveDialogFooter } from '@/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (data: Partial<InventoryPart>) =>
			InventoryService.createPart(data),
		onSuccess: part => {
			queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
			queryClient.invalidateQueries({ queryKey: inventoryKeys.stats() });
			toast.success(t('inventory.messages.addSuccess', { name: part.name }));
			onCancel();
		},
		onError: error => {
			console.error('Failed to create part:', error);
			toast.error(t('inventory.messages.addError'));
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
					{t('common.cancel')}
				</Button>
				<Button
					type='submit'
					form='edit-part-form' // Має збігатися з ID форми всередині EditPartForm
					disabled={mutation.isPending}
				>
					{mutation.isPending
						? t('common.adding')
						: t('inventory.actions.addPart')}
				</Button>
			</ResponsiveDialogFooter>
		</>
	);
}
