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
import { useTranslation } from 'react-i18next';
import z from 'zod';
import { ClientService } from '../api/client.service';
import { CreateClientData } from '../interfaces/create-client.interface';
import { clientKeys } from '../queries/keys';

export function AddClientDialog() {
	const { t } = useTranslation();
	const schema = z.object({
		fullName: z.string().min(1, t('clients.form.errors.fullNameRequired')),
		phone: z.string().min(1, t('clients.form.errors.phoneRequired')),
		email: z
			.email(t('clients.form.errors.invalidEmail'))
			.optional()
			.or(z.literal('')),
	});
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
			toast.success(t('clients.messages.addSuccess'));
			setOpen(false);
			reset();
		},
		onError: () => {
			toast.error(t('clients.messages.addError'));
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
					{t('clients.actions.addClient')}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('clients.dialogs.addTitle')}</DialogTitle>
					<DialogDescription>
						{t('clients.dialogs.addDescription')}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className='grid gap-4 py-4'>
						<div className='grid gap-2'>
							<Label htmlFor='name'>
								{t('clients.fields.fullName')}{' '}
								<span className='text-red-500'>*</span>
							</Label>
							<Input
								id='name'
								placeholder={t('clients.placeholders.fullName')}
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
								{t('common.phone')} <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='phone'
								placeholder={t('clients.placeholders.phone')}
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
							<Label htmlFor='email'>{t('common.email')}</Label>
							<Input
								id='email'
								type='email'
								placeholder={t('clients.placeholders.email')}
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
							{t('common.cancel')}
						</Button>
						<Button type='submit' disabled={isSubmitting}>
							{isSubmitting
								? t('common.adding')
								: t('clients.actions.addClient')}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
