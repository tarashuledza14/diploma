import { OrdersService } from '@/modules/orders/api';
import {
	OrderPriority,
	OrderStatus,
} from '@/modules/orders/interfaces/order.enums';
import { OrderListItem } from '@/modules/orders/interfaces/order.interface';
import { ordersKeys } from '@/modules/orders/queries/keys';
import {
	Kanban,
	KanbanBoard,
	KanbanColumn,
	KanbanItem,
	KanbanOverlay,
} from '@/shared/components/ui';
import type {
	DragEndEvent,
	DragStartEvent,
	UniqueIdentifier,
} from '@dnd-kit/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Ban,
	CheckCircle2,
	CircleDollarSign,
	Clock,
	Package,
	Wrench,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { KanbanOrder, OrderCard } from '../card/OrderCard';
import { KanbanColumnAddButton } from './KanbanColumnAddButton';
import { KanbanColumnHeader } from './KanbanColumnHeader';

const COLUMNS_CONFIG: Array<{
	id: OrderStatus;
	title: string;
	color: string;
	icon: React.ComponentType<{ className?: string }>;
}> = [
	{ id: OrderStatus.NEW, title: 'New', color: 'bg-blue-500', icon: Clock },
	{
		id: OrderStatus.IN_PROGRESS,
		title: 'In Progress',
		color: 'bg-amber-500',
		icon: Wrench,
	},
	{
		id: OrderStatus.WAITING_PARTS,
		title: 'Waiting Parts',
		color: 'bg-orange-500',
		icon: Package,
	},
	{
		id: OrderStatus.COMPLETED,
		title: 'Completed',
		color: 'bg-green-500',
		icon: CheckCircle2,
	},
	{
		id: OrderStatus.PAID,
		title: 'Paid',
		color: 'bg-teal-500',
		icon: CircleDollarSign,
	},
	{
		id: OrderStatus.CANCELLED,
		title: 'Cancelled',
		color: 'bg-zinc-500',
		icon: Ban,
	},
];

function mapPriority(priority: OrderPriority): KanbanOrder['priority'] {
	if (priority === OrderPriority.HIGH) return 'high';
	if (priority === OrderPriority.LOW) return 'low';
	return 'medium';
}

function mapOrderToKanbanOrder(order: OrderListItem): KanbanOrder {
	return {
		id: order.id,
		orderNumber: order.orderNumber,
		status: order.status,
		vehicle: {
			make: (order.vehicle as any).make ?? order.vehicle.brand ?? '—',
			model: order.vehicle.model ?? '—',
			year: order.vehicle.year ?? 0,
			plate: (order.vehicle as any).plate ?? order.vehicle.plateNumber ?? '',
		},
		client: {
			name: order.client.fullName,
			avatar: null,
		},
		services: order.services.map(service => service.name),
		priority: mapPriority(order.priority),
		dueDate: order.endDate,
	};
}

function groupOrdersByStatus(
	orders: KanbanOrder[],
): Record<UniqueIdentifier, KanbanOrder[]> {
	const grouped: Record<string, KanbanOrder[]> = {};
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
	return COLUMNS_CONFIG.find(column => column.id === columnId);
}

export function KanbanColumnsList() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const dragStartRef = useRef<{
		orderId: string;
		fromStatus: OrderStatus;
	} | null>(null);
	const [columns, setColumns] = useState<
		Record<UniqueIdentifier, KanbanOrder[]>
	>(() => groupOrdersByStatus([]));

	const { data } = useQuery({
		queryKey: ordersKeys.list({ filters: [], page: 1, perPage: 500 }),
		queryFn: () => OrdersService.getAll({ filters: [], page: 1, perPage: 500 }),
	});

	useEffect(() => {
		const orders = (data?.data ?? []).map(mapOrderToKanbanOrder);
		setColumns(groupOrdersByStatus(orders));
	}, [data]);

	const { mutate: updateOrders } = useMutation({
		mutationFn: ({ ids, status }: { ids: string[]; status: OrderStatus }) =>
			OrdersService.updateBulk(ids, { status }),
		onSuccess: async () => {
			await queryClient.refetchQueries({
				queryKey: ordersKeys.list({ filters: [], page: 1, perPage: 500 }),
			});
		},
		onError: () => {
			toast.error(t('orders.messages.updateStatusError'));
			queryClient.invalidateQueries({
				queryKey: ordersKeys.list({ filters: [], page: 1, perPage: 500 }),
			});
		},
	});

	const findOrderStatus = useCallback(
		(
			orderId: string,
			sourceColumns: Record<UniqueIdentifier, KanbanOrder[]>,
		): OrderStatus | null => {
			for (const [status, items] of Object.entries(sourceColumns)) {
				if (items.some(item => item.id === orderId)) {
					return status as OrderStatus;
				}
			}

			return null;
		},
		[],
	);

	const resolveDropStatus = useCallback(
		(
			overId: UniqueIdentifier,
			sourceColumns: Record<UniqueIdentifier, KanbanOrder[]>,
		): OrderStatus | null => {
			if (COLUMNS_CONFIG.some(column => column.id === overId)) {
				return overId as OrderStatus;
			}

			return findOrderStatus(String(overId), sourceColumns);
		},
		[findOrderStatus],
	);

	const handleBoardChange = useCallback(
		(nextColumns: Record<UniqueIdentifier, KanbanOrder[]>) => {
			setColumns(nextColumns);
		},
		[],
	);

	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			const orderId = String(event.active.id);
			const fromStatus = findOrderStatus(orderId, columns);

			if (!fromStatus) {
				dragStartRef.current = null;
				return;
			}

			dragStartRef.current = {
				orderId,
				fromStatus,
			};
		},
		[columns, findOrderStatus],
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const pending = dragStartRef.current;
			dragStartRef.current = null;

			if (!pending || !event.over) {
				return;
			}

			const toStatus =
				resolveDropStatus(event.over.id, columns) ??
				findOrderStatus(pending.orderId, columns);

			if (!toStatus || toStatus === pending.fromStatus) {
				return;
			}

			updateOrders({ ids: [pending.orderId], status: toStatus });
		},
		[columns, findOrderStatus, resolveDropStatus, updateOrders],
	);

	const findOrder = useCallback(
		(id: UniqueIdentifier): KanbanOrder | undefined => {
			for (const items of Object.values(columns)) {
				const found = items.find(order => order.id === id);
				if (found) return found;
			}
			return undefined;
		},
		[columns],
	);

	const columnEntries = useMemo(() => Object.entries(columns), [columns]);

	return (
		<div className='flex min-h-0 flex-1 overflow-hidden'>
			<Kanban
				value={columns}
				onValueChange={handleBoardChange}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				getItemValue={item => item.id}
			>
				<KanbanBoard className='flex h-full min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden pb-2'>
					{columnEntries.map(([columnId, items]) => {
						const config = getColumnConfig(columnId);
						if (!config) return null;
						const localizedTitle = t(`orderStatus.${config.id}`);

						return (
							<KanbanColumn
								key={columnId}
								value={columnId}
								className='flex min-h-0 min-w-72.5 flex-col rounded-lg border-none bg-muted/50'
							>
								<div className='flex items-center justify-between px-3 pb-2 pt-3'>
									<KanbanColumnHeader
										title={localizedTitle}
										color={config.color}
										count={items.length}
									/>
									<KanbanColumnAddButton
										title={localizedTitle}
										defaultStatus={config.id}
									/>
								</div>

								<div className='flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3'>
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
							const localizedTitle = t(`orderStatus.${config.id}`);

							return (
								<div className='flex min-w-[320px] flex-col rounded-lg bg-muted/50 opacity-90 shadow-lg'>
									<div className='flex items-center justify-between px-3 pb-2 pt-3'>
										<KanbanColumnHeader
											title={localizedTitle}
											color={config.color}
											count={items.length}
										/>
									</div>
									<div className='flex flex-col gap-2 px-3 pb-3'>
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
		</div>
	);
}
