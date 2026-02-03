import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Badge,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { Edit, Eye, MoreVertical, Trash2 } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

interface OrdersTableProps {
	orders: any[];
	statusColors: Record<string, string>;
	priorityColors: Record<string, string>;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
	orders,
	statusColors,
	priorityColors,
}) => (
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead>Order ID</TableHead>
				<TableHead>Client</TableHead>
				<TableHead>Vehicle</TableHead>
				<TableHead>Services</TableHead>
				<TableHead>Status</TableHead>
				<TableHead>Priority</TableHead>
				<TableHead>Due Date</TableHead>
				<TableHead className='text-right'>Total</TableHead>
				<TableHead className='w-12'></TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{orders.map(order => (
				<TableRow key={order.id}>
					<TableCell>
						<Link
							to={`/orders/${order.id}`}
							className='font-mono font-medium hover:underline'
						>
							{order.id}
						</Link>
					</TableCell>
					<TableCell>
						<div className='flex items-center gap-2'>
							<Avatar className='h-8 w-8'>
								<AvatarImage src={order.client.avatar || '/placeholder.svg'} />
								<AvatarFallback>
									{order.client.name
										.split(' ')
										// .map(n => n[0])
										.join('')}
								</AvatarFallback>
							</Avatar>
							<span>{order.client.name}</span>
						</div>
					</TableCell>
					<TableCell>
						<div>
							<p className='font-medium'>
								{order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
							</p>
							<p className='text-xs text-muted-foreground'>
								{order.vehicle.plate}
							</p>
						</div>
					</TableCell>
					<TableCell>
						<div className='flex flex-wrap gap-1'>
							{order.services.slice(0, 2).map((service: any) => (
								<Badge key={service} variant='secondary' className='text-xs'>
									{service}
								</Badge>
							))}
							{order.services.length > 2 && (
								<Badge variant='secondary' className='text-xs'>
									+{order.services.length - 2}
								</Badge>
							)}
						</div>
					</TableCell>
					<TableCell>
						<Badge className={cn(statusColors[order.status])}>
							{order.status.replace('_', ' ')}
						</Badge>
					</TableCell>
					<TableCell>
						<Badge
							variant='outline'
							className={cn(priorityColors[order.priority])}
						>
							{order.priority}
						</Badge>
					</TableCell>
					<TableCell>{new Date(order.dueDate).toLocaleDateString()}</TableCell>
					<TableCell className='text-right font-medium'>
						${order.total.toFixed(2)}
					</TableCell>
					<TableCell>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='ghost' size='icon' className='h-8 w-8'>
									<MoreVertical className='h-4 w-4' />
									<span className='sr-only'>Actions</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem asChild>
									<Link to={`/orders/${order.id}`}>
										<Eye className='mr-2 h-4 w-4' />
										View Details
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Edit className='mr-2 h-4 w-4' />
									Edit Order
								</DropdownMenuItem>
								<DropdownMenuItem className='text-destructive'>
									<Trash2 className='mr-2 h-4 w-4' />
									Delete Order
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);
