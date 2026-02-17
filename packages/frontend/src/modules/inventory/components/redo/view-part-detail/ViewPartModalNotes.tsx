interface ViewPartModalNotesProps {
	notes?: string | null;
}

export function ViewPartModalNotes({ notes }: ViewPartModalNotesProps) {
	if (!notes) return null;
	return (
		<div>
			<h4 className='text-sm font-semibold mb-2'>Notes</h4>
			<p className='text-sm text-muted-foreground rounded-lg border bg-muted/50 p-3'>
				{notes}
			</p>
		</div>
	);
}
