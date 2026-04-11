import { useCurrencyFormatter } from '@/modules/app-settings';
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface AddServiceProps {
	serviceOptions: Array<{ id: string; name: string; price: number }>;
	onAddService: (serviceId: string) => Promise<void>;
	isPending?: boolean;
}

export function AddService({
	serviceOptions,
	onAddService,
	isPending = false,
}: AddServiceProps) {
	const { t } = useTranslation();
	const { formatCurrency } = useCurrencyFormatter();
	const [open, setOpen] = useState(false);
	const [selectedServiceId, setSelectedServiceId] = useState('');

	const handleAdd = async () => {
		if (!selectedServiceId) {
			toast.error(t('orders.newOrder.messages.selectServiceFirst'));
			return;
		}

		await onAddService(selectedServiceId);
		setSelectedServiceId('');
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button disabled={isPending}>
					<Plus className='mr-2 h-4 w-4' />
					{t('orders.newOrder.actions.addService')}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{t('orders.newOrder.dialogs.addServiceTitle')}
					</DialogTitle>
					<DialogDescription>
						{t('orders.newOrder.dialogs.addServiceDescription')}
					</DialogDescription>
				</DialogHeader>
				<div className='py-4'>
					<Select
						value={selectedServiceId}
						onValueChange={setSelectedServiceId}
					>
						<SelectTrigger>
							<SelectValue
								placeholder={t('orders.newOrder.placeholders.selectService')}
							/>
						</SelectTrigger>
						<SelectContent>
							{serviceOptions.map(service => (
								<SelectItem key={service.id} value={service.id}>
									{service.name} - {formatCurrency(service.price)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => {
							setOpen(false);
							setSelectedServiceId('');
						}}
					>
						{t('common.cancel')}
					</Button>
					<Button
						onClick={handleAdd}
						disabled={isPending || !selectedServiceId}
					>
						{t('orders.newOrder.actions.addService')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
