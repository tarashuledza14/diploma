import { useCurrencyFormatter } from '@/modules/app-settings';
import { OrderServiceItem } from '@/modules/orders/interfaces/new-order.interface';
import {
	Badge,
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { AlertCircle, Wrench, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ServiceRowProps {
	index: number;
	service: OrderServiceItem;
	services: any[];
	mechanics: any[];
	onRemove: () => void;
	onChange: (field: keyof OrderServiceItem, value: string) => void;
}

export const ServiceRow: React.FC<ServiceRowProps> = ({
	index,
	service,
	services,
	mechanics,
	onRemove,
	onChange,
}) => {
	const { t } = useTranslation();
	const { formatCurrency } = useCurrencyFormatter();
	const selectedService = services.find(s => s.id === service.serviceId);
	const hasRequiredCategories = selectedService?.requiredCategories?.length > 0;

	const getMechanicLabel = (mechanic: any) => {
		const details: string[] = [];

		if (typeof mechanic.openTasksCount === 'number') {
			details.push(
				t('orders.newOrder.labels.openTasksCount', {
					count: mechanic.openTasksCount,
				}),
			);
		}

		if (typeof mechanic.todayAssignedHours === 'number') {
			details.push(
				t('orders.newOrder.labels.assignedHours', {
					hours: mechanic.todayAssignedHours.toFixed(1),
				}),
			);
		} else if (typeof mechanic.totalAssignedHours === 'number') {
			details.push(
				t('orders.newOrder.labels.assignedHours', {
					hours: mechanic.totalAssignedHours.toFixed(1),
				}),
			);
		}

		if (typeof mechanic.capacityPercent === 'number') {
			details.push(
				t('orders.newOrder.labels.capacityPercent', {
					percent: mechanic.capacityPercent,
				}),
			);
		}

		const detailsText = details.length > 0 ? ` (${details.join(' | ')})` : '';
		const overloadedText = mechanic.isOverloaded
			? ` [${t('orders.newOrder.labels.overloaded')}]`
			: '';

		return `${mechanic.name}${detailsText}${overloadedText}`;
	};

	return (
		<div className='border rounded-lg p-4 space-y-3'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Wrench className='h-4 w-4 text-blue-500' />
					<span className='font-medium'>
						{t('orders.newOrder.labels.serviceN', { index: index + 1 })}
					</span>
				</div>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={onRemove}
					className='text-red-500 hover:text-red-700'
				>
					<X className='h-4 w-4' />
				</Button>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div>
					<label className='text-sm font-medium'>
						{t('orders.newOrder.fields.service')} *
					</label>
					<Select
						value={service.serviceId}
						onValueChange={value => onChange('serviceId', value)}
					>
						<SelectTrigger>
							<SelectValue
								placeholder={t('orders.newOrder.placeholders.selectService')}
							/>
						</SelectTrigger>
						<SelectContent>
							{services.map(svc => (
								<SelectItem key={svc.id} value={svc.id}>
									{svc.name} - {formatCurrency(svc.price)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<label className='text-sm font-medium'>
						{t('orders.newOrder.fields.assignedMechanic')}
					</label>
					<Select
						value={service.mechanicId || 'none'}
						onValueChange={value =>
							onChange('mechanicId', value === 'none' ? '' : value)
						}
					>
						<SelectTrigger>
							<SelectValue
								placeholder={t(
									'orders.newOrder.placeholders.selectMechanicOptional',
								)}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='none'>
								{t('orders.newOrder.labels.noMechanicAssigned')}
							</SelectItem>
							{mechanics.map(mechanic => (
								<SelectItem key={mechanic.id} value={mechanic.id}>
									{getMechanicLabel(mechanic)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{hasRequiredCategories && (
				<div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
					<div className='flex items-start gap-2'>
						<AlertCircle className='h-4 w-4 text-blue-500 mt-0.5' />
						<div>
							<p className='text-sm font-medium text-blue-800'>
								{t('orders.newOrder.labels.requiredPartCategories')}
							</p>
							<div className='flex flex-wrap gap-1 mt-1'>
								{selectedService.requiredCategories.map((category: any) => (
									<Badge key={category.id} variant='secondary'>
										{category.name}
									</Badge>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
