import { Module } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { DmsModule } from 'src/dms/dms.module';
import { AppSettingsController } from './app-settings.controller';
import { AppSettingsService } from './app-settings.service';

@Module({
	imports: [DmsModule],
	controllers: [AppSettingsController],
	providers: [AppSettingsService, JwtAuthGuard, RolesGuard],
	exports: [AppSettingsService],
})
export class AppSettingsModule {}
