import { PartInventory } from '../../../interfaces/inventory.interfaces';

interface ViewPartModalStatsProps {
	inventory: PartInventory[];
	minStock: number;
}

function getStockColor(available: number, minStock: number) {
	if (available === 0) return 'text-red-600';
	if (available < minStock) return 'text-amber-600';
	return 'text-green-600';
}

export function ViewPartModalStats({
	inventory,
	minStock,
}: ViewPartModalStatsProps) {
	const available = inventory.reduce((sum, item) => sum + item.quantity, 0);
	return (
		<div className='grid grid-cols-2 gap-3 sm:grid-cols-2'>
			<div className='rounded-lg border p-3 text-center'>
				<p className='text-xs text-muted-foreground'>Available</p>
				<p
					className={`text-xl font-bold ${getStockColor(available, minStock)}`}
				>
					{available}
				</p>
			</div>
			<div className='rounded-lg border p-3 text-center'>
				<p className='text-xs text-muted-foreground'>Min Stock</p>
				<p className='text-xl font-bold'>{minStock}</p>
			</div>
		</div>
	);
}
