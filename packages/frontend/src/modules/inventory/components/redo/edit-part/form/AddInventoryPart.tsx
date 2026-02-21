import { InventoryService } from '@/modules/inventory/api/inventory.service';
import {
	InventoryDictionaries,
	InventoryPart,
} from '@/modules/inventory/interfaces/inventory.interfaces';
import { Button, DialogFooter } from '@/shared';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { EditPartForm } from './EditPartForm';

interface AddInventoryPartProps {
	dictionaries: InventoryDictionaries;
	onSuccess?: (part: InventoryPart) => void;
}

export function AddInventoryPart({
	dictionaries,
	onSuccess,
}: AddInventoryPartProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const mutation = useMutation({
		mutationFn: (data: Partial<InventoryPart>) =>
			InventoryService.createPart(data),
		onSuccess: part => {
			setIsSubmitting(false);
			// onSuccess?.(part);
		},
		onError: () => setIsSubmitting(false),
	});

	const handleSubmit = (data: Partial<InventoryPart>) => {
		console.log('data', data);
		setIsSubmitting(true);
		// mutation.mutate(data);
	};

	return (
		<>
			<EditPartForm
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
				dictionaries={dictionaries}
			/>
			<DialogFooter>
				<Button
					type='submit'
					form='edit-part-form' //disabled={isSubmitting}
				>
					{/* {isSubmitting ? 'Adding...' : 'Add Part'} */}
					Add Part
				</Button>
				<Button
					variant='outline' //disabled={isSubmitting}
				>
					Cancel
				</Button>
			</DialogFooter>
		</>
	);
}
