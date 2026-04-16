import { Document, Page, Text, View } from '@react-pdf/renderer';
import {
	OrderDetailsPart,
	OrderDetailsService,
} from '../../interfaces/order-details.interface';
import { ensureOrderPdfFontsRegistered } from '../order-pdf.fonts';
import { getOrderPdfTranslator, getOrderStatusLabel } from '../order-pdf.i18n';
import { orderPdfStyles } from '../order-pdf.styles';
import { OrderPdfDocumentProps } from '../order-pdf.types';
import {
	calculateOrderTotals,
	formatPdfCurrency,
	formatPdfDate,
	formatPdfMileage,
	getClientName,
	getClientPhone,
	getOrderNumber,
	getPartRowTotal,
	getServiceRowTotal,
	getVehicleDisplayName,
	getVehiclePlate,
} from '../order-pdf.utils';

export function CompletionActPdfDocument({
	order,
	appName,
	currency,
	language,
	generatedAt,
}: OrderPdfDocumentProps) {
	ensureOrderPdfFontsRegistered();
	const tr = getOrderPdfTranslator(language);

	const totals = calculateOrderTotals(order);

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
							{tr('orders.pdf.documents.completionAct.title', 'Completion Act')}
						</Text>
						<Text style={orderPdfStyles.documentSubtitle}>
							{tr(
								'orders.pdf.documents.completionAct.subtitle',
								'Client receipt for completed repair order',
							)}
						</Text>
					</View>
				</View>

				<View style={orderPdfStyles.metaGrid}>
					<View style={orderPdfStyles.metaItem}>
						<Text style={orderPdfStyles.metaLabel}>
							{tr(
								'orders.pdf.documents.common.meta.orderNumber',
								'Order number',
							)}
						</Text>
						<Text style={orderPdfStyles.metaValue}>
							{getOrderNumber(order)}
						</Text>
					</View>
					<View style={orderPdfStyles.metaItem}>
						<Text style={orderPdfStyles.metaLabel}>
							{tr(
								'orders.pdf.documents.common.meta.generatedAt',
								'Generated at',
							)}
						</Text>
						<Text style={orderPdfStyles.metaValue}>
							{formatPdfDate(generatedAt, language)}
						</Text>
					</View>
					<View style={orderPdfStyles.metaItem}>
						<Text style={orderPdfStyles.metaLabel}>
							{tr(
								'orders.pdf.documents.common.meta.orderCreated',
								'Order created',
							)}
						</Text>
						<Text style={orderPdfStyles.metaValue}>
							{formatPdfDate(order.createdAt, language)}
						</Text>
					</View>
					<View style={orderPdfStyles.metaItem}>
						<Text style={orderPdfStyles.metaLabel}>
							{tr('orders.pdf.documents.common.meta.status', 'Status')}
						</Text>
						<Text style={orderPdfStyles.metaValue}>
							{getOrderStatusLabel(order.status, language)}
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
							{tr('orders.pdf.documents.common.fields.phone', 'Phone')}
						</Text>
						<Text style={orderPdfStyles.infoValue}>
							{getClientPhone(order)}
						</Text>
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
						{tr('orders.pdf.documents.common.sections.services', 'Services')}
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
										'orders.pdf.documents.common.empty.noServicesInOrder',
										'No services in order',
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
						{tr('orders.pdf.documents.common.sections.parts', 'Parts')}
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
										'orders.pdf.documents.common.empty.noPartsInOrder',
										'No parts in order',
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
								'orders.pdf.documents.common.fields.grandTotal',
								'Grand total',
							)}
						</Text>
						<Text style={orderPdfStyles.grandTotalValue}>
							{formatPdfCurrency(totals.grandTotal, currency, language)}
						</Text>
					</View>
				</View>

				{order.notes ? (
					<View style={orderPdfStyles.section}>
						<Text style={orderPdfStyles.sectionTitle}>
							{tr('orders.pdf.documents.common.sections.notes', 'Notes')}
						</Text>
						<Text style={orderPdfStyles.noteBox}>{order.notes}</Text>
					</View>
				) : null}

				<View style={orderPdfStyles.signaturesRow}>
					<View style={orderPdfStyles.signatureBlock}>
						<Text style={orderPdfStyles.signatureLine}>
							{tr(
								'orders.pdf.documents.common.signatures.client',
								'Client signature',
							)}
						</Text>
					</View>
					<View style={orderPdfStyles.signatureBlock}>
						<Text style={orderPdfStyles.signatureLine}>
							{tr(
								'orders.pdf.documents.common.signatures.serviceManager',
								'Service manager signature',
							)}
						</Text>
					</View>
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
