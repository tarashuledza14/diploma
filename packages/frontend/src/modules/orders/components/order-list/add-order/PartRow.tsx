import { useCurrencyFormatter } from '@/modules/app-settings';
import { OrderPartItem } from '@/modules/orders/interfaces/new-order.interface';
import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { Package, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface PartRowProps {
	index: number;
	part: OrderPartItem;
	parts: any[];
	onRemove: () => void;
	onChange: (field: keyof OrderPartItem, value: string | number) => void;
}

export const PartRow: React.FC<PartRowProps> = ({
	index,
	part,
	parts,
	onRemove,
	onChange,
}) => {
	const { t } = useTranslation();
	const { formatCurrency } = useCurrencyFormatter();
	const selectedPart = parts.find(p => p.id === part.partId);

	return (
		<div className='border rounded-lg p-4 space-y-3'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Package className='h-4 w-4 text-green-500' />
					<span className='font-medium'>
						{t('orders.newOrder.labels.partN', { index: index + 1 })}
					</span>
				</div>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={onRemove}
					className='text-red-500 hover:text-red-700'
				>
					<X className='h-4 w-4' />
				</Button>
			</div>

			<div className='grid grid-cols-3 gap-4'>
				<div className='col-span-2'>
					<label className='text-sm font-medium'>
						{t('orders.newOrder.fields.part')} *
					</label>
					<Select
						value={part.partId}
						onValueChange={value => onChange('partId', value)}
					>
						<SelectTrigger>
							<SelectValue
								placeholder={t('orders.newOrder.placeholders.selectPart')}
							/>
						</SelectTrigger>
						<SelectContent>
							{parts.map(partItem => (
								<SelectItem key={partItem.id} value={partItem.id}>
									{partItem.name} - {formatCurrency(partItem.price)} (Stock:{' '}
									{partItem.stock})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<label className='text-sm font-medium'>
						{t('orders.newOrder.fields.quantity')} *
					</label>
					<Input
						type='number'
						min='1'
						value={part.quantity}
						onChange={e => onChange('quantity', parseInt(e.target.value) || 1)}
					/>
				</div>
			</div>

			{selectedPart && (
				<div className='text-sm text-muted-foreground'>
					{t('orders.newOrder.summary.subtotal')}:{' '}
					{formatCurrency(selectedPart.price * part.quantity)}
				</div>
			)}
		</div>
	);
};
