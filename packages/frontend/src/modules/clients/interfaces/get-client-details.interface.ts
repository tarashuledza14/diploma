import type { OrderListItem as Order } from "@/modules/orders/interfaces/order.interface";
import { Client } from "./client.interface";

export interface GetClientDetailsResponse extends Client {
  orders: Order[];
  vehicles: any[];
}
