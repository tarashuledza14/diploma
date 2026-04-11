import {
	Body,
	Controller,
	ForbiddenException,
	Get,
	Param,
	Patch,
} from '@nestjs/common';
import { Role } from 'prisma/generated/prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorators';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { DispatchingService } from './dispatching.service';
import { AssignDispatchTaskDto } from './dto/assign-dispatch-task.dto';
import { UpdateDispatchTaskPlanningDto } from './dto/update-dispatch-task-planning.dto';

@Controller(['dispatch', 'dispatching'])
export class DispatchingController {
	constructor(private readonly dispatchingService: DispatchingService) {}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Get('mechanics-workload')
	getMechanicsWorkload(@CurrentUser() user: AuthUser) {
		if (!user.organizationId) {
			throw new ForbiddenException('User is not attached to organization');
		}

		return this.dispatchingService.getMechanicsWorkload(user.organizationId);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Get('board')
	getBoard(@CurrentUser() user: AuthUser) {
		if (!user.organizationId) {
			throw new ForbiddenException('User is not attached to organization');
		}

		return this.dispatchingService.getBoard(user.organizationId);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Patch('tasks/:taskId/assign')
	assignTask(
		@CurrentUser() user: AuthUser,
		@Param('taskId') taskId: string,
		@Body() dto: AssignDispatchTaskDto,
	) {
		if (!user.organizationId) {
			throw new ForbiddenException('User is not attached to organization');
		}

		return this.dispatchingService.assignTask(
			user.organizationId,
			taskId,
			dto.mechanicId,
		);
	}

	@Auth(Role.ADMIN, Role.MANAGER)
	@Patch('tasks/:taskId/planning')
	updateTaskPlanning(
		@CurrentUser() user: AuthUser,
		@Param('taskId') taskId: string,
		@Body() dto: UpdateDispatchTaskPlanningDto,
	) {
		if (!user.organizationId) {
			throw new ForbiddenException('User is not attached to organization');
		}

		return this.dispatchingService.updateTaskPlanning(
			user.organizationId,
			taskId,
			dto,
		);
	}
}
