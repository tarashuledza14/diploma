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
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ClientService } from '../api/client.service';
import { Client } from '../interfaces/client.interface';

export type ClientFormData = {
	fullName: string;
	email: string;
	phone: string;
};

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
	const { t } = useTranslation();
	const clientSchema = z.object({
		fullName: z.string().min(1, t('clients.form.errors.fullNameRequired')),
		email: z.email(t('clients.form.errors.invalidEmail')),
		phone: z.string().min(1, t('clients.form.errors.phoneRequired')),
	});
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
					<ResponsiveDialogTitle>
						{t('clients.dialogs.editTitle')}
					</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						{t('clients.dialogs.editDescription')}
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className='grid gap-4 py-4'>
						<div className='grid gap-2'>
							<Label htmlFor='edit-name'>
								{t('clients.fields.fullName')} *
							</Label>
							<Input
								id='edit-name'
								placeholder={t('clients.placeholders.fullName')}
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
								<Label htmlFor='edit-email'>{t('common.email')} *</Label>
								<Input
									id='edit-email'
									type='email'
									placeholder={t('clients.placeholders.email')}
									{...register('email')}
								/>
								{errors.email && (
									<span className='text-red-500 text-xs'>
										{errors.email.message}
									</span>
								)}
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='edit-phone'>{t('common.phone')} *</Label>
								<Input
									id='edit-phone'
									placeholder={t('clients.placeholders.phone')}
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
							{t('common.cancel')}
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
									{t('common.saving')}
								</>
							) : (
								t('common.saveChanges')
							)}
						</Button>
					</ResponsiveDialogFooter>
				</form>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
