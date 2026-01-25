import { Separator } from '@/shared/components/ui';

interface PartsTotalsProps {
	partsTotal: number;
	servicesTotal: number;
	grandTotal: number;
}

export function PartsTotals({
	partsTotal,
	servicesTotal,
	grandTotal,
}: PartsTotalsProps) {
	return (
		<div className='flex justify-end'>
			<div className='w-64 space-y-2'>
				<div className='flex justify-between text-sm'>
					<span className='text-muted-foreground'>Parts Total</span>
					<span className='font-medium'>${partsTotal.toFixed(2)}</span>
				</div>
				<div className='flex justify-between text-sm'>
					<span className='text-muted-foreground'>Services Total</span>
					<span className='font-medium'>${servicesTotal.toFixed(2)}</span>
				</div>
				<Separator />
				<div className='flex justify-between text-lg font-bold'>
					<span>Grand Total</span>
					<span>${grandTotal.toFixed(2)}</span>
				</div>
			</div>
		</div>
	);
}
