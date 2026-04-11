import { MechanicWorkloadItem } from '../interfaces/mechanic-workload.interface';
import { NewOrderMechanic } from '../interfaces/new-order-meta.interface';

export function mergeMechanicsWithWorkload(
	mechanics: NewOrderMechanic[],
	workloads: MechanicWorkloadItem[],
): NewOrderMechanic[] {
	const workloadByMechanicId = new Map(workloads.map(item => [item.id, item]));

	return mechanics.map(mechanic => {
		const workload = workloadByMechanicId.get(mechanic.id);

		if (!workload) {
			return mechanic;
		}

		return {
			...mechanic,
			openTasksCount: workload.activeTasksCount,
			todayAssignedHours: workload.todayAssignedHours,
			totalAssignedHours: workload.totalAssignedHours,
			capacityPercent: workload.capacityPercent,
			isOverloaded: workload.isOverloaded,
		};
	});
}
