import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { DashboardStat } from '../types';

interface DashboardStatsCardsProps {
	stats: DashboardStat[];
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
			{stats.map(stat => (
				<Card key={stat.title}>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-muted-foreground'>
							{stat.title}
						</CardTitle>
						<stat.icon className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{stat.value}</div>
						<div className='flex items-center gap-1 text-xs'>
							{stat.trend === 'up' ? (
								<ArrowUpRight className='h-3 w-3 text-green-500' />
							) : stat.trend === 'down' ? (
								<ArrowDownRight className='h-3 w-3 text-red-500' />
							) : null}
							<span
								className={
									stat.trend === 'up'
										? 'text-green-500'
										: stat.trend === 'down'
											? 'text-red-500'
											: 'text-muted-foreground'
								}
							>
								{stat.change}
							</span>
							<span className='text-muted-foreground'>{stat.description}</span>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
