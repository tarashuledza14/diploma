import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AddServiceProps {
	serviceOptions: Array<{ id: string; name: string; price: number }>;
	onAddService: (serviceId: string) => Promise<void>;
	isPending?: boolean;
}

export function AddService({
	serviceOptions,
	onAddService,
	isPending = false,
}: AddServiceProps) {
	const [open, setOpen] = useState(false);
	const [selectedServiceId, setSelectedServiceId] = useState('');

	const handleAdd = async () => {
		if (!selectedServiceId) {
			toast.error('Select a service first');
			return;
		}

		await onAddService(selectedServiceId);
		setSelectedServiceId('');
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button disabled={isPending}>
					<Plus className='mr-2 h-4 w-4' />
					Add Service
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Service</DialogTitle>
					<DialogDescription>
						Select a service from the catalog to add to this order.
					</DialogDescription>
				</DialogHeader>
				<div className='py-4'>
					<Select
						value={selectedServiceId}
						onValueChange={setSelectedServiceId}
					>
						<SelectTrigger>
							<SelectValue placeholder='Select a service' />
						</SelectTrigger>
						<SelectContent>
							{serviceOptions.map(service => (
								<SelectItem key={service.id} value={service.id}>
									{service.name} - ${service.price}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => {
							setOpen(false);
							setSelectedServiceId('');
						}}
					>
						Cancel
					</Button>
					<Button
						onClick={handleAdd}
						disabled={isPending || !selectedServiceId}
					>
						Add Service
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
