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
import {
	Car,
	Edit,
	Eye,
	Mail,
	MoreVertical,
	Phone,
	Trash2,
} from 'lucide-react';
import { mockClients, statusColors } from './mockClients';

export function ClientsTable({ clients }: { clients: typeof mockClients }) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Client</TableHead>
					<TableHead>Contact</TableHead>
					<TableHead>Vehicles</TableHead>
					<TableHead>Orders</TableHead>
					<TableHead>Total Spent</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Last Visit</TableHead>
					<TableHead className='w-12'></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{clients.map(client => (
					<TableRow key={client.id}>
						<TableCell>
							<div className='flex items-center gap-3'>
								<Avatar className='h-10 w-10'>
									<AvatarImage src={client.avatar || '/placeholder.svg'} />
									<AvatarFallback>
										{client.name
											.split(' ')
											.map(n => n[0])
											.join('')}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className='font-medium'>{client.name}</p>
									<p className='text-xs text-muted-foreground'>{client.id}</p>
								</div>
							</div>
						</TableCell>
						<TableCell>
							<div className='space-y-1'>
								<div className='flex items-center gap-1 text-sm'>
									<Mail className='h-3 w-3 text-muted-foreground' />
									{client.email}
								</div>
								<div className='flex items-center gap-1 text-sm'>
									<Phone className='h-3 w-3 text-muted-foreground' />
									{client.phone}
								</div>
							</div>
						</TableCell>
						<TableCell>
							<div className='flex items-center gap-1'>
								<Car className='h-4 w-4 text-muted-foreground' />
								{client.vehicleCount}
							</div>
						</TableCell>
						<TableCell>{client.totalOrders}</TableCell>
						<TableCell className='font-medium'>
							${client.totalSpent.toFixed(2)}
						</TableCell>
						<TableCell>
							<Badge className={statusColors[client.status]}>
								{client.status.toUpperCase()}
							</Badge>
						</TableCell>
						<TableCell>
							{new Date(client.lastVisit).toLocaleDateString()}
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
									<DropdownMenuItem>
										<Eye className='mr-2 h-4 w-4' />
										View Profile
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Edit className='mr-2 h-4 w-4' />
										Edit Client
									</DropdownMenuItem>
									<DropdownMenuItem className='text-destructive'>
										<Trash2 className='mr-2 h-4 w-4' />
										Delete Client
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
