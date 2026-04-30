import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { JobStatus, OrderStatus, Role } from 'prisma/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

export interface MechanicWorkloadItem {
	id: string;
	fullName: string;
	avatar?: string;
	todayAssignedHours: number;
	totalAssignedHours: number;
	capacityPercent: number;
	isOverloaded: boolean;
	activeTasksCount: number;
}

export interface DispatchTaskItem {
	id: string;
	orderId: string;
	orderNumber: number;
	serviceName: string;
	estimatedHours: number;
	status: JobStatus;
	deadline: string | null;
	mechanicId: string | null;
	vehicleLabel: string;
	vehiclePlate: string | null;
}

export interface DispatchMechanicColumn {
	id: string;
	fullName: string;
	avatar?: string;
	tasks: DispatchTaskItem[];
}

export interface DispatchBoardData {
	mechanics: DispatchMechanicColumn[];
	unassignedTasks: DispatchTaskItem[];
}

@Injectable()
export class DispatchingService {
	constructor(private readonly db: PrismaService) {}

	private readonly MECHANIC_DAILY_CAPACITY_HOURS = 8;

	private readonly ACTIVE_ORDER_STATUSES: OrderStatus[] = [
		OrderStatus.NEW,
		OrderStatus.IN_PROGRESS,
		OrderStatus.WAITING_PARTS,
	];

	private readonly ACTIVE_JOB_STATUSES: JobStatus[] = [
		JobStatus.PENDING,
		JobStatus.IN_PROGRESS,
	];

	private isSameUtcCalendarDay(left: Date, right: Date) {
		return (
			left.getUTCFullYear() === right.getUTCFullYear() &&
			left.getUTCMonth() === right.getUTCMonth() &&
			left.getUTCDate() === right.getUTCDate()
		);
	}

	private toDispatchTaskItem(task: {
		id: string;
		mechanicId: string | null;
		status: JobStatus;
		estimatedHours: number;
		deadline: Date | null;
		service: { name: string };
		order: {
			id: string;
			orderNumber: number;
			vehicle: {
				brand: string;
				model: string;
				year: number;
				plateNumber: string | null;
			};
		};
	}): DispatchTaskItem {
		const vehicleLabel =
			`${task.order.vehicle.year} ${task.order.vehicle.brand} ${task.order.vehicle.model}`.trim();

		return {
			id: task.id,
			mechanicId: task.mechanicId,
			orderId: task.order.id,
			orderNumber: task.order.orderNumber,
			serviceName: task.service.name,
			status: task.status,
			estimatedHours: Number(task.estimatedHours.toFixed(2)),
			deadline: task.deadline ? task.deadline.toISOString() : null,
			vehicleLabel,
			vehiclePlate: task.order.vehicle.plateNumber,
		};
	}

	async getMechanicsWorkload(
		organizationId: string,
	): Promise<MechanicWorkloadItem[]> {
		if (!organizationId) {
			throw new ForbiddenException('Organization is required');
		}

		const mechanics = await this.db.user.findMany({
			where: {
				organizationId,
				role: Role.MECHANIC,
				deletedAt: null,
			},
			select: {
				id: true,
				fullName: true,
				avatar: true,
			},
			orderBy: { fullName: 'asc' },
		});

		if (mechanics.length === 0) {
			return [];
		}

		const mechanicIds = mechanics.map(mechanic => mechanic.id);
		const activeJobs = await this.db.orderService.findMany({
			where: {
				mechanicId: {
					in: mechanicIds,
				},
				status: {
					in: this.ACTIVE_JOB_STATUSES,
				},
				order: {
					deletedAt: null,
					status: {
						in: this.ACTIVE_ORDER_STATUSES,
					},
				},
			},
			select: {
				mechanicId: true,
				estimatedHours: true,
				additionalHours: true,
				order: {
					select: {
						startDate: true,
					},
				},
			},
		});

		const now = new Date();
		const workloadByMechanicId = new Map<
			string,
			{
				activeTasksCount: number;
				todayAssignedHours: number;
				totalAssignedHours: number;
			}
		>();

		for (const job of activeJobs) {
			if (!job.mechanicId) {
				continue;
			}

			const existing = workloadByMechanicId.get(job.mechanicId) ?? {
				activeTasksCount: 0,
				todayAssignedHours: 0,
				totalAssignedHours: 0,
			};

			const estimatedHours = Number(job.estimatedHours || 0);
			const additionalHours = Number(job.additionalHours || 0);
			const totalJobHours = Math.max(0, estimatedHours + additionalHours);

			existing.activeTasksCount += 1;
			existing.totalAssignedHours += totalJobHours;

			if (this.isSameUtcCalendarDay(job.order.startDate, now)) {
				existing.todayAssignedHours += totalJobHours;
			}

			workloadByMechanicId.set(job.mechanicId, existing);
		}

		return mechanics.map(mechanic => {
			const currentWorkload = workloadByMechanicId.get(mechanic.id);
			const totalAssignedHours = Number(
				(currentWorkload?.totalAssignedHours ?? 0).toFixed(1),
			);
			const rawTodayHours = currentWorkload?.todayAssignedHours ?? 0;
			const effectiveTodayHours =
				rawTodayHours > 0 ? rawTodayHours : totalAssignedHours;
			const todayAssignedHours = Number(effectiveTodayHours.toFixed(1));
			const rawCapacityPercent =
				this.MECHANIC_DAILY_CAPACITY_HOURS > 0
					? (effectiveTodayHours / this.MECHANIC_DAILY_CAPACITY_HOURS) * 100
					: 0;
			const capacityPercent = Number(Math.round(rawCapacityPercent));

			return {
				id: mechanic.id,
				fullName: mechanic.fullName,
				avatar: mechanic.avatar ?? undefined,
				todayAssignedHours,
				totalAssignedHours,
				capacityPercent,
				isOverloaded: capacityPercent >= 100,
				activeTasksCount: currentWorkload?.activeTasksCount ?? 0,
			};
		});
	}

	async getBoard(organizationId: string): Promise<DispatchBoardData> {
		if (!organizationId) {
			throw new ForbiddenException('Organization is required');
		}

		const [mechanics, organizationManagers] = await Promise.all([
			this.db.user.findMany({
				where: {
					organizationId,
					role: Role.MECHANIC,
					deletedAt: null,
				},
				select: {
					id: true,
					fullName: true,
					avatar: true,
				},
				orderBy: { fullName: 'asc' },
			}),
			this.db.user.findMany({
				where: {
					organizationId,
					role: { in: [Role.ADMIN, Role.MANAGER] },
					deletedAt: null,
				},
				select: { id: true },
			}),
		]);

		const managerIds = organizationManagers.map(manager => manager.id);
		const mechanicIds = mechanics.map(mechanic => mechanic.id);

		if (managerIds.length === 0) {
			return {
				mechanics: mechanics.map(mechanic => ({
					id: mechanic.id,
					fullName: mechanic.fullName,
					avatar: mechanic.avatar ?? undefined,
					tasks: [],
				})),
				unassignedTasks: [],
			};
		}

		const [assignedTasksRaw, unassignedTasksRaw] = await Promise.all([
			mechanicIds.length === 0
				? Promise.resolve([])
				: this.db.orderService.findMany({
						where: {
							mechanicId: { in: mechanicIds },
							status: { in: this.ACTIVE_JOB_STATUSES },
							order: {
								deletedAt: null,
								managerId: { in: managerIds },
								status: { in: this.ACTIVE_ORDER_STATUSES },
							},
						},
						select: {
							id: true,
							mechanicId: true,
							status: true,
							estimatedHours: true,
							deadline: true,
							service: { select: { name: true } },
							order: {
								select: {
									id: true,
									orderNumber: true,
									vehicle: {
										select: {
											brand: true,
											model: true,
											year: true,
											plateNumber: true,
										},
									},
								},
							},
						},
						orderBy: [{ order: { orderNumber: 'desc' } }, { id: 'asc' }],
					}),
			this.db.orderService.findMany({
				where: {
					mechanicId: null,
					status: JobStatus.PENDING,
					order: {
						deletedAt: null,
						managerId: { in: managerIds },
						status: { in: this.ACTIVE_ORDER_STATUSES },
					},
				},
				select: {
					id: true,
					mechanicId: true,
					status: true,
					estimatedHours: true,
					deadline: true,
					service: { select: { name: true } },
					order: {
						select: {
							id: true,
							orderNumber: true,
							vehicle: {
								select: {
									brand: true,
									model: true,
									year: true,
									plateNumber: true,
								},
							},
						},
					},
				},
				orderBy: [{ order: { orderNumber: 'desc' } }, { id: 'asc' }],
			}),
		]);

		const tasksByMechanic = new Map<string, DispatchTaskItem[]>();
		for (const task of assignedTasksRaw) {
			if (!task.mechanicId) {
				continue;
			}

			const mappedTask = this.toDispatchTaskItem(task);
			const existing = tasksByMechanic.get(task.mechanicId) ?? [];
			existing.push(mappedTask);
			tasksByMechanic.set(task.mechanicId, existing);
		}

		const unassignedTasks = unassignedTasksRaw.map(task =>
			this.toDispatchTaskItem(task),
		);

		const mechanicColumns: DispatchMechanicColumn[] = mechanics.map(
			mechanic => ({
				id: mechanic.id,
				fullName: mechanic.fullName,
				avatar: mechanic.avatar ?? undefined,
				tasks: tasksByMechanic.get(mechanic.id) ?? [],
			}),
		);

		return {
			mechanics: mechanicColumns,
			unassignedTasks,
		};
	}

	async assignTask(
		organizationId: string,
		taskId: string,
		mechanicId?: string | null,
	) {
		if (!organizationId) {
			throw new ForbiddenException('Organization is required');
		}

		const task = await this.db.orderService.findUnique({
			where: { id: taskId },
			select: {
				id: true,
				mechanicId: true,
				order: {
					select: {
						id: true,
						deletedAt: true,
						status: true,
						manager: {
							select: {
								organizationId: true,
							},
						},
					},
				},
			},
		});

		if (!task || task.order.deletedAt) {
			throw new NotFoundException('Dispatch task not found');
		}

		if (!this.ACTIVE_ORDER_STATUSES.includes(task.order.status)) {
			throw new ForbiddenException(
				'Task cannot be reassigned for this order status',
			);
		}

		const taskOrgId = task.order.manager?.organizationId ?? null;
		if (taskOrgId && taskOrgId !== organizationId) {
			throw new ForbiddenException('Task does not belong to your organization');
		}

		if (mechanicId) {
			const mechanic = await this.db.user.findFirst({
				where: {
					id: mechanicId,
					organizationId,
					role: Role.MECHANIC,
					deletedAt: null,
				},
				select: { id: true },
			});

			if (!mechanic) {
				throw new NotFoundException('Mechanic not found in your organization');
			}
		}

		const updated = await this.db.orderService.update({
			where: { id: taskId },
			data: {
				mechanicId: mechanicId ?? null,
			},
			select: {
				id: true,
				mechanicId: true,
			},
		});

		return updated;
	}

	async updateTaskPlanning(
		organizationId: string,
		taskId: string,
		payload: {
			additionalHours?: number;
			deadline?: string | null;
		},
	) {
		if (!organizationId) {
			throw new ForbiddenException('Organization is required');
		}

		if (
			payload.additionalHours === undefined &&
			payload.deadline === undefined
		) {
			throw new BadRequestException('No planning fields provided');
		}

		const task = await this.db.orderService.findUnique({
			where: { id: taskId },
			select: {
				id: true,
				order: {
					select: {
						deletedAt: true,
						status: true,
						manager: {
							select: {
								organizationId: true,
							},
						},
					},
				},
			},
		});

		if (!task || task.order.deletedAt) {
			throw new NotFoundException('Dispatch task not found');
		}

		if (!this.ACTIVE_ORDER_STATUSES.includes(task.order.status)) {
			throw new ForbiddenException(
				'Task planning cannot be updated for this order status',
			);
		}

		const taskOrgId = task.order.manager?.organizationId ?? null;
		if (taskOrgId && taskOrgId !== organizationId) {
			throw new ForbiddenException('Task does not belong to your organization');
		}

		const updated = await this.db.orderService.update({
			where: { id: taskId },
			data: {
				...(payload.additionalHours !== undefined
					? { additionalHours: payload.additionalHours }
					: {}),
				...(payload.deadline !== undefined
					? { deadline: payload.deadline ? new Date(payload.deadline) : null }
					: {}),
			},
			select: {
				id: true,
				additionalHours: true,
				deadline: true,
			},
		});

		return {
			id: updated.id,
			additionalHours: updated.additionalHours,
			deadline: updated.deadline ? updated.deadline.toISOString() : null,
		};
	}
}
