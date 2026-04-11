import {
	Button,
	DatePicker,
	Input,
	Label,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from '@/shared/components/ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DispatchTaskItem } from '../interfaces/dispatch-board.interface';

interface DispatchTaskPlanningDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	task: DispatchTaskItem | null;
	isSubmitting?: boolean;
	onSubmit: (payload: {
		additionalHours?: number;
		deadline?: string | null;
	}) => Promise<void>;
}

function toDateInputValue(value: string | null) {
	if (!value) {
		return '';
	}

	const isoDateMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
	if (isoDateMatch) {
		return isoDateMatch[0];
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return '';
	}

	return date.toISOString().slice(0, 10);
}

export function DispatchTaskPlanningDialog({
	open,
	onOpenChange,
	task,
	isSubmitting,
	onSubmit,
}: DispatchTaskPlanningDialogProps) {
	const { t } = useTranslation();
	const [additionalHours, setAdditionalHours] = useState('0');
	const [deadline, setDeadline] = useState('');

	useEffect(() => {
		if (!open || !task) {
			return;
		}

		setAdditionalHours(String(task.additionalHours ?? 0));
		setDeadline(toDateInputValue(task.deadline));
	}, [open, task]);

	const parsedAdditionalHours = useMemo(() => {
		const parsed = Number(additionalHours);
		if (!Number.isFinite(parsed) || parsed < 0) {
			return null;
		}
		return parsed;
	}, [additionalHours]);

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='max-w-lg'>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>
						{t('dispatch.dialogs.planningTitle')}
					</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						{task
							? `${task.serviceName} (#${task.orderNumber})`
							: t('dispatch.dialogs.planningDescription')}
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				<form
					className='space-y-4'
					onSubmit={event => {
						event.preventDefault();
						if (!task || parsedAdditionalHours === null) {
							return;
						}

						void onSubmit({
							additionalHours: parsedAdditionalHours,
							deadline: deadline ? `${deadline}T00:00:00.000Z` : null,
						});
					}}
				>
					<div className='space-y-2'>
						<Label htmlFor='dispatch-additional-hours'>
							{t('dispatch.fields.additionalHours')}
						</Label>
						<Input
							id='dispatch-additional-hours'
							type='number'
							min={0}
							step={0.1}
							value={additionalHours}
							onChange={event => setAdditionalHours(event.target.value)}
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='dispatch-deadline'>
							{t('dispatch.fields.deadline')}
						</Label>
						<DatePicker
							value={deadline}
							onChange={value => setDeadline(value ?? '')}
						/>
					</div>

					<ResponsiveDialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
						>
							{t('common.cancel')}
						</Button>
						<Button
							type='submit'
							disabled={isSubmitting || !task || parsedAdditionalHours === null}
						>
							{isSubmitting
								? t('common.savingChanges')
								: t('common.saveChanges')}
						</Button>
					</ResponsiveDialogFooter>
				</form>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
