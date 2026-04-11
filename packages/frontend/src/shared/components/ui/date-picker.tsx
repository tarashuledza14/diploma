import { format } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface DatePickerProps {
	value?: string | null;
	onChange?: (value: string | null) => void;
	placeholder?: string;
	disabled?: boolean;
}

function parseDate(value?: string | null) {
	if (!value) {
		return undefined;
	}

	const [year, month, day] = value.split('-').map(Number);
	if (!year || !month || !day) {
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? undefined : date;
	}

	const date = new Date(year, month - 1, day);
	return Number.isNaN(date.getTime()) ? undefined : date;
}

export function DatePicker({
	value,
	onChange,
	placeholder,
	disabled,
}: DatePickerProps) {
	const { t, i18n } = useTranslation();
	const [open, setOpen] = useState(false);
	const selectedDate = useMemo(() => parseDate(value), [value]);
	const language = i18n.resolvedLanguage ?? i18n.language;
	const locale = language?.startsWith('uk') ? uk : enUS;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type='button'
					variant='outline'
					disabled={disabled}
					className='w-full justify-between text-left font-normal'
				>
					{selectedDate
						? format(selectedDate, 'PPP', { locale })
						: (placeholder ?? t('table.filter.pickDate'))}
					<CalendarIcon className='ml-2 size-4 opacity-70' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0' align='start'>
				<Calendar
					mode='single'
					selected={selectedDate}
					onSelect={date => {
						onChange?.(date ? format(date, 'yyyy-MM-dd') : null);
						setOpen(false);
					}}
				/>
				<div className='flex items-center justify-between border-t px-3 py-2'>
					<Button
						type='button'
						variant='ghost'
						size='sm'
						onClick={() => {
							onChange?.(null);
							setOpen(false);
						}}
					>
						{t('common.clear')}
					</Button>
					<Button
						type='button'
						variant='ghost'
						size='sm'
						onClick={() => {
							onChange?.(format(new Date(), 'yyyy-MM-dd'));
							setOpen(false);
						}}
					>
						{t('common.today')}
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
