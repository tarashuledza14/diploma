import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '@/shared/components/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ClientService } from '../api/client.service'
import { clientKeys } from '../queries/keys'
import { EditClientDialog } from './EditClientDialog'
import { ClientHeader } from './profile/ClientHeader'
import { ClientStats } from './profile/ClientStats'
import { NotesTab } from './profile/tabs/NotesTab'
import { OrdersTab } from './profile/tabs/OrdersTab'
import { VehiclesTab } from './profile/tabs/VehiclesTab'

const notesSchema = z.object({
	notes: z.string(),
});

type NotesFormData = z.infer<typeof notesSchema>;

interface ViewProfileDetailsProps {
	open: boolean;
	setProfileModalOpen: (open: boolean) => void;
	selectedClientId?: string;
}

export function ViewProfileDetails({
	open: profileModalOpen,
	setProfileModalOpen,
	selectedClientId,
}: ViewProfileDetailsProps) {
	const [isEditingNotes, setIsEditingNotes] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const {
		register: registerNotes,
		handleSubmit: handleSubmitNotes,
		formState: { errors: notesErrors },
		reset: resetNotes,
	} = useForm<NotesFormData>({
		resolver: zodResolver(notesSchema),
		defaultValues: {
			notes: '',
		},
	});

	const { data: clientDetails } = useQuery({
		queryKey: clientKeys.detail(selectedClientId || ''),
		queryFn: () => ClientService.getClientDetails(selectedClientId || ''),
		enabled: profileModalOpen && !!selectedClientId,
	});

	const handleSaveNotes = async (data: NotesFormData) => {
		try {
			// await api.updateClientNotes(selectedClient.id, data.notes);
			console.log('Updated notes:', data.notes);
			setIsEditingNotes(false);
		} catch (error) {
			console.error('Failed to update notes:', error);
		}
	};

	const handleCancelNotes = () => {
		resetNotes();
		setIsEditingNotes(false);
	};

	// Mock data - replace with actual data from API
	// const mockClientVehicles = selectedClient?.vehicles || [];
	// const mockClientOrders = selectedClient?.orders || [];
	const orderStatusColors = {
		pending: 'bg-yellow-100 text-yellow-800',
		'in-progress': 'bg-blue-100 text-blue-800',
		completed: 'bg-green-100 text-green-800',
		cancelled: 'bg-red-100 text-red-800',
	};

	return (
		<>
			<Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
				<DialogContent className='max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
					<DialogHeader>
						<DialogTitle>Client Profile</DialogTitle>
					</DialogHeader>

					{clientDetails && (
						<div className='flex-1 min-h-0 overflow-hidden'>
							<ClientHeader
								selectedClient={clientDetails}
								onEditClick={() => setEditDialogOpen(true)}
							/>

							<ClientStats selectedClient={clientDetails} />

							<Tabs
								defaultValue='vehicles'
								className='flex-1 flex flex-col min-h-0'
							>
								<TabsList className='grid w-full grid-cols-3'>
									<TabsTrigger value='vehicles'>Vehicles</TabsTrigger>
									<TabsTrigger value='orders'>Order History</TabsTrigger>
									<TabsTrigger value='notes'>Notes</TabsTrigger>
								</TabsList>

								<TabsContent value='vehicles' className='flex-1 min-h-0 mt-4'>
									<VehiclesTab mockClientVehicles={clientDetails.vehicles} />
								</TabsContent>

								<TabsContent value='orders' className='flex-1 min-h-0 mt-4'>
									<OrdersTab
										mockClientOrders={clientDetails.orders}
										orderStatusColors={orderStatusColors}
									/>
								</TabsContent>

								<TabsContent value='notes' className='flex-1 min-h-0 mt-4'>
									<NotesTab
										isEditingNotes={isEditingNotes}
										setIsEditingNotes={setIsEditingNotes}
										selectedClient={clientDetails}
										registerNotes={registerNotes}
										handleSubmitNotes={handleSubmitNotes}
										notesErrors={notesErrors}
										handleSaveNotes={handleSaveNotes}
										handleCancelNotes={handleCancelNotes}
									/>
								</TabsContent>
							</Tabs>
						</div>
					)}
				</DialogContent>
			</Dialog>

			<EditClientDialog
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				selectedClient={clientDetails}
			/>
		</>
	);
}
