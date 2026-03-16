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
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Service</TableHead>
					<TableHead>Description</TableHead>
					<TableHead>Qty</TableHead>
					<TableHead>Labor (hrs)</TableHead>
					{showFinancials && (
						<TableHead className='text-right'>Price</TableHead>
					)}
					{canManageServices && <TableHead className='w-12'></TableHead>}
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
									<span className='sr-only'>Remove service</span>
								</Button>
							</TableCell>
						)}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
