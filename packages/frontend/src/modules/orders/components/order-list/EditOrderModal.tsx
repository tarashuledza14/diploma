import { OrdersService, UpdateOrderPayload } from '@/modules/orders/api';
import { NewOrderMeta } from '@/modules/orders/interfaces/new-order-meta.interface';
import {
	OrderPartItem,
	OrderServiceItem,
} from '@/modules/orders/interfaces/new-order.interface';
import { OrderDetails } from '@/modules/orders/interfaces/order-details.interface';
import {
	OrderPriority,
	OrderStatus,
} from '@/modules/orders/interfaces/order.enums';
import type { OrderListItem } from '@/modules/orders/interfaces/order.interface';
import { ordersKeys } from '@/modules/orders/queries/keys';
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from '@/shared/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useOrderDetailsQuery } from '../../query/useOrderDetailsQuery';
import { NewOrderFormContent } from './add-order/NewOrderFormContent';

interface EditOrderModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	order: EditOrderSource | null;
}

type EditOrderSource = Pick<OrderListItem, 'id' | 'priority' | 'status'> & {
	client?: Pick<OrderListItem['client'], 'id'> | null;
	vehicle?: Pick<OrderListItem['vehicle'], 'id'> | null;
};

const editOrderSchema = z.object({
	clientId: z.string().min(1, 'Client is required'),
	vehicleId: z.string().min(1, 'Vehicle is required'),
	mileage: z.number().min(0, 'Mileage must be a positive number'),
	endDate: z.string().optional(),
	priority: z.nativeEnum(OrderPriority),
	services: z.array(
		z.object({
			serviceId: z.string().min(1, 'Service is required'),
			mechanicId: z.string().optional(),
		}),
	),
	parts: z.array(
		z.object({
			partId: z.string().min(1, 'Part is required'),
			quantity: z.number().min(1, 'Quantity must be at least 1'),
		}),
	),
	notes: z.string(),
	status: z.nativeEnum(OrderStatus),
});

type EditOrderValues = z.infer<typeof editOrderSchema>;

export function EditOrderModal({
	open,
	onOpenChange,
	order,
}: EditOrderModalProps) {
	const queryClient = useQueryClient();
	const [autoFilledParts, setAutoFilledParts] = useState<Set<string>>(
		new Set(),
	);

	const { data: fetchedMeta } = useQuery<NewOrderMeta>({
		queryKey: ordersKeys.meta(),
		queryFn: () => OrdersService.getNewOrderMeta(),
		enabled: open,
	});
	const { data: orderDetails, isLoading } = useOrderDetailsQuery(
		open ? order?.id : undefined,
	);

	const form = useForm<EditOrderValues>({
		resolver: zodResolver(editOrderSchema),
		defaultValues: {
			clientId: '',
			vehicleId: '',
			mileage: 0,
			endDate: '',
			status: OrderStatus.NEW,
			priority: OrderPriority.MEDIUM,
			services: [],
			parts: [],
			notes: '',
		},
	});
	const { reset } = form;

	const {
		fields: serviceFields,
		append: appendService,
		remove: removeService,
		update: updateService,
	} = useFieldArray({
		control: form.control,
		name: 'services',
	});

	const {
		fields: partFields,
		append: appendPart,
		remove: removePart,
		update: updatePart,
	} = useFieldArray({
		control: form.control,
		name: 'parts',
	});

	const clients = fetchedMeta?.clients ?? [];
	const vehicles = fetchedMeta?.vehicles ?? [];
	const servicesMeta = fetchedMeta?.services ?? [];
	const mechanics = fetchedMeta?.mechanics ?? [];
	const parts = fetchedMeta?.parts ?? [];

	const details = orderDetails as OrderDetails | undefined;
	const vehiclesWithCurrent = useMemo(() => {
		const currentVehicle = details?.vehicle;
		const currentClientId = details?.client?.id ?? order?.client?.id ?? '';
		if (!currentVehicle?.id) {
			return vehicles;
		}

		const exists = vehicles.some(
			vehicle => String(vehicle.id) === String(currentVehicle.id),
		);

		if (exists) {
			return vehicles;
		}

		return [
			{
				id: String(currentVehicle.id),
				clientId: String(currentClientId),
				make: currentVehicle.make ?? currentVehicle.brand,
				model: currentVehicle.model,
				year: currentVehicle.year,
				licensePlate: currentVehicle.plateNumber ?? '',
			},
			...vehicles,
		];
	}, [vehicles, details, order]);

	useEffect(() => {
		if (details || order) {
			const normalizedPriority = String(
				details?.priority ?? order?.priority ?? OrderPriority.MEDIUM,
			).toUpperCase() as OrderPriority;
			const normalizedStatus = String(
				details?.status ?? order?.status ?? OrderStatus.NEW,
			).toUpperCase() as OrderStatus;
			const fallbackServiceIdByName = new Map(
				servicesMeta.map(service => [service.name, service.id]),
			);
			const fallbackPartIdByName = new Map(
				parts.map(part => [part.name, part.id]),
			);

			reset({
				clientId: String(details?.client?.id ?? order?.client?.id ?? ''),
				vehicleId: String(details?.vehicle?.id ?? order?.vehicle?.id ?? ''),
				mileage: details?.mileage ?? details?.vehicle?.mileage ?? 0,
				endDate: details?.dueDate ? String(details.dueDate).split('T')[0] : '',
				status: normalizedStatus,
				priority: normalizedPriority,
				services: (details?.services ?? []).map(service => ({
					serviceId:
						service.serviceId ??
						fallbackServiceIdByName.get(service.name) ??
						'',
					mechanicId: service.mechanicId ?? undefined,
				})),
				parts: (details?.parts ?? []).map(part => ({
					partId: part.partId ?? fallbackPartIdByName.get(part.name) ?? '',
					quantity: part.quantity,
				})),
				notes: details?.notes ?? '',
			});
			setAutoFilledParts(new Set());
		}
	}, [orderDetails, order, reset, servicesMeta, parts]);

	const clientId = form.watch('clientId');
	const vehicleId = form.watch('vehicleId');
	const selectedServices = form.watch('services');
	const selectedParts = form.watch('parts');

	useEffect(() => {
		if (!vehicleId && (details?.vehicle?.id || order?.vehicle?.id)) {
			form.setValue(
				'vehicleId',
				String(details?.vehicle?.id ?? order?.vehicle?.id ?? ''),
			);
		}
	}, [vehicleId, details, order, form]);

	const clientVehicles = clientId
		? vehiclesWithCurrent.filter(
				(vehicle: NewOrderMeta['vehicles'][number]) =>
					String(vehicle.clientId) === String(clientId) ||
					String(vehicle.id) === String(vehicleId),
			)
		: vehiclesWithCurrent;

	useEffect(() => {
		if (!vehicleId) {
			return;
		}

		const activeServiceIds = selectedServices
			.map(service => service.serviceId)
			.filter(Boolean);

		if (activeServiceIds.length === 0) {
			const currentParts = form.getValues('parts');
			const manualParts = currentParts.filter(
				part => !autoFilledParts.has(part.partId),
			);

			if (manualParts.length !== currentParts.length) {
				form.setValue('parts', manualParts);
				setAutoFilledParts(new Set());
			}
			return;
		}

		const fetchAllRecommendedParts = async () => {
			try {
				const allRecommendedParts = new Set<string>();

				for (const serviceId of activeServiceIds) {
					try {
						const serviceParts = await OrdersService.getRecommendedParts(
							vehicleId,
							serviceId,
						);
						serviceParts?.forEach((part: any) => {
							allRecommendedParts.add(part.id);
						});
					} catch (error) {
						console.warn(
							`Failed to get parts for service ${serviceId}:`,
							error,
						);
					}
				}

				const currentParts = form.getValues('parts');
				const manualParts = currentParts.filter(
					part => !autoFilledParts.has(part.partId),
				);

				const newAutoParts = Array.from(allRecommendedParts)
					.map(partId =>
						parts.find(
							(part: NewOrderMeta['parts'][number]) => part.id === partId,
						),
					)
					.filter(Boolean)
					.map((part: any) => ({
						partId: part.id,
						quantity: 1,
					}));

				form.setValue('parts', [...manualParts, ...newAutoParts]);
				setAutoFilledParts(new Set(Array.from(allRecommendedParts)));
			} catch (error) {
				console.error('Smart Auto-Fill error:', error);
			}
		};

		const timeoutId = setTimeout(fetchAllRecommendedParts, 300);
		return () => clearTimeout(timeoutId);
	}, [selectedServices, vehicleId, parts, form]);

	useEffect(() => {
		setAutoFilledParts(new Set());
	}, [vehicleId]);

	const servicesTotal = selectedServices.reduce((sum, service) => {
		const serviceData = servicesMeta.find(
			(item: NewOrderMeta['services'][number]) => item.id === service.serviceId,
		);
		return sum + (serviceData?.price || 0);
	}, 0);

	const partsTotal = selectedParts.reduce((sum, part) => {
		const partData = parts.find(
			(item: NewOrderMeta['parts'][number]) => item.id === part.partId,
		);
		return sum + (partData?.price || 0) * part.quantity;
	}, 0);

	const totalAmount = servicesTotal + partsTotal;

	const addNewService = () => {
		appendService({ serviceId: '', mechanicId: undefined });
	};

	const addNewPart = () => {
		appendPart({ partId: '', quantity: 1 });
	};

	const handleServiceChange = (
		index: number,
		field: keyof OrderServiceItem,
		value: string,
	) => {
		const currentService = serviceFields[index];
		updateService(index, { ...currentService, [field]: value });
	};

	const handlePartChange = (
		index: number,
		field: keyof OrderPartItem,
		value: string | number,
	) => {
		const currentPart = partFields[index];
		const oldPartId = currentPart.partId;

		updatePart(index, { ...currentPart, [field]: value });

		if (field === 'partId' && oldPartId && autoFilledParts.has(oldPartId)) {
			setAutoFilledParts(prev => {
				const updated = new Set(prev);
				updated.delete(oldPartId);
				return updated;
			});
		}
	};

	const handleRemovePart = (index: number) => {
		const partToRemove = partFields[index];
		if (partToRemove?.partId && autoFilledParts.has(partToRemove.partId)) {
			setAutoFilledParts(prev => {
				const updated = new Set(prev);
				updated.delete(partToRemove.partId);
				return updated;
			});
		}
		removePart(index);
	};

	const { mutateAsync, isPending } = useMutation({
		mutationKey: [...ordersKeys.all, 'mutations', 'update-order', order?.id],
		mutationFn: (values: EditOrderValues) => {
			if (!order) {
				return Promise.resolve(null);
			}

			const payload: UpdateOrderPayload = {
				...values,
				endDate: values.endDate || undefined,
			};

			return OrdersService.updateOrder(order.id, payload);
		},
		onSuccess: () => {
			toast.success('Order updated successfully');
			queryClient.invalidateQueries({ queryKey: ordersKeys.all });
			if (order?.id) {
				queryClient.invalidateQueries({
					queryKey: ordersKeys.detail(order.id),
				});
			}
			onOpenChange(false);
		},
		onError: () => {
			toast.error('Failed to update order');
		},
	});

	if (!open || !order) {
		return null;
	}

	const onSubmit = async (values: EditOrderValues) => {
		await mutateAsync(values);
	};

	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='max-w-4xl max-h-[90vh] overflow-hidden'>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>Edit Order</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						Update the full work order for the selected client and vehicle.
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				{isLoading || !fetchedMeta || !orderDetails ? null : (
					<NewOrderFormContent
						form={form}
						handleSubmit={form.handleSubmit(onSubmit)}
						clients={clients}
						clientId={clientId}
						clientVehicles={clientVehicles}
						servicesMeta={servicesMeta}
						mechanics={mechanics}
						parts={parts}
						serviceFields={serviceFields}
						partFields={partFields}
						addNewService={addNewService}
						addNewPart={addNewPart}
						handleServiceChange={handleServiceChange}
						handlePartChange={handlePartChange}
						handleRemoveService={removeService}
						handleRemovePart={handleRemovePart}
						servicesTotal={servicesTotal}
						partsTotal={partsTotal}
						totalAmount={totalAmount}
						isPending={isPending}
						onCancel={() => onOpenChange(false)}
						submitLabel='Save Changes'
						pendingSubmitLabel='Saving Changes...'
						showStatusField
						showEndDateField
					/>
				)}
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
