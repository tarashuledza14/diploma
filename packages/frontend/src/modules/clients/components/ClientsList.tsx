'use client';

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Badge,
	Button,
	Card,
	CardContent,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Input,
	Label,
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
	Plus,
	Search,
	Trash2,
} from 'lucide-react';
import { useState } from 'react';

const mockClients = [
	{
		id: 'CLI-001',
		name: 'John Smith',
		email: 'john.smith@email.com',
		phone: '+1 (555) 111-1111',
		avatar: '/avatars/client1.jpg',
		vehicleCount: 2,
		totalOrders: 8,
		totalSpent: 2450.0,
		status: 'active',
		lastVisit: '2026-01-15',
	},
	{
		id: 'CLI-002',
		name: 'Sarah Davis',
		email: 'sarah.davis@email.com',
		phone: '+1 (555) 222-2222',
		avatar: '/avatars/client2.jpg',
		vehicleCount: 1,
		totalOrders: 5,
		totalSpent: 1200.0,
		status: 'active',
		lastVisit: '2026-01-14',
	},
	{
		id: 'CLI-003',
		name: 'Robert Brown',
		email: 'robert.brown@email.com',
		phone: '+1 (555) 333-3333',
		avatar: '/avatars/client3.jpg',
		vehicleCount: 3,
		totalOrders: 12,
		totalSpent: 4500.0,
		status: 'vip',
		lastVisit: '2026-01-18',
	},
	{
		id: 'CLI-004',
		name: 'Emily Chen',
		email: 'emily.chen@email.com',
		phone: '+1 (555) 444-4444',
		avatar: '/avatars/client4.jpg',
		vehicleCount: 1,
		totalOrders: 3,
		totalSpent: 650.0,
		status: 'active',
		lastVisit: '2026-01-10',
	},
	{
		id: 'CLI-005',
		name: 'Michael Lee',
		email: 'michael.lee@email.com',
		phone: '+1 (555) 555-5555',
		avatar: '/avatars/client5.jpg',
		vehicleCount: 2,
		totalOrders: 6,
		totalSpent: 1800.0,
		status: 'active',
		lastVisit: '2026-01-08',
	},
	{
		id: 'CLI-006',
		name: 'Lisa Wang',
		email: 'lisa.wang@email.com',
		phone: '+1 (555) 666-6666',
		avatar: '/avatars/client6.jpg',
		vehicleCount: 1,
		totalOrders: 4,
		totalSpent: 980.0,
		status: 'inactive',
		lastVisit: '2025-12-20',
	},
];

const statusColors: Record<string, string> = {
	active: 'bg-green-100 text-green-700',
	vip: 'bg-purple-100 text-purple-700',
	inactive: 'bg-gray-100 text-gray-700',
};

export function ClientsList() {
	const [searchQuery, setSearchQuery] = useState('');

	const filteredClients = mockClients.filter(
		client =>
			client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			client.phone.includes(searchQuery),
	);

	return (
		<div className='flex flex-col gap-6'>
			{/* Page Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Clients</h1>
					<p className='text-muted-foreground'>Manage your client database</p>
				</div>
				<Dialog>
					<DialogTrigger asChild>
						<Button>
							<Plus className='mr-2 h-4 w-4' />
							Add Client
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add New Client</DialogTitle>
							<DialogDescription>
								Enter the client details below.
							</DialogDescription>
						</DialogHeader>
						<div className='grid gap-4 py-4'>
							<div className='grid gap-2'>
								<Label htmlFor='name'>Full Name</Label>
								<Input id='name' placeholder='John Doe' />
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='email'>Email</Label>
								<Input id='email' type='email' placeholder='john@example.com' />
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='phone'>Phone</Label>
								<Input id='phone' placeholder='+1 (555) 000-0000' />
							</div>
						</div>
						<DialogFooter>
							<Button variant='outline'>Cancel</Button>
							<Button>Add Client</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Search */}
			<Card>
				<CardContent className='pt-6'>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
						<Input
							placeholder='Search by name, email, or phone...'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className='pl-9'
						/>
					</div>
				</CardContent>
			</Card>

			{/* Clients Table */}
			<Card>
				<CardContent className='p-0'>
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
							{filteredClients.map(client => (
								<TableRow key={client.id}>
									<TableCell>
										<div className='flex items-center gap-3'>
											<Avatar className='h-10 w-10'>
												<AvatarImage
													src={client.avatar || '/placeholder.svg'}
												/>
												<AvatarFallback>
													{client.name
														.split(' ')
														.map(n => n[0])
														.join('')}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className='font-medium'>{client.name}</p>
												<p className='text-xs text-muted-foreground'>
													{client.id}
												</p>
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
				</CardContent>
			</Card>

			<div className='text-sm text-muted-foreground'>
				Showing {filteredClients.length} of {mockClients.length} clients
			</div>
		</div>
	);
}
