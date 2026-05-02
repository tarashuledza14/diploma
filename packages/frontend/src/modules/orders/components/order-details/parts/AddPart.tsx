import { useCurrencyFormatter } from '@/modules/app-settings';
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
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation();
	const { formatCurrency } = useCurrencyFormatter();
	const [open, setOpen] = useState(false);
	const [selectedPartId, setSelectedPartId] = useState('');
	const [quantity, setQuantity] = useState(1);

	const handleAdd = async () => {
		if (!selectedPartId) {
			toast.error(t('orders.newOrder.messages.selectPartFirst'));
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
					{t('orders.newOrder.actions.addPart')}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('orders.newOrder.dialogs.addPartTitle')}</DialogTitle>
					<DialogDescription>
						{t('orders.newOrder.dialogs.addPartDescription')}
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<Select value={selectedPartId} onValueChange={setSelectedPartId}>
						<SelectTrigger>
							<SelectValue
								placeholder={t('orders.newOrder.placeholders.selectPart')}
							/>
						</SelectTrigger>
						<SelectContent>
							{partOptions.map(part => (
								<SelectItem key={part.id} value={part.id}>
									{part.name} - {formatCurrency(part.price)} ({t('common.inStock')}: {part.stock})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='text-sm font-medium'>
								{t('orders.newOrder.fields.quantity')}
							</label>
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
						{t('common.cancel')}
					</Button>
					<Button onClick={handleAdd} disabled={isPending || !selectedPartId}>
						{t('orders.newOrder.actions.addPart')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
