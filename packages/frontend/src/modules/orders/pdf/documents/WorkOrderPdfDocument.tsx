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
	formatPdfDate,
	formatPdfMileage,
	getClientEmail,
	getClientName,
	getClientPhone,
	getOrderNumber,
	getVehicleDisplayName,
	getVehiclePlate,
	getVehicleVin,
} from '../order-pdf.utils';

export function WorkOrderPdfDocument({
	order,
	appName,
	language,
	generatedAt,
}: OrderPdfDocumentProps) {
	ensureOrderPdfFontsRegistered();
	const tr = getOrderPdfTranslator(language);

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
							{tr('orders.pdf.documents.workOrder.title', 'Work Order')}
						</Text>
						<Text style={orderPdfStyles.documentSubtitle}>
							{tr(
								'orders.pdf.documents.workOrder.subtitle',
								'Printable mechanic worksheet',
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
							{tr('orders.pdf.documents.common.meta.priority', 'Priority')}
						</Text>
						<Text style={orderPdfStyles.metaValue}>
							{getOrderPriorityLabel(order.priority, language)}
						</Text>
					</View>
					<View style={orderPdfStyles.metaItem}>
						<Text style={orderPdfStyles.metaLabel}>
							{tr('orders.pdf.documents.common.meta.dueDate', 'Due date')}
						</Text>
						<Text style={orderPdfStyles.metaValue}>
							{formatPdfDate(order.dueDate, language)}
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
							{tr('orders.pdf.documents.common.fields.email', 'Email')}
						</Text>
						<Text style={orderPdfStyles.infoValue}>
							{getClientEmail(order)}
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
							{tr('orders.pdf.documents.common.fields.vin', 'VIN')}
						</Text>
						<Text style={orderPdfStyles.infoValue}>{getVehicleVin(order)}</Text>
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
							'orders.pdf.documents.workOrder.sections.serviceChecklist',
							'Service checklist',
						)}
					</Text>
					{order.services.length === 0 ? (
						<Text style={orderPdfStyles.checklistItem}>
							{tr(
								'orders.pdf.documents.common.empty.noServicesAssigned',
								'No services assigned',
							)}
						</Text>
					) : (
						order.services.map(
							(service: OrderDetailsService, index: number) => (
								<Text key={service.id} style={orderPdfStyles.checklistItem}>
									[ ] {index + 1}. {service.name} ({service.quantity}
									{tr('orders.pdf.documents.workOrder.quantitySuffix', 'x')})
								</Text>
							),
						)
					)}
				</View>

				<View style={orderPdfStyles.section}>
					<Text style={orderPdfStyles.sectionTitle}>
						{tr(
							'orders.pdf.documents.workOrder.sections.partsToUse',
							'Parts to use',
						)}
					</Text>
					{order.parts.length === 0 ? (
						<Text style={orderPdfStyles.checklistItem}>
							{tr(
								'orders.pdf.documents.common.empty.noPartsAssigned',
								'No parts assigned',
							)}
						</Text>
					) : (
						order.parts.map((part: OrderDetailsPart, index: number) => (
							<Text key={part.id} style={orderPdfStyles.checklistItem}>
								{index + 1}. {part.name} |{' '}
								{tr('orders.pdf.documents.common.fields.qtyShort', 'Qty')}:{' '}
								{part.quantity} | SKU: {part.sku}
							</Text>
						))
					)}
				</View>

				<View style={orderPdfStyles.section}>
					<Text style={orderPdfStyles.sectionTitle}>
						{tr(
							'orders.pdf.documents.workOrder.sections.mechanicNotes',
							'Mechanic notes',
						)}
					</Text>
					<Text style={orderPdfStyles.noteBox}>
						1) ________________________________________________{`\n`}
						2) ________________________________________________{`\n`}
						3) ________________________________________________{`\n`}
						4) ________________________________________________
					</Text>
				</View>

				<View style={orderPdfStyles.signaturesRow}>
					<View style={orderPdfStyles.signatureBlock}>
						<Text style={orderPdfStyles.signatureLine}>
							{tr(
								'orders.pdf.documents.common.signatures.mechanic',
								'Mechanic signature',
							)}
						</Text>
					</View>
					<View style={orderPdfStyles.signatureBlock}>
						<Text style={orderPdfStyles.signatureLine}>
							{tr(
								'orders.pdf.documents.common.signatures.manager',
								'Manager signature',
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
