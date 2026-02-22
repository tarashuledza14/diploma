import { InventoryService } from '@/modules/inventory/api/inventory.service';
import { inventoryKeys } from '@/modules/inventory/query/keys';
import {
	Stat,
	StatDescription,
	StatIndicator,
	StatLabel,
	StatValue,
} from '@/shared';
import { useQuery } from '@tanstack/react-query';
import {
	AlertTriangle,
	DollarSign,
	Layers,
	Package,
	TrendingDown,
} from 'lucide-react';

export function InventoryStats() {
	const { data } = useQuery({
		queryKey: inventoryKeys.stats(),
		queryFn: () => InventoryService.getStats(),
	});

	const purchaseValue = data?.purchasePrice ?? 0;
	const retailValue = data?.retailPrice ?? 0;
	const reserved = data?.quantityReserved ?? 0;
	const lowStock = data?.lowStock ?? 0;
	const outOfStock = data?.outOfStock ?? 0;
	const totalParts = data?.totalParts ?? 0;

	return (
		// Змінено класи тут:
		// grid-cols-1 для мобільних, sm:grid-cols-2 для більших телефонів,
		// lg:grid-cols-3 для планшетів, xl:grid-cols-5 для десктопу
		<div className='grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
			<Stat>
				<StatLabel>Total Parts</StatLabel>
				<StatIndicator variant='icon' color='default'>
					<Package />
				</StatIndicator>
				<StatValue>{totalParts}</StatValue>
			</Stat>

			<Stat>
				<StatLabel>Purchase Value</StatLabel>
				<StatIndicator variant='icon' color='success'>
					<DollarSign />
				</StatIndicator>
				<StatValue>${purchaseValue.toLocaleString()}</StatValue>
				<StatDescription>
					Retail: ${retailValue.toLocaleString()}
				</StatDescription>
			</Stat>

			<Stat>
				<StatLabel>Reserved</StatLabel>
				<StatIndicator variant='icon' color='info'>
					<Layers />
				</StatIndicator>
				<StatValue>{reserved}</StatValue>
			</Stat>

			<Stat>
				<StatLabel>Low Stock</StatLabel>
				<StatIndicator variant='icon' color='warning'>
					<TrendingDown />
				</StatIndicator>
				<StatValue>{lowStock}</StatValue>
			</Stat>

			<Stat>
				<StatLabel>Out of Stock</StatLabel>
				<StatIndicator variant='icon' color='error'>
					<AlertTriangle />
				</StatIndicator>
				<StatValue>{outOfStock}</StatValue>
			</Stat>
		</div>
	);
}
