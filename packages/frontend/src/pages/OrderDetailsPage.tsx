// TODO: Import useQuery from @tanstack/react-query
// TODO: Import OrderService, ServiceCatalogService, PartsService from services/

import { Tabs, TabsContent } from '@/shared/components/ui';
import { GeneralInfoTab } from '../modules/orders/components/order-details/general-info/GeneralInfoTab';
import { MediaGallery } from '../modules/orders/components/order-details/media/MediaGallery';
import { OrderDetailsHeader } from '../modules/orders/components/order-details/OrderDetailsHeader';
import { PartsTab } from '../modules/orders/components/order-details/parts/PartsTab';
import { ServicesTab } from '../modules/orders/components/order-details/services/ServicesTab';
import { TabsNav } from '../modules/orders/components/order-details/tabs/TabsNav';

/**
 * Mock order data - Replace with useQuery(['orders', orderId])
 */
const mockOrder = {
	id: 'ORD-003',
	status: 'in_progress',
	priority: 'high',
	createdAt: '2026-01-15T10:00:00Z',
	dueDate: '2026-01-19T18:00:00Z',
	estimatedCompletion: '2026-01-19T16:00:00Z',
	notes:
		'Customer mentioned unusual noise from front wheels. Check brake pads.',
	vehicle: {
		id: 'VEH-001',
		make: 'Audi',
		model: 'A4',
		year: 2023,
		plate: 'DEF-9012',
		vin: 'WAUZZZ8V3NA012345',
		color: 'Black',
		mileage: 45000,
	},
	client: {
		id: 'CLI-001',
		name: 'Robert Brown',
		email: 'robert.brown@email.com',
		phone: '+1 (555) 123-4567',
		avatar: '/avatars/client3.jpg',
		address: '123 Main Street, New York, NY 10001',
	},
	assignedTo: {
		id: 'MECH-001',
		name: 'Mike Johnson',
		avatar: '/avatars/mechanic1.jpg',
		specialty: 'Engine & Transmission',
	},
};

/**
 * Mock services data - Replace with actual services from order
 */
const mockServices = [
	{
		id: 'SRV-001',
		name: 'Full Service',
		description: 'Complete vehicle inspection and maintenance',
		price: 299.99,
		laborHours: 3,
		status: 'in_progress',
	},
	{
		id: 'SRV-002',
		name: 'Tire Rotation',
		description: 'Rotate all four tires for even wear',
		price: 49.99,
		laborHours: 0.5,
		status: 'completed',
	},
	{
		id: 'SRV-003',
		name: 'Brake Inspection',
		description: 'Inspect brake pads, rotors, and fluid',
		price: 79.99,
		laborHours: 1,
		status: 'pending',
	},
];

/**
 * Mock parts data - Replace with actual parts from order
 */
const mockParts = [
	{
		id: 'PRT-001',
		name: 'Oil Filter',
		sku: 'OF-12345',
		quantity: 1,
		unitPrice: 24.99,
		status: 'in_stock',
	},
	{
		id: 'PRT-002',
		name: 'Engine Oil 5W-30 (5L)',
		sku: 'EO-5W30-5L',
		quantity: 1,
		unitPrice: 45.99,
		status: 'in_stock',
	},
	{
		id: 'PRT-003',
		name: 'Air Filter',
		sku: 'AF-98765',
		quantity: 1,
		unitPrice: 34.99,
		status: 'ordered',
	},
	{
		id: 'PRT-004',
		name: 'Brake Pads (Front)',
		sku: 'BP-FRONT-A4',
		quantity: 2,
		unitPrice: 89.99,
		status: 'in_stock',
	},
];

/**
 * Mock media files - Replace with actual media from order
 */
const mockMedia = [
	{
		id: 'MED-001',
		name: 'Front_Damage.jpg',
		type: 'image',
		size: '2.4 MB',
		uploadedAt: '2026-01-15T10:30:00Z',
		uploadedBy: 'Mike Johnson',
		url: '/uploads/front-damage.jpg',
	},
	{
		id: 'MED-002',
		name: 'Engine_Bay.jpg',
		type: 'image',
		size: '1.8 MB',
		uploadedAt: '2026-01-15T11:00:00Z',
		uploadedBy: 'Mike Johnson',
		url: '/uploads/engine-bay.jpg',
	},
	{
		id: 'MED-003',
		name: 'Inspection_Report.pdf',
		type: 'document',
		size: '450 KB',
		uploadedAt: '2026-01-16T09:00:00Z',
		uploadedBy: 'Mike Johnson',
		url: '/uploads/inspection-report.pdf',
	},
];

const statusColors = {
	new: 'bg-blue-100 text-blue-700',
	in_progress: 'bg-amber-100 text-amber-700',
	waiting_parts: 'bg-orange-100 text-orange-700',
	done: 'bg-green-100 text-green-700',
};

const priorityColors = {
	high: 'bg-red-100 text-red-700',
	medium: 'bg-amber-100 text-amber-700',
	low: 'bg-green-100 text-green-700',
};

const serviceStatusColors = {
	pending: 'bg-gray-100 text-gray-700',
	in_progress: 'bg-blue-100 text-blue-700',
	completed: 'bg-green-100 text-green-700',
};

const partStatusColors = {
	in_stock: 'bg-green-100 text-green-700',
	ordered: 'bg-amber-100 text-amber-700',
	out_of_stock: 'bg-red-100 text-red-700',
};

export function OrderDetailsPage() {
	// TODO: Replace mock data with actual API call
	// const { data: order, isLoading, error } = useQuery({
	//   queryKey: ['orders', orderId],
	//   queryFn: () => OrderService.getById(orderId)
	// })

	// TODO: Calculate total price based on quantity * price
	const servicesTotal = mockServices.reduce((sum, s) => sum + s.price, 0);
	const partsTotal = mockParts.reduce(
		(sum, p) => sum + p.quantity * p.unitPrice,
		0,
	);
	const grandTotal = servicesTotal + partsTotal;

	return (
		<div className='flex h-full flex-col'>
			{/* Page Header */}
			<OrderDetailsHeader order={mockOrder} />

			{/* Tabs Content */}
			<Tabs defaultValue='general' className='flex-1'>
				<TabsNav
					servicesCount={mockServices.length}
					partsCount={mockParts.length}
					mediaCount={mockMedia.length}
				/>

				{/* Tab 1: General Info */}
				<TabsContent value='general' className='flex-1'>
					<GeneralInfoTab order={mockOrder} />
				</TabsContent>

				{/* Tab 2: Services */}
				<TabsContent value='services' className='flex-1'>
					<ServicesTab services={mockServices} servicesTotal={servicesTotal} />
				</TabsContent>

				{/* Tab 3: Parts */}
				<TabsContent value='parts' className='flex-1'>
					<PartsTab
						parts={mockParts}
						partsTotal={partsTotal}
						servicesTotal={servicesTotal}
						grandTotal={grandTotal}
					/>
				</TabsContent>

				{/* Tab 4: Media */}
				<TabsContent value='media' className='flex-1'>
					{/* MediaGallery is a new component in Media/ */}
					<MediaGallery media={mockMedia} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
