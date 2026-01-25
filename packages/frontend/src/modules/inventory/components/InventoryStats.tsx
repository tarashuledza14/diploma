import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';

interface InventoryStatsProps {
	totalParts: number;
	totalValue: number;
	lowStockCount: number;
	outOfStockCount: number;
}

export function InventoryStats({
	totalParts,
	totalValue,
	lowStockCount,
	outOfStockCount,
}: InventoryStatsProps) {
	return (
		<div className='grid gap-4 md:grid-cols-4'>
			<Card>
				<CardHeader className='pb-2'>
					<CardTitle className='text-sm font-medium text-muted-foreground'>
						Total Parts
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex items-center gap-2'>
						<Package className='h-5 w-5 text-primary' />
						<span className='text-2xl font-bold'>{totalParts}</span>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className='pb-2'>
					<CardTitle className='text-sm font-medium text-muted-foreground'>
						Inventory Value
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-2xl font-bold'>${totalValue.toFixed(2)}</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className='pb-2'>
					<CardTitle className='text-sm font-medium text-muted-foreground'>
						Low Stock
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex items-center gap-2'>
						<TrendingDown className='h-5 w-5 text-amber-500' />
						<span className='text-2xl font-bold'>{lowStockCount}</span>
					</div>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className='pb-2'>
					<CardTitle className='text-sm font-medium text-muted-foreground'>
						Out of Stock
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='flex items-center gap-2'>
						<AlertTriangle className='h-5 w-5 text-red-500' />
						<span className='text-2xl font-bold'>{outOfStockCount}</span>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
