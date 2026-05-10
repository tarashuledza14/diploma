import { StockMovement } from '@/modules/inventory/interfaces/get-inventory.interfaces';

const formatDateSimple = (date: Date | string | number) => {
	const d = new Date(date);
	return d.toLocaleDateString('uk-UA', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
};

const getMovementTypeLabel = (type: StockMovement['type']) => {
	switch (type) {
		case 'RECEIVED':
			return 'Надходження';
		case 'ISSUED':
			return 'Видано';
		case 'RESERVED':
			return 'Зарезервовано';
		case 'RETURNED':
			return 'Повернено';
		default:
			return type;
	}
};

const getMovementColor = (type: StockMovement['type']) => {
	switch (type) {
		case 'RECEIVED':
			return '#16a34a';
		case 'ISSUED':
			return '#2563eb';
		case 'RESERVED':
			return '#d97706';
		case 'RETURNED':
			return '#9333ea';
		default:
			return '#6b7280';
	}
};

export async function generateMovementHistoryPDF(
	partName: string,
	partSku: string,
	history: StockMovement[],
	stats: {
		received: number;
		issued: number;
		reserved: number;
		returned: number;
	},
) {
	const html = `
		<!DOCTYPE html>
		<html lang="uk-UA">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Історія руху - ${partSku}</title>
			<style>
				* {
					margin: 0;
					padding: 0;
					box-sizing: border-box;
				}
				body {
					font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
					line-height: 1.6;
					color: #1f2937;
					background: white;
					padding: 40px;
				}
				h1 {
					font-size: 24px;
					font-weight: bold;
					margin-bottom: 8px;
				}
				.subtitle {
					font-size: 14px;
					color: #666;
					margin-bottom: 24px;
				}
				.stats {
					display: grid;
					grid-template-columns: repeat(4, 1fr);
					gap: 12px;
					margin-bottom: 32px;
				}
				.stat-box {
					border: 1px solid #e5e7eb;
					padding: 16px;
					border-radius: 4px;
					text-align: center;
				}
				.stat-label {
					font-size: 12px;
					color: #999;
					margin-bottom: 8px;
				}
				.stat-value {
					font-size: 20px;
					font-weight: bold;
				}
				.history-title {
					font-size: 16px;
					font-weight: bold;
					margin-bottom: 16px;
					margin-top: 16px;
				}
				.history-item {
					border-left: 3px solid #3b82f6;
					padding: 16px;
					margin-bottom: 16px;
					background: #f9fafb;
					border-radius: 4px;
			}
				.movement-type {
					font-size: 12px;
					font-weight: bold;
					margin-bottom: 4px;
				}
				.quantity {
					font-size: 12px;
					font-weight: bold;
					margin-bottom: 4px;
				}
				.reason {
					font-size: 12px;
					color: #666;
					margin-bottom: 8px;
				}
				.metadata {
					font-size: 11px;
					color: #999;
					display: flex;
					gap: 16px;
				}
				.empty-state {
					text-align: center;
					color: #999;
					padding: 32px;
				}
				@media print {
					body {
						padding: 20px;
					}
				}
			</style>
		</head>
		<body>
			<h1>Історія руху запчастини</h1>
			<div class="subtitle">${partName} (${partSku})</div>

			<div class="stats">
				<div class="stat-box">
					<div class="stat-label">Надходження</div>
					<div class="stat-value" style="color: #16a34a;">${stats.received}</div>
				</div>
				<div class="stat-box">
					<div class="stat-label">Видано</div>
					<div class="stat-value" style="color: #2563eb;">${stats.issued}</div>
				</div>
				<div class="stat-box">
					<div class="stat-label">Зарезервовано</div>
					<div class="stat-value" style="color: #d97706;">${stats.reserved}</div>
				</div>
				<div class="stat-box">
					<div class="stat-label">Повернено</div>
					<div class="stat-value" style="color: #9333ea;">${stats.returned}</div>
				</div>
			</div>

			<div class="history-title">Деталі рухів</div>

			${
				history.length === 0
					? '<div class="empty-state">Немає записів</div>'
					: history
							.map(
								(mov) =>
									`
							<div class="history-item" style="border-left-color: ${getMovementColor(mov.type)};">
								<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
									<div class="movement-type" style="color: ${getMovementColor(mov.type)};">
										${getMovementTypeLabel(mov.type)}
									</div>
									<div class="quantity">
										${mov.type === 'RECEIVED' || mov.type === 'RETURNED' ? '+' : '-'}${Math.abs(mov.quantity)}
									</div>
								</div>
								<div class="reason">${mov.reason}</div>
								<div class="metadata">
									<span>${formatDateSimple(mov.createdAt)}</span>
									${mov.order?.id ? `<span>${mov.order.id}</span>` : ''}
									${mov.user?.fullName ? `<span>${mov.user.fullName}</span>` : ''}
								</div>
							</div>
						`,
							)
							.join('')
			}
		</body>
		</html>
	`;

	const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const printWindow = window.open(url, '_blank');

	if (printWindow) {
		printWindow.addEventListener('load', () => {
			printWindow.print();
			setTimeout(() => {
				printWindow.close();
				URL.revokeObjectURL(url);
			}, 500);
		});
	}
}
