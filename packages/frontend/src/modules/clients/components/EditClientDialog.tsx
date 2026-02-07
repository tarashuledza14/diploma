import {
	Button,
	Input,
	Label,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from '@/shared/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ClientService } from '../api/client.service';
import { Client } from '../interfaces/client.interface';

const clientSchema = z.object({
	fullName: z.string().min(1, 'Name is required'),
	email: z.email('Invalid email'),
	phone: z.string().min(1, 'Phone is required'),
});

export type ClientFormData = z.infer<typeof clientSchema>;

interface EditClientDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedClient?: Client;
}

export function EditClientDialog({
	open,
	onOpenChange,
	selectedClient,
}: EditClientDialogProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		watch,
	} = useForm<ClientFormData>({
		resolver: zodResolver(clientSchema),
		defaultValues: {
			fullName: selectedClient?.fullName || '',
			email: selectedClient?.email || '',
			phone: selectedClient?.phone || '',
		},
	});

	const clientData = watch();

	const { mutate, isPending } = useMutation({
		mutationFn: (data: ClientFormData & { id: string }) =>
			ClientService.updateClient(data.id, data),
		onSuccess: () => {
			onOpenChange(false);
			reset();
		},
	});

	const onSubmit = (data: ClientFormData) => {
		if (selectedClient) {
			mutate({ ...data, id: selectedClient.id });
		}
	};

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='max-w-lg'>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>Edit Client</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Update the client information below.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className='grid gap-4 py-4'>
						<div className='grid gap-2'>
							<Label htmlFor='edit-name'>Full Name *</Label>
							<Input
								id='edit-name'
								placeholder='John Doe'
								{...register('fullName')}
							/>
							{errors.fullName && (
								<span className='text-red-500 text-xs'>
									{errors.fullName.message}
								</span>
							)}
						</div>
						<div className='grid grid-cols-2 gap-4'>
							<div className='grid gap-2'>
								<Label htmlFor='edit-email'>Email *</Label>
								<Input
									id='edit-email'
									type='email'
									placeholder='john@example.com'
									{...register('email')}
								/>
								{errors.email && (
									<span className='text-red-500 text-xs'>
										{errors.email.message}
									</span>
								)}
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='edit-phone'>Phone *</Label>
								<Input
									id='edit-phone'
									placeholder='+1 (555) 000-0000'
									{...register('phone')}
								/>
								{errors.phone && (
									<span className='text-red-500 text-xs'>
										{errors.phone.message}
									</span>
								)}
							</div>
						</div>
					</div>
					<ResponsiveDialogFooter>
						<Button
							variant='outline'
							type='button'
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={
								!clientData.fullName ||
								!clientData.email ||
								!clientData.phone ||
								isPending
							}
						>
							{isPending ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Saving...
								</>
							) : (
								'Save Changes'
							)}
						</Button>
					</ResponsiveDialogFooter>
				</form>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
