import { cn } from '@/lib/utils';
import {
	Button,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui';
import { Badge, Trash2 } from 'lucide-react';

interface Props {
	services: any;
}
const serviceStatusColors = {
	pending: 'bg-gray-100 text-gray-700',
	in_progress: 'bg-blue-100 text-blue-700',
	completed: 'bg-green-100 text-green-700',
};
export function ServiceTable({ services }: Props) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Service</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>Labor (hrs)</TableHead>
					<TableHead>Status</TableHead>
					<TableHead className='text-right'>Price</TableHead>
					<TableHead className='w-12'></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{services.map((service: any) => (
					<TableRow key={service.id}>
						<TableCell className='font-medium'>{service.name}</TableCell>
						<TableCell className='text-muted-foreground'>
							{service.description}
						</TableCell>
						<TableCell>{service.laborHours}h</TableCell>
						<TableCell>
							<Badge
								className={cn(
									serviceStatusColors[
										service.status as keyof typeof serviceStatusColors
									],
								)}
							>
								{service.status.replace('_', ' ')}
							</Badge>
						</TableCell>
						<TableCell className='text-right font-medium'>
							${service.price.toFixed(2)}
						</TableCell>
						<TableCell>
							<Button
								variant='ghost'
								size='icon'
								className='text-destructive hover:text-destructive'
							>
								<Trash2 className='h-4 w-4' />
								<span className='sr-only'>Remove service</span>
								{/* TODO: Call OrderService.removeService() */}
							</Button>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
