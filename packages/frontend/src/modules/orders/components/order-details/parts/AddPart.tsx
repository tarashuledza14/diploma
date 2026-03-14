import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AddPartProps {
	partOptions: Array<{
		id: string;
		name: string;
		price: number;
		stock: number;
	}>;
	onAddPart: (partId: string, quantity: number) => Promise<void>;
	isPending?: boolean;
}

export function AddPart({
	partOptions,
	onAddPart,
	isPending = false,
}: AddPartProps) {
	const [open, setOpen] = useState(false);
	const [selectedPartId, setSelectedPartId] = useState('');
	const [quantity, setQuantity] = useState(1);

	const handleAdd = async () => {
		if (!selectedPartId) {
			toast.error('Select a part first');
			return;
		}

		await onAddPart(selectedPartId, Math.max(1, quantity));
		setSelectedPartId('');
		setQuantity(1);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button disabled={isPending}>
					<Plus className='mr-2 h-4 w-4' />
					Add Part
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Part</DialogTitle>
					<DialogDescription>
						Search for a part in the inventory to add to this order.
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<Select value={selectedPartId} onValueChange={setSelectedPartId}>
						<SelectTrigger>
							<SelectValue placeholder='Select part' />
						</SelectTrigger>
						<SelectContent>
							{partOptions.map(part => (
								<SelectItem key={part.id} value={part.id}>
									{part.name} - ${part.price} (Stock: {part.stock})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='text-sm font-medium'>Quantity</label>
							<Input
								type='number'
								value={quantity}
								min='1'
								onChange={e => setQuantity(parseInt(e.target.value, 10) || 1)}
							/>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => {
							setOpen(false);
							setSelectedPartId('');
							setQuantity(1);
						}}
					>
						Cancel
					</Button>
					<Button onClick={handleAdd} disabled={isPending || !selectedPartId}>
						Add Part
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
