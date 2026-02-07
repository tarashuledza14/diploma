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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import z from 'zod';
import { ClientService } from '../api/client.service';
import { CreateClientData } from '../interfaces/create-client.interface';
import { clientKeys } from '../queries/keys';

const schema = z.object({
	fullName: z.string().min(1, 'Full Name is required'),
	phone: z.string().min(1, 'Phone is required'),
	email: z.email('Invalid email').optional().or(z.literal('')),
});

export function AddClientDialog() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<CreateClientData>({
		resolver: zodResolver(schema),
	});

	const { mutate } = useMutation({
		mutationKey: clientKeys.mutations.create,
		mutationFn: (data: CreateClientData) => ClientService.createClient(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: clientKeys.all });
			toast.success('Client added successfully');
			setOpen(false);
			reset();
		},
		onError: () => {
			toast.error('Failed to add client');
		},
	});

	const onSubmit = (data: CreateClientData) => {
		mutate(data);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={nextOpen => {
				setOpen(nextOpen);
				if (!nextOpen) reset();
			}}
		>
			<DialogTrigger asChild>
				<Button>
					<Plus className='mr-2 h-4 w-4' />
					Add Client
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add New Client</DialogTitle>
					<DialogDescription>Enter the client details below.</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className='grid gap-4 py-4'>
						<div className='grid gap-2'>
							<Label htmlFor='name'>
								Full Name <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='name'
								placeholder='John Doe'
								{...register('fullName')}
								disabled={isSubmitting}
							/>
							{errors.fullName && (
								<span className='text-red-500 text-xs'>
									{errors.fullName.message}
								</span>
							)}
						</div>

						<div className='grid gap-2'>
							<Label htmlFor='phone'>
								Phone <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='phone'
								placeholder='+1 (555) 000-0000'
								{...register('phone')}
								disabled={isSubmitting}
							/>
							{errors.phone && (
								<span className='text-red-500 text-xs'>
									{errors.phone.message}
								</span>
							)}
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								placeholder='john@example.com'
								{...register('email')}
								disabled={isSubmitting}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => {
								reset();
								setOpen(false);
							}}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type='submit' disabled={isSubmitting}>
							{isSubmitting ? 'Adding...' : 'Add Client'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
