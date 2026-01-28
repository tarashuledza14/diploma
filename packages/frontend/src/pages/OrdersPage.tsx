import {
	mockOrders,
	OrdersFilters,
	OrdersSummary,
	OrdersTable,
	PageHeader,
	priorityColors,
	statusColors,
} from '@/modules/orders';
import { Card, CardContent } from '@/shared/components/ui';
import { useState } from 'react';

export function OrdersPage() {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [priorityFilter, setPriorityFilter] = useState('all');

	const filteredOrders = mockOrders.filter(order => {
		const matchesSearch =
			order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			order.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			order.vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			statusFilter === 'all' || order.status === statusFilter;
		const matchesPriority =
			priorityFilter === 'all' || order.priority === priorityFilter;
		return matchesSearch && matchesStatus && matchesPriority;
	});

	return (
		<div className='flex flex-col gap-6'>
			<PageHeader
				title='Orders'
				subtitle='Manage and track all service orders'
			/>
			<OrdersFilters
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				statusFilter={statusFilter}
				setStatusFilter={setStatusFilter}
				priorityFilter={priorityFilter}
				setPriorityFilter={setPriorityFilter}
			/>
			<Card>
				<CardContent className='p-0'>
					<OrdersTable
						orders={filteredOrders}
						statusColors={statusColors}
						priorityColors={priorityColors}
					/>
				</CardContent>
			</Card>
			<OrdersSummary
				filteredCount={filteredOrders.length}
				totalCount={mockOrders.length}
			/>
		</div>
	);
}
