import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
	Label,
} from '@/shared/components/ui';
import { Plus } from 'lucide-react';

export function VehiclesHeader() {
	return (
		<div className='flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>Vehicles</h1>
				<p className='text-muted-foreground'>Manage registered vehicles</p>
			</div>
			<Dialog>
				<DialogTrigger asChild>
					<Button>
						<Plus className='mr-2 h-4 w-4' />
						Add Vehicle
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New Vehicle</DialogTitle>
						<DialogDescription>
							Enter the vehicle details below.
						</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<div className='grid grid-cols-2 gap-4'>
							<div className='grid gap-2'>
								<Label htmlFor='make'>Make</Label>
								<Input id='make' placeholder='BMW' />
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='model'>Model</Label>
								<Input id='model' placeholder='X5' />
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div className='grid gap-2'>
								<Label htmlFor='year'>Year</Label>
								<Input id='year' placeholder='2023' />
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='color'>Color</Label>
								<Input id='color' placeholder='Black' />
							</div>
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='plate'>License Plate</Label>
							<Input id='plate' placeholder='ABC-1234' />
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='vin'>VIN</Label>
							<Input id='vin' placeholder='WBAPH5C55BA123456' />
						</div>
					</div>
					<DialogFooter>
						<Button variant='outline'>Cancel</Button>
						<Button>Add Vehicle</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
