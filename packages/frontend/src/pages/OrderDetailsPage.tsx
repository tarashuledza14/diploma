import { Tabs, TabsContent } from '@/shared/components/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { OrdersService, UpdateOrderPayload } from '../modules/orders/api';
import { EditOrderModal } from '../modules/orders/components/order-list/EditOrderModal';
import { GeneralInfoTab } from '../modules/orders/components/order-details/general-info/GeneralInfoTab';
import { MediaGallery } from '../modules/orders/components/order-details/media/MediaGallery';
import { OrderDetailsHeader } from '../modules/orders/components/order-details/OrderDetailsHeader';
import { PartsTab } from '../modules/orders/components/order-details/parts/PartsTab';
import { ServicesTab } from '../modules/orders/components/order-details/services/ServicesTab';
import { TabsNav } from '../modules/orders/components/order-details/tabs/TabsNav';
import { NewOrderMeta } from '../modules/orders/interfaces/new-order-meta.interface';
import {
	OrderPartItem,
	OrderServiceItem,
} from '../modules/orders/interfaces/new-order.interface';
import {
	OrderDetailsPart,
	OrderDetailsService,
	OrderDetails,
} from '../modules/orders/interfaces/order-details.interface';
import {
	OrderPriority,
	OrderStatus,
} from '../modules/orders/interfaces/order.enums';
import { ordersKeys } from '../modules/orders/queries/keys';
import { useOrderDetailsQuery } from '../modules/orders/query/useOrderDetailsQuery';

const normalizePriority = (value?: string) =>
	String(value ?? OrderPriority.MEDIUM).toUpperCase() as OrderPriority;

const normalizeStatus = (value?: string) =>
	String(value ?? OrderStatus.NEW).toUpperCase() as OrderStatus;

const toEditOrderSource = (order: OrderDetails) => ({
	id: order.id,
	priority: normalizePriority(order.priority),
	status: normalizeStatus(order.status),
	client: {
		id: order.client?.id ?? '',
	},
	vehicle: {
		id: order.vehicle?.id ?? '',
	},
});

interface ServicePartGroup {
	serviceId: string;
	serviceName: string;
	parts: OrderDetailsPart[];
}

export function OrderDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { data: order, isLoading, error } = useOrderDetailsQuery(id);
	const queryClient = useQueryClient();
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [autoFilledPartIds, setAutoFilledPartIds] = useState<Set<string>>(
		new Set(),
	);

	const { data: meta } = useQuery<NewOrderMeta>({
		queryKey: ordersKeys.meta(),
		queryFn: () => OrdersService.getNewOrderMeta(),
		enabled: !!order,
	});

	const servicesMeta = meta?.services ?? [];
	const partsMeta = meta?.parts ?? [];

	const serviceIdByName = useMemo(
		() => new Map(servicesMeta.map(service => [service.name, service.id])),
		[servicesMeta],
	);
	const partIdByName = useMemo(
		() => new Map(partsMeta.map(part => [part.name, part.id])),
		[partsMeta],
	);

	const mappedServices = useMemo<OrderServiceItem[]>(() => {
		if (!order) {
			return [];
		}

		return (order.services ?? [])
			.map((service: OrderDetailsService) => ({
				serviceId: service.serviceId ?? serviceIdByName.get(service.name) ?? '',
				mechanicId: service.mechanicId ?? undefined,
			}))
			.filter((service: OrderServiceItem) => Boolean(service.serviceId));
	}, [order, serviceIdByName]);

	const mappedParts = useMemo<OrderPartItem[]>(() => {
		if (!order) {
			return [];
		}

		return (order.parts ?? [])
			.map((part: OrderDetailsPart) => ({
				partId: part.partId ?? partIdByName.get(part.name) ?? '',
				quantity: part.quantity,
			}))
			.filter((part: OrderPartItem) => Boolean(part.partId));
	}, [order, partIdByName]);

	const serviceRows = useMemo(
		() =>
			(order?.services ?? [])
				.map((service: OrderDetailsService) => ({
					serviceId:
						service.serviceId ?? serviceIdByName.get(service.name) ?? '',
					serviceName: service.name,
				}))
				.filter(item => Boolean(item.serviceId)),
		[order, serviceIdByName],
	);

	const { data: recommendedPartsByService = {} } = useQuery({
		queryKey: [
			...ordersKeys.all,
			'recommended-parts-map',
			order?.vehicle?.id,
			serviceRows.map(row => row.serviceId).join(','),
		],
		queryFn: async () => {
			if (!order?.vehicle?.id || serviceRows.length === 0) {
				return {} as Record<string, Set<string>>;
			}

			const uniqueServiceIds = Array.from(
				new Set(serviceRows.map(row => row.serviceId)),
			);

			const recommendations = await Promise.all(
				uniqueServiceIds.map(async serviceId => {
					try {
						const rec =
							(await OrdersService.getRecommendedParts(
								order.vehicle!.id,
								serviceId,
							)) ?? [];
						return {
							serviceId,
							partIds: new Set<string>(
								rec
									.map((part: any) => part?.id)
									.filter((partId: string | undefined) => Boolean(partId)),
							),
						};
					} catch {
						return { serviceId, partIds: new Set<string>() };
					}
				}),
			);

			return recommendations.reduce(
				(acc, item) => {
					acc[item.serviceId] = item.partIds;
					return acc;
				},
				{} as Record<string, Set<string>>,
			);
		},
		enabled: Boolean(order?.vehicle?.id && serviceRows.length > 0),
	});

	const servicePartGroups = useMemo<ServicePartGroup[]>(() => {
		const currentParts = order?.parts ?? [];
		const uniqueServiceMap = new Map<string, string>();

		serviceRows.forEach(row => {
			if (!uniqueServiceMap.has(row.serviceId)) {
				uniqueServiceMap.set(row.serviceId, row.serviceName);
			}
		});

		return Array.from(uniqueServiceMap.entries())
			.map(([serviceId, serviceName]) => {
				const relatedPartIds =
					recommendedPartsByService[serviceId] ?? new Set();
				const parts = currentParts.filter((part: OrderDetailsPart) => {
					const partId = part.partId ?? partIdByName.get(part.name) ?? '';
					return partId ? relatedPartIds.has(partId) : false;
				});

				return {
					serviceId,
					serviceName,
					parts,
				};
			})
			.filter(group => group.parts.length > 0);
	}, [order, serviceRows, recommendedPartsByService, partIdByName]);

	const unassignedParts = useMemo<OrderDetailsPart[]>(() => {
		const assignedPartIds = new Set<string>();

		servicePartGroups.forEach(group => {
			group.parts.forEach((part: OrderDetailsPart) => {
				const partId = part.partId ?? partIdByName.get(part.name) ?? '';
				if (partId) {
					assignedPartIds.add(partId);
				}
			});
		});

		return (order?.parts ?? []).filter((part: OrderDetailsPart) => {
			const partId = part.partId ?? partIdByName.get(part.name) ?? '';
			return !partId || !assignedPartIds.has(partId);
		});
	}, [order, servicePartGroups, partIdByName]);

	const buildPayload = (
		services: OrderServiceItem[],
		parts: OrderPartItem[],
	): UpdateOrderPayload | null => {
		if (!order?.client?.id || !order?.vehicle?.id || !order.id) {
			return null;
		}

		return {
			clientId: order.client.id,
			vehicleId: order.vehicle.id,
			mileage: order.mileage ?? order.vehicle.mileage ?? 0,
			priority: normalizePriority(order.priority),
			services,
			parts,
			notes: order.notes ?? '',
			status: normalizeStatus(order.status),
			endDate: order.dueDate ? String(order.dueDate).split('T')[0] : undefined,
		};
	};

	const { mutateAsync: updateOrderItems, isPending: isUpdating } = useMutation({
		mutationKey: [...ordersKeys.all, 'mutations', 'order-details-update', id],
		mutationFn: async (data: {
			services: OrderServiceItem[];
			parts: OrderPartItem[];
		}) => {
			if (!order?.id) {
				throw new Error('Order not found');
			}

			const payload = buildPayload(data.services, data.parts);
			if (!payload) {
				throw new Error('Order client/vehicle data is missing');
			}

			return OrdersService.updateOrder(order.id, payload);
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ordersKeys.all }),
				id
					? queryClient.invalidateQueries({ queryKey: ordersKeys.detail(id) })
					: Promise.resolve(),
			]);
		},
		onError: (mutationError: any) => {
			const message =
				mutationError?.response?.data?.message ||
				mutationError?.message ||
				'Failed to update order items';
			toast.error(message);
		},
	});

	const { mutate: updateOrderStatus, isPending: isUpdatingStatus } = useMutation({
		mutationKey: [...ordersKeys.all, 'mutations', 'order-details-status', id],
		mutationFn: async (status: OrderStatus) => {
			if (!order?.id) {
				throw new Error('Order not found');
			}

			await OrdersService.updateBulk([order.id], { status });
		},
		onSuccess: async () => {
			toast.success('Order status updated');
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ordersKeys.lists() }),
				id
					? queryClient.invalidateQueries({ queryKey: ordersKeys.detail(id) })
					: Promise.resolve(),
			]);
		},
		onError: (mutationError: any) => {
			const message =
				mutationError?.response?.data?.message ||
				mutationError?.message ||
				'Failed to update order status';
			toast.error(message);
		},
	});

	const handleStatusChange = (status: string) => {
		if (!order) {
			return;
		}

		if (String(order.status) === status) {
			return;
		}

		updateOrderStatus(status as OrderStatus);
	};

	const { mutate: completeOrder, isPending: isCompletingOrder } = useMutation({
		mutationKey: [...ordersKeys.all, 'mutations', 'order-details-complete', id],
		mutationFn: async () => {
			if (!order?.id) {
				throw new Error('Order not found');
			}

			await OrdersService.updateBulk([order.id], {
				status: OrderStatus.COMPLETED,
			});
		},
		onSuccess: async () => {
			toast.success('Order completed');
			await queryClient.invalidateQueries({ queryKey: ordersKeys.all });
			navigate('/orders');
		},
		onError: (mutationError: any) => {
			const message =
				mutationError?.response?.data?.message ||
				mutationError?.message ||
				'Failed to complete order';
			toast.error(message);
		},
	});

	const handleCompleteOrder = () => {
		if (!order) {
			return;
		}

		if (String(order.status) === OrderStatus.COMPLETED) {
			navigate('/orders');
			return;
		}

		completeOrder();
	};

	const applyRecommendedParts = async (
		services: OrderServiceItem[],
		parts: OrderPartItem[],
	) => {
		if (!order?.vehicle?.id) {
			return { parts, nextAutoFilled: new Set<string>() };
		}

		const activeServiceIds = services
			.map(service => service.serviceId)
			.filter(Boolean);

		if (activeServiceIds.length === 0) {
			const manualParts = parts.filter(
				part => !autoFilledPartIds.has(part.partId),
			);
			return { parts: manualParts, nextAutoFilled: new Set<string>() };
		}

		const servicePartsResults = await Promise.all(
			activeServiceIds.map(async serviceId => {
				try {
					return (
						(await OrdersService.getRecommendedParts(
							order.vehicle!.id,
							serviceId,
						)) ?? []
					);
				} catch {
					return [];
				}
			}),
		);

		const recommendedPartIds = new Set<string>();
		servicePartsResults.flat().forEach((part: any) => {
			if (part?.id) {
				recommendedPartIds.add(part.id);
			}
		});

		const manualParts = parts.filter(
			part => !autoFilledPartIds.has(part.partId),
		);
		const recommendedParts = Array.from(recommendedPartIds)
			.map(partId => partsMeta.find(part => part.id === partId))
			.filter(Boolean)
			.map(part => ({
				partId: part!.id,
				quantity: 1,
			}));

		return {
			parts: [...manualParts, ...recommendedParts],
			nextAutoFilled: recommendedPartIds,
		};
	};

	const handleAddService = async (serviceId: string) => {
		const nextServices = [
			...mappedServices,
			{ serviceId, mechanicId: undefined },
		];
		const { parts: nextParts, nextAutoFilled } = await applyRecommendedParts(
			nextServices,
			mappedParts,
		);

		await updateOrderItems({ services: nextServices, parts: nextParts });
		setAutoFilledPartIds(nextAutoFilled);
		toast.success('Service added');
	};

	const handleRemoveService = async (serviceRowId: string) => {
		if (!order) {
			return;
		}

		const removedService = (order.services ?? []).find(
			(service: OrderDetailsService) => service.id === serviceRowId,
		);
		const removedServiceId =
			removedService?.serviceId ??
			(removedService ? (serviceIdByName.get(removedService.name) ?? '') : '');

		const nextServices = (order.services ?? [])
			.filter((service: OrderDetailsService) => service.id !== serviceRowId)
			.map((service: OrderDetailsService) => ({
				serviceId: service.serviceId ?? serviceIdByName.get(service.name) ?? '',
				mechanicId: service.mechanicId ?? undefined,
			}))
			.filter((service: OrderServiceItem) => Boolean(service.serviceId));

		const remainingRecommendedPartIds = new Set<string>();
		nextServices.forEach(service => {
			(
				recommendedPartsByService[service.serviceId] ?? new Set<string>()
			).forEach(partId => {
				remainingRecommendedPartIds.add(partId);
			});
		});

		const removedRecommendedPartIds = removedServiceId
			? (recommendedPartsByService[removedServiceId] ?? new Set<string>())
			: new Set<string>();

		const nextParts = mappedParts.filter(part => {
			if (!removedRecommendedPartIds.has(part.partId)) {
				return true;
			}

			return remainingRecommendedPartIds.has(part.partId);
		});

		await updateOrderItems({ services: nextServices, parts: nextParts });
		setAutoFilledPartIds(remainingRecommendedPartIds);
		toast.success('Service removed');
	};

	const handleAddPart = async (partId: string, quantity: number) => {
		const nextParts = [...mappedParts];
		const partIndex = nextParts.findIndex(part => part.partId === partId);

		if (partIndex >= 0) {
			nextParts[partIndex] = {
				...nextParts[partIndex],
				quantity: nextParts[partIndex].quantity + quantity,
			};
		} else {
			nextParts.push({ partId, quantity });
		}

		await updateOrderItems({ services: mappedServices, parts: nextParts });
		toast.success('Part added');
	};

	const handleRemovePart = async (partId: string) => {
		const nextParts = mappedParts.filter(part => part.partId !== partId);

		await updateOrderItems({ services: mappedServices, parts: nextParts });
		if (autoFilledPartIds.has(partId)) {
			setAutoFilledPartIds(prev => {
				const updated = new Set(prev);
				updated.delete(partId);
				return updated;
			});
		}
		toast.success('Part removed');
	};

	const handleUpdatePartQuantity = async (partId: string, quantity: number) => {
		const safeQuantity = Math.max(1, quantity);
		const nextParts = mappedParts.map(part =>
			part.partId === partId ? { ...part, quantity: safeQuantity } : part,
		);

		await updateOrderItems({ services: mappedServices, parts: nextParts });
	};

	if (isLoading) {
		return (
			<div className='flex h-full items-center justify-center'>
				<p className='text-muted-foreground'>Завантаження...</p>
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className='flex h-full items-center justify-center'>
				<p className='text-destructive'>
					{error instanceof Error ? error.message : 'Замовлення не знайдено'}
				</p>
			</div>
		);
	}

	const services = order.services ?? [];
	const parts = order.parts ?? [];
	const media = order.media ?? [];
	const servicesTotal = services.reduce(
		(sum: number, s: OrderDetailsService) =>
			sum + (s.price ?? 0) * (s.quantity ?? 1),
		0,
	);
	const partsTotal = parts.reduce(
		(sum: number, p: OrderDetailsPart) =>
			sum + (p.quantity ?? 0) * (p.unitPrice ?? 0),
		0,
	);
	const grandTotal = servicesTotal + partsTotal;

	return (
		<div className='flex h-full flex-col'>
			<OrderDetailsHeader
				order={order}
				onStatusChange={handleStatusChange}
				onEditOrder={() => setIsEditOpen(true)}
				onCompleteOrder={handleCompleteOrder}
				isUpdatingStatus={isUpdatingStatus}
				isCompletingOrder={isCompletingOrder}
			/>
			<Tabs defaultValue='general' className='flex-1'>
				<TabsNav
					servicesCount={services.length}
					partsCount={parts.length}
					mediaCount={media.length}
				/>
				<TabsContent value='general' className='flex-1'>
					<GeneralInfoTab order={order} />
				</TabsContent>
				<TabsContent value='services' className='flex-1'>
					<ServicesTab
						services={services}
						servicesTotal={servicesTotal}
						serviceOptions={servicesMeta}
						onAddService={handleAddService}
						onRemoveService={handleRemoveService}
						isUpdating={isUpdating}
					/>
				</TabsContent>
				<TabsContent value='parts' className='flex-1'>
					<PartsTab
						parts={parts}
						partsTotal={partsTotal}
						servicesTotal={servicesTotal}
						grandTotal={grandTotal}
						servicePartGroups={servicePartGroups}
						unassignedParts={unassignedParts}
						partOptions={partsMeta}
						onAddPart={handleAddPart}
						onRemovePart={handleRemovePart}
						onQuantityChange={handleUpdatePartQuantity}
						isUpdating={isUpdating}
					/>
				</TabsContent>
				<TabsContent value='media' className='flex-1'>
					<MediaGallery media={media} />
				</TabsContent>
			</Tabs>
			<EditOrderModal
				open={isEditOpen}
				onOpenChange={setIsEditOpen}
				order={toEditOrderSource(order)}
			/>
		</div>
	);
}
