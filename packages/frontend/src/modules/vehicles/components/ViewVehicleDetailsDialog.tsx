import { toMoneyNumber, useCurrencyFormatter } from '@/modules/app-settings';
import { OrdersService } from '@/modules/orders/api';
import { OrderListItem } from '@/modules/orders/interfaces/order.interface';
import {
	Badge,
	Card,
	CardContent,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ScrollArea,
	formatDate,
} from '@/shared';
import { useQuery } from '@tanstack/react-query';
import {
	CalendarDays,
	CarFront,
	Clock3,
	DollarSign,
	Wrench,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { VehicleWithOwnerInfo } from '../interfaces/get-vehicle.interface';

interface ViewVehicleDetailsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedVehicle?: VehicleWithOwnerInfo;
}

function ServiceHistoryItem({
	order,
	formatCurrency,
}: {
	order: OrderListItem;
	formatCurrency: (value: number | string | null | undefined) => string;
}) {
	const { t } = useTranslation();
	const orderDate = order.endDate || null;

	return (
		<Card>
			<CardContent className='p-4 space-y-3'>
				<div className='flex items-start justify-between gap-3'>
					<div>
						<div className='flex items-center gap-2 flex-wrap'>
							<CalendarDays className='h-4 w-4 text-muted-foreground' />
							<p className='text-base font-semibold'>
								{orderDate
									? formatDate(orderDate)
									: t('vehicles.details.noDate')}
							</p>
							<Badge variant='outline'>ORD-{order.orderNumber || '---'}</Badge>
						</div>
					</div>
					<p className='text-2xl font-bold'>
						{formatCurrency(order.totalAmount)}
					</p>
				</div>

				<div className='flex flex-wrap gap-2'>
					{order.services.map(service => (
						<Badge key={service.id} variant='secondary'>
							{service.name}
						</Badge>
					))}
				</div>

				{order.mechanic?.fullName ? (
					<p className='text-sm text-muted-foreground'>
						{t('vehicles.details.mechanic')}: {order.mechanic.fullName}
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}

export function ViewVehicleDetailsDialog({
	open,
	onOpenChange,
	selectedVehicle,
}: ViewVehicleDetailsDialogProps) {
	const { t } = useTranslation();
	const { formatCurrency } = useCurrencyFormatter();

	const { data, isLoading } = useQuery({
		queryKey: ['vehicle-details-orders', selectedVehicle?.id],
		queryFn: () =>
			OrdersService.getAll({
				filters: [
					{
						id: 'vehicle.id',
						value: selectedVehicle?.id || '',
						operator: 'eq',
						variant: 'text',
					},
				],
				sort: [{ id: 'endDate', desc: true }],
				perPage: 50,
				page: 1,
			} as any),
		enabled: open && !!selectedVehicle?.id,
	});

	const orders = data?.data ?? [];

	const totals = useMemo(() => {
		const totalSpent = orders.reduce(
			(sum, order) => sum + toMoneyNumber(order.totalAmount),
			0,
		);

		return {
			totalServices: selectedVehicle?.totalServices ?? orders.length,
			totalSpent,
			mileage: selectedVehicle?.mileage ?? 0,
		};
	}, [orders, selectedVehicle]);

	if (!selectedVehicle) {
		return null;
	}

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='max-w-4xl max-h-[90vh] overflow-hidden'>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle className='flex items-center gap-2'>
						<CarFront className='h-5 w-5 text-muted-foreground' />
						<span>
							{selectedVehicle.year} {selectedVehicle.brand}{' '}
							{selectedVehicle.model}
						</span>
					</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						{selectedVehicle.plateNumber || '---'} •{' '}
						{selectedVehicle.owner.fullName}
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<div className='space-y-4'>
					<p className='text-sm text-muted-foreground'>
						{t('vehicles.details.subtitle')}
					</p>

					<div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
						<Card>
							<CardContent className='p-4'>
								<div className='flex items-center gap-2 text-muted-foreground mb-3'>
									<Wrench className='h-4 w-4' />
									<span>{t('vehicles.details.totalServices')}</span>
								</div>
								<p className='text-4xl font-bold'>{totals.totalServices}</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className='p-4'>
								<div className='flex items-center gap-2 text-muted-foreground mb-3'>
									<DollarSign className='h-4 w-4' />
									<span>{t('vehicles.details.totalSpent')}</span>
								</div>
								<p className='text-4xl font-bold'>
									{formatCurrency(totals.totalSpent)}
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className='p-4'>
								<div className='flex items-center gap-2 text-muted-foreground mb-3'>
									<Clock3 className='h-4 w-4' />
									<span>{t('vehicles.details.currentMileage')}</span>
								</div>
								<p className='text-4xl font-bold'>
									{totals.mileage.toLocaleString()} km
								</p>
							</CardContent>
						</Card>
					</div>

					<div className='space-y-3'>
						<h3 className='text-2xl font-semibold'>
							{t('vehicles.details.serviceHistory')}
						</h3>

						<ScrollArea className='h-90 pr-3'>
							<div className='space-y-3'>
								{isLoading ? (
									<p className='text-sm text-muted-foreground'>
										{t('common.loading')}
									</p>
								) : null}

								{!isLoading && orders.length === 0 ? (
									<p className='text-sm text-muted-foreground'>
										{t('vehicles.details.noServiceHistory')}
									</p>
								) : null}

								{orders.map(order => (
									<ServiceHistoryItem
										key={order.id}
										order={order}
										formatCurrency={formatCurrency}
									/>
								))}
							</div>
						</ScrollArea>
					</div>
				</div>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
