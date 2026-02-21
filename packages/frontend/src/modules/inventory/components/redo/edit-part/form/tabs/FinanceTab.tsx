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
	Separator,
} from '@/shared';
import { DollarSign, Truck } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';

interface FinanceTabProps {
	control: Control<InventoryPart, any, InventoryPart>;
	dictionaries: InventoryDictionaries;
}

export function FinanceTab({ control, dictionaries }: FinanceTabProps) {
	return (
		<div className='space-y-4 pt-4'>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>Purchase Price *</Label>
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
									placeholder='12.50'
									className='pl-10'
								/>
							)}
						/>
					</div>
				</div>
				<div className='grid gap-2'>
					<Label>Retail Price *</Label>
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
									placeholder='24.99'
									className='pl-10'
								/>
							)}
						/>
					</div>
				</div>
			</div>
			<div className='rounded-lg border bg-muted/50 p-3'>
				<div className='flex items-center justify-between text-sm'>
					<span className='text-muted-foreground'>Calculated Markup</span>
					<span className='font-bold text-lg text-muted-foreground'>—</span>
				</div>
			</div>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>Price Category</Label>
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
									<SelectItem value='RETAIL'>RETAIL</SelectItem>
									<SelectItem value='WHOLESALE'>WHOLESALE</SelectItem>
									<SelectItem value='SPECIAL'>SPECIAL</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>
			</div>
			<Separator />
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>Supplier *</Label>
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
									<SelectValue placeholder='Select supplier' />
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
