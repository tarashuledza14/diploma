import {
	Button,
	Calendar,
	Label,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import React from 'react';
import { enUS, uk } from 'react-day-picker/locale';
import { useTranslation } from 'react-i18next';

export interface DueDateInputProps {
	dueDate: Date | undefined;
	setDueDate: (date: Date | undefined) => void;
	dueDateOpen: boolean;
	setDueDateOpen: (open: boolean) => void;
}

export const DueDateInput: React.FC<DueDateInputProps> = ({
	dueDate,
	setDueDate,
	dueDateOpen,
	setDueDateOpen,
}) => {
	const language = useTranslation().i18n.language;

	const lang = language === 'en' ? enUS : uk;
	return (
		<div className='space-y-2'>
			<Label>Due Date *</Label>
			<Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						className={cn(
							'w-full justify-start text-left font-normal bg-transparent',
							!dueDate && 'text-muted-foreground',
						)}
					>
						<CalendarIcon className='mr-2 h-4 w-4' />
						{dueDate ? dayjs(dueDate).format('MMMM D, YYYY') : 'Select a date'}
					</Button>
				</PopoverTrigger>
				<PopoverContent className='p-0' align='start'>
					<Calendar
						mode='single'
						selected={dueDate}
						onSelect={date => {
							setDueDate(date);
							setDueDateOpen(false);
						}}
						captionLayout='label'
						className='rounded-lg border w-full h-full'
						locale={lang}
						disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
};
