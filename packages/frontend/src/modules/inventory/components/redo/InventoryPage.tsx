import { useTableSearchParams } from '@/shared';
import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { InventoryService } from '../../api/inventory.service';
import { inventoryKeys } from '../../query/keys';
import { InventoryHeader } from '../InventoryHeader';
import { InventoryTable } from './InventoryTable';
import { InventoryTableSkeleton } from './InventoryTableSkeleton';
import { InventoryStats } from './stats/InventoryStat';

export function InventoryPage() {
	const searchParams = useTableSearchParams();

	const { data } = useQuery({
		queryKey: inventoryKeys.list(searchParams),
		queryFn: () => InventoryService.getAll(searchParams),
	});
	const { data: dictionaries } = useQuery({
		queryKey: inventoryKeys.dictionaries(),
		queryFn: () => InventoryService.getAllDictionaries(),
		staleTime: Infinity,
	});
	return (
		<>
			<InventoryHeader dictionaries={dictionaries} />
			<InventoryStats />
			<Suspense fallback={<InventoryTableSkeleton />}>
				<InventoryTable
					dictionaries={dictionaries}
					data={data?.data ?? []}
					pageCount={data?.pageCount ?? 0}
				/>
			</Suspense>
		</>
	);
}
