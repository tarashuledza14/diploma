import { DispatchPageHeader, DispatchPlannerBoard } from '@/modules/dispatch';

export function DispatchPage() {
	return (
		<div className='flex h-full min-h-0 flex-col gap-4 overflow-hidden'>
			<DispatchPageHeader />
			<DispatchPlannerBoard />
		</div>
	);
}
