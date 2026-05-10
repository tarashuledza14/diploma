import { AppCurrency, DEFAULT_APP_NAME } from '@/modules/app-settings';
import {
	OrderDetails,
	OrderDetailsPart,
	OrderDetailsService,
} from '../interfaces/order-details.interface';
import {
	getOrderPdfTranslator,
	getOrderPriorityLabel,
	getOrderStatusLabel,
} from './order-pdf.i18n';
import { OrderPdfDocumentType } from './order-pdf.types';
import {
	calculateOrderTotals,
	formatPdfCurrency,
	formatPdfDate,
	formatPdfMileage,
	getClientEmail,
	getClientName,
	getClientPhone,
	getOrderNumber,
	getPartRowTotal,
	getServiceRowTotal,
	getVehicleDisplayName,
	getVehiclePlate,
	getVehicleVin,
} from './order-pdf.utils';

function esc(str: string | null | undefined): string {
	if (str == null) return '';
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

const css = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;
  font-size: 10pt;
  color: #0f172a;
  line-height: 1.4;
  padding: 28pt;
}
.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12pt; }
.company-name { font-size: 15pt; font-weight: bold; }
.doc-title { font-size: 17pt; font-weight: bold; text-align: right; }
.doc-subtitle { font-size: 9pt; color: #475569; }
.meta-grid { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid #cbd5e1; border-radius: 4pt; margin-bottom: 12pt; }
.meta-item { padding: 6pt 8pt; border-bottom: 1px solid #e2e8f0; }
.meta-item:nth-last-child(-n+2) { border-bottom: none; }
.meta-label { font-size: 8pt; color: #64748b; margin-bottom: 2pt; }
.meta-value { font-size: 10pt; font-weight: bold; }
.section { margin-top: 10pt; }
.section-title { font-size: 11pt; font-weight: bold; margin-bottom: 6pt; }
.info-row { display: flex; margin-bottom: 3pt; }
.info-label { width: 110pt; font-size: 9pt; color: #64748b; flex-shrink: 0; }
.info-value { flex: 1; font-size: 10pt; }
.table { margin-top: 6pt; border: 1px solid #cbd5e1; border-radius: 4pt; overflow: hidden; }
.table-header { display: flex; background: #f1f5f9; border-bottom: 1px solid #cbd5e1; padding: 6pt; font-weight: bold; font-size: 9pt; }
.table-row { display: flex; padding: 5pt 6pt; border-bottom: 1px solid #e2e8f0; font-size: 10pt; }
.table-row:last-child { border-bottom: none; }
.col-name { flex: 4; padding-right: 6pt; }
.col-qty { flex: 1; text-align: right; }
.col-price { flex: 2; text-align: right; }
.col-total { flex: 2; text-align: right; }
.totals { margin-top: 10pt; margin-left: auto; width: 230pt; }
.total-row { display: flex; justify-content: space-between; padding: 4pt 0; border-bottom: 1px solid #e2e8f0; }
.total-label { font-size: 10pt; color: #475569; }
.total-value { font-size: 10pt; font-weight: bold; }
.grand-total-row { display: flex; justify-content: space-between; padding: 6pt; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4pt; margin-top: 6pt; }
.grand-total-label { font-size: 11pt; font-weight: bold; }
.grand-total-value { font-size: 11pt; font-weight: bold; }
.note-box { margin-top: 8pt; padding: 8pt; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4pt; font-size: 9pt; line-height: 1.8; white-space: pre-wrap; }
.checklist-item { font-size: 10pt; margin-bottom: 4pt; }
.signatures { display: flex; justify-content: space-between; margin-top: 26pt; }
.signature-block { width: 46%; }
.signature-line { margin-top: 20pt; border-top: 1px solid #334155; padding-top: 4pt; font-size: 9pt; color: #475569; }
.footer { margin-top: 20pt; font-size: 8pt; color: #64748b; text-align: center; }
@media print {
  body { padding: 0; }
  @page { size: A4; margin: 15mm; }
}
`;

function wrap(title: string, body: string): string {
	return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <title>${esc(title)}</title>
  <style>${css}</style>
</head>
<body>${body}</body>
</html>`;
}

function infoRow(label: string, value: string): string {
	return `<div class="info-row"><span class="info-label">${label}</span><span class="info-value">${value}</span></div>`;
}

function serviceTableRows(
	services: OrderDetailsService[],
	currency: AppCurrency,
	language: string | undefined,
	emptyLabel: string,
): string {
	if (services.length === 0) {
		return `<div class="table-row"><span class="col-name">${esc(emptyLabel)}</span><span class="col-qty">-</span><span class="col-price">-</span><span class="col-total">-</span></div>`;
	}
	return services
		.map(
			s => `<div class="table-row">
    <span class="col-name">${esc(s.name)}</span>
    <span class="col-qty">${s.quantity}</span>
    <span class="col-price">${esc(formatPdfCurrency(s.price, currency, language))}</span>
    <span class="col-total">${esc(formatPdfCurrency(getServiceRowTotal(s), currency, language))}</span>
  </div>`,
		)
		.join('');
}

function partTableRows(
	parts: OrderDetailsPart[],
	currency: AppCurrency,
	language: string | undefined,
	emptyLabel: string,
): string {
	if (parts.length === 0) {
		return `<div class="table-row"><span class="col-name">${esc(emptyLabel)}</span><span class="col-qty">-</span><span class="col-price">-</span><span class="col-total">-</span></div>`;
	}
	return parts
		.map(
			p => `<div class="table-row">
    <span class="col-name">${esc(p.name)}</span>
    <span class="col-qty">${p.quantity}</span>
    <span class="col-price">${esc(formatPdfCurrency(p.unitPrice, currency, language))}</span>
    <span class="col-total">${esc(formatPdfCurrency(getPartRowTotal(p), currency, language))}</span>
  </div>`,
		)
		.join('');
}

function buildWorkOrderHtml(
	order: OrderDetails,
	appName: string,
	currency: AppCurrency,
	language: string | undefined,
	generatedAt: Date,
): string {
	const tr = getOrderPdfTranslator(language);

	const servicesHtml =
		order.services.length === 0
			? `<div class="checklist-item">${esc(tr('orders.pdf.documents.common.empty.noServicesAssigned', 'No services assigned'))}</div>`
			: order.services
					.map(
						(s: OrderDetailsService, i: number) =>
							`<div class="checklist-item">[ ] ${i + 1}. ${esc(s.name)} (${s.quantity}${esc(tr('orders.pdf.documents.workOrder.quantitySuffix', 'x'))})</div>`,
					)
					.join('');

	const partsHtml =
		order.parts.length === 0
			? `<div class="checklist-item">${esc(tr('orders.pdf.documents.common.empty.noPartsAssigned', 'No parts assigned'))}</div>`
			: order.parts
					.map(
						(p: OrderDetailsPart, i: number) =>
							`<div class="checklist-item">${i + 1}. ${esc(p.name)} | ${esc(tr('orders.pdf.documents.common.fields.qtyShort', 'Qty'))}: ${p.quantity} | SKU: ${esc(p.sku)}</div>`,
					)
					.join('');

	const notesHtml = order.notes
		? `<div class="note-box">${esc(order.notes)}</div>`
		: `<div class="note-box">1) ________________________________________________\n2) ________________________________________________\n3) ________________________________________________\n4) ________________________________________________</div>`;

	const body = `
  <div class="header">
    <div>
      <div class="company-name">${esc(appName)}</div>
      <div class="doc-subtitle">${esc(tr('orders.pdf.documents.common.companyType', 'Auto Service'))}</div>
    </div>
    <div style="text-align:right">
      <div class="doc-title">${esc(tr('orders.pdf.documents.workOrder.title', 'Work Order'))}</div>
      <div class="doc-subtitle">${esc(tr('orders.pdf.documents.workOrder.subtitle', 'Printable mechanic worksheet'))}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">${esc(tr('orders.pdf.documents.common.meta.orderNumber', 'Order number'))}</div><div class="meta-value">${esc(getOrderNumber(order))}</div></div>
    <div class="meta-item"><div class="meta-label">${esc(tr('orders.pdf.documents.common.meta.generatedAt', 'Generated at'))}</div><div class="meta-value">${esc(formatPdfDate(generatedAt, language))}</div></div>
    <div class="meta-item"><div class="meta-label">${esc(tr('orders.pdf.documents.common.meta.priority', 'Priority'))}</div><div class="meta-value">${esc(getOrderPriorityLabel(order.priority, language))}</div></div>
    <div class="meta-item"><div class="meta-label">${esc(tr('orders.pdf.documents.common.meta.dueDate', 'Due date'))}</div><div class="meta-value">${esc(formatPdfDate(order.dueDate, language))}</div></div>
  </div>

  <div class="section">
    <div class="section-title">${esc(tr('orders.pdf.documents.common.sections.clientAndVehicle', 'Client and vehicle'))}</div>
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.client', 'Client')), esc(getClientName(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.phone', 'Phone')), esc(getClientPhone(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.email', 'Email')), esc(getClientEmail(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.vehicle', 'Vehicle')), esc(getVehicleDisplayName(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.plate', 'Plate')), esc(getVehiclePlate(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.vin', 'VIN')), esc(getVehicleVin(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.mileage', 'Mileage')), `${esc(formatPdfMileage(order.mileage ?? order.vehicle?.mileage, language))} ${esc(tr('orders.pdf.documents.common.km', 'km'))}`)}
  </div>

  <div class="section">
    <div class="section-title">${esc(tr('orders.pdf.documents.workOrder.sections.serviceChecklist', 'Service checklist'))}</div>
    ${servicesHtml}
  </div>

  <div class="section">
    <div class="section-title">${esc(tr('orders.pdf.documents.workOrder.sections.partsToUse', 'Parts to use'))}</div>
    ${partsHtml}
  </div>

  <div class="section">
    <div class="section-title">${esc(tr('orders.pdf.documents.workOrder.sections.mechanicNotes', 'Mechanic notes'))}</div>
    ${notesHtml}
  </div>

  <div class="signatures">
    <div class="signature-block"><div class="signature-line">${esc(tr('orders.pdf.documents.common.signatures.mechanic', 'Mechanic signature'))}</div></div>
    <div class="signature-block"><div class="signature-line">${esc(tr('orders.pdf.documents.common.signatures.manager', 'Manager signature'))}</div></div>
  </div>

  <div class="footer">${esc(tr('orders.pdf.documents.common.generatedBy', 'Generated by {{appName}} on {{date}}', { appName, date: formatPdfDate(generatedAt, language) }))}</div>
  `;

	return wrap(
		tr('orders.pdf.documents.workOrder.title', 'Work Order'),
		body,
	);
}

function buildEstimateHtml(
	order: OrderDetails,
	appName: string,
	currency: AppCurrency,
	language: string | undefined,
	generatedAt: Date,
): string {
	const tr = getOrderPdfTranslator(language);
	const totals = calculateOrderTotals(order);
	const validityDate =
		order.dueDate ??
		new Date(generatedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

	const qtyLabel = esc(tr('orders.pdf.documents.common.fields.qtyShort', 'Qty'));
	const priceLabel = esc(tr('orders.pdf.documents.common.fields.price', 'Price'));
	const totalLabel = esc(tr('orders.pdf.documents.common.fields.total', 'Total'));
	const unitPriceLabel = esc(tr('orders.pdf.documents.common.fields.unitPrice', 'Unit price'));

	const body = `
  <div class="header">
    <div>
      <div class="company-name">${esc(appName)}</div>
      <div class="doc-subtitle">${esc(tr('orders.pdf.documents.common.companyType', 'Auto Service'))}</div>
    </div>
    <div style="text-align:right">
      <div class="doc-title">${esc(tr('orders.pdf.documents.estimate.title', 'Repair Estimate'))}</div>
      <div class="doc-subtitle">${esc(tr('orders.pdf.documents.estimate.subtitle', 'Preliminary calculation before approval'))}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">${esc(tr('orders.pdf.documents.common.meta.estimateNumber', 'Estimate number'))}</div><div class="meta-value">${esc(getOrderNumber(order))}</div></div>
    <div class="meta-item"><div class="meta-label">${esc(tr('orders.pdf.documents.common.meta.estimateDate', 'Estimate date'))}</div><div class="meta-value">${esc(formatPdfDate(generatedAt, language))}</div></div>
    <div class="meta-item"><div class="meta-label">${esc(tr('orders.pdf.documents.common.meta.validUntil', 'Valid until'))}</div><div class="meta-value">${esc(formatPdfDate(validityDate, language))}</div></div>
    <div class="meta-item"><div class="meta-label">${esc(tr('orders.pdf.documents.common.meta.priority', 'Priority'))}</div><div class="meta-value">${esc(getOrderPriorityLabel(order.priority, language))}</div></div>
  </div>

  <div class="section">
    <div class="section-title">${esc(tr('orders.pdf.documents.common.sections.clientAndVehicle', 'Client and vehicle'))}</div>
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.client', 'Client')), esc(getClientName(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.vehicle', 'Vehicle')), esc(getVehicleDisplayName(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.plate', 'Plate')), esc(getVehiclePlate(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.mileage', 'Mileage')), `${esc(formatPdfMileage(order.mileage ?? order.vehicle?.mileage, language))} ${esc(tr('orders.pdf.documents.common.km', 'km'))}`)}
  </div>

  <div class="section">
    <div class="section-title">${esc(tr('orders.pdf.documents.estimate.sections.estimatedServices', 'Estimated services'))}</div>
    <div class="table">
      <div class="table-header">
        <span class="col-name">${esc(tr('orders.pdf.documents.common.fields.service', 'Service'))}</span>
        <span class="col-qty">${qtyLabel}</span>
        <span class="col-price">${priceLabel}</span>
        <span class="col-total">${totalLabel}</span>
      </div>
      ${serviceTableRows(order.services, currency, language, tr('orders.pdf.documents.common.empty.noServicesInEstimate', 'No services in estimate'))}
    </div>
  </div>

  <div class="section">
    <div class="section-title">${esc(tr('orders.pdf.documents.estimate.sections.estimatedParts', 'Estimated parts'))}</div>
    <div class="table">
      <div class="table-header">
        <span class="col-name">${esc(tr('orders.pdf.documents.common.fields.part', 'Part'))}</span>
        <span class="col-qty">${qtyLabel}</span>
        <span class="col-price">${unitPriceLabel}</span>
        <span class="col-total">${totalLabel}</span>
      </div>
      ${partTableRows(order.parts, currency, language, tr('orders.pdf.documents.common.empty.noPartsInEstimate', 'No parts in estimate'))}
    </div>
  </div>

  <div class="totals">
    <div class="total-row">
      <span class="total-label">${esc(tr('orders.pdf.documents.common.fields.servicesSubtotal', 'Services subtotal'))}</span>
      <span class="total-value">${esc(formatPdfCurrency(totals.servicesTotal, currency, language))}</span>
    </div>
    <div class="total-row">
      <span class="total-label">${esc(tr('orders.pdf.documents.common.fields.partsSubtotal', 'Parts subtotal'))}</span>
      <span class="total-value">${esc(formatPdfCurrency(totals.partsTotal, currency, language))}</span>
    </div>
    <div class="grand-total-row">
      <span class="grand-total-label">${esc(tr('orders.pdf.documents.common.fields.estimatedTotal', 'Estimated total'))}</span>
      <span class="grand-total-value">${esc(formatPdfCurrency(totals.grandTotal, currency, language))}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">${esc(tr('orders.pdf.documents.estimate.sections.terms', 'Terms'))}</div>
    <div class="note-box">${esc(tr('orders.pdf.documents.estimate.termsText', 'This estimate is preliminary and can change after additional diagnostics or disassembly. Final invoice is generated only after the work is completed and confirmed.'))}</div>
  </div>

  <div class="footer">${esc(tr('orders.pdf.documents.common.generatedBy', 'Generated by {{appName}} on {{date}}', { appName, date: formatPdfDate(generatedAt, language) }))}</div>
  `;

	return wrap(
		tr('orders.pdf.documents.estimate.title', 'Repair Estimate'),
		body,
	);
}

function buildCompletionActHtml(
	order: OrderDetails,
	appName: string,
	currency: AppCurrency,
	language: string | undefined,
	generatedAt: Date,
): string {
	const tr = getOrderPdfTranslator(language);
	const totals = calculateOrderTotals(order);

	const qtyLabel = esc(tr('orders.pdf.documents.common.fields.qtyShort', 'Qty'));
	const priceLabel = esc(tr('orders.pdf.documents.common.fields.price', 'Price'));
	const totalLabel = esc(tr('orders.pdf.documents.common.fields.total', 'Total'));
	const unitPriceLabel = esc(tr('orders.pdf.documents.common.fields.unitPrice', 'Unit price'));

	const notesHtml = order.notes
		? `<div class="section">
    <div class="section-title">${esc(tr('orders.pdf.documents.common.sections.notes', 'Notes'))}</div>
    <div class="note-box">${esc(order.notes)}</div>
  </div>`
		: '';

	const body = `
  <div class="header">
    <div>
      <div class="company-name">${esc(appName)}</div>
      <div class="doc-subtitle">${esc(tr('orders.pdf.documents.common.companyType', 'Auto Service'))}</div>
    </div>
    <div style="text-align:right">
      <div class="doc-title">${esc(tr('orders.pdf.documents.completionAct.title', 'Completion Act'))}</div>
      <div class="doc-subtitle">${esc(tr('orders.pdf.documents.completionAct.subtitle', 'Client receipt for completed repair order'))}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">${esc(tr('orders.pdf.documents.common.meta.orderNumber', 'Order number'))}</div><div class="meta-value">${esc(getOrderNumber(order))}</div></div>
    <div class="meta-item"><div class="meta-label">${esc(tr('orders.pdf.documents.common.meta.generatedAt', 'Generated at'))}</div><div class="meta-value">${esc(formatPdfDate(generatedAt, language))}</div></div>
    <div class="meta-item"><div class="meta-label">${esc(tr('orders.pdf.documents.common.meta.orderCreated', 'Order created'))}</div><div class="meta-value">${esc(formatPdfDate(order.createdAt, language))}</div></div>
    <div class="meta-item"><div class="meta-label">${esc(tr('orders.pdf.documents.common.meta.status', 'Status'))}</div><div class="meta-value">${esc(getOrderStatusLabel(order.status, language))}</div></div>
  </div>

  <div class="section">
    <div class="section-title">${esc(tr('orders.pdf.documents.common.sections.clientAndVehicle', 'Client and vehicle'))}</div>
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.client', 'Client')), esc(getClientName(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.phone', 'Phone')), esc(getClientPhone(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.vehicle', 'Vehicle')), esc(getVehicleDisplayName(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.plate', 'Plate')), esc(getVehiclePlate(order)))}
    ${infoRow(esc(tr('orders.pdf.documents.common.fields.mileage', 'Mileage')), `${esc(formatPdfMileage(order.mileage ?? order.vehicle?.mileage, language))} ${esc(tr('orders.pdf.documents.common.km', 'km'))}`)}
  </div>

  <div class="section">
    <div class="section-title">${esc(tr('orders.pdf.documents.common.sections.services', 'Services'))}</div>
    <div class="table">
      <div class="table-header">
        <span class="col-name">${esc(tr('orders.pdf.documents.common.fields.service', 'Service'))}</span>
        <span class="col-qty">${qtyLabel}</span>
        <span class="col-price">${priceLabel}</span>
        <span class="col-total">${totalLabel}</span>
      </div>
      ${serviceTableRows(order.services, currency, language, tr('orders.pdf.documents.common.empty.noServicesInOrder', 'No services in order'))}
    </div>
  </div>

  <div class="section">
    <div class="section-title">${esc(tr('orders.pdf.documents.common.sections.parts', 'Parts'))}</div>
    <div class="table">
      <div class="table-header">
        <span class="col-name">${esc(tr('orders.pdf.documents.common.fields.part', 'Part'))}</span>
        <span class="col-qty">${qtyLabel}</span>
        <span class="col-price">${unitPriceLabel}</span>
        <span class="col-total">${totalLabel}</span>
      </div>
      ${partTableRows(order.parts, currency, language, tr('orders.pdf.documents.common.empty.noPartsInOrder', 'No parts in order'))}
    </div>
  </div>

  <div class="totals">
    <div class="total-row">
      <span class="total-label">${esc(tr('orders.pdf.documents.common.fields.servicesSubtotal', 'Services subtotal'))}</span>
      <span class="total-value">${esc(formatPdfCurrency(totals.servicesTotal, currency, language))}</span>
    </div>
    <div class="total-row">
      <span class="total-label">${esc(tr('orders.pdf.documents.common.fields.partsSubtotal', 'Parts subtotal'))}</span>
      <span class="total-value">${esc(formatPdfCurrency(totals.partsTotal, currency, language))}</span>
    </div>
    <div class="grand-total-row">
      <span class="grand-total-label">${esc(tr('orders.pdf.documents.common.fields.grandTotal', 'Grand total'))}</span>
      <span class="grand-total-value">${esc(formatPdfCurrency(totals.grandTotal, currency, language))}</span>
    </div>
  </div>

  ${notesHtml}

  <div class="signatures">
    <div class="signature-block"><div class="signature-line">${esc(tr('orders.pdf.documents.common.signatures.client', 'Client signature'))}</div></div>
    <div class="signature-block"><div class="signature-line">${esc(tr('orders.pdf.documents.common.signatures.serviceManager', 'Service manager signature'))}</div></div>
  </div>

  <div class="footer">${esc(tr('orders.pdf.documents.common.generatedBy', 'Generated by {{appName}} on {{date}}', { appName, date: formatPdfDate(generatedAt, language) }))}</div>
  `;

	return wrap(
		tr('orders.pdf.documents.completionAct.title', 'Completion Act'),
		body,
	);
}

export function generateOrderPdf(
	type: OrderPdfDocumentType,
	order: OrderDetails,
	appName: string = DEFAULT_APP_NAME,
	currency: AppCurrency,
	language?: string,
	generatedAt: Date = new Date(),
): void {
	let html: string;
	switch (type) {
		case 'workOrder':
			html = buildWorkOrderHtml(order, appName, currency, language, generatedAt);
			break;
		case 'estimate':
			html = buildEstimateHtml(order, appName, currency, language, generatedAt);
			break;
		case 'completionAct':
			html = buildCompletionActHtml(order, appName, currency, language, generatedAt);
			break;
		default:
			html = buildCompletionActHtml(order, appName, currency, language, generatedAt);
	}

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
