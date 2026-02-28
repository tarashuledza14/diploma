import { Button } from '@/shared';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ServicesService } from '../api/services.service';
import { serviceKeys } from '../queries/keys';
import { AddServiceDialog } from './AddServiceDialog';

export function ServicesHeader() {
	const [addOpen, setAddOpen] = useState(false);
	const { data: dictionaries } = useSuspenseQuery({
		queryKey: serviceKeys.categories(),
		queryFn: () => ServicesService.getDictionaries(),
		staleTime: Infinity,
	});

	return (
		<>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Services</h1>
					<p className='text-muted-foreground'>Manage service catalog</p>
				</div>
				<Button onClick={() => setAddOpen(true)}>
					<Plus className='mr-2 h-4 w-4' />
					Add Service
				</Button>
			</div>
			<AddServiceDialog
				open={addOpen}
				onOpenChange={setAddOpen}
				dictionaries={dictionaries}
			/>
		</>
	);
}
