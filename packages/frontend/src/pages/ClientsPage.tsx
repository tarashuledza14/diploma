import { ClientsHeader, ClientTable, useClientsQuery } from '@/modules/clients';
import { useTableSearchParams } from '@/shared';

export function ClientsPage() {
	const searchParams = useTableSearchParams();
	const { data, isLoading } = useClientsQuery(searchParams);

	return (
		<div className='flex flex-col gap-6'>
			<ClientsHeader />
			<ClientTable
				data={data?.data ?? []}
				pageCount={data?.pageCount ?? 0}
				isLoading={isLoading}
			/>
		</div>
	);
}
