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
import { useTranslation } from 'react-i18next';

export function InventoryStats() {
	const { t } = useTranslation();
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
				<StatLabel>{t('inventory.stats.totalParts')}</StatLabel>
				<StatIndicator variant='icon' color='default'>
					<Package />
				</StatIndicator>
				<StatValue>{totalParts}</StatValue>
			</Stat>

			<Stat>
				<StatLabel>{t('inventory.stats.purchaseValue')}</StatLabel>
				<StatIndicator variant='icon' color='success'>
					<DollarSign />
				</StatIndicator>
				<StatValue>${purchaseValue.toLocaleString()}</StatValue>
				<StatDescription>
					{t('inventory.stats.retailValue', {
						value: retailValue.toLocaleString(),
					})}
				</StatDescription>
			</Stat>

			<Stat>
				<StatLabel>{t('inventory.stats.reserved')}</StatLabel>
				<StatIndicator variant='icon' color='info'>
					<Layers />
				</StatIndicator>
				<StatValue>{reserved}</StatValue>
			</Stat>

			<Stat>
				<StatLabel>{t('inventory.stats.lowStock')}</StatLabel>
				<StatIndicator variant='icon' color='warning'>
					<TrendingDown />
				</StatIndicator>
				<StatValue>{lowStock}</StatValue>
			</Stat>

			<Stat>
				<StatLabel>{t('inventory.stats.outOfStock')}</StatLabel>
				<StatIndicator variant='icon' color='error'>
					<AlertTriangle />
				</StatIndicator>
				<StatValue>{outOfStock}</StatValue>
			</Stat>
		</div>
	);
}
