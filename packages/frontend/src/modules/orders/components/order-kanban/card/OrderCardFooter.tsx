import { OrdersService } from '@/modules/orders/api';
import { ordersKeys } from '@/modules/orders/queries/keys';
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Button,
	Calendar,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/shared/components/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { KanbanOrder } from './OrderCard';

interface OrderCardFooterProps {
	order: KanbanOrder;
}

export function OrderCardFooter({ order }: OrderCardFooterProps) {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const [dateOpen, setDateOpen] = useState(false);

	const { mutate: quickUpdate } = useMutation({
		mutationFn: (data: { endDate?: string | null }) =>
			OrdersService.quickUpdateOrder(order.id, data),
		onSuccess: () => {
			queryClient.refetchQueries({
				queryKey: ordersKeys.list({ filters: [], page: 1, perPage: 500 }),
			});
		},
		onError: () => toast.error(t('orders.newOrder.messages.updateError')),
	});

	const handleDateSelect = (date: Date | undefined) => {
		quickUpdate({ endDate: date ? date.toISOString() : null });
		setDateOpen(false);
	};

	const stopDrag = (e: React.PointerEvent | React.MouseEvent) => {
		e.stopPropagation();
	};

	const currentDate = order.dueDate ? new Date(order.dueDate) : undefined;

	return (
		<>
			<div className='flex items-center justify-between border-t border-border pt-2'>
				<div className='flex items-center gap-2'>
					<Avatar className='h-6 w-6'>
						<AvatarImage src={order.client.avatar || '/placeholder.svg'} />
						<AvatarFallback>
							{order.client.name
								.split(' ')
								.map(n => n[0])
								.join('')}
						</AvatarFallback>
					</Avatar>
					<span className='text-xs text-muted-foreground'>
						{order.client.name}
					</span>
				</div>

				<Popover open={dateOpen} onOpenChange={setDateOpen}>
					<PopoverTrigger asChild>
						<Button
							variant='ghost'
							size='sm'
							className='h-auto gap-1 px-1 py-0.5 text-xs text-muted-foreground hover:text-foreground'
							onPointerDown={stopDrag}
							onMouseDown={stopDrag}
							onClick={e => e.stopPropagation()}
						>
							<CalendarIcon className='h-3 w-3' />
							{currentDate
								? currentDate.toLocaleDateString()
								: t('orders.newOrder.labels.noDueDate')}
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className='w-auto p-0'
						align='end'
						onClick={e => e.stopPropagation()}
						onPointerDownCapture={stopDrag}
						onMouseDownCapture={stopDrag}
					>
						<div onPointerDownCapture={stopDrag} onMouseDownCapture={stopDrag}>
							<Calendar
								mode='single'
								selected={currentDate}
								onSelect={handleDateSelect}
								initialFocus
							/>
						</div>
						{currentDate && (
							<div className='border-t p-2'>
								<Button
									variant='ghost'
									size='sm'
									className='w-full text-xs text-muted-foreground'
									onPointerDownCapture={stopDrag}
									onMouseDownCapture={stopDrag}
									onClick={() => handleDateSelect(undefined)}
								>
									{t('orders.newOrder.actions.clearDate')}
								</Button>
							</div>
						)}
					</PopoverContent>
				</Popover>
			</div>
		</>
	);
}
