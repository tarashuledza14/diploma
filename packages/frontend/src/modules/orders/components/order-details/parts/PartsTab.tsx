import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Separator,
} from '@/shared/components/ui';
import { Package } from 'lucide-react';
import { AddPart } from './AddPart';
import { PartsTable } from './PartsTable';
import { PartsTotals } from './PartsTotals';

interface PartsTabProps {
	parts: any[];
	partsTotal: number;
	servicesTotal: number;
	grandTotal: number;
}

export function PartsTab({
	parts,
	partsTotal,
	servicesTotal,
	grandTotal,
}: PartsTabProps) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle className='flex items-center gap-2'>
					<Package className='h-5 w-5' />
					Parts
				</CardTitle>
				<AddPart />
			</CardHeader>
			<CardContent>
				<PartsTable parts={parts} />
				<Separator className='my-4' />
				<PartsTotals
					partsTotal={partsTotal}
					servicesTotal={servicesTotal}
					grandTotal={grandTotal}
				/>
			</CardContent>
		</Card>
	);
}
