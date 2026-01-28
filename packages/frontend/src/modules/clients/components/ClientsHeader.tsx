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
} from '@/shared/components/ui';
import { Plus } from 'lucide-react';

export function ClientsHeader() {
	return (
		<div className='flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>Clients</h1>
				<p className='text-muted-foreground'>Manage your client database</p>
			</div>
			<Dialog>
				<DialogTrigger asChild>
					<Button>
						<Plus className='mr-2 h-4 w-4' />
						Add Client
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New Client</DialogTitle>
						<DialogDescription>
							Enter the client details below.
						</DialogDescription>
					</DialogHeader>
					<div className='grid gap-4 py-4'>
						<div className='grid gap-2'>
							<Label htmlFor='name'>Full Name</Label>
							<Input id='name' placeholder='John Doe' />
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='email'>Email</Label>
							<Input id='email' type='email' placeholder='john@example.com' />
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='phone'>Phone</Label>
							<Input id='phone' placeholder='+1 (555) 000-0000' />
						</div>
					</div>
					<DialogFooter>
						<Button variant='outline'>Cancel</Button>
						<Button>Add Client</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
