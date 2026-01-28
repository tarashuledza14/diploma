export function KanbanPageHeader() {
	return (
		<div className='mb-6 flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>Kanban Board</h1>
				<p className='text-muted-foreground'>
					Drag and drop orders to update their status
				</p>
			</div>
		</div>
	);
}
