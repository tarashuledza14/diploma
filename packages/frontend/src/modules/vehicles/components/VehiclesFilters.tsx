import {
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { Filter, Search } from 'lucide-react';

interface VehiclesFiltersProps {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	makeFilter: string;
	setMakeFilter: (v: string) => void;
	uniqueMakes: string[];
}

export function VehiclesFilters({
	searchQuery,
	setSearchQuery,
	makeFilter,
	setMakeFilter,
	uniqueMakes,
}: VehiclesFiltersProps) {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-center'>
			<div className='relative flex-1'>
				<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
				<Input
					placeholder='Search by plate, VIN, owner, or make/model...'
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					className='pl-9'
				/>
			</div>
			<Select value={makeFilter} onValueChange={setMakeFilter}>
				<SelectTrigger className='w-40'>
					<Filter className='mr-2 h-4 w-4' />
					<SelectValue placeholder='Make' />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value='all'>All Makes</SelectItem>
					{uniqueMakes.map(make => (
						<SelectItem key={make} value={make}>
							{make}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
