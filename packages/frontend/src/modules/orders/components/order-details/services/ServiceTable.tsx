import {
	Button,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
	services: any;
	onRemoveService: (serviceRowId: string) => Promise<void>;
	canManageServices?: boolean;
	showFinancials?: boolean;
	isPending?: boolean;
}

export function ServiceTable({
	services,
	onRemoveService,
	canManageServices = true,
	showFinancials = true,
	isPending = false,
}: Props) {
	const { t } = useTranslation();

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>{t('orders.newOrder.fields.service')}</TableHead>
					<TableHead>
						{t('orders.detailsServices.columns.description')}
					</TableHead>
					<TableHead>{t('orders.detailsServices.columns.quantity')}</TableHead>
					<TableHead>
						{t('orders.detailsServices.columns.laborHours')}
					</TableHead>
					{showFinancials && (
						<TableHead className='text-right'>
							{t('orders.detailsServices.columns.price')}
						</TableHead>
					)}
					{canManageServices && <TableHead className='w-12'></TableHead>}
				</TableRow>
			</TableHeader>
			<TableBody>
				{services.map((service: any) => (
					<TableRow key={service.id}>
						<TableCell className='font-medium'>{service.name}</TableCell>
						<TableCell className='text-muted-foreground'>
							{service.description ?? t('common.notAvailable')}
						</TableCell>
						<TableCell>{service.quantity ?? 1}</TableCell>
						<TableCell>{service.laborHours ?? 0}h</TableCell>
						{showFinancials && (
							<TableCell className='text-right font-medium'>
								${(Number(service.price) * (service.quantity ?? 1)).toFixed(2)}
							</TableCell>
						)}
						{canManageServices && (
							<TableCell>
								<Button
									variant='ghost'
									size='icon'
									className='text-destructive hover:text-destructive'
									disabled={isPending}
									onClick={() => onRemoveService(service.id)}
								>
									<Trash2 className='h-4 w-4' />
									<span className='sr-only'>
										{t('orders.actions.removeService')}
									</span>
								</Button>
							</TableCell>
						)}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
