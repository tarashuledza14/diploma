import { Card, CardContent } from '@/shared/components/ui';
import { formatDate } from '@/shared/lib/format';
import { Calendar, Car, ClipboardList, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GetClientDetailsResponse } from '../../interfaces/get-client-details.interface';

interface ClientStatsProps {
	selectedClient: GetClientDetailsResponse;
}

export function ClientStats({ selectedClient }: ClientStatsProps) {
	const { t } = useTranslation();
	return (
		<div className='grid grid-cols-4 gap-3 pb-4'>
			<Card>
				<CardContent className='p-3 text-center'>
					<Car className='h-5 w-5 mx-auto mb-1 text-muted-foreground' />
					<p className='text-2xl font-bold'>{selectedClient.vehicleCount}</p>
					<p className='text-xs text-muted-foreground'>
						{t('clients.profile.stats.vehicles')}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className='p-3 text-center'>
					<ClipboardList className='h-5 w-5 mx-auto mb-1 text-muted-foreground' />
					<p className='text-2xl font-bold'>{selectedClient.totalOrders}</p>
					<p className='text-xs text-muted-foreground'>
						{t('clients.profile.stats.orders')}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className='p-3 text-center'>
					<DollarSign className='h-5 w-5 mx-auto mb-1 text-muted-foreground' />
					<p className='text-2xl font-bold'>${selectedClient.totalSpent}</p>
					<p className='text-xs text-muted-foreground'>
						{t('clients.profile.stats.totalSpent')}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardContent className='p-3 text-center'>
					<Calendar className='h-5 w-5 mx-auto mb-1 text-muted-foreground' />
					<p className='text-lg font-bold'>
						{formatDate(selectedClient.latestVisit, { month: 'short' })}
					</p>
					<p className='text-xs text-muted-foreground'>
						{t('clients.profile.stats.lastVisit')}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
