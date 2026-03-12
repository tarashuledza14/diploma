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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarIcon, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { KanbanOrder } from './OrderCard';

interface Mechanic {
	id: string;
	name: string;
}

interface OrderCardFooterProps {
	order: KanbanOrder;
	mechanics: Mechanic[];
}

export function OrderCardFooter({ order, mechanics }: OrderCardFooterProps) {
	const queryClient = useQueryClient();
	const [mechanicOpen, setMechanicOpen] = useState(false);
	const [dateOpen, setDateOpen] = useState(false);

	const { mutate: quickUpdate } = useMutation({
		mutationFn: (data: {
			mechanicId?: string | null;
			endDate?: string | null;
		}) => OrdersService.quickUpdateOrder(order.id, data),
		onSuccess: () => {
			queryClient.refetchQueries({
				queryKey: ordersKeys.list({ filters: [], page: 1, perPage: 500 }),
			});
		},
		onError: () => toast.error('Failed to update order'),
	});

	const handleMechanicSelect = (mechanicId: string) => {
		quickUpdate({
			mechanicId: mechanicId === 'unassigned' ? null : mechanicId,
		});
		setMechanicOpen(false);
	};

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
							{currentDate ? currentDate.toLocaleDateString() : 'No due date'}
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
									Clear date
								</Button>
							</div>
						)}
					</PopoverContent>
				</Popover>
			</div>

			<div className='mt-1.5'>
				<Popover open={mechanicOpen} onOpenChange={setMechanicOpen}>
					<PopoverTrigger asChild>
						<Button
							variant='ghost'
							size='sm'
							className='h-auto gap-1.5 px-1 py-0.5 text-xs text-muted-foreground hover:text-foreground'
							onPointerDown={stopDrag}
							onMouseDown={stopDrag}
							onClick={e => e.stopPropagation()}
						>
							<UserIcon className='h-3 w-3' />
							{order.assignedTo.name}
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className='w-48 p-2'
						align='start'
						onClick={e => e.stopPropagation()}
						onPointerDownCapture={stopDrag}
						onMouseDownCapture={stopDrag}
					>
						<p className='mb-1.5 text-xs font-medium text-muted-foreground'>
							Assign mechanic
						</p>
						<Select
							value={order.assignedTo.id ?? 'unassigned'}
							onValueChange={handleMechanicSelect}
						>
							<SelectTrigger className='h-8 text-xs'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='unassigned' className='text-xs'>
									Unassigned
								</SelectItem>
								{mechanics.map(m => (
									<SelectItem key={m.id} value={m.id} className='text-xs'>
										{m.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</PopoverContent>
				</Popover>
			</div>
		</>
	);
}
