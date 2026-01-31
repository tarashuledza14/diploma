import { instance } from '@/api';
import { NewOrder } from '../interfaces/new-order.interface';

export class OrderService {
	createOrder(data: NewOrder) {
		return instance.post('/orders', data);
	}
}
