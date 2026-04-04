import { StockMovement } from '@/modules/inventory/interfaces/get-inventory.interfaces';
import { Badge, formatDate, ScrollArea } from '@/shared';
import { ArrowUpDown, Clock, History, Package, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function getMovementBadge(
	type: StockMovement['type'],
	t: (key: string) => string,
) {
	switch (type) {
		case 'RECEIVED':
			return {
				label: t('inventory.movement.types.received'),
				className: 'bg-green-100 text-green-700 border-green-200',
			};
		case 'ISSUED':
			return {
				label: t('inventory.movement.types.issued'),
				className: 'bg-blue-100 text-blue-700 border-blue-200',
			};
		case 'RESERVED':
			return {
				label: t('inventory.movement.types.reserved'),
				className: 'bg-amber-100 text-amber-700 border-amber-200',
			};
		case 'RETURNED':
			return {
				label: t('inventory.movement.types.returned'),
				className: 'bg-purple-100 text-purple-700 border-purple-200',
			};
		default:
			return {
				label: type,
				className: 'bg-gray-100 text-gray-700 border-gray-200',
			};
	}
}

interface MovementHistoryListProps {
	history: StockMovement[];
	partUnit: string;
}
export function MovementHistoryList({
	history,
	partUnit,
}: MovementHistoryListProps) {
	const { t } = useTranslation();
	return (
		<ScrollArea className='flex-1 h-[50vh]'>
			<div className='space-y-3 pr-4'>
				{history.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
						<History className='mb-3 h-10 w-10 opacity-40' />
						<p>{t('inventory.movement.empty')}</p>
					</div>
				) : (
					history.map(mov => {
						const badge = getMovementBadge(mov.type, t);
						return (
							<div
								key={mov.id}
								className='flex items-start gap-3 rounded-lg border p-3'
							>
								<div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted'>
									{mov.type === 'RECEIVED' && (
										<Plus className='h-4 w-4 text-green-600' />
									)}
									{mov.type === 'ISSUED' && (
										<Package className='h-4 w-4 text-blue-600' />
									)}
									{mov.type === 'RESERVED' && (
										<Clock className='h-4 w-4 text-amber-600' />
									)}
									{mov.type === 'RETURNED' && (
										<ArrowUpDown className='h-4 w-4 text-purple-600' />
									)}
								</div>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2 mb-0.5'>
										<Badge variant='outline' className={badge.className}>
											{badge.label}
										</Badge>
										<span className='text-sm font-medium'>
											{(mov.type === 'RECEIVED' || mov.type === 'RETURNED') &&
												'+'}
											{mov.quantity} {partUnit}
										</span>
									</div>
									<p className='text-sm text-muted-foreground'>{mov.reason}</p>
									<div className='flex items-center gap-3 mt-1 text-xs text-muted-foreground'>
										<span>{formatDate(mov.createdAt)}</span>
										{mov.order?.id && (
											<span className='font-mono'>{mov.order.id}</span>
										)}
										{mov.user?.fullName && <span>{mov.user.fullName}</span>}
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>
		</ScrollArea>
	);
}
