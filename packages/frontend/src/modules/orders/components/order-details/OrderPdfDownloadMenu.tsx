import {
	DEFAULT_APP_NAME,
	useAppBrandingQuery,
	useCurrencyFormatter,
} from '@/modules/app-settings';
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/shared/components/ui';
import { FileDown, FileText, FileType2, Wrench } from 'lucide-react';
import { ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { OrderDetails } from '../../interfaces/order-details.interface';
import { CompletionActPdfDocument } from '../../pdf/documents/CompletionActPdfDocument';
import { EstimatePdfDocument } from '../../pdf/documents/EstimatePdfDocument';
import { WorkOrderPdfDocument } from '../../pdf/documents/WorkOrderPdfDocument';
import { downloadOrderPdfDocument } from '../../pdf/download-order-pdf';
import { OrderPdfDocumentType } from '../../pdf/order-pdf.types';
import { createOrderPdfFileName } from '../../pdf/order-pdf.utils';

interface OrderPdfDownloadMenuProps {
	order: OrderDetails;
}

interface PdfActionOption {
	type: OrderPdfDocumentType;
	label: string;
	Icon: typeof FileText;
}

export function OrderPdfDownloadMenu({ order }: OrderPdfDownloadMenuProps) {
	const { t, i18n } = useTranslation();
	const { currency } = useCurrencyFormatter();
	const { data: branding } = useAppBrandingQuery();
	const [activeType, setActiveType] = useState<OrderPdfDocumentType | null>(
		null,
	);
	const isGenerating = activeType !== null;

	const actionOptions = useMemo<PdfActionOption[]>(
		() => [
			{
				type: 'completionAct',
				label: t('orders.pdf.completionAct'),
				Icon: FileText,
			},
			{
				type: 'workOrder',
				label: t('orders.pdf.workOrder'),
				Icon: Wrench,
			},
			{
				type: 'estimate',
				label: t('orders.pdf.estimate'),
				Icon: FileType2,
			},
		],
		[t],
	);

	const buildDocument = useCallback(
		(type: OrderPdfDocumentType, generatedAt: Date): ReactElement => {
			const commonProps = {
				order,
				appName: branding?.appName ?? DEFAULT_APP_NAME,
				currency,
				language: i18n.resolvedLanguage,
				generatedAt,
			};

			switch (type) {
				case 'completionAct':
					return <CompletionActPdfDocument {...commonProps} />;
				case 'workOrder':
					return <WorkOrderPdfDocument {...commonProps} />;
				case 'estimate':
					return <EstimatePdfDocument {...commonProps} />;
				default:
					return <CompletionActPdfDocument {...commonProps} />;
			}
		},
		[branding?.appName, currency, i18n.resolvedLanguage, order],
	);

	const handleDownload = useCallback(
		async (type: OrderPdfDocumentType) => {
			setActiveType(type);

			try {
				const generatedAt = new Date();
				const document = buildDocument(type, generatedAt);
				const fileName = createOrderPdfFileName(type, order, generatedAt);
				await downloadOrderPdfDocument(document, fileName);
				const documentLabel =
					actionOptions.find(option => option.type === type)?.label ??
					t('orders.pdf.document');

				toast.success(
					t('orders.pdf.downloadSuccess', {
						document: documentLabel,
					}),
				);
			} catch (_error) {
				toast.error(t('orders.pdf.downloadError'));
			} finally {
				setActiveType(null);
			}
		},
		[actionOptions, buildDocument, order, t],
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='outline' disabled={isGenerating}>
					<FileDown className='mr-2 h-4 w-4' />
					{isGenerating ? t('orders.pdf.generating') : t('orders.pdf.download')}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-64'>
				{actionOptions.map(option => (
					<DropdownMenuItem
						key={option.type}
						disabled={isGenerating}
						onClick={() => handleDownload(option.type)}
					>
						<option.Icon className='mr-2 h-4 w-4' />
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
