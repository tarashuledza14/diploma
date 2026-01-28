import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui';
import { Clock, DollarSign, Wrench } from 'lucide-react';
import { FC } from 'react';

interface CatalogStatsProps {
	total: number;
	active: number;
	avgPrice: number;
}

export const CatalogStats: FC<CatalogStatsProps> = ({
	total,
	active,
	avgPrice,
}) => (
	<div className='grid gap-4 md:grid-cols-3'>
		<Card>
			<CardHeader className='pb-2'>
				<CardTitle className='text-sm font-medium text-muted-foreground'>
					Total Services
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='flex items-center gap-2'>
					<Wrench className='h-5 w-5 text-primary' />
					<span className='text-2xl font-bold'>{total}</span>
				</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader className='pb-2'>
				<CardTitle className='text-sm font-medium text-muted-foreground'>
					Active Services
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='flex items-center gap-2'>
					<Clock className='h-5 w-5 text-green-500' />
					<span className='text-2xl font-bold'>{active}</span>
				</div>
			</CardContent>
		</Card>
		<Card>
			<CardHeader className='pb-2'>
				<CardTitle className='text-sm font-medium text-muted-foreground'>
					Average Price
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='flex items-center gap-2'>
					<DollarSign className='h-5 w-5 text-amber-500' />
					<span className='text-2xl font-bold'>${avgPrice.toFixed(2)}</span>
				</div>
			</CardContent>
		</Card>
	</div>
);
