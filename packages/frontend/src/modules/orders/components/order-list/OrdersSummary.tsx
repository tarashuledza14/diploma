import React from 'react';

interface OrdersSummaryProps {
	filteredCount: number;
	totalCount: number;
}

export const OrdersSummary: React.FC<OrdersSummaryProps> = ({
	filteredCount,
	totalCount,
}) => (
	<div className='text-sm text-muted-foreground'>
		Showing {filteredCount} of {totalCount} orders
	</div>
);
