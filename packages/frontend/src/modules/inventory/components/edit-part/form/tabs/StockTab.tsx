import { PartFormData } from '@/modules/inventory/interfaces/edit-inventory.interfaces';
import {
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared';
import { AlertTriangle, MapPin } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';

interface StockTabProps {
	control: Control<PartFormData, any, PartFormData>;
}

export function StockTab({ control }: StockTabProps) {
	return (
		<div className='space-y-4 pt-4'>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>Storage Location *</Label>
					<div className='relative'>
						<MapPin className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
						<Controller
							name='location'
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									value={field.value ?? ''}
									placeholder='A-3-2 (Section-Shelf-Slot)'
									className='pl-10'
								/>
							)}
						/>
					</div>
				</div>
				<div className='grid gap-2'>
					<Label>Unit of Measure</Label>
					<Controller
						name='unit'
						control={control}
						render={({ field }) => (
							<Select value={field.value ?? ''} onValueChange={field.onChange}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='шт'>шт</SelectItem>
									<SelectItem value='л'>л</SelectItem>
									<SelectItem value='комплект'>комплект</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>
			</div>
			<div className='grid grid-cols-3 gap-4'>
				<div className='grid gap-2'>
					<Label>Available</Label>
					<Controller
						name='quantityAvailable'
						control={control}
						render={({ field }) => (
							<Input
								type='number'
								{...field}
								value={field.value ?? ''}
								onChange={e => field.onChange(Number(e.target.value))}
							/>
						)}
					/>
				</div>
				{/* <div className='grid gap-2'>
					<Label>Reserved</Label>
					<Controller
						name=''
						control={control}
						render={({ field }) => (
							<Input
								type='number'
								{...field}
								value={field.value ?? ''}
								onChange={e => field.onChange(Number(e.target.value))}
							/>
						)}
					/>
				</div> */}
				<div className='grid gap-2'>
					<Label>Min Stock (Alert)</Label>
					<Controller
						name='minStock'
						control={control}
						render={({ field }) => (
							<Input
								type='number'
								{...field}
								value={field.value ?? ''}
								onChange={e => field.onChange(Number(e.target.value))}
							/>
						)}
					/>
				</div>
			</div>
			<div className='rounded-lg border bg-muted/50 p-3'>
				<div className='flex items-center gap-2 text-sm'>
					<AlertTriangle className='h-4 w-4 text-amber-500' />
					<span className='text-muted-foreground'>
						Alert will trigger when available quantity drops below{' '}
						<span className='font-medium text-foreground'>
							{control._formValues?.minStock ?? ''}
						</span>{' '}
						{control._formValues?.unit ?? ''}
					</span>
				</div>
			</div>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>Weight</Label>
					<Controller
						name='weight'
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								value={field.value ?? ''}
								placeholder='0.3 kg'
							/>
						)}
					/>
				</div>
				<div className='grid gap-2'>
					<Label>Dimensions</Label>
					<Controller
						name='dimensions'
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								value={field.value ?? ''}
								placeholder='95 x 95 x 75 mm'
							/>
						)}
					/>
				</div>
			</div>
		</div>
	);
}
