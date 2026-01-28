import {
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/';
import React from 'react';

export interface PrioritySelectProps {
	priority: string;
	setPriority: (priority: string) => void;
}

export const PrioritySelect: React.FC<PrioritySelectProps> = ({
	priority,
	setPriority,
}) => {
	return (
		<div className='space-y-2'>
			<Label>Priority</Label>
			<Select value={priority} onValueChange={setPriority}>
				<SelectTrigger>
					<SelectValue placeholder='Select priority' />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value='low'>
						<div className='flex items-center gap-2'>
							<div className='h-2 w-2 rounded-full bg-green-500' />
							Low
						</div>
					</SelectItem>
					<SelectItem value='medium'>
						<div className='flex items-center gap-2'>
							<div className='h-2 w-2 rounded-full bg-amber-500' />
							Medium
						</div>
					</SelectItem>
					<SelectItem value='high'>
						<div className='flex items-center gap-2'>
							<div className='h-2 w-2 rounded-full bg-red-500' />
							High
						</div>
					</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
};
