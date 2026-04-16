import { Document, Page, Text, View } from '@react-pdf/renderer';
import {
	OrderDetailsPart,
	OrderDetailsService,
} from '../../interfaces/order-details.interface';
import { ensureOrderPdfFontsRegistered } from '../order-pdf.fonts';
import {
	getOrderPdfTranslator,
	getOrderPriorityLabel,
} from '../order-pdf.i18n';
import { orderPdfStyles } from '../order-pdf.styles';
import { OrderPdfDocumentProps } from '../order-pdf.types';
import {
	calculateOrderTotals,
	formatPdfCurrency,
	formatPdfDate,
	formatPdfMileage,
	getClientName,
	getOrderNumber,
	getPartRowTotal,
	getServiceRowTotal,
	getVehicleDisplayName,
	getVehiclePlate,
} from '../order-pdf.utils';

export function EstimatePdfDocument({
	order,
	appName,
	currency,
	language,
	generatedAt,
}: OrderPdfDocumentProps) {
	ensureOrderPdfFontsRegistered();
	const tr = getOrderPdfTranslator(language);

	const totals = calculateOrderTotals(order);
	const validityDate =
		order.dueDate ??
		new Date(generatedAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

	return (
		<Document>
			<Page size='A4' style={orderPdfStyles.page}>
				<View style={orderPdfStyles.headerRow}>
					<View>
						<Text style={orderPdfStyles.companyName}>{appName}</Text>
						<Text style={orderPdfStyles.documentSubtitle}>
							{tr('orders.pdf.documents.common.companyType', 'Auto Service')}
						</Text>
					</View>
					<View>
						<Text style={orderPdfStyles.documentTitle}>
							{tr('orders.pdf.documents.estimate.title', 'Repair Estimate')}
						</Text>
						<Text style={orderPdfStyles.documentSubtitle}>
							{tr(
								'orders.pdf.documents.estimate.subtitle',
								'Preliminary calculation before approval',
							)}
						</Text>
					</View>
				</View>

				<View style={orderPdfStyles.metaGrid}>
					<View style={orderPdfStyles.metaItem}>
						<Text style={orderPdfStyles.metaLabel}>
							{tr(
								'orders.pdf.documents.common.meta.estimateNumber',
								'Estimate number',
							)}
						</Text>
						<Text style={orderPdfStyles.metaValue}>
							{getOrderNumber(order)}
						</Text>
					</View>
					<View style={orderPdfStyles.metaItem}>
						<Text style={orderPdfStyles.metaLabel}>
							{tr(
								'orders.pdf.documents.common.meta.estimateDate',
								'Estimate date',
							)}
						</Text>
						<Text style={orderPdfStyles.metaValue}>
							{formatPdfDate(generatedAt, language)}
						</Text>
					</View>
					<View style={orderPdfStyles.metaItem}>
						<Text style={orderPdfStyles.metaLabel}>
							{tr('orders.pdf.documents.common.meta.validUntil', 'Valid until')}
						</Text>
						<Text style={orderPdfStyles.metaValue}>
							{formatPdfDate(validityDate, language)}
						</Text>
					</View>
					<View style={orderPdfStyles.metaItem}>
						<Text style={orderPdfStyles.metaLabel}>
							{tr('orders.pdf.documents.common.meta.priority', 'Priority')}
						</Text>
						<Text style={orderPdfStyles.metaValue}>
							{getOrderPriorityLabel(order.priority, language)}
						</Text>
					</View>
				</View>

				<View style={orderPdfStyles.section}>
					<Text style={orderPdfStyles.sectionTitle}>
						{tr(
							'orders.pdf.documents.common.sections.clientAndVehicle',
							'Client and vehicle',
						)}
					</Text>
					<View style={orderPdfStyles.infoRow}>
						<Text style={orderPdfStyles.infoLabel}>
							{tr('orders.pdf.documents.common.fields.client', 'Client')}
						</Text>
						<Text style={orderPdfStyles.infoValue}>{getClientName(order)}</Text>
					</View>
					<View style={orderPdfStyles.infoRow}>
						<Text style={orderPdfStyles.infoLabel}>
							{tr('orders.pdf.documents.common.fields.vehicle', 'Vehicle')}
						</Text>
						<Text style={orderPdfStyles.infoValue}>
							{getVehicleDisplayName(order)}
						</Text>
					</View>
					<View style={orderPdfStyles.infoRow}>
						<Text style={orderPdfStyles.infoLabel}>
							{tr('orders.pdf.documents.common.fields.plate', 'Plate')}
						</Text>
						<Text style={orderPdfStyles.infoValue}>
							{getVehiclePlate(order)}
						</Text>
					</View>
					<View style={orderPdfStyles.infoRow}>
						<Text style={orderPdfStyles.infoLabel}>
							{tr('orders.pdf.documents.common.fields.mileage', 'Mileage')}
						</Text>
						<Text style={orderPdfStyles.infoValue}>
							{formatPdfMileage(
								order.mileage ?? order.vehicle?.mileage,
								language,
							)}{' '}
							{tr('orders.pdf.documents.common.km', 'km')}
						</Text>
					</View>
				</View>

				<View style={orderPdfStyles.section}>
					<Text style={orderPdfStyles.sectionTitle}>
						{tr(
							'orders.pdf.documents.estimate.sections.estimatedServices',
							'Estimated services',
						)}
					</Text>
					<View style={orderPdfStyles.table}>
						<View style={orderPdfStyles.tableHeader}>
							<Text style={orderPdfStyles.colName}>
								{tr('orders.pdf.documents.common.fields.service', 'Service')}
							</Text>
							<Text style={orderPdfStyles.colQty}>
								{tr('orders.pdf.documents.common.fields.qtyShort', 'Qty')}
							</Text>
							<Text style={orderPdfStyles.colPrice}>
								{tr('orders.pdf.documents.common.fields.price', 'Price')}
							</Text>
							<Text style={orderPdfStyles.colTotal}>
								{tr('orders.pdf.documents.common.fields.total', 'Total')}
							</Text>
						</View>
						{order.services.length === 0 ? (
							<View style={orderPdfStyles.tableRow}>
								<Text style={orderPdfStyles.colName}>
									{tr(
										'orders.pdf.documents.common.empty.noServicesInEstimate',
										'No services in estimate',
									)}
								</Text>
								<Text style={orderPdfStyles.colQty}>-</Text>
								<Text style={orderPdfStyles.colPrice}>-</Text>
								<Text style={orderPdfStyles.colTotal}>-</Text>
							</View>
						) : (
							order.services.map((service: OrderDetailsService) => (
								<View key={service.id} style={orderPdfStyles.tableRow}>
									<Text style={orderPdfStyles.colName}>{service.name}</Text>
									<Text style={orderPdfStyles.colQty}>{service.quantity}</Text>
									<Text style={orderPdfStyles.colPrice}>
										{formatPdfCurrency(service.price, currency, language)}
									</Text>
									<Text style={orderPdfStyles.colTotal}>
										{formatPdfCurrency(
											getServiceRowTotal(service),
											currency,
											language,
										)}
									</Text>
								</View>
							))
						)}
					</View>
				</View>

				<View style={orderPdfStyles.section}>
					<Text style={orderPdfStyles.sectionTitle}>
						{tr(
							'orders.pdf.documents.estimate.sections.estimatedParts',
							'Estimated parts',
						)}
					</Text>
					<View style={orderPdfStyles.table}>
						<View style={orderPdfStyles.tableHeader}>
							<Text style={orderPdfStyles.colName}>
								{tr('orders.pdf.documents.common.fields.part', 'Part')}
							</Text>
							<Text style={orderPdfStyles.colQty}>
								{tr('orders.pdf.documents.common.fields.qtyShort', 'Qty')}
							</Text>
							<Text style={orderPdfStyles.colPrice}>
								{tr(
									'orders.pdf.documents.common.fields.unitPrice',
									'Unit price',
								)}
							</Text>
							<Text style={orderPdfStyles.colTotal}>
								{tr('orders.pdf.documents.common.fields.total', 'Total')}
							</Text>
						</View>
						{order.parts.length === 0 ? (
							<View style={orderPdfStyles.tableRow}>
								<Text style={orderPdfStyles.colName}>
									{tr(
										'orders.pdf.documents.common.empty.noPartsInEstimate',
										'No parts in estimate',
									)}
								</Text>
								<Text style={orderPdfStyles.colQty}>-</Text>
								<Text style={orderPdfStyles.colPrice}>-</Text>
								<Text style={orderPdfStyles.colTotal}>-</Text>
							</View>
						) : (
							order.parts.map((part: OrderDetailsPart) => (
								<View key={part.id} style={orderPdfStyles.tableRow}>
									<Text style={orderPdfStyles.colName}>{part.name}</Text>
									<Text style={orderPdfStyles.colQty}>{part.quantity}</Text>
									<Text style={orderPdfStyles.colPrice}>
										{formatPdfCurrency(part.unitPrice, currency, language)}
									</Text>
									<Text style={orderPdfStyles.colTotal}>
										{formatPdfCurrency(
											getPartRowTotal(part),
											currency,
											language,
										)}
									</Text>
								</View>
							))
						)}
					</View>
				</View>

				<View style={orderPdfStyles.totalsContainer}>
					<View style={orderPdfStyles.totalRow}>
						<Text style={orderPdfStyles.totalLabel}>
							{tr(
								'orders.pdf.documents.common.fields.servicesSubtotal',
								'Services subtotal',
							)}
						</Text>
						<Text style={orderPdfStyles.totalValue}>
							{formatPdfCurrency(totals.servicesTotal, currency, language)}
						</Text>
					</View>
					<View style={orderPdfStyles.totalRow}>
						<Text style={orderPdfStyles.totalLabel}>
							{tr(
								'orders.pdf.documents.common.fields.partsSubtotal',
								'Parts subtotal',
							)}
						</Text>
						<Text style={orderPdfStyles.totalValue}>
							{formatPdfCurrency(totals.partsTotal, currency, language)}
						</Text>
					</View>
					<View style={orderPdfStyles.grandTotalRow}>
						<Text style={orderPdfStyles.grandTotalLabel}>
							{tr(
								'orders.pdf.documents.common.fields.estimatedTotal',
								'Estimated total',
							)}
						</Text>
						<Text style={orderPdfStyles.grandTotalValue}>
							{formatPdfCurrency(totals.grandTotal, currency, language)}
						</Text>
					</View>
				</View>

				<View style={orderPdfStyles.section}>
					<Text style={orderPdfStyles.sectionTitle}>
						{tr('orders.pdf.documents.estimate.sections.terms', 'Terms')}
					</Text>
					<Text style={orderPdfStyles.noteBox}>
						{tr(
							'orders.pdf.documents.estimate.termsText',
							'This estimate is preliminary and can change after additional diagnostics or disassembly. Final invoice is generated only after the work is completed and confirmed.',
						)}
					</Text>
				</View>

				<Text style={orderPdfStyles.footer} fixed>
					{tr(
						'orders.pdf.documents.common.generatedBy',
						'Generated by {{appName}} on {{date}}',
						{
							appName,
							date: formatPdfDate(generatedAt, language),
						},
					)}
				</Text>
			</Page>
		</Document>
	);
}
