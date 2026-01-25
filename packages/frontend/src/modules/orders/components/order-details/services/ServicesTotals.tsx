interface ServicesTotalsProps {
	servicesTotal: number;
}

export function ServicesTotals({ servicesTotal }: ServicesTotalsProps) {
	return (
		<div className='flex justify-end'>
			<div className='w-64 space-y-2'>
				<div className='flex justify-between text-sm'>
					<span className='text-muted-foreground'>Services Total</span>
					<span className='font-medium'>${servicesTotal.toFixed(2)}</span>
				</div>
			</div>
		</div>
	);
}
