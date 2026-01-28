import {
	ClientsCount,
	ClientsHeader,
	ClientsSearch,
	ClientsTable,
	mockClients,
} from '@/modules/clients';
import { useState } from 'react';

export function ClientsPage() {
	const [searchQuery, setSearchQuery] = useState('');

	const filteredClients = mockClients.filter(
		client =>
			client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			client.phone.includes(searchQuery),
	);

	return (
		<div className='flex flex-col gap-6'>
			<ClientsHeader />
			<ClientsSearch
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
			/>
			<ClientsTable clients={filteredClients} />
			<ClientsCount
				filtered={filteredClients.length}
				total={mockClients.length}
			/>
		</div>
	);
}
