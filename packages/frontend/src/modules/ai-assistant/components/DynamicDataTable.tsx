import {
	Card,
	CardContent,
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared';
import { useTranslation } from 'react-i18next';

interface DynamicDataTableProps {
	data: any[];
}

function formatCellValue(value: unknown): string {
	if (value === null || value === undefined) {
		return '—';
	}

	if (typeof value === 'object') {
		try {
			return JSON.stringify(value);
		} catch {
			return String(value);
		}
	}

	return String(value);
}

export function TableSkeletonLoader() {
	return (
		<div className='mt-3 overflow-x-auto'>
			<Card className='min-w-120 border-border/60 shadow-sm'>
				<CardContent className='space-y-3 p-4'>
					<Skeleton className='h-8 w-full' />
					<Skeleton className='h-8 w-full' />
					<Skeleton className='h-8 w-full' />
				</CardContent>
			</Card>
		</div>
	);
}

export function DynamicDataTable({ data }: DynamicDataTableProps) {
	const { t } = useTranslation();
	if (!Array.isArray(data) || data.length === 0) {
		return (
			<div className='mt-3 text-sm text-muted-foreground'>
				{t('aiAssistant.messages.noData')}
			</div>
		);
	}

	const headers = Object.keys(data[0] ?? {});

	if (headers.length === 0) {
		return (
			<div className='mt-3 text-sm text-muted-foreground'>
				{t('aiAssistant.messages.noData')}
			</div>
		);
	}

	return (
		<div className='mt-3 overflow-x-auto'>
			<Card className='min-w-120 overflow-hidden border-border/60 bg-linear-to-b from-background to-muted/30 shadow-sm'>
				<CardContent className='p-0'>
					<Table className='w-full'>
						<TableHeader>
							<TableRow className='bg-muted/40 hover:bg-muted/40'>
								{headers.map(header => (
									<TableHead key={header} className='px-3 py-2 font-semibold'>
										{header}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.map((row, rowIndex) => (
								<TableRow key={`row-${rowIndex}`}>
									{headers.map(header => (
										<TableCell
											key={`cell-${rowIndex}-${header}`}
											className='max-w-70 px-3 py-2 align-top'
										>
											<div className='wrap-break-word whitespace-pre-wrap'>
												{formatCellValue(row?.[header])}
											</div>
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
