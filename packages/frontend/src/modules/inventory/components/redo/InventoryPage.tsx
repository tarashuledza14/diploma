import { useTableSearchParams } from '@/shared/hooks/use-table-search-params';
import { useQuery } from '@tanstack/react-query';
import { InventoryService } from '../../api/inventory.service';
import { inventoryKeys } from '../../query/keys';
import { InventoryTable } from './InventoryTable';

export function InventoryPage() {
	const searchParams = useTableSearchParams();
	console.log('searchParams', searchParams);
	const { data } = useQuery({
		queryKey: inventoryKeys.list(searchParams),
		queryFn: () => InventoryService.getAll(searchParams),
		placeholderData: previousData => previousData,
	});
	console.log('data', data);
	return (
		<InventoryTable data={data?.data ?? []} pageCount={data?.pageCount ?? 0} />
	);
}
