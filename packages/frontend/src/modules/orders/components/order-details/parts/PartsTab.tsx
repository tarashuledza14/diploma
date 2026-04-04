import {
	Badge,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Separator,
} from '@/shared/components/ui';
import { Package, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AddPart } from './AddPart';
import { PartsTable } from './PartsTable';
import { PartsTotals } from './PartsTotals';

interface DisplayPart {
	id: string;
	name: string;
	sku: string;
	quantity: number;
	unitPrice: number;
}

interface ServicePartGroup {
	serviceId: string;
	serviceName: string;
	parts: DisplayPart[];
}

interface PartsTabProps {
	parts: any[];
	partsTotal: number;
	servicesTotal: number;
	grandTotal: number;
	servicePartGroups: ServicePartGroup[];
	unassignedParts: DisplayPart[];
	partOptions: Array<{
		id: string;
		name: string;
		price: number;
		stock: number;
	}>;
	onAddPart: (partId: string, quantity: number) => Promise<void>;
	onRemovePart: (partId: string) => Promise<void>;
	onQuantityChange: (partId: string, quantity: number) => Promise<void>;
	canManageParts?: boolean;
	showFinancials?: boolean;
	isUpdating?: boolean;
}

export function PartsTab({
	parts,
	partsTotal,
	servicesTotal,
	grandTotal,
	servicePartGroups,
	unassignedParts,
	partOptions,
	onAddPart,
	onRemovePart,
	onQuantityChange,
	canManageParts = true,
	showFinancials = true,
	isUpdating = false,
}: PartsTabProps) {
	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between'>
				<CardTitle className='flex items-center gap-2'>
					<Package className='h-5 w-5' />
					{t('orders.detailsTabs.parts', { count: parts.length })}
				</CardTitle>
				{canManageParts && (
					<AddPart
						partOptions={partOptions}
						onAddPart={onAddPart}
						isPending={isUpdating}
					/>
				)}
			</CardHeader>
			<CardContent>
				{(servicePartGroups.length > 0 || unassignedParts.length > 0) && (
					<div className='mb-6 space-y-4'>
						<div className='flex items-center justify-between'>
							<h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
								{t('orders.detailsParts.assignmentMap')}
							</h3>
							<Badge variant='secondary'>
								{t('orders.detailsParts.partsInOrder', { count: parts.length })}
							</Badge>
						</div>

						<div className='grid gap-3 md:grid-cols-2'>
							{servicePartGroups.map(group => (
								<div
									key={group.serviceId}
									className='rounded-lg border bg-muted/20 p-3'
								>
									<div className='mb-2 flex items-center gap-2'>
										<Wrench className='h-4 w-4 text-blue-500' />
										<p className='text-sm font-medium'>{group.serviceName}</p>
										<Badge variant='outline'>{group.parts.length}</Badge>
									</div>
									<div className='space-y-1'>
										{group.parts.map(part => (
											<div
												key={part.id}
												className='flex items-center justify-between rounded-md bg-background px-2 py-1.5 text-sm'
											>
												<span className='font-medium'>{part.name}</span>
												<span className='text-muted-foreground'>
													x{part.quantity}
												</span>
											</div>
										))}
									</div>
								</div>
							))}

							{unassignedParts.length > 0 && (
								<div className='rounded-lg border border-dashed p-3'>
									<div className='mb-2 flex items-center gap-2'>
										<Package className='h-4 w-4 text-amber-500' />
										<p className='text-sm font-medium'>
											{t('orders.detailsParts.unassignedParts')}
										</p>
										<Badge variant='outline'>{unassignedParts.length}</Badge>
									</div>
									<div className='space-y-1'>
										{unassignedParts.map(part => (
											<div
												key={part.id}
												className='flex items-center justify-between rounded-md bg-background px-2 py-1.5 text-sm'
											>
												<span className='font-medium'>{part.name}</span>
												<span className='text-muted-foreground'>
													x{part.quantity}
												</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				<PartsTable
					parts={parts}
					onRemovePart={onRemovePart}
					onQuantityChange={onQuantityChange}
					canManageParts={canManageParts}
					showFinancials={showFinancials}
					isPending={isUpdating}
				/>
				{showFinancials && (
					<>
						<Separator className='my-4' />
						<PartsTotals
							partsTotal={partsTotal}
							servicesTotal={servicesTotal}
							grandTotal={grandTotal}
						/>
					</>
				)}
			</CardContent>
		</Card>
	);
}
