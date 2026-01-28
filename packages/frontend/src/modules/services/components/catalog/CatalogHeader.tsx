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
	Textarea,
} from '@/shared/components/ui';
import { Plus } from 'lucide-react';
import { FC } from 'react';

interface CatalogHeaderProps {
	categories: string[];
}

export const CatalogHeader: FC<CatalogHeaderProps> = ({ categories }) => (
	<div className='flex items-center justify-between'>
		<div>
			<h1 className='text-2xl font-bold'>Services Catalog</h1>
			<p className='text-muted-foreground'>
				Manage your service offerings and pricing
			</p>
		</div>
		<Dialog>
			<DialogTrigger asChild>
				<Button>
					<Plus className='mr-2 h-4 w-4' />
					Add Service
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>Add New Service</DialogTitle>
					<DialogDescription>
						Create a new service for your catalog.
					</DialogDescription>
				</DialogHeader>
				<div className='grid gap-4 py-4'>
					<div className='grid gap-2'>
						<Label htmlFor='name'>Service Name</Label>
						<Input id='name' placeholder='Oil Change' />
					</div>
					<div className='grid gap-2'>
						<Label htmlFor='category'>Category</Label>
						<Select>
							<SelectTrigger>
								<SelectValue placeholder='Select category' />
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
					<div className='grid gap-2'>
						<Label htmlFor='description'>Description</Label>
						<Textarea id='description' placeholder='Service description...' />
					</div>
					<div className='grid grid-cols-2 gap-4'>
						<div className='grid gap-2'>
							<Label htmlFor='price'>Price ($)</Label>
							<Input id='price' type='number' placeholder='49.99' />
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='hours'>Labor Hours</Label>
							<Input id='hours' type='number' placeholder='1' />
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline'>Cancel</Button>
					<Button>Add Service</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</div>
);
