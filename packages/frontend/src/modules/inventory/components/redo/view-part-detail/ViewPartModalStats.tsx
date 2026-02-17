interface ViewPartModalStatsProps {
	available: number;
	reserved: number;
	retailPrice: number;
	markup: number;
	minStock: number;
	total: number;
}

function getStockColor(available: number, total: number, minStock: number) {
	if (total === 0) return 'text-red-600';
	if (available < minStock) return 'text-amber-600';
	return 'text-green-600';
}

export function ViewPartModalStats({
	available,
	reserved,
	retailPrice,
	markup,
	minStock,
	total,
}: ViewPartModalStatsProps) {
	return (
		<div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
			<div className='rounded-lg border p-3 text-center'>
				<p className='text-xs text-muted-foreground'>Available</p>
				<p
					className={`text-xl font-bold ${getStockColor(available, total, minStock)}`}
				>
					{available}
				</p>
			</div>
			<div className='rounded-lg border p-3 text-center'>
				<p className='text-xs text-muted-foreground'>Reserved</p>
				<p className='text-xl font-bold text-amber-600'>{reserved}</p>
			</div>
			<div className='rounded-lg border p-3 text-center'>
				<p className='text-xs text-muted-foreground'>Retail Price</p>
				<p className='text-xl font-bold'>${retailPrice}</p>
			</div>
			<div className='rounded-lg border p-3 text-center'>
				<p className='text-xs text-muted-foreground'>Markup</p>
				<p className='text-xl font-bold text-green-600'>{markup}%</p>
			</div>
		</div>
	);
}
