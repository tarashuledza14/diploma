import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { Plus, ShoppingCart } from 'lucide-react';

const categories = ['Filters', 'Fluids', 'Brakes', 'Ignition', 'Electrical'];

export function InventoryHeader() {
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
						<div className='grid gap-4 py-4'>
							<div className='grid gap-2'>
								<Label htmlFor='name'>Part Name</Label>
								<Input id='name' placeholder='Oil Filter' />
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='grid gap-2'>
									<Label htmlFor='sku'>SKU</Label>
									<Input id='sku' placeholder='OF-12345' />
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='category'>Category</Label>
									<Select>
										<SelectTrigger>
											<SelectValue placeholder='Select' />
										</SelectTrigger>
										<SelectContent>
											{categories.map(cat => (
												<SelectItem key={cat} value={cat.toLowerCase()}>
													{cat}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className='grid grid-cols-2 gap-4'>
								<div className='grid gap-2'>
									<Label htmlFor='quantity'>Quantity</Label>
									<Input id='quantity' type='number' placeholder='0' />
								</div>
								<div className='grid gap-2'>
									<Label htmlFor='minStock'>Min Stock</Label>
									<Input id='minStock' type='number' placeholder='10' />
								</div>
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='price'>Unit Price ($)</Label>
								<Input id='price' type='number' placeholder='24.99' />
							</div>
						</div>
						<DialogFooter>
							<Button variant='outline'>Cancel</Button>
							<Button>Add Part</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
