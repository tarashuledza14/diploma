import {
	Card,
	CardContent,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { Filter, Search } from 'lucide-react';
import { FC } from 'react';

interface CatalogFiltersProps {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	categoryFilter: string;
	setCategoryFilter: (v: string) => void;
	categories: string[];
}

export const CatalogFilters: FC<CatalogFiltersProps> = ({
	searchQuery,
	setSearchQuery,
	categoryFilter,
	setCategoryFilter,
	categories,
}) => (
	<Card>
		<CardContent className='pt-6'>
			<div className='flex flex-col gap-4 md:flex-row md:items-center'>
				<div className='relative flex-1'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						placeholder='Search services...'
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className='pl-9'
					/>
				</div>
				<Select value={categoryFilter} onValueChange={setCategoryFilter}>
					<SelectTrigger className='w-40'>
						<Filter className='mr-2 h-4 w-4' />
						<SelectValue placeholder='Category' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Categories</SelectItem>
						{categories.map(cat => (
							<SelectItem key={cat} value={cat}>
								{cat}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</CardContent>
	</Card>
);
