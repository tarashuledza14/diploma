import { Body, Controller, Post } from '@nestjs/common'
import { CreateVehicleDto } from './dto/create-vehicle.dto'
import { VehiclesService } from './vehicles.service'

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  async createVehicle(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }
}
