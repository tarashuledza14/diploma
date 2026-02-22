import { Badge } from '@/shared';
import { ArrowUpDown } from 'lucide-react';

interface ViewPartModalCompatibilityProps {
	compatibility: string[];
}

export function ViewPartModalCompatibility({
	compatibility,
}: ViewPartModalCompatibilityProps) {
	if (!compatibility.length) return null;
	return (
		<div>
			<h4 className='flex items-center gap-2 text-sm font-semibold mb-2'>
				<ArrowUpDown className='h-4 w-4' />
				Compatibility
			</h4>
			<div className='flex flex-wrap gap-1.5'>
				{compatibility.map(c => (
					<Badge key={c} variant='outline' className='text-xs'>
						{c}
					</Badge>
				))}
			</div>
		</div>
	);
}
