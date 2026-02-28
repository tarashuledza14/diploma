import {
	serviceKeys,
	ServicesHeader,
	ServicesService,
	ServiceTable,
} from '@/modules/services';
import { useTableSearchParams } from '@/shared';
import { useQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

export function ServicesPage() {
	const searchParams = useTableSearchParams();

	const { data } = useQuery({
		queryKey: serviceKeys.list(searchParams),
		queryFn: () => ServicesService.getAll(searchParams),
		placeholderData: previousData => previousData,
	});

	return (
		<div className='flex flex-col gap-6'>
			<Suspense fallback={<div>Loading...</div>}>
				<ServicesHeader />
			</Suspense>
			<Suspense fallback={<div>Loading...</div>}>
				<ServiceTable
					data={data?.data || []}
					pageCount={data?.pageCount || 0}
				/>
			</Suspense>
		</div>
	);
}
