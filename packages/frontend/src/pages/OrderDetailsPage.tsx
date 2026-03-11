import { Tabs, TabsContent } from '@/shared/components/ui';
import { GeneralInfoTab } from '../modules/orders/components/order-details/general-info/GeneralInfoTab';
import { MediaGallery } from '../modules/orders/components/order-details/media/MediaGallery';
import { OrderDetailsHeader } from '../modules/orders/components/order-details/OrderDetailsHeader';
import { PartsTab } from '../modules/orders/components/order-details/parts/PartsTab';
import { ServicesTab } from '../modules/orders/components/order-details/services/ServicesTab';
import { TabsNav } from '../modules/orders/components/order-details/tabs/TabsNav';
import { useOrderDetailsQuery } from '../modules/orders/query/useOrderDetailsQuery';
import { useParams } from 'react-router-dom';

export function OrderDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const { data: order, isLoading, error } = useOrderDetailsQuery(id);

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
		(sum, s) => sum + (s.price ?? 0) * (s.quantity ?? 1),
		0,
	);
	const partsTotal = parts.reduce(
		(sum, p) => sum + (p.quantity ?? 0) * (p.unitPrice ?? 0),
		0,
	);
	const grandTotal = servicesTotal + partsTotal;

	return (
		<div className='flex h-full flex-col'>
			<OrderDetailsHeader order={order} />
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
					<ServicesTab services={services} servicesTotal={servicesTotal} />
				</TabsContent>
				<TabsContent value='parts' className='flex-1'>
					<PartsTab
						parts={parts}
						partsTotal={partsTotal}
						servicesTotal={servicesTotal}
						grandTotal={grandTotal}
					/>
				</TabsContent>
				<TabsContent value='media' className='flex-1'>
					<MediaGallery media={media} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
