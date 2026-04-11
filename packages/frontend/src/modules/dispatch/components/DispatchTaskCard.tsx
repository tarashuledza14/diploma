import { Badge, Button } from '@/shared/components/ui';
import { Clock3, Pencil } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DispatchTaskItem } from '../interfaces/dispatch-board.interface';

interface DispatchTaskCardProps {
	task: DispatchTaskItem;
	onEditPlanning?: (task: DispatchTaskItem) => void;
	showEditIcon?: boolean;
}

export function DispatchTaskCard({
	task,
	onEditPlanning,
	showEditIcon,
}: DispatchTaskCardProps) {
	const { t } = useTranslation();
	const shownHours = Number(task.estimatedHours ?? 0);
	const shouldShowEditIcon = showEditIcon ?? Boolean(onEditPlanning);

	const deadlineBadge = useMemo(() => {
		if (!task.deadline) {
			return null;
		}

		const deadlineDate = new Date(task.deadline);
		if (Number.isNaN(deadlineDate.getTime())) {
			return null;
		}

		const today = new Date();
		const todayStart = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
		);
		const deadlineStart = new Date(
			deadlineDate.getFullYear(),
			deadlineDate.getMonth(),
			deadlineDate.getDate(),
		);
		const diffDays = Math.round(
			(deadlineStart.getTime() - todayStart.getTime()) / 86_400_000,
		);

		if (diffDays < 0) {
			return {
				label: t('dispatch.deadlineBadge.overdue'),
				variant: 'destructive' as const,
			};
		}

		if (diffDays === 0) {
			return {
				label: t('dispatch.deadlineBadge.today'),
				variant: 'secondary' as const,
			};
		}

		if (diffDays === 1) {
			return {
				label: t('dispatch.deadlineBadge.tomorrow'),
				variant: 'outline' as const,
			};
		}

		return {
			label: t('dispatch.deadlineBadge.inDays', { count: diffDays }),
			variant: 'outline' as const,
		};
	}, [task.deadline, t]);

	const stopDragFromButton = (
		event:
			| React.PointerEvent<HTMLButtonElement>
			| React.MouseEvent<HTMLButtonElement>
			| React.TouchEvent<HTMLButtonElement>,
	) => {
		event.preventDefault();
		event.stopPropagation();
	};

	return (
		<div className='rounded-lg border bg-card p-3'>
			<div className='flex items-start justify-between gap-2'>
				<p className='text-sm font-semibold leading-tight'>
					{task.serviceName}
				</p>
				{shouldShowEditIcon ? (
					onEditPlanning ? (
						<Button
							type='button'
							variant='ghost'
							size='icon'
							className='-mr-1 -mt-1 size-7'
							onPointerDownCapture={stopDragFromButton}
							onPointerDown={stopDragFromButton}
							onMouseDownCapture={stopDragFromButton}
							onTouchStartCapture={stopDragFromButton}
							onClick={event => {
								event.preventDefault();
								event.stopPropagation();
								onEditPlanning(task);
							}}
						>
							<Pencil className='size-3.5' />
							<span className='sr-only'>{t('dispatch.editPlanning')}</span>
						</Button>
					) : (
						<span className='-mr-1 -mt-1 inline-flex size-7 items-center justify-center text-muted-foreground'>
							<Pencil className='size-3.5' />
						</span>
					)
				) : null}
			</div>
			<p className='mt-1 text-xs text-muted-foreground'>
				#{task.orderNumber} · {task.vehicleLabel}
			</p>
			{task.deadline ? (
				<div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
					<span>
						{t('dispatch.deadline')}:{' '}
						{new Date(task.deadline).toLocaleDateString()}
					</span>
					{deadlineBadge ? (
						<Badge variant={deadlineBadge.variant}>{deadlineBadge.label}</Badge>
					) : null}
				</div>
			) : null}
			<div className='mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground'>
				<Clock3 className='size-3.5' />
				<span>
					{t('dispatch.hours', {
						hours: shownHours.toFixed(1),
					})}
				</span>
			</div>
		</div>
	);
}
