import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Textarea,
} from '@/shared/components/ui';
import {
	Clock,
	DollarSign,
	Edit,
	Filter,
	MoreVertical,
	Plus,
	Search,
	Trash2,
	Wrench,
} from 'lucide-react';
import { useState } from 'react';

const mockServices = [
	{
		id: 'SRV-001',
		name: 'Oil Change',
		description: 'Standard oil change with filter replacement',
		category: 'Maintenance',
		price: 49.99,
		laborHours: 0.5,
		partsIncluded: ['Oil Filter', 'Engine Oil 5W-30'],
		status: 'active',
		popularityCount: 156,
	},
	{
		id: 'SRV-002',
		name: 'Full Service',
		description: 'Complete vehicle inspection and maintenance package',
		category: 'Maintenance',
		price: 299.99,
		laborHours: 3,
		partsIncluded: ['Oil Filter', 'Air Filter', 'Cabin Filter', 'Engine Oil'],
		status: 'active',
		popularityCount: 89,
	},
	{
		id: 'SRV-003',
		name: 'Brake Inspection',
		description: 'Complete brake system inspection',
		category: 'Brakes',
		price: 79.99,
		laborHours: 1,
		partsIncluded: [],
		status: 'active',
		popularityCount: 67,
	},
	{
		id: 'SRV-004',
		name: 'Brake Pad Replacement',
		description: 'Front or rear brake pad replacement',
		category: 'Brakes',
		price: 189.99,
		laborHours: 2,
		partsIncluded: ['Brake Pads'],
		status: 'active',
		popularityCount: 45,
	},
	{
		id: 'SRV-005',
		name: 'Tire Rotation',
		description: 'Rotate all four tires for even wear',
		category: 'Tires',
		price: 29.99,
		laborHours: 0.5,
		partsIncluded: [],
		status: 'active',
		popularityCount: 112,
	},
	{
		id: 'SRV-006',
		name: 'Tire Replacement',
		description: 'Replace and balance single tire',
		category: 'Tires',
		price: 149.99,
		laborHours: 1,
		partsIncluded: ['Tire'],
		status: 'active',
		popularityCount: 78,
	},
	{
		id: 'SRV-007',
		name: 'Engine Diagnostic',
		description: 'Computer diagnostic scan and analysis',
		category: 'Engine',
		price: 89.99,
		laborHours: 1,
		partsIncluded: [],
		status: 'active',
		popularityCount: 54,
	},
	{
		id: 'SRV-008',
		name: 'AC Repair',
		description: 'Air conditioning system diagnosis and repair',
		category: 'Climate',
		price: 199.99,
		laborHours: 2,
		partsIncluded: ['Refrigerant'],
		status: 'active',
		popularityCount: 34,
	},
	{
		id: 'SRV-009',
		name: 'Battery Replacement',
		description: 'Test and replace vehicle battery',
		category: 'Electrical',
		price: 149.99,
		laborHours: 0.5,
		partsIncluded: ['Battery'],
		status: 'active',
		popularityCount: 67,
	},
	{
		id: 'SRV-010',
		name: 'Transmission Flush',
		description: 'Complete transmission fluid flush and replacement',
		category: 'Transmission',
		price: 249.99,
		laborHours: 2,
		partsIncluded: ['Transmission Fluid'],
		status: 'inactive',
		popularityCount: 23,
	},
];

const categories = [
	'Maintenance',
	'Brakes',
	'Tires',
	'Engine',
	'Climate',
	'Electrical',
	'Transmission',
];

const statusColors: Record<string, string> = {
	active: 'bg-green-100 text-green-700',
	inactive: 'bg-gray-100 text-gray-700',
};

export function ServicesCatalog() {
	const [searchQuery, setSearchQuery] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('all');

	const filteredServices = mockServices.filter(service => {
		const matchesSearch =
			service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			service.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory =
			categoryFilter === 'all' || service.category === categoryFilter;
		return matchesSearch && matchesCategory;
	});

	const totalActiveServices = mockServices.filter(
		s => s.status === 'active',
	).length;
	const avgPrice =
		mockServices.reduce((sum, s) => sum + s.price, 0) / mockServices.length;

	return (
		<div className='flex flex-col gap-6'>
			{/* Page Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-2xl font-bold'>Services Catalog</h1>
					<p className='text-muted-foreground'>
						Manage your service offerings and pricing
					</p>
				</div>
				<Dialog>
					<DialogTrigger asChild>
						<Button>
							<Plus className='mr-2 h-4 w-4' />
							Add Service
						</Button>
					</DialogTrigger>
					<DialogContent className='max-w-md'>
						<DialogHeader>
							<DialogTitle>Add New Service</DialogTitle>
							<DialogDescription>
								Create a new service for your catalog.
							</DialogDescription>
						</DialogHeader>
						<div className='grid gap-4 py-4'>
							<div className='grid gap-2'>
								<Label htmlFor='name'>Service Name</Label>
								<Input id='name' placeholder='Oil Change' />
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='category'>Category</Label>
								<Select>
									<SelectTrigger>
										<SelectValue placeholder='Select category' />
									</SelectTrigger>
									<SelectContent>
										{categories.map(cat => (
											<SelectItem key={cat} value={cat.toLowerCase()}>
												{cat}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='description'>Description</Label>
								<Textarea
									id='description'
									placeholder='Service description...'
								/>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='grid gap-2'>
									<Label htmlFor='price'>Price ($)</Label>
									<Input id='price' type='number' placeholder='49.99' />
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='hours'>Labor Hours</Label>
									<Input id='hours' type='number' placeholder='1' />
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button variant='outline'>Cancel</Button>
							<Button>Add Service</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Stats Cards */}
			<div className='grid gap-4 md:grid-cols-3'>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium text-muted-foreground'>
							Total Services
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='flex items-center gap-2'>
							<Wrench className='h-5 w-5 text-primary' />
							<span className='text-2xl font-bold'>{mockServices.length}</span>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium text-muted-foreground'>
							Active Services
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='flex items-center gap-2'>
							<Clock className='h-5 w-5 text-green-500' />
							<span className='text-2xl font-bold'>{totalActiveServices}</span>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium text-muted-foreground'>
							Average Price
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='flex items-center gap-2'>
							<DollarSign className='h-5 w-5 text-amber-500' />
							<span className='text-2xl font-bold'>${avgPrice.toFixed(2)}</span>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<Card>
				<CardContent className='pt-6'>
					<div className='flex flex-col gap-4 md:flex-row md:items-center'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
							<Input
								placeholder='Search services...'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								className='pl-9'
							/>
						</div>
						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger className='w-40'>
								<Filter className='mr-2 h-4 w-4' />
								<SelectValue placeholder='Category' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Categories</SelectItem>
								{categories.map(cat => (
									<SelectItem key={cat} value={cat}>
										{cat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Services Table */}
			<Card>
				<CardContent className='p-0'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Service</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Labor</TableHead>
								<TableHead>Parts Included</TableHead>
								<TableHead className='text-right'>Price</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className='w-12'></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredServices.map(service => (
								<TableRow key={service.id}>
									<TableCell>
										<div>
											<p className='font-medium'>{service.name}</p>
											<p className='text-xs text-muted-foreground'>
												{service.description}
											</p>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant='secondary'>{service.category}</Badge>
									</TableCell>
									<TableCell>{service.laborHours}h</TableCell>
									<TableCell>
										<div className='flex flex-wrap gap-1'>
											{service.partsIncluded.length > 0 ? (
												service.partsIncluded.slice(0, 2).map(part => (
													<Badge
														key={part}
														variant='outline'
														className='text-xs'
													>
														{part}
													</Badge>
												))
											) : (
												<span className='text-xs text-muted-foreground'>
													None
												</span>
											)}
											{service.partsIncluded.length > 2 && (
												<Badge variant='outline' className='text-xs'>
													+{service.partsIncluded.length - 2}
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell className='text-right font-medium'>
										${service.price.toFixed(2)}
									</TableCell>
									<TableCell>
										<Badge className={statusColors[service.status]}>
											{service.status}
										</Badge>
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
													<Edit className='mr-2 h-4 w-4' />
													Edit Service
												</DropdownMenuItem>
												<DropdownMenuItem className='text-destructive'>
													<Trash2 className='mr-2 h-4 w-4' />
													Delete Service
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
				Showing {filteredServices.length} of {mockServices.length} services
			</div>
		</div>
	);
}
