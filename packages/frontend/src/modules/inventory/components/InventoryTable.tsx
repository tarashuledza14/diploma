import {
	Badge,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Progress,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui';
import { Edit, MoreVertical, ShoppingCart, Trash2 } from 'lucide-react';

export interface Part {
	id: string;
	name: string;
	sku: string;
	category: string;
	quantity: number;
	minStock: number;
	unitPrice: number;
	supplier: string;
	lastRestocked: string;
}

function getStockStatus(quantity: number, minStock: number) {
	if (quantity === 0)
		return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
	if (quantity < minStock)
		return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700' };
	return { label: 'In Stock', color: 'bg-green-100 text-green-700' };
}

interface InventoryTableProps {
	parts: Part[];
}

export function InventoryTable({ parts }: InventoryTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Part</TableHead>
					<TableHead>Category</TableHead>
					<TableHead>Stock Level</TableHead>
					<TableHead>Supplier</TableHead>
					<TableHead className='text-right'>Unit Price</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className='w-12'></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{parts.map(part => {
					const status = getStockStatus(part.quantity, part.minStock);
					const stockPercent = Math.min(
						(part.quantity / (part.minStock * 2)) * 100,
						100,
					);
					return (
						<TableRow key={part.id}>
							<TableCell>
								<div>
									<p className='font-medium'>{part.name}</p>
									<p className='font-mono text-xs text-muted-foreground'>
										{part.sku}
									</p>
								</div>
							</TableCell>
							<TableCell>
								<Badge variant='secondary'>{part.category}</Badge>
							</TableCell>
							<TableCell>
								<div className='w-32 space-y-1'>
									<div className='flex justify-between text-xs'>
										<span>{part.quantity} units</span>
										<span className='text-muted-foreground'>
											Min: {part.minStock}
										</span>
									</div>
									<Progress
										value={stockPercent}
										className={`h-2 ${part.quantity === 0 ? '[&>div]:bg-red-500' : part.quantity < part.minStock ? '[&>div]:bg-amber-500' : ''}`}
									/>
								</div>
							</TableCell>
							<TableCell>{part.supplier}</TableCell>
							<TableCell className='text-right font-medium'>
								${part.unitPrice.toFixed(2)}
							</TableCell>
							<TableCell>
								<Badge className={status.color}>{status.label}</Badge>
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant='ghost' size='icon' className='h-8 w-8'>
											<MoreVertical className='h-4 w-4' />
											<span className='sr-only'>Actions</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end'>
										<DropdownMenuItem>
											<Edit className='mr-2 h-4 w-4' />
											Edit Part
										</DropdownMenuItem>
										<DropdownMenuItem>
											<ShoppingCart className='mr-2 h-4 w-4' />
											Reorder
										</DropdownMenuItem>
										<DropdownMenuItem className='text-destructive'>
											<Trash2 className='mr-2 h-4 w-4' />
											Delete Part
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
