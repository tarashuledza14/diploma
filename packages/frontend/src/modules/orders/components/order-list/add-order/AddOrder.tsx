import React from 'react';

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	ScrollArea,
	Separator,
} from '@/shared/components/ui';
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { ClientSelect } from './components/ClientSelect';
import { DueDateInput } from './components/DueDateInput';
import { MechanicSelect } from './components/MechanicSelect';
import { NotesInput } from './components/NotesInput';
import { PrioritySelect } from './components/PrioritySelect';
import { SelectedServicesTags } from './components/SelectedServicesTags';
import { ServicesSelect } from './components/ServicesSelect';
import { ServicesSummary } from './components/ServicesSummary';
import { VehicleSelect } from './components/VehicleSelect';

// TODO: Replace with actual data from API
const mockClients = [
	{
		id: 'CLI-001',
		name: 'John Smith',
		email: 'john@example.com',
		phone: '+1 555-123-4567',
	},
	{
		id: 'CLI-002',
		name: 'Sarah Davis',
		email: 'sarah@example.com',
		phone: '+1 555-234-5678',
	},
	{
		id: 'CLI-003',
		name: 'Robert Brown',
		email: 'robert@example.com',
		phone: '+1 555-345-6789',
	},
	{
		id: 'CLI-004',
		name: 'Emily Chen',
		email: 'emily@example.com',
		phone: '+1 555-456-7890',
	},
	{
		id: 'CLI-005',
		name: 'Michael Lee',
		email: 'michael@example.com',
		phone: '+1 555-567-8901',
	},
];

const mockVehicles = [
	{
		id: 'VEH-001',
		clientId: 'CLI-001',
		make: 'BMW',
		model: 'X5',
		year: 2022,
		plate: 'ABC-1234',
	},
	{
		id: 'VEH-002',
		clientId: 'CLI-002',
		make: 'Mercedes',
		model: 'C-Class',
		year: 2021,
		plate: 'XYZ-5678',
	},
	{
		id: 'VEH-003',
		clientId: 'CLI-003',
		make: 'Audi',
		model: 'A4',
		year: 2023,
		plate: 'DEF-9012',
	},
	{
		id: 'VEH-004',
		clientId: 'CLI-004',
		make: 'VW',
		model: 'Golf',
		year: 2020,
		plate: 'GHI-3456',
	},
	{
		id: 'VEH-005',
		clientId: 'CLI-005',
		make: 'Toyota',
		model: 'Camry',
		year: 2019,
		plate: 'JKL-7890',
	},
];

const mockServices = [
	{ id: 'SRV-001', name: 'Oil Change', price: 49.99, duration: 0.5 },
	{ id: 'SRV-002', name: 'Brake Inspection', price: 79.99, duration: 1 },
	{ id: 'SRV-003', name: 'Full Service', price: 299.99, duration: 3 },
	{ id: 'SRV-004', name: 'Tire Rotation', price: 39.99, duration: 0.5 },
	{ id: 'SRV-005', name: 'Filter Replacement', price: 29.99, duration: 0.5 },
	{ id: 'SRV-006', name: 'AC Repair', price: 149.99, duration: 2 },
	{ id: 'SRV-007', name: 'Battery Replacement', price: 99.99, duration: 0.5 },
	{ id: 'SRV-008', name: 'Engine Diagnostic', price: 89.99, duration: 1 },
];

const mockMechanics = [
	{ id: 'MECH-001', name: 'Mike Johnson', specialty: 'Engine & Transmission' },
	{ id: 'MECH-002', name: 'Tom Wilson', specialty: 'Brakes & Suspension' },
	{ id: 'MECH-003', name: 'Alex Rodriguez', specialty: 'Electrical Systems' },
];

interface NewOrderModalProps {
	trigger?: React.ReactNode;
	defaultStatus?: string;
}

export function NewOrderModal({
	trigger,
	// defaultStatus = 'new',
}: NewOrderModalProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Form state
	const [selectedClient, setSelectedClient] = useState<string>('');
	const [selectedVehicle, setSelectedVehicle] = useState<string>('');
	const [selectedServices, setSelectedServices] = useState<string[]>([]);
	const [priority, setPriority] = useState<string>('medium');
	const [assignedMechanic, setAssignedMechanic] = useState<string>('');
	const [dueDate, setDueDate] = useState<string>('');
	const [notes, setNotes] = useState<string>('');

	const [clientOpen, setClientOpen] = useState(false);
	const [vehicleOpen, setVehicleOpen] = useState(false);
	const [servicesOpen, setServicesOpen] = useState(false);

	const clientVehicles = selectedClient
		? mockVehicles.filter(v => v.clientId === selectedClient)
		: mockVehicles;

	const selectedClientData = mockClients.find(c => c.id === selectedClient);
	const selectedVehicleData = mockVehicles.find(v => v.id === selectedVehicle);
	const selectedServicesData = mockServices.filter(s =>
		selectedServices.includes(s.id),
	);

	const totalPrice = selectedServicesData.reduce((sum, s) => sum + s.price, 0);
	const totalDuration = selectedServicesData.reduce(
		(sum, s) => sum + s.duration,
		0,
	);

	const handleServiceToggle = (serviceId: string) => {
		setSelectedServices(prev =>
			prev.includes(serviceId)
				? prev.filter(id => id !== serviceId)
				: [...prev, serviceId],
		);
	};

	const removeService = (serviceId: string) => {
		setSelectedServices(prev => prev.filter(id => id !== serviceId));
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);

		await new Promise(resolve => setTimeout(resolve, 1000));

		setIsSubmitting(false);
		setOpen(false);

		setSelectedClient('');
		setSelectedVehicle('');
		setSelectedServices([]);
		setPriority('medium');
		setAssignedMechanic('');
		setDueDate('');
		setNotes('');
	};

	const isFormValid =
		selectedClient && selectedVehicle && selectedServices.length > 0 && dueDate;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button>
						<Plus className='mr-2 h-4 w-4' />
						New Order
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className='max-w-2xl overflow-hidden'>
				<DialogHeader>
					<DialogTitle>Create New Order</DialogTitle>
					<DialogDescription>
						Fill in the details to create a new service order.
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className='max-h-[60vh] pr-4'>
					<div className='space-y-6 py-4'>
						<ClientSelect
							clients={mockClients}
							selectedClient={selectedClient}
							setSelectedClient={setSelectedClient}
							setSelectedVehicle={setSelectedVehicle}
							open={clientOpen}
							setOpen={setClientOpen}
						/>
						<VehicleSelect
							vehicles={clientVehicles}
							selectedVehicle={selectedVehicle}
							setSelectedVehicle={setSelectedVehicle}
							open={vehicleOpen}
							setOpen={setVehicleOpen}
							disabled={!selectedClient && clientVehicles.length === 0}
							selectedClient={selectedClient}
						/>
						<Separator />
						<ServicesSelect
							services={mockServices}
							selectedServices={selectedServices}
							handleServiceToggle={handleServiceToggle}
							open={servicesOpen}
							setOpen={setServicesOpen}
						/>
						<SelectedServicesTags
							selectedServicesData={selectedServicesData}
							removeService={removeService}
						/>
						<ServicesSummary
							totalDuration={totalDuration}
							totalPrice={totalPrice}
						/>
						<Separator />
						<div className='grid grid-cols-2 gap-4'>
							<PrioritySelect priority={priority} setPriority={setPriority} />
							<MechanicSelect
								mechanics={mockMechanics}
								assignedMechanic={assignedMechanic}
								setAssignedMechanic={setAssignedMechanic}
							/>
						</div>
						<DueDateInput dueDate={dueDate} setDueDate={setDueDate} />
						<NotesInput notes={notes} setNotes={setNotes} />
					</div>
				</ScrollArea>

				<DialogFooter className='border-t pt-4'>
					<Button
						variant='outline'
						onClick={() => setOpen(false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!isFormValid || isSubmitting}
					>
						{isSubmitting ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Creating...
							</>
						) : (
							<>
								<Plus className='mr-2 h-4 w-4' />
								Create Order
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
