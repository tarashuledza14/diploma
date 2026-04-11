import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from '@nestjs/common';
import { Role } from 'prisma/generated/prisma/client';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorators';
import { AuthUser } from 'src/auth/types/auth-user.type';
import { CreateTeamUserDto } from './dto/create-team-user.dto';
import { UpdateTeamUserDto } from './dto/update-team-user.dto';
import { TeamService } from './team.service';

@Controller('team')
@Auth(Role.ADMIN)
export class TeamController {
	constructor(private readonly teamService: TeamService) {}

	@Get('users')
	getUsers(@CurrentUser() actor: AuthUser) {
		return this.teamService.getUsers(actor);
	}

	@Post('users')
	createUser(@CurrentUser() actor: AuthUser, @Body() dto: CreateTeamUserDto) {
		return this.teamService.createUser(actor, dto);
	}

	@Patch('users/:id')
	updateUser(
		@CurrentUser() actor: AuthUser,
		@Param('id') userId: string,
		@Body() dto: UpdateTeamUserDto,
	) {
		return this.teamService.updateUser(actor, userId, dto);
	}

	@Delete('users/:id')
	blockUser(@CurrentUser() actor: AuthUser, @Param('id') userId: string) {
		return this.teamService.blockUser(actor, userId);
	}
}
