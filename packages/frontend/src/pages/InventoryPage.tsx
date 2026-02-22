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
