import { dispatchKeys } from '@/modules/dispatch/queries/keys';
import {
	Kanban,
	KanbanBoard,
	KanbanColumn,
	KanbanItem,
	KanbanOverlay,
} from '@/shared/components/ui';
import { DragEndEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
	DispatchBoardData,
	DispatchTaskItem,
} from '../interfaces/dispatch-board.interface';
import { useAssignDispatchTaskMutation } from '../query/useAssignDispatchTaskMutation';
import { useDispatchBoardQuery } from '../query/useDispatchBoardQuery';
import { useUpdateDispatchTaskPlanningMutation } from '../query/useUpdateDispatchTaskPlanningMutation';
import { DispatchTaskCard } from './DispatchTaskCard';
import { DispatchTaskPlanningDialog } from './DispatchTaskPlanningDialog';

const POOL_COLUMN_ID = 'pool';

function sumHours(tasks: DispatchTaskItem[]) {
	return tasks.reduce((sum, task) => {
		return sum + Number(task.estimatedHours ?? 0);
	}, 0);
}

function buildColumns(board?: DispatchBoardData) {
	const columns: Record<UniqueIdentifier, DispatchTaskItem[]> = {
		[POOL_COLUMN_ID]: board?.unassignedTasks ?? [],
	};

	for (const mechanic of board?.mechanics ?? []) {
		columns[mechanic.id] = mechanic.tasks;
	}

	return columns;
}

function findTaskColumn(
	taskId: string,
	columns: Record<UniqueIdentifier, DispatchTaskItem[]>,
) {
	for (const [columnId, tasks] of Object.entries(columns)) {
		if (tasks.some(task => task.id === taskId)) {
			return columnId;
		}
	}

	return null;
}

function resolveDropColumn(
	overId: string,
	columns: Record<UniqueIdentifier, DispatchTaskItem[]>,
) {
	if (overId in columns) {
		return overId;
	}

	return findTaskColumn(overId, columns);
}

export function DispatchPlannerBoard() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { data: board, isLoading } = useDispatchBoardQuery();
	const { mutateAsync: assignTask } = useAssignDispatchTaskMutation();
	const { mutateAsync: updateTaskPlanning, isPending: isPlanningSaving } =
		useUpdateDispatchTaskPlanningMutation();
	const dragStartRef = useRef<{ taskId: string; fromColumn: string } | null>(
		null,
	);
	const [columns, setColumns] =
		useState<Record<UniqueIdentifier, DispatchTaskItem[]>>(buildColumns());
	const [planningTask, setPlanningTask] = useState<DispatchTaskItem | null>(
		null,
	);
	const [planningDialogOpen, setPlanningDialogOpen] = useState(false);

	useEffect(() => {
		setColumns(buildColumns(board));
	}, [board]);

	const mechanicById = useMemo(
		() =>
			new Map(
				(board?.mechanics ?? []).map(mechanic => [mechanic.id, mechanic]),
			),
		[board],
	);

	const columnIds = useMemo(() => {
		const mechanicIds = board?.mechanics.map(mechanic => mechanic.id) ?? [];
		return [POOL_COLUMN_ID, ...mechanicIds];
	}, [board]);

	const summary = useMemo(() => {
		const allTasks = Object.values(columns).flat();
		return {
			activeTasksCount: allTasks.length,
			totalHours: Number(sumHours(allTasks).toFixed(1)),
		};
	}, [columns]);

	const findTask = useCallback(
		(id: UniqueIdentifier) => {
			for (const tasks of Object.values(columns)) {
				const found = tasks.find(task => task.id === id);
				if (found) return found;
			}
			return undefined;
		},
		[columns],
	);

	const handleDragEnd = useCallback(
		async ({ active, over }: DragEndEvent) => {
			const pending = dragStartRef.current;
			dragStartRef.current = null;

			if (!over) {
				return;
			}

			const taskId = String(active.id);
			const fromColumn = pending?.fromColumn ?? findTaskColumn(taskId, columns);
			const toColumn = resolveDropColumn(String(over.id), columns);

			if (!fromColumn || !toColumn || fromColumn === toColumn) {
				return;
			}

			try {
				await assignTask({
					taskId,
					mechanicId: toColumn === POOL_COLUMN_ID ? null : toColumn,
				});
			} catch {
				toast.error(t('dispatch.assignError'));
				queryClient.invalidateQueries({ queryKey: dispatchKeys.board() });
			}
		},
		[assignTask, columns, queryClient, t],
	);

	const handleDragStart = useCallback(
		({ active }: DragStartEvent) => {
			const taskId = String(active.id);
			const fromColumn = findTaskColumn(taskId, columns);

			if (!fromColumn) {
				dragStartRef.current = null;
				return;
			}

			dragStartRef.current = { taskId, fromColumn };
		},
		[columns],
	);

	const handlePlanningDialogOpenChange = useCallback((open: boolean) => {
		setPlanningDialogOpen(open);
		if (!open) {
			setPlanningTask(null);
		}
	}, []);

	const handlePlanningSubmit = useCallback(
		async (payload: { additionalHours?: number; deadline?: string | null }) => {
			if (!planningTask) {
				return;
			}

			try {
				await updateTaskPlanning({
					taskId: planningTask.id,
					additionalHours: payload.additionalHours,
					deadline: payload.deadline,
				});
				toast.success(t('dispatch.planningUpdateSuccess'));
				handlePlanningDialogOpenChange(false);
			} catch {
				toast.error(t('dispatch.planningUpdateError'));
			}
		},
		[handlePlanningDialogOpenChange, planningTask, t, updateTaskPlanning],
	);

	if (isLoading) {
		return (
			<p className='text-sm text-muted-foreground'>{t('common.loading')}</p>
		);
	}

	return (
		<>
			<div className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-xl border bg-card p-4'>
				<div className='flex flex-wrap items-center justify-end gap-3 text-sm'>
					<div className='rounded-lg border px-3 py-1.5'>
						<span className='text-muted-foreground'>
							{t('dispatch.tasksInWork')}:{' '}
						</span>
						<span className='font-semibold'>{summary.activeTasksCount}</span>
					</div>
					<div className='rounded-lg border px-3 py-1.5'>
						<span className='text-muted-foreground'>
							{t('dispatch.estimatedHours')}:{' '}
						</span>
						<span className='font-semibold'>
							{t('dispatch.hours', { hours: summary.totalHours.toFixed(1) })}
						</span>
					</div>
				</div>

				<div className='flex min-h-0 flex-1 overflow-hidden'>
					<Kanban
						value={columns}
						onValueChange={setColumns}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
						getItemValue={task => task.id}
					>
						<KanbanBoard className='flex h-full min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden pb-1'>
							{columnIds.map(columnId => {
								const tasks = columns[columnId] ?? [];
								const mechanic = mechanicById.get(columnId);
								const columnEstimatedHours = sumHours(tasks);

								return (
									<KanbanColumn
										key={columnId}
										value={columnId}
										className='flex min-h-0 min-w-80 flex-col rounded-xl border bg-muted/30 p-3'
									>
										<div className='mb-3 space-y-2'>
											<div className='flex items-start justify-between gap-2'>
												<div>
													<h3 className='text-base font-semibold leading-tight'>
														{columnId === POOL_COLUMN_ID
															? t('dispatch.pool')
															: mechanic?.fullName}
													</h3>
													<p className='mt-1 text-xs text-muted-foreground'>
														{columnId === POOL_COLUMN_ID
															? t('dispatch.unassignedHint')
															: t('dispatch.tasksCount', {
																	count: tasks.length,
																})}
													</p>
												</div>
												<span className='rounded-md border px-2 py-0.5 text-xs font-medium'>
													{tasks.length}
												</span>
											</div>
											<p className='text-[11px] text-muted-foreground'>
												{t('dispatch.estimatedHours')}:{' '}
												{columnEstimatedHours.toFixed(1)}
											</p>
										</div>

										<div className='flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto'>
											{tasks.map(task => (
												<KanbanItem
													key={task.id}
													value={task.id}
													asHandle
													className='rounded-lg'
												>
													<DispatchTaskCard
														task={task}
														onEditPlanning={selectedTask => {
															setPlanningTask(selectedTask);
															setPlanningDialogOpen(true);
														}}
													/>
												</KanbanItem>
											))}
										</div>
									</KanbanColumn>
								);
							})}
						</KanbanBoard>

						<KanbanOverlay>
							{({ value, variant }) => {
								if (variant === 'column') {
									return null;
								}

								const task = findTask(value);
								if (!task) return null;

								return <DispatchTaskCard task={task} showEditIcon />;
							}}
						</KanbanOverlay>
					</Kanban>
				</div>
			</div>

			<DispatchTaskPlanningDialog
				open={planningDialogOpen}
				onOpenChange={handlePlanningDialogOpenChange}
				task={planningTask}
				isSubmitting={isPlanningSaving}
				onSubmit={handlePlanningSubmit}
			/>
		</>
	);
}
