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
	TagsInput,
	TagsInputInput,
	TagsInputItem,
	TagsInputList,
} from '@/shared';

import { Barcode } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface BaseInfoTabProps {
	control: Control<PartFormData, any, PartFormData>;
	dictionaries: InventoryDictionaries;
}

export function BaseInfoTab({ control, dictionaries }: BaseInfoTabProps) {
	const { t } = useTranslation();
	return (
		<div className='space-y-4 pt-4'>
			<div className='grid gap-2'>
				<Label>{t('inventory.form.base.partNameLabel')} *</Label>
				<Controller
					name='name'
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							placeholder={t('inventory.form.base.placeholders.partName')}
						/>
					)}
				/>
			</div>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>{t('inventory.form.base.skuLabel')} *</Label>
					<Controller
						name='sku'
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								placeholder={t('inventory.form.base.placeholders.sku')}
							/>
						)}
					/>
				</div>
				<div className='grid gap-2'>
					<Label>{t('inventory.form.base.oemLabel')}</Label>
					<Controller
						name='oem'
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								value={field.value ?? ''}
								placeholder={t('inventory.form.base.placeholders.oem')}
							/>
						)}
					/>
				</div>
			</div>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>{t('inventory.form.base.categoryLabel')} *</Label>
					<Controller
						name='category'
						control={control}
						render={({ field }) => (
							<Select
								value={field.value?.id ?? ''}
								onValueChange={selectedId => {
									const selectedCategory = dictionaries.categories.find(
										cat => cat.id === selectedId,
									);
									field.onChange(selectedCategory);
								}}
							>
								<SelectTrigger>
									<SelectValue
										placeholder={t(
											'inventory.form.base.placeholders.selectCategory',
										)}
									/>
								</SelectTrigger>
								<SelectContent>
									{dictionaries.categories.map(cat => (
										<SelectItem key={cat.id} value={cat.id}>
											{cat.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</div>
				<div className='grid gap-2'>
					<Label>{t('inventory.form.base.brandLabel')} *</Label>
					<Controller
						name='brand'
						control={control}
						render={({ field }) => (
							<Select
								value={field.value?.id ?? ''}
								onValueChange={selectedId => {
									const selectedBrand = dictionaries.brands.find(
										brand => brand.id === selectedId,
									);
									field.onChange(selectedBrand);
								}}
							>
								<SelectTrigger>
									<SelectValue
										placeholder={t(
											'inventory.form.base.placeholders.selectBrand',
										)}
									/>
								</SelectTrigger>
								<SelectContent>
									{dictionaries.brands.map(brand => (
										<SelectItem key={brand.id} value={brand.id}>
											{brand.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
				</div>
			</div>
			<div className='grid gap-2'>
				<Label>{t('inventory.form.base.barcodeLabel')}</Label>
				<div className='relative'>
					<Barcode className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Controller
						name='barcode'
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								value={field.value ?? ''}
								placeholder={t('inventory.form.base.placeholders.barcode')}
								className='pl-10'
							/>
						)}
					/>
				</div>
			</div>
			<div className='grid gap-2'>
				<Label>{t('inventory.form.base.compatibilityLabel')}</Label>
				<Controller
					name='compatibility'
					control={control}
					render={({ field }) => (
						<TagsInput
							value={field.value ?? []}
							onValueChange={field.onChange}
							max={10}
							addOnPaste
							editable
							blurBehavior='add'
							className='w-full'
						>
							<TagsInputList>
								{field.value?.map((item: string) => (
									<TagsInputItem key={item} value={item}>
										{item}
									</TagsInputItem>
								))}

								<TagsInputInput
									placeholder={t(
										'inventory.form.base.placeholders.addCompatibility',
									)}
								/>
							</TagsInputList>
						</TagsInput>
					)}
				/>
			</div>
		</div>
	);
}
