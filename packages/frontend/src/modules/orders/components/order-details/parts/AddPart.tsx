import {
	Button,
	DialogFooter,
	DialogHeader,
	Input,
} from '@/shared/components/ui';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from '@radix-ui/react-dialog';
import { Plus } from 'lucide-react';

export function AddPart() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>
					<Plus className='mr-2 h-4 w-4' />
					Add Part
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add Part</DialogTitle>
					<DialogDescription>
						Search for a part in the inventory to add to this order.
					</DialogDescription>
				</DialogHeader>
				{/* TODO: Implement parts search with PartsService.search() */}
				<div className='space-y-4 py-4'>
					<Input placeholder='Search parts by name or SKU...' />
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='text-sm font-medium'>Quantity</label>
							<Input type='number' defaultValue='1' min='1' />
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline'>Cancel</Button>
					<Button>
						Add Part
						{/* TODO: Call OrderService.addPart() */}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
