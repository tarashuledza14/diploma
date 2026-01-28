import React from 'react';

export interface ServicesSummaryProps {
	totalDuration: number;
	totalPrice: number;
}

export const ServicesSummary: React.FC<ServicesSummaryProps> = ({
	totalDuration,
	totalPrice,
}) => {
	if (!totalDuration && !totalPrice) return null;
	return (
		<div className='mt-3 rounded-lg border bg-muted/50 p-3'>
			<div className='flex justify-between text-sm'>
				<span className='text-muted-foreground'>Estimated Duration:</span>
				<span className='font-medium'>{totalDuration} hours</span>
			</div>
			<div className='flex justify-between text-sm mt-1'>
				<span className='text-muted-foreground'>Services Total:</span>
				<span className='font-medium'>${totalPrice.toFixed(2)}</span>
			</div>
		</div>
	);
};
