import { KanbanColumnsList, KanbanPageHeader } from '@/modules/orders';

export function KanbanPage() {
	return (
		<div className='flex h-full min-h-0 flex-col overflow-hidden'>
			<KanbanPageHeader />
			<KanbanColumnsList />
		</div>
	);
}
