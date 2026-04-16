import { AppCurrency } from '@/modules/app-settings';
import { OrderDetails } from '../interfaces/order-details.interface';

export type OrderPdfDocumentType = 'completionAct' | 'workOrder' | 'estimate';

export interface OrderPdfDocumentProps {
	order: OrderDetails;
	appName: string;
	currency: AppCurrency;
	language?: string;
	generatedAt: Date;
}

export interface OrderPdfTotals {
	servicesTotal: number;
	partsTotal: number;
	grandTotal: number;
}
