import {
	Badge,
	Button,
	Card,
	CardContent,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui';
import { Edit, MoreVertical, Trash2 } from 'lucide-react';
import { FC } from 'react';

interface CatalogTableProps {
	services: any[];
	statusColors: Record<string, string>;
}

export const CatalogTable: FC<CatalogTableProps> = ({
	services,
	statusColors,
}) => (
	<Card>
		<CardContent className='p-0'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Service</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Labor</TableHead>
						<TableHead>Parts Included</TableHead>
						<TableHead className='text-right'>Price</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className='w-12'></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{services.map(service => (
						<TableRow key={service.id}>
							<TableCell>
								<div>
									<p className='font-medium'>{service.name}</p>
									<p className='text-xs text-muted-foreground'>
										{service.description}
									</p>
								</div>
							</TableCell>
							<TableCell>
								<Badge variant='secondary'>{service.category}</Badge>
							</TableCell>
							<TableCell>{service.laborHours}h</TableCell>
							<TableCell>
								<div className='flex flex-wrap gap-1'>
									{service.partsIncluded.length > 0 ? (
										service.partsIncluded.slice(0, 2).map(part => (
											<Badge key={part} variant='outline' className='text-xs'>
												{part}
											</Badge>
										))
									) : (
										<span className='text-xs text-muted-foreground'>None</span>
									)}
									{service.partsIncluded.length > 2 && (
										<Badge variant='outline' className='text-xs'>
											+{service.partsIncluded.length - 2}
										</Badge>
									)}
								</div>
							</TableCell>
							<TableCell className='text-right font-medium'>
								${service.price.toFixed(2)}
							</TableCell>
							<TableCell>
								<Badge className={statusColors[service.status]}>
									{service.status}
								</Badge>
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant='ghost' size='icon' className='h-8 w-8'>
											<MoreVertical className='h-4 w-4' />
											<span className='sr-only'>Actions</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end'>
										<DropdownMenuItem>
											<Edit className='mr-2 h-4 w-4' />
											Edit Service
										</DropdownMenuItem>
										<DropdownMenuItem className='text-destructive'>
											<Trash2 className='mr-2 h-4 w-4' />
											Delete Service
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</CardContent>
	</Card>
);
