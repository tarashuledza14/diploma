import { useUserStore } from '@/modules/auth';
import { CreateOrderPayload, OrdersService } from '@/modules/orders/api';
import {
	OrderPartItem,
	OrderServiceItem,
} from '@/modules/orders/interfaces/new-order.interface';
import { mergeMechanicsWithWorkload } from '@/modules/orders/lib/merge-mechanics-with-workload';
import { ordersKeys } from '@/modules/orders/queries/keys';
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/shared/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';
import { OrderPriority, OrderStatus } from '../../../interfaces/order.enums';
import { NewOrderFormContent } from './NewOrderFormContent';

const newOrderSchema = z.object({
	clientId: z.string().min(1, 'Client is required'),
	vehicleId: z.string().min(1, 'Vehicle is required'),
	mileage: z.number().min(1, 'Mileage must be greater than 0'),
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

type NewOrderForm = z.infer<typeof newOrderSchema>;

interface NewOrderModalProps {
	trigger?: React.ReactNode;
	defaultStatus?: OrderStatus;
}

export function NewOrderModal({
	trigger,
	defaultStatus = OrderStatus.NEW,
}: NewOrderModalProps) {
	const { t } = useTranslation();
	const role = useUserStore(state => state.user?.role);
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();
	const minMileageRef = useRef(0);
	const canSeeWorkload = role === 'ADMIN' || role === 'MANAGER';

	const form = useForm<NewOrderForm>({
		resolver: zodResolver(newOrderSchema),
		defaultValues: {
			clientId: '',
			vehicleId: '',
			mileage: 0,
			priority: OrderPriority.MEDIUM,
			services: [],
			parts: [],
			notes: '',
			status: defaultStatus,
		},
	});

	useEffect(() => {
		if (open) {
			form.setValue('status', defaultStatus);
		}
	}, [open, defaultStatus, form]);

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

	const { data: meta } = useQuery({
		queryKey: ordersKeys.meta(),
		queryFn: () => OrdersService.getNewOrderMeta(),
	});

	const { data: mechanicsWorkload } = useQuery({
		queryKey: ordersKeys.workload(),
		queryFn: () => OrdersService.getMechanicsWorkload(),
		enabled: open && canSeeWorkload,
		staleTime: 30_000,
	});

	const clients = meta?.clients ?? [];
	const vehicles = meta?.vehicles ?? [];
	const servicesMeta = meta?.services ?? [];
	const mechanics = mergeMechanicsWithWorkload(
		meta?.mechanics ?? [],
		mechanicsWorkload ?? [],
	);
	const parts = meta?.parts ?? [];

	const clientId = form.watch('clientId');
	const vehicleId = form.watch('vehicleId');
	const selectedServices = form.watch('services');
	const selectedParts = form.watch('parts');

	const clientVehicles = clientId
		? vehicles.filter((v: any) => v.clientId === clientId)
		: vehicles;

	useEffect(() => {
		if (vehicleId) {
			const selectedVehicle = vehicles.find((v: any) => v.id === vehicleId);
			const newMinMileage = selectedVehicle?.lastMileage || 0;
			minMileageRef.current = newMinMileage;

			const currentMileage = form.getValues('mileage');
			if (newMinMileage > 0 && currentMileage < newMinMileage) {
				form.setValue('mileage', newMinMileage, { shouldValidate: false });
				form.clearErrors('mileage');
			}
		} else {
			minMileageRef.current = 0;
			form.clearErrors('mileage');
		}
	}, [vehicleId, vehicles]);

	const [autoFilledParts, setAutoFilledParts] = useState<Set<string>>(
		new Set(),
	);

	useEffect(() => {
		if (!vehicleId) {
			return;
		}

		const activeServiceIds = selectedServices
			.map(s => s.serviceId)
			.filter(Boolean);

		if (activeServiceIds.length === 0) {
			const currentParts = form.getValues('parts');
			const manualParts = currentParts.filter(
				part => !autoFilledParts.has(part.partId),
			);

			if (manualParts.length !== currentParts.length) {
				form.setValue('parts', manualParts);
				setAutoFilledParts(new Set());
				toast.info(t('orders.newOrder.messages.autoFillCleared'));
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

				const allPartsMeta = parts || [];
				const newAutoParts = Array.from(allRecommendedParts)
					.map(partId => allPartsMeta.find((p: any) => p.id === partId))
					.filter(Boolean)
					.map((part: any) => ({
						partId: part.id,
						quantity: 1,
					}));

				const updatedParts = [...manualParts, ...newAutoParts];

				form.setValue('parts', updatedParts);
				setAutoFilledParts(new Set(Array.from(allRecommendedParts)));

				if (newAutoParts.length > 0) {
					toast.success(
						t('orders.newOrder.messages.autoFillUpdated', {
							count: newAutoParts.length,
						}),
						{ duration: 3000 },
					);
				}
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
			(s: any) => s.id === service.serviceId,
		);
		return sum + (serviceData?.price || 0);
	}, 0);

	const partsTotal = selectedParts.reduce((sum, part) => {
		const partData = parts.find((p: any) => p.id === part.partId);
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

	const { mutateAsync: createOrder, isPending } = useMutation({
		mutationFn: (payload: CreateOrderPayload) =>
			OrdersService.createOrder(payload),
		onSuccess: async () => {
			toast.success(t('orders.newOrder.messages.createSuccess'));
			await queryClient.invalidateQueries({
				queryKey: ordersKeys.lists(),
			});

			setOpen(false);
			form.reset();
			setAutoFilledParts(new Set());
		},
		onError: (error: any) => {
			console.error('Error creating order:', error);
			const errorMessage =
				error?.response?.data?.message ||
				error.message ||
				t('orders.newOrder.messages.createError');
			toast.error(errorMessage);
		},
	});

	const onSubmit = async (data: NewOrderForm) => {
		const minMil = minMileageRef.current;
		if (minMil > 0 && data.mileage < minMil) {
			form.setError('mileage', {
				message: t('orders.newOrder.messages.minMileageError', {
					min: minMil.toLocaleString(),
				}),
			});
			return;
		}
		try {
			await createOrder(data as CreateOrderPayload);
		} catch (error) {
			console.error('Failed to create order:', error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button>
						<Plus className='mr-2 h-4 w-4' />
						{t('orders.newOrder.actions.newWorkOrder')}
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-hidden'>
				<DialogHeader>
					<DialogTitle>{t('orders.newOrder.dialogs.builderTitle')}</DialogTitle>
					<DialogDescription>
						{t('orders.newOrder.dialogs.builderDescription')}
					</DialogDescription>
				</DialogHeader>
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
					onCancel={() => setOpen(false)}
					submitLabel={t('orders.newOrder.actions.createWorkOrder')}
					pendingSubmitLabel={t('orders.newOrder.actions.creatingWorkOrder')}
					minMileage={minMileageRef.current}
				/>
			</DialogContent>
		</Dialog>
	);
}
