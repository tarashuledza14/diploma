export interface DispatchTaskItem {
	id: string;
	mechanicId: string | null;
	orderId: string;
	orderNumber: number;
	serviceName: string;
	estimatedHours: number;
	status: 'PENDING' | 'IN_PROGRESS' | 'WAITING_FOR_PARTS' | 'COMPLETED';
	additionalHours?: number;
	deadline: string | null;
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
	unassignedTasks: DispatchTaskItem[];
	mechanics: DispatchMechanicColumn[];
}

export interface AssignDispatchTaskPayload {
	taskId: string;
	mechanicId?: string | null;
}

export interface UpdateDispatchTaskPlanningPayload {
	taskId: string;
	additionalHours?: number;
	deadline?: string | null;
}
