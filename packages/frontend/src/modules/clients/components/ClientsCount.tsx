interface ClientsCountProps {
	filtered: number;
	total: number;
}

export function ClientsCount({ filtered, total }: ClientsCountProps) {
	return (
		<div className='text-sm text-muted-foreground'>
			Showing {filtered} of {total} clients
		</div>
	);
}
