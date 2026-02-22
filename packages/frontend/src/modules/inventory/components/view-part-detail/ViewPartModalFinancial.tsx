import { DollarSign } from 'lucide-react';
import { PartPriceRule } from '../../interfaces/inventory.interfaces';

interface ViewPartModalFinancialProps {
	priceRules: PartPriceRule[];
}

export function ViewPartModalFinancial({
	priceRules,
}: ViewPartModalFinancialProps) {
	if (!priceRules.length) return null;
	return (
		<div>
			<h4 className='flex items-center gap-2 text-sm font-semibold mb-3'>
				<DollarSign className='h-4 w-4' />
				Financial
			</h4>
			<div className='grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-2 sm:gap-x-8 sm:gap-y-2'>
				{priceRules.map(rule => (
					<div
						key={rule.id}
						className='flex justify-between border-b border-dashed pb-1 sm:border-0 sm:pb-0'
					>
						<span className='text-muted-foreground'>
							{rule.clientType ? rule.clientType : 'Default'} Price
						</span>
						<span className='font-medium text-right'>
							{rule.fixedPrice
								? `$${rule.fixedPrice}`
								: rule.markupPercent
									? `${rule.markupPercent}% markup`
									: 'N/A'}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
