import {
	Button,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
	Textarea,
} from '@/shared';
import { ImageIcon } from 'lucide-react';
import { Controller } from 'react-hook-form';

interface DetailsTabProps {
	control: any;
}

export function DetailsTab({ control }: DetailsTabProps) {
	return (
		<div className='space-y-4 pt-4'>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>Condition *</Label>
					<Controller
						name='condition'
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
									<SelectItem value='NEW'>New</SelectItem>
									<SelectItem value='USED'>Used</SelectItem>
									<SelectItem value='REFURBISHED'>Refurbished</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>
				<div className='grid gap-2'>
					<Label>Photo</Label>
					<Button variant='outline' className='w-full bg-transparent'>
						<ImageIcon className='mr-2 h-4 w-4' />
						Upload Photo
						{/* TODO: file upload */}
					</Button>
				</div>
			</div>
			<Separator />
			<p className='text-sm font-medium'>Warranty</p>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>Warranty (months)</Label>
					<Controller
						name='warrantyMonths'
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
				<div className='grid gap-2'>
					<Label>Warranty (km)</Label>
					<Controller
						name='warrantyKm'
						control={control}
						render={({ field }) => (
							<Input
								type='number'
								{...field}
								value={field.value ?? ''}
								onChange={e => field.onChange(Number(e.target.value))}
								placeholder='0 = no km limit'
							/>
						)}
					/>
				</div>
			</div>
			<Separator />
			<div className='grid gap-2'>
				<Label>Notes</Label>
				<Controller
					name='notes'
					control={control}
					render={({ field }) => (
						<Textarea
							{...field}
							value={field.value ?? ''}
							placeholder='Any additional info about this part...'
							rows={3}
						/>
					)}
				/>
			</div>
		</div>
	);
}
