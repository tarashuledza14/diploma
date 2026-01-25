import { cn } from '@/lib/utils';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Badge,
	Button,
	Card,
	CardContent,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	ScrollArea,
} from '@/shared/components/ui';
import {
	Car,
	CheckCircle2,
	Clock,
	MoreVertical,
	Package,
	Plus,
	User,
	Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// TODO: Import useOrdersStore for managing orders state
// TODO: Import OrderStatus enum from types/order.ts
// TODO: Wrap this with DragOverlay and DndContext (@dnd-kit) to handle state changes

/**
 * Kanban column configuration
 */
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

/**
 * Mock order data - Replace with actual data from useQuery(['orders'])
 */
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
];

const priorityColors = {
	high: 'bg-red-100 text-red-700 border-red-200',
	medium: 'bg-amber-100 text-amber-700 border-amber-200',
	low: 'bg-green-100 text-green-700 border-green-200',
};

interface Order {
	id: string;
	status: string;
	vehicle: {
		make: string;
		model: string;
		year: number;
		plate: string;
	};
	client: {
		name: string;
		avatar: string;
	};
	services: string[];
	priority: 'high' | 'medium' | 'low';
	dueDate: string;
	assignedTo: {
		name: string;
		avatar: string;
	};
}

interface OrderCardProps {
	order: Order;
}
function OrderCard({ order }: OrderCardProps) {
	// TODO: Add drag handle and draggable props from @dnd-kit/sortable
	// const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: order.id })

	return (
		<Link to={`/orders/${order.id}`}>
			<Card
				className='cursor-pointer transition-all hover:shadow-md hover:border-primary/50'
				// TODO: Add ref={setNodeRef} and style={{ transform, transition }}
			>
				<CardContent className='p-4'>
					{/* Header */}
					<div className='mb-3 flex items-start justify-between'>
						<div className='flex items-center gap-2'>
							<span className='font-mono text-sm font-medium text-muted-foreground'>
								{order.id}
							</span>
							<Badge
								variant='outline'
								className={cn('text-xs', priorityColors[order.priority])}
							>
								{order.priority}
							</Badge>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild onClick={e => e.preventDefault()}>
								<Button variant='ghost' size='icon' className='h-8 w-8'>
									<MoreVertical className='h-4 w-4' />
									<span className='sr-only'>Order actions</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem>
									{/* TODO: Open order in new tab */}
									View Details
								</DropdownMenuItem>
								<DropdownMenuItem>
									{/* TODO: Open assign mechanic modal */}
									Assign Mechanic
								</DropdownMenuItem>
								<DropdownMenuItem>
									{/* TODO: Call OrderService.updateStatus() */}
									Change Status
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Vehicle Info */}
					<div className='mb-3 flex items-center gap-2'>
						<Car className='h-4 w-4 text-muted-foreground' />
						<span className='font-medium'>
							{order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
						</span>
					</div>
					<p className='mb-3 text-sm text-muted-foreground'>
						Plate: {order.vehicle.plate}
					</p>

					{/* Services */}
					<div className='mb-3 flex flex-wrap gap-1'>
						{order.services.slice(0, 2).map(service => (
							<Badge key={service} variant='secondary' className='text-xs'>
								{service}
							</Badge>
						))}
						{order.services.length > 2 && (
							<Badge variant='secondary' className='text-xs'>
								+{order.services.length - 2} more
							</Badge>
						)}
					</div>

					{/* Footer */}
					<div className='flex items-center justify-between border-t border-border pt-3'>
						<div className='flex items-center gap-2'>
							<Avatar className='h-6 w-6'>
								<AvatarImage src={order.client.avatar || '/placeholder.svg'} />
								<AvatarFallback>
									{order.client.name
										.split(' ')
										.map(n => n[0])
										.join('')}
								</AvatarFallback>
							</Avatar>
							<span className='text-xs text-muted-foreground'>
								{order.client.name}
							</span>
						</div>
						<div className='flex items-center gap-1 text-xs text-muted-foreground'>
							<Clock className='h-3 w-3' />
							{new Date(order.dueDate).toLocaleDateString()}
						</div>
					</div>

					{/* Assigned Mechanic */}
					<div className='mt-2 flex items-center gap-2'>
						<User className='h-3 w-3 text-muted-foreground' />
						<span className='text-xs text-muted-foreground'>
							{order.assignedTo.name}
						</span>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}

interface KanbanColumnProps {
	column: (typeof columns)[0];
	orders: Order[];
}

function KanbanColumn({ column, orders }: KanbanColumnProps) {
	// TODO: Add useDroppable from @dnd-kit for drop target functionality
	// const { setNodeRef, isOver } = useDroppable({ id: column.id })

	return (
		<div
			className='flex min-w-[320px] flex-col rounded-lg bg-muted/50'
			// TODO: Add ref={setNodeRef}
		>
			{/* Column Header */}
			<div className='flex items-center justify-between p-4'>
				<div className='flex items-center gap-2'>
					<div className={cn('h-3 w-3 rounded-full', column.color)} />
					<h3 className='font-semibold'>{column.title}</h3>
					<Badge variant='secondary' className='ml-1'>
						{orders.length}
					</Badge>
				</div>
				<Button variant='ghost' size='icon' className='h-8 w-8'>
					<Plus className='h-4 w-4' />
					<span className='sr-only'>Add order to {column.title}</span>
					{/* TODO: Open create order modal with pre-selected status */}
				</Button>
			</div>

			{/* Column Content */}
			<ScrollArea className='flex-1 px-4 pb-4'>
				<div className='flex flex-col gap-3'>
					{orders.map(order => (
						<OrderCard key={order.id} order={order} />
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

export function KanbanBoard() {
	// TODO: Replace with actual data from useQuery(['orders'])
	// const { data: orders, isLoading, error } = useQuery({
	//   queryKey: ['orders'],
	//   queryFn: () => OrderService.getAll()
	// })

	// TODO: Implement DnD handlers
	// const handleDragEnd = (event: DragEndEvent) => {
	//   const { active, over } = event
	//   if (over && active.id !== over.id) {
	//     // Update order status via API
	//     await OrderService.updateStatus(active.id, over.id)
	//   }
	// }

	const getOrdersByStatus = (status: string) =>
		mockOrders.filter(order => order.status === status);

	return (
		<div className='flex h-full flex-col'>
			{/* Page Header */}
			<div className='mb-6 flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Kanban Board</h1>
					<p className='text-muted-foreground'>
						Drag and drop orders to update their status
					</p>
				</div>
				<Button>
					<Plus className='mr-2 h-4 w-4' />
					New Order
					{/* TODO: Open CreateOrderModal */}
				</Button>
			</div>

			{/* Kanban Columns */}
			{/* TODO: Wrap with DndContext and DragOverlay from @dnd-kit */}
			{/* <DndContext onDragEnd={handleDragEnd}> */}
			<div className='flex flex-1 gap-4 overflow-x-auto pb-4'>
				{columns.map(column => (
					<KanbanColumn
						key={column.id}
						column={column}
						orders={getOrdersByStatus(column.id)}
					/>
				))}
			</div>
			{/* </DndContext> */}
		</div>
	);
}
