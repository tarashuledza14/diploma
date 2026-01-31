import { AddVehicleDialog } from './AddVehicleDialog';

export function VehiclesHeader() {
	return (
		<div className='flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>Vehicles</h1>
				<p className='text-muted-foreground'>Manage registered vehicles</p>
			</div>
			<AddVehicleDialog />
		</div>
	);
}
