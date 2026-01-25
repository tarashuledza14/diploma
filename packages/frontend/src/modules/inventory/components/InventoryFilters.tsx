import {
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { Filter, Search } from 'lucide-react';

interface InventoryFiltersProps {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
	categoryFilter: string;
	setCategoryFilter: (v: string) => void;
	stockFilter: string;
	setStockFilter: (v: string) => void;
	categories: string[];
}

export function InventoryFilters({
	searchQuery,
	setSearchQuery,
	categoryFilter,
	setCategoryFilter,
	stockFilter,
	setStockFilter,
	categories,
}: InventoryFiltersProps) {
	return (
		<div className='flex flex-col gap-4 md:flex-row md:items-center'>
			<div className='relative flex-1'>
				<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
				<Input
					placeholder='Search by name or SKU...'
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					className='pl-9'
				/>
			</div>
			<div className='flex gap-2'>
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
				<Select value={stockFilter} onValueChange={setStockFilter}>
					<SelectTrigger className='w-40'>
						<SelectValue placeholder='Stock Status' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>All Status</SelectItem>
						<SelectItem value='in'>In Stock</SelectItem>
						<SelectItem value='low'>Low Stock</SelectItem>
						<SelectItem value='out'>Out of Stock</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
