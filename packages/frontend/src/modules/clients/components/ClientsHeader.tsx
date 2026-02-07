import { AddClientDialog } from './AddClientDialog';

export function ClientsHeader() {
	return (
		<div className='flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>Clients</h1>
				<p className='text-muted-foreground'>Manage your client database</p>
			</div>
			<AddClientDialog />
		</div>
	);
}
