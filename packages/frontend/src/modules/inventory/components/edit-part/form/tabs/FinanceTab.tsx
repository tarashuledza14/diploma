import { PartFormData } from '@/modules/inventory/interfaces/edit-inventory.interfaces';
import { InventoryDictionaries } from '@/modules/inventory/interfaces/inventory.interfaces';
import {
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
} from '@/shared';
import { DollarSign, Truck } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface FinanceTabProps {
	control: Control<PartFormData, any, PartFormData>;
	dictionaries: InventoryDictionaries;
}

export function FinanceTab({ control, dictionaries }: FinanceTabProps) {
	const { t } = useTranslation();
	return (
		<div className='space-y-4 pt-4'>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>{t('inventory.form.finance.purchasePriceLabel')} *</Label>
					<div className='relative'>
						<DollarSign className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
						<Controller
							name='purchasePrice'
							control={control}
							render={({ field }) => (
								<Input
									type='number'
									step='0.01'
									{...field}
									value={field.value ?? ''}
									onChange={e => field.onChange(Number(e.target.value))}
									placeholder={t(
										'inventory.form.finance.placeholders.purchasePrice',
									)}
									className='pl-10'
								/>
							)}
						/>
					</div>
				</div>
				<div className='grid gap-2'>
					<Label>{t('inventory.form.finance.retailPriceLabel')} *</Label>
					<div className='relative'>
						<DollarSign className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
						<Controller
							name='retailPrice'
							control={control}
							render={({ field }) => (
								<Input
									type='number'
									step='0.01'
									{...field}
									value={field.value ?? ''}
									onChange={e => field.onChange(Number(e.target.value))}
									placeholder={t(
										'inventory.form.finance.placeholders.retailPrice',
									)}
									className='pl-10'
								/>
							)}
						/>
					</div>
				</div>
			</div>
			<div className='rounded-lg border bg-muted/50 p-3'>
				<div className='flex items-center justify-between text-sm'>
					<span className='text-muted-foreground'>
						{t('inventory.form.finance.calculatedMarkupLabel')}
					</span>
					<span className='font-bold text-lg text-muted-foreground'>—</span>
				</div>
			</div>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>{t('inventory.form.finance.priceCategoryLabel')}</Label>
					<Controller
						name='priceCategory'
						control={control}
						render={({ field }) => (
							<Select
								value={field.value ?? undefined}
								onValueChange={field.onChange}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='RETAIL'>
										{t('inventory.form.finance.priceCategory.retail')}
									</SelectItem>
									<SelectItem value='WHOLESALE'>
										{t('inventory.form.finance.priceCategory.wholesale')}
									</SelectItem>
									<SelectItem value='SPECIAL'>
										{t('inventory.form.finance.priceCategory.special')}
									</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>
			</div>
			<Separator />
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>{t('inventory.form.finance.supplierLabel')} *</Label>
					<Controller
						name='supplier'
						control={control}
						render={({ field }) => (
							<Select
								value={field.value?.id ?? ''}
								onValueChange={selectedId => {
									const selectedSupplier = dictionaries.suppliers.find(
										supplier => supplier.id === selectedId,
									);

									field.onChange(selectedSupplier);
								}}
							>
								<SelectTrigger>
									<Truck className='mr-2 h-4 w-4' />
									<SelectValue
										placeholder={t(
											'inventory.form.finance.placeholders.selectSupplier',
										)}
									/>
								</SelectTrigger>
								<SelectContent>
									{dictionaries.suppliers.map(supplier => (
										<SelectItem key={supplier.id} value={supplier.id}>
											{supplier.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</div>
			</div>
		</div>
	);
}
