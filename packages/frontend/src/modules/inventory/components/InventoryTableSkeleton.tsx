import { DataTableSkeleton } from '@/shared';

export function InventoryTableSkeleton() {
	return (
		<DataTableSkeleton
			columnCount={8}
			filterCount={3}
			cellWidths={[
				'3rem',
				'10rem',
				'10rem',
				'10rem',
				'10rem',
				'10rem',
				'10rem',
				'3rem',
			]}
			shrinkZero
		/>
	);
}
