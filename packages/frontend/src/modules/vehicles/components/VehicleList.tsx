import { useState } from 'react';
import { VehiclesFilters } from './VehiclesFilters';
import { VehiclesHeader } from './VehiclesHeader';
import { VehiclesTable } from './VehiclesTable';
import { mockVehicles } from './mockVehicles';

export function VehiclesList() {
	const [searchQuery, setSearchQuery] = useState('');
	const [makeFilter, setMakeFilter] = useState('all');

	const uniqueMakes = [...new Set(mockVehicles.map(v => v.make))];

	const filteredVehicles = mockVehicles.filter(vehicle => {
		const matchesSearch =
			vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
			vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
			vehicle.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			`${vehicle.make} ${vehicle.model}`
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
		const matchesMake = makeFilter === 'all' || vehicle.make === makeFilter;
		return matchesSearch && matchesMake;
	});

	return (
		<div className='flex flex-col gap-6'>
			<VehiclesHeader />
			<div className='bg-card rounded-lg shadow-sm'>
				<div className='p-6'>
					<VehiclesFilters
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						makeFilter={makeFilter}
						setMakeFilter={setMakeFilter}
						uniqueMakes={uniqueMakes}
					/>
				</div>
			</div>
			<div className='bg-card rounded-lg shadow-sm'>
				<div className='p-0'>
					<VehiclesTable vehicles={filteredVehicles} />
				</div>
			</div>
			<div className='text-sm text-muted-foreground'>
				Showing {filteredVehicles.length} of {mockVehicles.length} vehicles
			</div>
		</div>
	);
	// ...existing code...
}
