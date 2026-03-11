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
						<TableCell>${Number(part.unitPrice).toFixed(2)}</TableCell>
						<TableCell className='text-right font-medium'>
							$
							{(
								(part.quantity ?? 0) * Number(part.unitPrice ?? 0)
							).toFixed(2)}
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
