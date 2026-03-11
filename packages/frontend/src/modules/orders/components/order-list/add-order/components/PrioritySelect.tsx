import {
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/';
import React from 'react';
import { OrderPriority } from '../../../../interfaces/order.enums';

export interface PrioritySelectProps {
	priority: OrderPriority;
	setPriority: (priority: OrderPriority) => void;
}

export const PrioritySelect: React.FC<PrioritySelectProps> = ({
	priority,
	setPriority,
}) => {
	return (
		<div className='space-y-2'>
			<Label>Priority</Label>
			<Select
				value={priority}
				onValueChange={value => setPriority(value as OrderPriority)}
			>
				<SelectTrigger>
					<SelectValue placeholder='Select priority' />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value={OrderPriority.LOW}>
						<div className='flex items-center gap-2'>
							<div className='h-2 w-2 rounded-full bg-green-500' />
							Low
						</div>
					</SelectItem>
					<SelectItem value={OrderPriority.MEDIUM}>
						<div className='flex items-center gap-2'>
							<div className='h-2 w-2 rounded-full bg-amber-500' />
							Medium
						</div>
					</SelectItem>
					<SelectItem value={OrderPriority.HIGH}>
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
