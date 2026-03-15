import {
	Button,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
	ResponsiveDialogTrigger,
} from '@/shared/components/ui';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InventoryDictionaries } from '../interfaces/inventory.interfaces';
import { AddInventoryPart } from './edit-part/form/AddInventoryPart';

interface InventoryHeaderProps {
	dictionaries: InventoryDictionaries | undefined;
}
export function InventoryHeader({ dictionaries }: InventoryHeaderProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	return (
		<div className='flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>{t('inventory.title')}</h1>
				<p className='text-muted-foreground'>{t('inventory.subtitle')}</p>
			</div>
			<div className='flex gap-2'>
				{/* <Button variant='outline'>
					<ShoppingCart className='mr-2 h-4 w-4' />
					Order Parts
				</Button> */}
				<ResponsiveDialog open={open} onOpenChange={setOpen}>
					<ResponsiveDialogTrigger asChild>
						<Button>
							<Plus className='mr-2 h-4 w-4' />
							{t('inventory.actions.addPart')}
						</Button>
					</ResponsiveDialogTrigger>
					<ResponsiveDialogContent>
						<ResponsiveDialogHeader>
							<ResponsiveDialogTitle>
								{t('inventory.dialogs.addTitle')}
							</ResponsiveDialogTitle>
							<ResponsiveDialogDescription>
								{t('inventory.dialogs.addDescription')}
							</ResponsiveDialogDescription>
						</ResponsiveDialogHeader>
						{dictionaries && (
							<AddInventoryPart
								dictionaries={dictionaries}
								onCancel={() => setOpen(false)}
							/>
						)}
					</ResponsiveDialogContent>
				</ResponsiveDialog>
			</div>
		</div>
	);
}
