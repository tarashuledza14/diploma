import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/components/ui';
import { Plus, ShoppingCart } from 'lucide-react';
import { InventoryDictionaries } from '../interfaces/inventory.interfaces';
import { AddInventoryPart } from './redo/edit-part/form/AddInventoryPart';

const categories = ['Filters', 'Fluids', 'Brakes', 'Ignition', 'Electrical'];

interface InventoryHeaderProps {
	dictionaries: InventoryDictionaries | undefined;
}
export function InventoryHeader({ dictionaries }: InventoryHeaderProps) {
	return (
		<div className='flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>Parts Inventory</h1>
				<p className='text-muted-foreground'>
					Manage your parts stock and orders
				</p>
			</div>
			<div className='flex gap-2'>
				<Button variant='outline'>
					<ShoppingCart className='mr-2 h-4 w-4' />
					Order Parts
				</Button>
				<Dialog>
					<DialogTrigger asChild>
						<Button>
							<Plus className='mr-2 h-4 w-4' />
							Add Part
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add New Part</DialogTitle>
							<DialogDescription>
								Add a new part to your inventory.
							</DialogDescription>
						</DialogHeader>
						{dictionaries && <AddInventoryPart dictionaries={dictionaries} />}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
