import { NewOrder } from '@/modules/orders/interfaces/new-order.interface';
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
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { OrderStatus } from '../../../interfaces/order-status.enum';
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
	defaultStatus?: OrderStatus;
}

export function NewOrderModal({
	trigger,
	defaultStatus = OrderStatus.NEW,
}: NewOrderModalProps) {
	const [open, setOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [clientOpen, setClientOpen] = useState(false);
	const [vehicleOpen, setVehicleOpen] = useState(false);
	const [servicesOpen, setServicesOpen] = useState(false);
	const [dueDateOpen, setDueDateOpen] = useState(false);
	const {
		control,
		setValue,
		handleSubmit,
		watch,
		reset,
		formState: { isValid },
	} = useForm<NewOrder>({
		mode: 'onChange',
		defaultValues: {
			clientId: '',
			vehicleId: '',
			services: [],
			priority: 'medium',
			assignedMechanic: '',
			dueDate: undefined,
			notes: '',
			status: defaultStatus,
		},
	});

	const clientId = watch('clientId');
	const vehicleId = watch('vehicleId');
	const services = watch('services');

	const clientVehicles = clientId
		? mockVehicles.filter(v => v.clientId === clientId)
		: mockVehicles;

	const clientData = mockClients.find(c => c.id === clientId);
	const vehicleData = mockVehicles.find(v => v.id === vehicleId);
	const servicesData = mockServices.filter(s => services.includes(s.id));

	const totalPrice = servicesData.reduce((sum, s) => sum + s.price, 0);
	const totalDuration = servicesData.reduce((sum, s) => sum + s.duration, 0);

	const handleServiceToggle = (serviceId: string) => {
		const current = watch('services');
		const updated = current.includes(serviceId)
			? current.filter((id: string) => id !== serviceId)
			: [...current, serviceId];
		setValue('services', updated as any);
	};

	const removeService = (serviceId: string) => {
		const current = watch('services');
		setValue(
			'services',
			current.filter((id: string) => id !== serviceId) as any,
		);
	};

	const onSubmit = async (data: NewOrder) => {
		console.log('data', data);
		setIsSubmitting(true);
		await new Promise(resolve => setTimeout(resolve, 1000));
		setIsSubmitting(false);
		setOpen(false);
		reset();
	};

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
						<Controller
							name='clientId'
							control={control}
							render={({ field }) => (
								<ClientSelect
									clients={mockClients}
									selectedClient={field.value}
									setSelectedClient={value => {
										field.onChange(value);
										setValue('vehicleId', '');
									}}
									setSelectedVehicle={value => setValue('vehicleId', value)}
									open={clientOpen}
									setOpen={setClientOpen}
								/>
							)}
						/>
						<Controller
							name='vehicleId'
							control={control}
							render={({ field }) => (
								<VehicleSelect
									vehicles={clientVehicles}
									selectedVehicle={field.value}
									setSelectedVehicle={field.onChange}
									open={vehicleOpen}
									setOpen={setVehicleOpen}
									disabled={!clientId && clientVehicles.length === 0}
									selectedClient={clientId}
								/>
							)}
						/>
						<Separator />
						<Controller
							name='services'
							control={control}
							render={({ field }) => (
								<ServicesSelect
									services={mockServices}
									selectedServices={field.value}
									handleServiceToggle={handleServiceToggle}
									open={servicesOpen}
									setOpen={setServicesOpen}
								/>
							)}
						/>
						<SelectedServicesTags
							selectedServicesData={servicesData}
							removeService={removeService}
						/>
						<ServicesSummary
							totalDuration={totalDuration}
							totalPrice={totalPrice}
						/>
						<Separator />
						<div className='grid grid-cols-2 gap-4'>
							<Controller
								name='priority'
								control={control}
								render={({ field }) => (
									<PrioritySelect
										priority={field.value}
										setPriority={field.onChange}
									/>
								)}
							/>
							<Controller
								name='assignedMechanic'
								control={control}
								render={({ field }) => (
									<MechanicSelect
										mechanics={mockMechanics}
										assignedMechanic={field.value}
										setAssignedMechanic={field.onChange}
									/>
								)}
							/>
						</div>
						<Controller
							name='dueDate'
							control={control}
							render={({ field }) => (
								<DueDateInput
									dueDate={field.value}
									setDueDate={field.onChange}
									dueDateOpen={dueDateOpen}
									setDueDateOpen={setDueDateOpen}
								/>
							)}
						/>
						<Controller
							name='notes'
							control={control}
							render={({ field }) => (
								<NotesInput notes={field.value} setNotes={field.onChange} />
							)}
						/>
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
						onClick={handleSubmit(onSubmit)}
						disabled={!isValid || isSubmitting}
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
