import { instance } from '@/api';
import {
	AssignDispatchTaskPayload,
	DispatchBoardData,
	UpdateDispatchTaskPlanningPayload,
} from '../interfaces/dispatch-board.interface';

export class DispatchService {
	static async getBoard() {
		const response = await instance.get<DispatchBoardData>('/dispatch/board');
		return response.data;
	}

	static async assignTask(payload: AssignDispatchTaskPayload) {
		const { taskId, mechanicId } = payload;
		const response = await instance.patch(
			`/dispatching/tasks/${taskId}/assign`,
			{
				mechanicId,
			},
		);
		return response.data;
	}

	static async updateTaskPlanning(payload: UpdateDispatchTaskPlanningPayload) {
		const { taskId, additionalHours, deadline } = payload;
		const response = await instance.patch(
			`/dispatching/tasks/${taskId}/planning`,
			{
				additionalHours,
				deadline,
			},
		);
		return response.data;
	}
}
