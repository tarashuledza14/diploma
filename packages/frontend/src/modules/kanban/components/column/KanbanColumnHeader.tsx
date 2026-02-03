import { Badge } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

export interface KanbanColumnHeaderProps {
	title: string;
	color: string;
	count: number;
}

export function KanbanColumnHeader({
	title,
	color,
	count,
}: KanbanColumnHeaderProps) {
	return (
		<div className='flex items-center gap-2'>
			<div className={cn('h-3 w-3 rounded-full', color)} />
			<h3 className='font-semibold'>{title}</h3>
			<Badge variant='secondary' className='ml-1'>
				{count}
			</Badge>
		</div>
	);
}
