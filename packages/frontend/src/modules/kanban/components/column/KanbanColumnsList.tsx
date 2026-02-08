import {
	Kanban,
	KanbanBoard,
	KanbanColumn,
	KanbanItem,
	KanbanOverlay,
} from '@/shared/components/ui';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { CheckCircle2, Clock, Package, Wrench } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { Order } from '../card/OrderCard';
import { OrderCard } from '../card/OrderCard';
import { KanbanColumnAddButton } from './KanbanColumnAddButton';
import { KanbanColumnHeader } from './KanbanColumnHeader';

const COLUMNS_CONFIG = [
	{ id: 'new', title: 'New', color: 'bg-blue-500', icon: Clock },
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
	{ id: 'done', title: 'Done', color: 'bg-green-500', icon: CheckCircle2 },
] as const;

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
		vehicle: {
			make: 'Toyota',
			model: 'Camry',
			year: 2019,
			plate: 'JKL-7890',
		},
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

function groupOrdersByStatus(
	orders: Order[],
): Record<UniqueIdentifier, Order[]> {
	const grouped: Record<string, Order[]> = {};
	for (const col of COLUMNS_CONFIG) {
		grouped[col.id] = [];
	}
	for (const order of orders) {
		if (grouped[order.status]) {
			grouped[order.status].push(order);
		}
	}
	return grouped;
}

function getColumnConfig(columnId: string) {
	return COLUMNS_CONFIG.find(c => c.id === columnId);
}

export function KanbanColumnsList() {
	const [columns, setColumns] = useState<Record<UniqueIdentifier, Order[]>>(
		() => groupOrdersByStatus(mockOrders),
	);

	const findOrder = useCallback(
		(id: UniqueIdentifier): Order | undefined => {
			for (const items of Object.values(columns)) {
				const found = items.find(o => o.id === id);
				if (found) return found;
			}
			return undefined;
		},
		[columns],
	);

	const columnEntries = useMemo(() => Object.entries(columns), [columns]);

	return (
		<Kanban
			value={columns}
			onValueChange={setColumns}
			getItemValue={item => item.id}
		>
			<KanbanBoard className='flex flex-1 gap-4 overflow-x-auto p-0.5 pb-4'>
				{columnEntries.map(([columnId, items]) => {
					const config = getColumnConfig(columnId);
					if (!config) return null;

					return (
						<KanbanColumn
							key={columnId}
							value={columnId}
							className='flex min-w-[320px] flex-col rounded-lg border-none bg-muted/50'
						>
							<div className='flex items-center justify-between p-4'>
								<KanbanColumnHeader
									title={config.title}
									color={config.color}
									count={items.length}
								/>
								<KanbanColumnAddButton
									title={config.title}
									defaultStatus={config.id}
								/>
							</div>

							<div className='flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4'>
								{items.map(order => (
									<KanbanItem
										key={order.id}
										value={order.id}
										asHandle
										className='rounded-lg'
									>
										<OrderCard order={order} />
									</KanbanItem>
								))}
							</div>
						</KanbanColumn>
					);
				})}
			</KanbanBoard>

			<KanbanOverlay>
				{({ value, variant }) => {
					if (variant === 'column') {
						const config = getColumnConfig(value as string);
						const items = columns[value] ?? [];
						if (!config) return null;

						return (
							<div className='flex min-w-[320px] flex-col rounded-lg bg-muted/50 opacity-90 shadow-lg'>
								<div className='flex items-center justify-between p-4'>
									<KanbanColumnHeader
										title={config.title}
										color={config.color}
										count={items.length}
									/>
								</div>
								<div className='flex flex-col gap-3 px-4 pb-4'>
									{items.map(order => (
										<OrderCard key={order.id} order={order} />
									))}
								</div>
							</div>
						);
					}

					const order = findOrder(value);
					if (!order) return null;

					return <OrderCard order={order} />;
				}}
			</KanbanOverlay>
		</Kanban>
	);
}
