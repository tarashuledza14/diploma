import {
	Button,
	Card,
	CardContent,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { Download, Filter, Search } from 'lucide-react';
import React from 'react';

interface OrdersFiltersProps {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	statusFilter: string;
	setStatusFilter: (v: string) => void;
	priorityFilter: string;
	setPriorityFilter: (v: string) => void;
}

export const OrdersFilters: React.FC<OrdersFiltersProps> = ({
	searchQuery,
	setSearchQuery,
	statusFilter,
	setStatusFilter,
	priorityFilter,
	setPriorityFilter,
}) => (
	<Card>
		<CardContent className='pt-6'>
			<div className='flex flex-col gap-4 md:flex-row md:items-center'>
				<div className='relative flex-1'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						placeholder='Search by order ID, client, or plate...'
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className='pl-9'
					/>
				</div>
				<div className='flex gap-2'>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className='w-40'>
							<Filter className='mr-2 h-4 w-4' />
							<SelectValue placeholder='Status' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Status</SelectItem>
							<SelectItem value='new'>New</SelectItem>
							<SelectItem value='in_progress'>In Progress</SelectItem>
							<SelectItem value='waiting_parts'>Waiting Parts</SelectItem>
							<SelectItem value='done'>Done</SelectItem>
						</SelectContent>
					</Select>
					<Select value={priorityFilter} onValueChange={setPriorityFilter}>
						<SelectTrigger className='w-40'>
							<SelectValue placeholder='Priority' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Priority</SelectItem>
							<SelectItem value='high'>High</SelectItem>
							<SelectItem value='medium'>Medium</SelectItem>
							<SelectItem value='low'>Low</SelectItem>
						</SelectContent>
					</Select>
					<Button variant='outline'>
						<Download className='mr-2 h-4 w-4' />
						Export
					</Button>
				</div>
			</div>
		</CardContent>
	</Card>
);
