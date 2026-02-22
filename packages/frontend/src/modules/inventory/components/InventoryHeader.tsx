import {
	Button,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
} from '@/shared/components/ui';
import { Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { InventoryDictionaries } from '../interfaces/inventory.interfaces';
import { AddInventoryPart } from './redo/edit-part/form/AddInventoryPart';

interface InventoryHeaderProps {
	dictionaries: InventoryDictionaries | undefined;
}
export function InventoryHeader({ dictionaries }: InventoryHeaderProps) {
	const [open, setOpen] = useState(false);
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
				<ResponsiveDialog open={open} onOpenChange={setOpen}>
					<ResponsiveDialogTrigger asChild>
						<Button>
							<Plus className='mr-2 h-4 w-4' />
							Add Part
						</Button>
					</ResponsiveDialogTrigger>
					<ResponsiveDialogContent>
						<ResponsiveDialogHeader>
							<ResponsiveDialogTitle>Add New Part</ResponsiveDialogTitle>
							<ResponsiveDialogDescription>
								Add a new part to your inventory.
							</ResponsiveDialogDescription>
						</ResponsiveDialogHeader>
						{dictionaries && (
							<AddInventoryPart
								dictionaries={dictionaries}
								onCancel={() => setOpen(false)}
							/>
						)}
					</ResponsiveDialogContent>
				</ResponsiveDialog>
			</div>
		</div>
	);
}
