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
