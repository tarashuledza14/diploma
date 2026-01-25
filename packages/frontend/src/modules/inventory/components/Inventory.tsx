import { useState } from 'react';
import { InventoryFilters } from './InventoryFilters';
import { InventoryHeader } from './InventoryHeader';
import { InventoryStats } from './InventoryStats';
import { InventoryTable } from './InventoryTable';
import { categories, mockParts } from './mockData';

export function Inventory() {
	const [searchQuery, setSearchQuery] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('all');
	const [stockFilter, setStockFilter] = useState('all');

	const filteredParts = mockParts.filter(part => {
		const matchesSearch =
			part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			part.sku.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCategory =
			categoryFilter === 'all' || part.category === categoryFilter;

		// getStockStatus logic is now in InventoryTable
		const status = (() => {
			if (part.quantity === 0) return 'Out of Stock';
			if (part.quantity < part.minStock) return 'Low Stock';
			return 'In Stock';
		})();
		const matchesStock =
			stockFilter === 'all' ||
			(stockFilter === 'low' && status === 'Low Stock') ||
			(stockFilter === 'out' && status === 'Out of Stock') ||
			(stockFilter === 'in' && status === 'In Stock');

		return matchesSearch && matchesCategory && matchesStock;
	});

	const totalValue = mockParts.reduce(
		(sum: number, p) => sum + p.quantity * p.unitPrice,
		0,
	);
	const lowStockCount = mockParts.filter(
		p => p.quantity < p.minStock && p.quantity > 0,
	).length;
	const outOfStockCount = mockParts.filter(p => p.quantity === 0).length;

	return (
		<div className='flex flex-col gap-6'>
			<InventoryHeader />
			<InventoryStats
				totalParts={mockParts.length}
				totalValue={totalValue}
				lowStockCount={lowStockCount}
				outOfStockCount={outOfStockCount}
			/>
			<div className='bg-card rounded-lg shadow-sm'>
				<div className='p-6'>
					<InventoryFilters
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						categoryFilter={categoryFilter}
						setCategoryFilter={setCategoryFilter}
						stockFilter={stockFilter}
						setStockFilter={setStockFilter}
						categories={categories}
					/>
				</div>
			</div>
			<div className='bg-card rounded-lg shadow-sm'>
				<div className='p-0'>
					<InventoryTable parts={filteredParts} />
				</div>
			</div>
			<div className='text-sm text-muted-foreground'>
				Showing {filteredParts.length} of {mockParts.length} parts
			</div>
		</div>
	);
}
