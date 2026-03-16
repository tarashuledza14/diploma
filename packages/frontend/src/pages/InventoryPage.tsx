import { useUserStore } from '@/modules/auth';
import {
	InventoryHeader,
	inventoryKeys,
	InventoryService,
	InventoryStats,
	InventoryTable,
	InventoryTableSkeleton,
} from '@/modules/inventory';
import { useTableSearchParams } from '@/shared';
import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

export function InventoryPage() {
	const role = useUserStore(state => state.user?.role);
	const canManageInventory = role !== 'MECHANIC';
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
			<InventoryHeader
				dictionaries={dictionaries}
				canManageInventory={canManageInventory}
			/>
			<InventoryStats />
			<Suspense fallback={<InventoryTableSkeleton />}>
				<InventoryTable
					canManageInventory={canManageInventory}
					dictionaries={dictionaries}
					data={data?.data ?? []}
					pageCount={data?.pageCount ?? 0}
				/>
			</Suspense>
		</>
	);
}
