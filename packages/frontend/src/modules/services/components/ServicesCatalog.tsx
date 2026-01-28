import { categories } from '@/modules/inventory';
import { statusColors } from '@/modules/orders';
import { useState } from 'react';
import { mockServices } from './catalog/catalogData';
import { CatalogFilters } from './catalog/CatalogFilters';
import { CatalogHeader } from './catalog/CatalogHeader';
import { CatalogStats } from './catalog/CatalogStats';
import { CatalogTable } from './catalog/CatalogTable';

export function ServicesCatalog() {
	const [searchQuery, setSearchQuery] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('all');

	const filteredServices = mockServices.filter(service => {
		const matchesSearch =
			service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			service.description.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory =
			categoryFilter === 'all' || service.category === categoryFilter;
		return matchesSearch && matchesCategory;
	});

	const totalActiveServices = mockServices.filter(
		s => s.status === 'active',
	).length;
	const avgPrice =
		mockServices.reduce((sum, s) => sum + s.price, 0) / mockServices.length;

	return (
		<div className='flex flex-col gap-6'>
			<CatalogHeader categories={categories} />
			<CatalogStats
				total={mockServices.length}
				active={totalActiveServices}
				avgPrice={avgPrice}
			/>
			<CatalogFilters
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				categoryFilter={categoryFilter}
				setCategoryFilter={setCategoryFilter}
				categories={categories}
			/>
			<CatalogTable services={filteredServices} statusColors={statusColors} />
			<div className='text-sm text-muted-foreground'>
				Showing {filteredServices.length} of {mockServices.length} services
			</div>
		</div>
	);
}
