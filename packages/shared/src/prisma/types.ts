// Export Prisma types for use in frontend and backend
export type {
    Car, Document, Order, OrderPart,
    OrderService, OrderStatus,
    Part, Prisma, Service, User
} from '@prisma/client';

// Export Prisma enums as values (not just types)
export { OrderStatus as OrderStatusEnum, Role } from '@prisma/client';

