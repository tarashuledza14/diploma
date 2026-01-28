import { KanbanColumnsList, KanbanPageHeader } from '@/modules/kanban';

export function KanbanPage() {
	return (
		<div className='flex h-full flex-col'>
			<KanbanPageHeader />
			<KanbanColumnsList />
		</div>
	);
}
