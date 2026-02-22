import { PartFormData } from '@/modules/inventory/interfaces/edit-inventory.interfaces';
import {
	InventoryDictionaries,
	InventoryPart,
} from '@/modules/inventory/interfaces/inventory.interfaces';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared';
import { useForm } from 'react-hook-form';
import { BaseInfoTab } from './tabs/BaseInfoTab';
import { DetailsTab } from './tabs/DetailsTab';
import { FinanceTab } from './tabs/FinanceTab';
import { StockTab } from './tabs/StockTab';

interface EditPartFormProps {
	inventoryPart?: InventoryPart;
	onSubmit: (data: Partial<InventoryPart>) => void; // Віддаємо наверх вже правильний тип
	isSubmitting: boolean;
	dictionaries: InventoryDictionaries;
}

export function EditPartForm({
	inventoryPart,
	onSubmit,
	isSubmitting,
	dictionaries,
}: EditPartFormProps) {
	// Якщо це редагування, розпаковуємо масиви назад у плоскі поля
	const defaultValues: Partial<PartFormData> | undefined = inventoryPart
		? {
				...inventoryPart,
				quantityAvailable:
					inventoryPart.inventory?.reduce(
						(acc, inv) => acc + inv.quantity,
						0,
					) || 0,
				purchasePrice: Number(inventoryPart.inventory?.[0]?.purchasePrice || 0),
				location: inventoryPart.inventory?.[0]?.location || '',
				retailPrice: Number(
					inventoryPart.priceRules?.find(r => r.clientType === 'RETAIL')
						?.fixedPrice || 0,
				),
				priceCategory: 'RETAIL',
			}
		: undefined;

	const { control, handleSubmit } = useForm<PartFormData>({
		defaultValues,
	});

	// 2. Трансформуємо плоскі дані ПЕРЕД відправкою на бекенд
	const handleFormSubmit = (formData: PartFormData) => {
		// Зводимо priceCategory до енумів бекенду
		const clientType =
			formData.priceCategory === 'SPECIAL'
				? 'VIP'
				: formData.priceCategory || 'RETAIL';

		// Формуємо payload у тому вигляді, який чекає нова схема Prisma
		const payload: Partial<InventoryPart> = {
			id: inventoryPart?.id,
			name: formData.name,
			sku: formData.sku,
			oem: formData.oem,
			barcode: formData.barcode,
			category: formData.category,
			brand: formData.brand,
			supplier: formData.supplier,
			compatibility: formData.compatibility || [],
			unit: formData.unit,
			minStock: formData.minStock,
			weight: formData.weight,
			dimensions: formData.dimensions,
			condition: formData.condition as any,
			warrantyMonths: formData.warrantyMonths,
			warrantyKm: formData.warrantyKm,
			notes: formData.notes,

			inventory: [
				{
					quantity: formData.quantityAvailable || 0,
					purchasePrice: formData.purchasePrice || 0,
					location: formData.location || '',
					receivedAt: new Date().toISOString(),
				} as any,
			],

			priceRules: [
				{
					clientType: clientType as any,
					fixedPrice: formData.retailPrice || 0,
					createdAt: new Date().toISOString(),
				} as any,
			],
		};

		onSubmit(payload);
	};

	return (
		<form id='edit-part-form' onSubmit={handleSubmit(handleFormSubmit)}>
			<Tabs defaultValue='base' className='w-full'>
				<TabsList className='grid w-full grid-cols-4'>
					<TabsTrigger value='base'>Base Info</TabsTrigger>
					<TabsTrigger value='stock'>Stock</TabsTrigger>
					<TabsTrigger value='finance'>Finance</TabsTrigger>
					<TabsTrigger value='details'>Details</TabsTrigger>
				</TabsList>
				<TabsContent value='base'>
					<BaseInfoTab control={control} dictionaries={dictionaries} />
				</TabsContent>
				<TabsContent value='stock'>
					<StockTab control={control} />
				</TabsContent>
				<TabsContent value='finance'>
					<FinanceTab control={control} dictionaries={dictionaries} />
				</TabsContent>
				<TabsContent value='details'>
					<DetailsTab control={control} />
				</TabsContent>
			</Tabs>
		</form>
	);
}
