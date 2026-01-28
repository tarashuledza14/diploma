import { Input, Label } from '@/shared/components/ui';
import { Calendar } from 'lucide-react';
import React from 'react';

export interface DueDateInputProps {
	dueDate: string;
	setDueDate: (date: string) => void;
}

export const DueDateInput: React.FC<DueDateInputProps> = ({
	dueDate,
	setDueDate,
}) => {
	return (
		<div className='space-y-2'>
			<Label>Due Date *</Label>
			<div className='relative'>
				<Calendar className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
				<Input
					type='date'
					value={dueDate}
					onChange={e => setDueDate(e.target.value)}
					className='pl-10'
					min={new Date().toISOString().split('T')[0]}
				/>
			</div>
		</div>
	);
};
