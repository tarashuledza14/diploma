export function formatOrderNumber(orderNumber?: number | null) {
	if (!orderNumber) {
		return 'ORD-';
	}

	return `ORD-${orderNumber}`;
}
