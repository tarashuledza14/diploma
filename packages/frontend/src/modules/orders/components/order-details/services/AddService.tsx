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

export function AddService() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>
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
				{/* TODO: Open modal to select service from catalog */}
				{/* TODO: Fetch services from ServiceCatalogService.getAll() */}
				<div className='py-4'>
					<Select>
						<SelectTrigger>
							<SelectValue placeholder='Select a service' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='oil-change'>Oil Change - $49.99</SelectItem>
							<SelectItem value='brake-service'>
								Brake Service - $149.99
							</SelectItem>
							<SelectItem value='tire-rotation'>
								Tire Rotation - $29.99
							</SelectItem>
							<SelectItem value='full-service'>
								Full Service - $299.99
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<DialogFooter>
					<Button variant='outline'>Cancel</Button>
					<Button>
						Add Service
						{/* TODO: Call OrderService.addService() */}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
