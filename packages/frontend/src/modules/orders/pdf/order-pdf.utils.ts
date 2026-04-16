import {
	AppCurrency,
	DEFAULT_APP_CURRENCY,
	formatCurrencyValue,
} from '@/modules/app-settings';
import {
	OrderDetails,
	OrderDetailsPart,
	OrderDetailsService,
} from '../interfaces/order-details.interface';
import { formatOrderNumber } from '../utils/format-order-number';
import { OrderPdfDocumentType, OrderPdfTotals } from './order-pdf.types';

const EMPTY_VALUE = '-';

function resolveLocale(language?: string) {
	const normalized = (language ?? 'uk').toLowerCase();
	if (normalized.startsWith('uk')) {
		return 'uk-UA';
	}

	return 'en-US';
}

export function formatPdfDate(
	date: Date | string | number | null | undefined,
	language?: string,
) {
	if (!date) {
		return EMPTY_VALUE;
	}

	try {
		return new Intl.DateTimeFormat(resolveLocale(language), {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}).format(new Date(date));
	} catch (_error) {
		return EMPTY_VALUE;
	}
}

export function formatPdfCurrency(
	value: number | string | null | undefined,
	currency: AppCurrency = DEFAULT_APP_CURRENCY,
	language?: string,
) {
	return formatCurrencyValue(value, currency, language);
}

export function formatPdfMileage(
	value: number | null | undefined,
	language?: string,
) {
	if (typeof value !== 'number' || Number.isNaN(value)) {
		return EMPTY_VALUE;
	}

	return new Intl.NumberFormat(resolveLocale(language), {
		maximumFractionDigits: 0,
	}).format(value);
}

export function calculateOrderTotals(order: OrderDetails): OrderPdfTotals {
	const servicesTotal = (order.services ?? []).reduce(
		(sum: number, service: OrderDetailsService) =>
			sum + (service.price ?? 0) * (service.quantity ?? 1),
		0,
	);

	const partsTotal = (order.parts ?? []).reduce(
		(sum: number, part: OrderDetailsPart) =>
			sum + (part.unitPrice ?? 0) * (part.quantity ?? 0),
		0,
	);

	return {
		servicesTotal,
		partsTotal,
		grandTotal: servicesTotal + partsTotal,
	};
}

export function getServiceRowTotal(service: OrderDetailsService) {
	return (service.price ?? 0) * (service.quantity ?? 1);
}

export function getPartRowTotal(part: OrderDetailsPart) {
	return (part.unitPrice ?? 0) * (part.quantity ?? 0);
}

export function getClientName(order: OrderDetails) {
	return order.client?.fullName ?? order.client?.name ?? EMPTY_VALUE;
}

export function getClientPhone(order: OrderDetails) {
	return order.client?.phone ?? EMPTY_VALUE;
}

export function getClientEmail(order: OrderDetails) {
	return order.client?.email ?? EMPTY_VALUE;
}

export function getVehicleDisplayName(order: OrderDetails) {
	if (!order.vehicle) {
		return EMPTY_VALUE;
	}

	return `${order.vehicle.year} ${order.vehicle.brand} ${order.vehicle.model}`;
}

export function getVehiclePlate(order: OrderDetails) {
	if (!order.vehicle) {
		return EMPTY_VALUE;
	}

	return order.vehicle.plateNumber ?? order.vehicle.plate ?? EMPTY_VALUE;
}

export function getVehicleVin(order: OrderDetails) {
	return order.vehicle?.vin ?? EMPTY_VALUE;
}

export function getOrderNumber(order: OrderDetails) {
	return formatOrderNumber(order.orderNumber);
}

function sanitizeFileNameSegment(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

export function createOrderPdfFileName(
	type: OrderPdfDocumentType,
	order: OrderDetails,
	generatedAt: Date,
) {
	const suffixByType: Record<OrderPdfDocumentType, string> = {
		completionAct: 'completion-act',
		workOrder: 'work-order',
		estimate: 'estimate',
	};

	const date = generatedAt.toISOString().slice(0, 10);
	const orderNumber = sanitizeFileNameSegment(getOrderNumber(order));

	return `${orderNumber}-${suffixByType[type]}-${date}.pdf`;
}
