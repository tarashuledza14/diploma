import { PartFormData } from '@/modules/inventory/interfaces/edit-inventory.interfaces';
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
import { Control, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface DetailsTabProps {
	control: Control<PartFormData, any, PartFormData>;
}

export function DetailsTab({ control }: DetailsTabProps) {
	const { t } = useTranslation();
	return (
		<div className='space-y-4 pt-4'>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>{t('inventory.form.details.conditionLabel')} *</Label>
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
									<SelectItem value='NEW'>
										{t('inventory.form.details.condition.new')}
									</SelectItem>
									<SelectItem value='USED'>
										{t('inventory.form.details.condition.used')}
									</SelectItem>
									<SelectItem value='REFURBISHED'>
										{t('inventory.form.details.condition.refurbished')}
									</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
				</div>
				<div className='grid gap-2'>
					<Label>{t('inventory.form.details.photoLabel')}</Label>
					<Button variant='outline' className='w-full bg-transparent'>
						<ImageIcon className='mr-2 h-4 w-4' />
						{t('inventory.form.details.uploadPhoto')}
						{/* TODO: file upload */}
					</Button>
				</div>
			</div>
			<Separator />
			<p className='text-sm font-medium'>
				{t('inventory.form.details.warrantyTitle')}
			</p>
			<div className='grid grid-cols-2 gap-4'>
				<div className='grid gap-2'>
					<Label>{t('inventory.form.details.warrantyMonthsLabel')}</Label>
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
					<Label>{t('inventory.form.details.warrantyKmLabel')}</Label>
					<Controller
						name='warrantyKm'
						control={control}
						render={({ field }) => (
							<Input
								type='number'
								{...field}
								value={field.value ?? ''}
								onChange={e => field.onChange(Number(e.target.value))}
								placeholder={t(
									'inventory.form.details.placeholders.warrantyKm',
								)}
							/>
						)}
					/>
				</div>
			</div>
			<Separator />
			<div className='grid gap-2'>
				<Label>{t('inventory.form.details.notesLabel')}</Label>
				<Controller
					name='notes'
					control={control}
					render={({ field }) => (
						<Textarea
							{...field}
							value={field.value ?? ''}
							placeholder={t('inventory.form.details.placeholders.notes')}
							rows={3}
						/>
					)}
				/>
			</div>
		</div>
	);
}
