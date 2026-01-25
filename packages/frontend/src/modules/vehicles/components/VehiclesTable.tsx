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
import { Car, Edit, Eye, MoreVertical, Trash2, Wrench } from 'lucide-react';

export interface Vehicle {
	id: string;
	make: string;
	model: string;
	year: number;
	plate: string;
	vin: string;
	color: string;
	mileage: number;
	owner: { name: string; avatar: string };
	lastService: string;
	totalServices: number;
	status: string;
}

const statusColors: Record<string, string> = {
	active: 'bg-green-100 text-green-700',
	in_service: 'bg-amber-100 text-amber-700',
	inactive: 'bg-gray-100 text-gray-700',
};

interface VehiclesTableProps {
	vehicles: Vehicle[];
}

export function VehiclesTable({ vehicles }: VehiclesTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Vehicle</TableHead>
					<TableHead>Plate / VIN</TableHead>
					<TableHead>Owner</TableHead>
					<TableHead>Mileage</TableHead>
					<TableHead>Services</TableHead>
					<TableHead>Last Service</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className='w-12'></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{vehicles.map(vehicle => (
					<TableRow key={vehicle.id}>
						<TableCell>
							<div className='flex items-center gap-3'>
								<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted'>
									<Car className='h-5 w-5 text-muted-foreground' />
								</div>
								<div>
									<p className='font-medium'>
										{vehicle.year} {vehicle.make} {vehicle.model}
									</p>
									<p className='text-xs text-muted-foreground'>
										{vehicle.color}
									</p>
								</div>
							</div>
						</TableCell>
						<TableCell>
							<div>
								<p className='font-medium'>{vehicle.plate}</p>
								<p className='font-mono text-xs text-muted-foreground'>
									{vehicle.vin}
								</p>
							</div>
						</TableCell>
						<TableCell>
							<div className='flex items-center gap-2'>
								<Avatar className='h-8 w-8'>
									<AvatarImage
										src={vehicle.owner.avatar || '/placeholder.svg'}
									/>
									<AvatarFallback>
										{vehicle.owner.name
											.split(' ')
											.map(n => n[0])
											.join('')}
									</AvatarFallback>
								</Avatar>
								<span>{vehicle.owner.name}</span>
							</div>
						</TableCell>
						<TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
						<TableCell>
							<div className='flex items-center gap-1'>
								<Wrench className='h-4 w-4 text-muted-foreground' />
								{vehicle.totalServices}
							</div>
						</TableCell>
						<TableCell>
							{new Date(vehicle.lastService).toLocaleDateString()}
						</TableCell>
						<TableCell>
							<Badge className={statusColors[vehicle.status]}>
								{vehicle.status.replace('_', ' ')}
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
										<Eye className='mr-2 h-4 w-4' />
										View History
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Edit className='mr-2 h-4 w-4' />
										Edit Vehicle
									</DropdownMenuItem>
									<DropdownMenuItem className='text-destructive'>
										<Trash2 className='mr-2 h-4 w-4' />
										Delete Vehicle
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
