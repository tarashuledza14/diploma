import { Controller } from '@nestjs/common';
import { DmsService } from './dms.service';

@Controller('dms')
export class DmsController {
  constructor(private readonly dmsService: DmsService) {}
}
