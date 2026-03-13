import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardAlert } from '../types';

interface AlertsCardProps {
	alerts: DashboardAlert[];
}

export function AlertsCard({ alerts }: AlertsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<AlertTriangle className='h-5 w-5' />
					Alerts
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-3'>
				{alerts.length === 0 && (
					<div className='rounded-lg border p-3 text-sm text-muted-foreground'>
						No active alerts right now.
					</div>
				)}
				{alerts.map((alert, index) => (
					<Link key={index} to={alert.link}>
						<div className='flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50'>
							{alert.type === 'warning' && (
								<AlertTriangle className='mt-0.5 h-4 w-4 text-amber-500' />
							)}
							{alert.type === 'info' && (
								<Clock className='mt-0.5 h-4 w-4 text-blue-500' />
							)}
							{alert.type === 'success' && (
								<CheckCircle2 className='mt-0.5 h-4 w-4 text-green-500' />
							)}
							<span className='text-sm'>{alert.message}</span>
						</div>
					</Link>
				))}
			</CardContent>
		</Card>
	);
}
