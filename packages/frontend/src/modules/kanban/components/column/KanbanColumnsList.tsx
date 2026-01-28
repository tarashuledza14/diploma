import { CheckCircle2, Clock, Package, Wrench } from 'lucide-react';
import { Order } from '../card/OrderCard';
import { KanbanColumn } from './KanbanColumn';

const mockOrders: Order[] = [
	{
		id: 'ORD-001',
		status: 'new',
		vehicle: { make: 'BMW', model: 'X5', year: 2022, plate: 'ABC-1234' },
		client: { name: 'John Smith', avatar: '/avatars/client1.jpg' },
		services: ['Oil Change', 'Filter Replacement'],
		priority: 'high',
		dueDate: '2026-01-20',
		assignedTo: { name: 'Mike Johnson', avatar: '/avatars/mechanic1.jpg' },
	},
	{
		id: 'ORD-002',
		status: 'new',
		vehicle: {
			make: 'Mercedes',
			model: 'C-Class',
			year: 2021,
			plate: 'XYZ-5678',
		},
		client: { name: 'Sarah Davis', avatar: '/avatars/client2.jpg' },
		services: ['Brake Inspection'],
		priority: 'medium',
		dueDate: '2026-01-21',
		assignedTo: { name: 'Tom Wilson', avatar: '/avatars/mechanic2.jpg' },
	},
	{
		id: 'ORD-003',
		status: 'in_progress',
		vehicle: { make: 'Audi', model: 'A4', year: 2023, plate: 'DEF-9012' },
		client: { name: 'Robert Brown', avatar: '/avatars/client3.jpg' },
		services: ['Full Service', 'Tire Rotation'],
		priority: 'high',
		dueDate: '2026-01-19',
		assignedTo: { name: 'Mike Johnson', avatar: '/avatars/mechanic1.jpg' },
	},
	{
		id: 'ORD-004',
		status: 'in_progress',
		vehicle: { make: 'VW', model: 'Golf', year: 2020, plate: 'GHI-3456' },
		client: { name: 'Emily Chen', avatar: '/avatars/client4.jpg' },
		services: ['Tire Replacement'],
		priority: 'low',
		dueDate: '2026-01-22',
		assignedTo: { name: 'Tom Wilson', avatar: '/avatars/mechanic2.jpg' },
	},
	{
		id: 'ORD-005',
		status: 'waiting_parts',
		vehicle: { make: 'Toyota', model: 'Camry', year: 2019, plate: 'JKL-7890' },
		client: { name: 'Michael Lee', avatar: '/avatars/client5.jpg' },
		services: ['Engine Diagnostic', 'Spark Plug Replacement'],
		priority: 'medium',
		dueDate: '2026-01-23',
		assignedTo: { name: 'Mike Johnson', avatar: '/avatars/mechanic1.jpg' },
	},
	{
		id: 'ORD-006',
		status: 'done',
		vehicle: { make: 'Honda', model: 'Civic', year: 2022, plate: 'MNO-1234' },
		client: { name: 'Lisa Wang', avatar: '/avatars/client6.jpg' },
		services: ['AC Repair'],
		priority: 'medium',
		dueDate: '2026-01-18',
		assignedTo: { name: 'Tom Wilson', avatar: '/avatars/mechanic2.jpg' },
	},
	{
		id: 'ORD-007',
		status: 'done',
		vehicle: { make: 'Ford', model: 'Focus', year: 2021, plate: 'PQR-5678' },
		client: { name: 'David Kim', avatar: '/avatars/client7.jpg' },
		services: ['Battery Replacement'],
		priority: 'low',
		dueDate: '2026-01-17',
		assignedTo: { name: 'Mike Johnson', avatar: '/avatars/mechanic1.jpg' },
	},
	{
		id: 'ORD-001',
		status: 'new',
		vehicle: { make: 'BMW', model: 'X5', year: 2022, plate: 'ABC-1234' },
		client: { name: 'John Smith', avatar: '/avatars/client1.jpg' },
		services: ['Oil Change', 'Filter Replacement'],
		priority: 'high',
		dueDate: '2026-01-20',
		assignedTo: { name: 'Mike Johnson', avatar: '/avatars/mechanic1.jpg' },
	},
	{
		id: 'ORD-002',
		status: 'new',
		vehicle: {
			make: 'Mercedes',
			model: 'C-Class',
			year: 2021,
			plate: 'XYZ-5678',
		},
		client: { name: 'Sarah Davis', avatar: '/avatars/client2.jpg' },
		services: ['Brake Inspection'],
		priority: 'medium',
		dueDate: '2026-01-21',
		assignedTo: { name: 'Tom Wilson', avatar: '/avatars/mechanic2.jpg' },
	},
	{
		id: 'ORD-003',
		status: 'in_progress',
		vehicle: { make: 'Audi', model: 'A4', year: 2023, plate: 'DEF-9012' },
		client: { name: 'Robert Brown', avatar: '/avatars/client3.jpg' },
		services: ['Full Service', 'Tire Rotation'],
		priority: 'high',
		dueDate: '2026-01-19',
		assignedTo: { name: 'Mike Johnson', avatar: '/avatars/mechanic1.jpg' },
	},
	{
		id: 'ORD-004',
		status: 'in_progress',
		vehicle: { make: 'VW', model: 'Golf', year: 2020, plate: 'GHI-3456' },
		client: { name: 'Emily Chen', avatar: '/avatars/client4.jpg' },
		services: ['Tire Replacement'],
		priority: 'low',
		dueDate: '2026-01-22',
		assignedTo: { name: 'Tom Wilson', avatar: '/avatars/mechanic2.jpg' },
	},
	{
		id: 'ORD-005',
		status: 'waiting_parts',
		vehicle: { make: 'Toyota', model: 'Camry', year: 2019, plate: 'JKL-7890' },
		client: { name: 'Michael Lee', avatar: '/avatars/client5.jpg' },
		services: ['Engine Diagnostic', 'Spark Plug Replacement'],
		priority: 'medium',
		dueDate: '2026-01-23',
		assignedTo: { name: 'Mike Johnson', avatar: '/avatars/mechanic1.jpg' },
	},
	{
		id: 'ORD-006',
		status: 'done',
		vehicle: { make: 'Honda', model: 'Civic', year: 2022, plate: 'MNO-1234' },
		client: { name: 'Lisa Wang', avatar: '/avatars/client6.jpg' },
		services: ['AC Repair'],
		priority: 'medium',
		dueDate: '2026-01-18',
		assignedTo: { name: 'Tom Wilson', avatar: '/avatars/mechanic2.jpg' },
	},
	{
		id: 'ORD-007',
		status: 'done',
		vehicle: { make: 'Ford', model: 'Focus', year: 2021, plate: 'PQR-5678' },
		client: { name: 'David Kim', avatar: '/avatars/client7.jpg' },
		services: ['Battery Replacement'],
		priority: 'low',
		dueDate: '2026-01-17',
		assignedTo: { name: 'Mike Johnson', avatar: '/avatars/mechanic1.jpg' },
	},
];
const columns = [
	{
		id: 'new',
		title: 'New',
		color: 'bg-blue-500',
		icon: Clock,
	},
	{
		id: 'in_progress',
		title: 'In Progress',
		color: 'bg-amber-500',
		icon: Wrench,
	},
	{
		id: 'waiting_parts',
		title: 'Waiting Parts',
		color: 'bg-orange-500',
		icon: Package,
	},
	{
		id: 'done',
		title: 'Done',
		color: 'bg-green-500',
		icon: CheckCircle2,
	},
];
export function KanbanColumnsList() {
	const getOrdersByStatus = (status: string) =>
		mockOrders.filter(order => order.status === status);

	return (
		<div className='flex flex-1 gap-4 overflow-x-auto pb-4'>
			{columns.map(column => (
				<KanbanColumn
					key={column.id}
					column={column}
					orders={getOrdersByStatus(column.id)}
				/>
			))}
		</div>
	);
}
