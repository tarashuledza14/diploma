import { Progress } from '@/shared/components/ui';
import { AlertTriangle, Gauge, Users, Wrench } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatchWorkloadQuery } from '../query/useDispatchWorkloadQuery';

function normalizeCapacity(value: number) {
	if (!Number.isFinite(value)) {
		return 0;
	}
	return Math.max(0, Math.min(100, Math.round(value)));
}

export function DispatchWorkloadPanel() {
	const { t } = useTranslation();
	const { data: mechanics, isLoading } = useDispatchWorkloadQuery();

	const summary = useMemo(() => {
		const items = mechanics ?? [];
		const overloadedCount = items.filter(item => item.isOverloaded).length;
		const averageCapacity =
			items.length > 0
				? Math.round(
						items.reduce((sum, item) => sum + item.capacityPercent, 0) /
							items.length,
					)
				: 0;

		const averageTodayHours =
			items.length > 0
				? Number(
						(
							items.reduce((sum, item) => sum + item.todayAssignedHours, 0) /
							items.length
						).toFixed(1),
					)
				: 0;

		return {
			totalMechanics: items.length,
			overloadedCount,
			averageCapacity,
			averageTodayHours,
		};
	}, [mechanics]);

	return (
		<section className='rounded-xl border bg-card p-4'>
			<div className='mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
				<div>
					<h2 className='text-sm font-semibold uppercase tracking-wide text-muted-foreground'>
						{t('dispatch.mechanicsTitle')}
					</h2>
					<p className='text-sm text-muted-foreground'>
						{t('dispatch.mechanicsSubtitle')}
					</p>
				</div>
				<div className='flex flex-wrap items-center gap-2 text-xs'>
					<span className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1'>
						<Users className='size-3.5' />
						{t('dispatch.summary.mechanics', {
							count: summary.totalMechanics,
						})}
					</span>
					<span className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1'>
						<Gauge className='size-3.5' />
						{t('dispatch.summary.avgCapacity', {
							percent: summary.averageCapacity,
						})}
					</span>
					<span className='inline-flex items-center gap-1 rounded-full border px-2.5 py-1'>
						<Wrench className='size-3.5' />
						{t('dispatch.summary.avgTodayHours', {
							hours: summary.averageTodayHours,
						})}
					</span>
					<span className='inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300'>
						<AlertTriangle className='size-3.5' />
						{t('dispatch.summary.overloaded', {
							count: summary.overloadedCount,
						})}
					</span>
				</div>
			</div>

			{isLoading ? (
				<p className='text-sm text-muted-foreground'>{t('common.loading')}</p>
			) : (mechanics?.length ?? 0) === 0 ? (
				<p className='text-sm text-muted-foreground'>
					{t('dispatch.emptyMechanics')}
				</p>
			) : (
				<div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
					{mechanics?.map(mechanic => {
						const normalized = normalizeCapacity(mechanic.capacityPercent);

						return (
							<div
								key={mechanic.id}
								className='rounded-lg border bg-background p-3'
							>
								<div className='mb-2 flex items-start justify-between gap-3'>
									<div>
										<p className='text-sm font-semibold leading-tight'>
											{mechanic.fullName}
										</p>
										<p className='mt-1 text-xs text-muted-foreground'>
											{t('dispatch.mechanicTasks', {
												count: mechanic.activeTasksCount,
											})}
										</p>
									</div>
									<span
										className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
											mechanic.isOverloaded
												? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
												: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
										}`}
									>
										{mechanic.isOverloaded
											? t('dispatch.overloaded')
											: t('dispatch.available')}
									</span>
								</div>

								<div className='mb-2 flex items-center justify-between text-xs text-muted-foreground'>
									<span className='inline-flex items-center gap-1'>
										<Wrench className='size-3.5' />
										{t('dispatch.assignedHours', {
											hours: mechanic.todayAssignedHours.toFixed(1),
										})}
									</span>
									<span>{normalized}%</span>
								</div>
								<p className='mb-2 text-[11px] text-muted-foreground'>
									{t('dispatch.totalHours')}:{' '}
									{mechanic.totalAssignedHours.toFixed(1)}
								</p>
								<Progress value={normalized} />
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}
