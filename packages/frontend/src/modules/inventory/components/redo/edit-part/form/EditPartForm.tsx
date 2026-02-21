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
	onSubmit: (data: any) => void;
	isSubmitting: boolean;
	dictionaries: InventoryDictionaries;
}

export function EditPartForm({
	inventoryPart,
	onSubmit,
	isSubmitting,
	dictionaries,
}: EditPartFormProps) {
	const { control, handleSubmit } = useForm<InventoryPart>({
		 defaultValues: inventoryPart ? { ...inventoryPart } : undefined,
	});
	   return (
		   <form id='edit-part-form' onSubmit={handleSubmit(onSubmit)}>
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
