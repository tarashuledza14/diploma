import {
	InventoryDictionaries,
	InventoryPart,
} from '@/modules/inventory/interfaces/inventory.interfaces';
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

interface BaseInfoTabProps {
	control: Control<InventoryPart, any, InventoryPart>;
	dictionaries: InventoryDictionaries;
}

export function BaseInfoTab({ control, dictionaries }: BaseInfoTabProps) {
	return (
		<div className='space-y-4 pt-4'>
			<div className='grid gap-2'>
				<Label>Part Name *</Label>
				<Controller
					name='name'
					control={control}
					render={({ field }) => <Input {...field} placeholder='Oil Filter' />}
				/>
			</div>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>SKU (Internal) *</Label>
					<Controller
						name='sku'
						control={control}
						render={({ field }) => <Input {...field} placeholder='OF-12345' />}
					/>
				</div>
				<div className='grid gap-2'>
					<Label>OEM Number</Label>
					<Controller
						name='oem'
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								value={field.value ?? ''}
								placeholder='04152-YZZA1'
							/>
						)}
					/>
				</div>
			</div>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>Category *</Label>
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
									<SelectValue placeholder='Select category' />
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
					<Label>Brand *</Label>
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
									<SelectValue placeholder='Select brand' />
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
				<Label>Barcode</Label>
				<div className='relative'>
					<Barcode className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Controller
						name='barcode'
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								value={field.value ?? ''}
								placeholder='4047024743892'
								className='pl-10'
							/>
						)}
					/>
				</div>
			</div>
			<div className='grid gap-2'>
				<Label>Compatibility</Label>
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

								<TagsInputInput placeholder='Add model...' />
							</TagsInputList>
						</TagsInput>
					)}
				/>
			</div>
		</div>
	);
}
