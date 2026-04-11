import { useCurrencyFormatter } from '@/modules/app-settings';
import {
	Button,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
	parts: any;
	onRemovePart: (partId: string) => Promise<void>;
	onQuantityChange: (partId: string, quantity: number) => Promise<void>;
	canManageParts?: boolean;
	showFinancials?: boolean;
	isPending?: boolean;
}
export function PartsTable({
	parts,
	onRemovePart,
	onQuantityChange,
	canManageParts = true,
	showFinancials = true,
	isPending = false,
}: Props) {
	const { t } = useTranslation();
	const { formatCurrency } = useCurrencyFormatter();
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{t('orders.detailsParts.columns.partName')}</TableHead>
					<TableHead>{t('orders.detailsParts.columns.sku')}</TableHead>
					<TableHead>{t('orders.newOrder.fields.quantity')}</TableHead>
					{showFinancials && (
						<TableHead>{t('orders.detailsParts.columns.unitPrice')}</TableHead>
					)}
					{showFinancials && (
						<TableHead className='text-right'>
							{t('orders.columns.total')}
						</TableHead>
					)}
					{canManageParts && <TableHead className='w-12'></TableHead>}
				</TableRow>
			</TableHeader>
			<TableBody>
				{parts.map((part: any) => {
					const partId = part.partId ?? part.id;

					return (
						<TableRow key={part.id}>
							<TableCell className='font-medium'>{part.name}</TableCell>
							<TableCell className='font-mono text-sm text-muted-foreground'>
								{part.sku}
							</TableCell>
							<TableCell>
								<Input
									type='number'
									value={part.quantity}
									min='1'
									className='w-20'
									disabled={isPending || !canManageParts}
									onChange={e =>
										onQuantityChange(partId, parseInt(e.target.value, 10) || 1)
									}
								/>
							</TableCell>
							{showFinancials && (
								<TableCell>{formatCurrency(part.unitPrice)}</TableCell>
							)}
							{showFinancials && (
								<TableCell className='text-right font-medium'>
									{formatCurrency(
										(part.quantity ?? 0) * Number(part.unitPrice ?? 0),
									)}
								</TableCell>
							)}
							{canManageParts && (
								<TableCell>
									<Button
										variant='ghost'
										size='icon'
										className='text-destructive hover:text-destructive'
										disabled={isPending}
										onClick={() => onRemovePart(partId)}
									>
										<Trash2 className='h-4 w-4' />
										<span className='sr-only'>
											{t('orders.detailsParts.actions.removePart')}
										</span>
									</Button>
								</TableCell>
							)}
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
