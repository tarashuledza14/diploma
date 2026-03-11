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

interface Props {
	services: any;
}

export function ServiceTable({ services }: Props) {
	return (
		<Table>
			<TableHeader>
			<TableRow>
				<TableHead>Service</TableHead>
				<TableHead>Description</TableHead>
				<TableHead>Qty</TableHead>
				<TableHead>Labor (hrs)</TableHead>
				<TableHead className='text-right'>Price</TableHead>
				<TableHead className='w-12'></TableHead>
			</TableRow>
			</TableHeader>
			<TableBody>
				{services.map((service: any) => (
					<TableRow key={service.id}>
						<TableCell className='font-medium'>{service.name}</TableCell>
						<TableCell className='text-muted-foreground'>
							{service.description ?? '—'}
						</TableCell>
						<TableCell>{service.quantity ?? 1}</TableCell>
						<TableCell>{service.laborHours ?? 0}h</TableCell>
						<TableCell className='text-right font-medium'>
							${(Number(service.price) * (service.quantity ?? 1)).toFixed(2)}
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
