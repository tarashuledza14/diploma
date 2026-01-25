import { cn } from '@/lib/utils';
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
import { Badge, Trash2 } from 'lucide-react';

const partStatusColors = {
	in_stock: 'bg-green-100 text-green-700',
	ordered: 'bg-amber-100 text-amber-700',
	out_of_stock: 'bg-red-100 text-red-700',
};

interface Props {
	parts: any;
}
export function PartsTable({ parts }: Props) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Part Name</TableHead>
					<TableHead>SKU</TableHead>
					<TableHead>Quantity</TableHead>
					<TableHead>Unit Price</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className='text-right'>Total</TableHead>
					<TableHead className='w-12'></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{parts.map((part: any) => (
					<TableRow key={part.id}>
						<TableCell className='font-medium'>{part.name}</TableCell>
						<TableCell className='font-mono text-sm text-muted-foreground'>
							{part.sku}
						</TableCell>
						<TableCell>
							<Input
								type='number'
								defaultValue={part.quantity}
								min='1'
								className='w-20'
								// TODO: Call OrderService.updatePartQuantity() on change
							/>
						</TableCell>
						<TableCell>${part.unitPrice.toFixed(2)}</TableCell>
						<TableCell>
							<Badge
								className={cn(
									partStatusColors[
										part.status as keyof typeof partStatusColors
									],
								)}
							>
								{part.status.replace('_', ' ')}
							</Badge>
						</TableCell>
						<TableCell className='text-right font-medium'>
							{/* TODO: Calculate total price based on quantity * price */}$
							{(part.quantity * part.unitPrice).toFixed(2)}
						</TableCell>
						<TableCell>
							<Button
								variant='ghost'
								size='icon'
								className='text-destructive hover:text-destructive'
							>
								<Trash2 className='h-4 w-4' />
								<span className='sr-only'>Remove part</span>
								{/* TODO: Call OrderService.removePart() */}
							</Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
