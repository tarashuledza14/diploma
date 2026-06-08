import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { OrderStatus } from "prisma/generated/prisma/client";
import { AuthUser } from "src/auth/types/auth-user.type";
import { FilterService } from "src/filter/filter.service";
import { PaginationService } from "src/pagination/pagination.service";
import { PrismaService } from "src/prisma/prisma.service";
import { BulkUpdateVehicleDto } from "./dto/bulk-update.dto";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { GetVehiclesDto } from "./dto/get-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

@Injectable()
export class VehiclesService {
  constructor(
    private readonly db: PrismaService,
    private readonly filterService: FilterService,
    private readonly paginationService: PaginationService,
  ) {}

  private assertOrganizationId(user: AuthUser): string {
    if (!user.organizationId) {
      throw new ForbiddenException("User is not attached to organization");
    }

    return user.organizationId;
  }

  async create(data: CreateVehicleDto, actor: AuthUser) {
    const organizationId = this.assertOrganizationId(actor);

    const createdVehicle = await this.db.withOrg(organizationId, async (tx) => {
      const client = await tx.client.findFirst({
        where: { id: data.ownerId, organizationId, deletedAt: null },
      });
      if (!client) {
        throw new BadRequestException("Client not found");
      }
      return tx.vehicle.create({ data: { ...data, organizationId } });
    });

    await this.recalculateClientVehicleCount(createdVehicle.ownerId);

    return createdVehicle;
  }

  async update(id: string, data: UpdateVehicleDto, actor: AuthUser) {
    const organizationId = this.assertOrganizationId(actor);

    const { existingOwnerId, updatedVehicle } = await this.db.withOrg(
      organizationId,
      async (tx) => {
        const existingVehicle = await tx.vehicle.findFirst({
          where: { id, organizationId },
          select: { ownerId: true },
        });

        if (!existingVehicle) {
          throw new BadRequestException("Vehicle not found");
        }

        if (data.ownerId) {
          const client = await tx.client.findFirst({
            where: { id: data.ownerId, organizationId, deletedAt: null },
          });
          if (!client) {
            throw new BadRequestException("Client not found");
          }
        }

        const updatedVehicle = await tx.vehicle.update({ where: { id }, data });
        return { existingOwnerId: existingVehicle.ownerId, updatedVehicle };
      },
    );

    await Promise.all([
      this.recalculateClientVehicleCount(existingOwnerId),
      ...(updatedVehicle.ownerId !== existingOwnerId
        ? [this.recalculateClientVehicleCount(updatedVehicle.ownerId)]
        : []),
    ]);

    return updatedVehicle;
  }

  async updateBulk(data: BulkUpdateVehicleDto, actor: AuthUser) {
    const organizationId = this.assertOrganizationId(actor);
    const { ids, field, value } = data;

    const { result, ownerIds } = await this.db.withOrg(
      organizationId,
      async (tx) => {
        const previousOwners =
          field === "ownerId"
            ? await tx.vehicle.findMany({
                where: { id: { in: ids }, organizationId },
                select: { ownerId: true },
              })
            : [];

        if (field === "ownerId") {
          const client = await tx.client.findFirst({
            where: { id: value, organizationId, deletedAt: null },
          });
          if (!client) {
            throw new BadRequestException("Client not found");
          }
        }

        const result = await tx.vehicle.updateMany({
          where: { id: { in: ids }, organizationId },
          data: { [field]: value },
        });

        const ownerIds =
          field === "ownerId"
            ? [...new Set([...previousOwners.map((item) => item.ownerId), value])]
            : [];

        return { result, ownerIds };
      },
    );

    if (ownerIds.length) {
      await Promise.all(
        ownerIds.map((ownerId) => this.recalculateClientVehicleCount(ownerId)),
      );
    }

    return result;
  }

  async getStatusCounts(actor: AuthUser) {
    const organizationId = this.assertOrganizationId(actor);
    return this.db.withOrg(organizationId, async (tx) => {
      const counts = await tx.vehicle.groupBy({
        by: ["status"],
        where: { organizationId, deletedAt: null },
        _count: { status: true },
      });
      return counts.reduce(
        (acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        },
        {} as Record<string, number>,
      );
    });
  }

  async getAll(input: GetVehiclesDto, actor: AuthUser) {
    const organizationId = this.assertOrganizationId(actor);
    return this.db.withOrg(organizationId, async (tx) => {
      const { skip, perPage } = this.paginationService.getPagination({
        page: input.page,
        perPage: input.perPage,
      });
      const filter = this.filterService.createFilter(
        input.filters,
        input.joinOperator,
      );
      const scopedFilter = {
        AND: [filter, { organizationId, deletedAt: null }],
      };
      const sortFilter = this.filterService.getSortFilter(input.sort);
      const [vehicles, total] = await Promise.all([
        tx.vehicle.findMany({
          where: scopedFilter,
          orderBy: sortFilter,
          skip,
          take: perPage,
          include: {
            owner: { select: { id: true, fullName: true } },
          },
        }),
        tx.vehicle.count({ where: scopedFilter }),
      ]);
      return {
        data: vehicles,
        total,
        pageCount: this.paginationService.getPageCount(total, perPage),
      };
    });
  }

  async syncServiceCompleted(vehicleId: string, serviceDate: Date) {
    await this.db.vehicle.update({
      where: { id: vehicleId },
      data: {
        totalServices: { increment: 1 },
        lastService: serviceDate,
      },
    });
  }

  async syncTotalServices(vehicleId: string, increment: boolean) {
    await this.db.vehicle.update({
      where: { id: vehicleId },
      data: {
        totalServices: {
          [increment ? "increment" : "decrement"]: 1,
        },
      },
    });
  }

  async updateLastService(vehicleId: string, serviceDate: Date) {
    await this.db.vehicle.update({
      where: { id: vehicleId },
      data: { lastService: serviceDate },
    });
  }

  async deleteBulk(ids: string[], actor: AuthUser) {
    const organizationId = this.assertOrganizationId(actor);

    const { result, ownerIds } = await this.db.withOrg(
      organizationId,
      async (tx) => {
        const affectedVehicles = await tx.vehicle.findMany({
          where: { id: { in: ids }, organizationId, deletedAt: null },
          select: { ownerId: true },
        });

        const result = await tx.vehicle.updateMany({
          where: { id: { in: ids }, organizationId },
          data: { deletedAt: new Date() },
        });

        const ownerIds = [
          ...new Set(affectedVehicles.map((item) => item.ownerId)),
        ];
        return { result, ownerIds };
      },
    );

    await Promise.all(
      ownerIds.map((ownerId) => this.recalculateClientVehicleCount(ownerId)),
    );

    return result;
  }

  async recalculateVehicleStats(vehicleId: string) {
    const [totalServices, latestCompletedOrder] = await Promise.all([
      this.db.order.count({
        where: { vehicleId, deletedAt: null, status: OrderStatus.COMPLETED },
      }),
      this.db.order.findFirst({
        where: {
          vehicleId,
          deletedAt: null,
          status: OrderStatus.COMPLETED,
          endDate: { not: null },
        },
        select: { endDate: true },
        orderBy: { endDate: "desc" },
      }),
    ]);

    await this.db.vehicle.update({
      where: { id: vehicleId },
      data: {
        totalServices,
        lastService: latestCompletedOrder?.endDate || null,
      },
    });
  }

  private async recalculateClientVehicleCount(clientId: string) {
    const activeVehiclesCount = await this.db.vehicle.count({
      where: { ownerId: clientId, deletedAt: null },
    });

    await this.db.client.update({
      where: { id: clientId },
      data: { vehicleCount: activeVehiclesCount },
    });
  }
}
