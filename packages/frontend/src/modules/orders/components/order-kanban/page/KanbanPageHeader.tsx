export function KanbanPageHeader() {
	return (
		<div className='mb-4 flex items-center justify-between'>
			<div>
				<h1 className='text-xl font-semibold'>Kanban Board</h1>
				<p className='text-sm text-muted-foreground'>
					Drag and drop orders to update their status
				</p>
			</div>
		</div>
	);
}
