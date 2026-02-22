import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ScrollArea,
} from '@/shared';
import { ViewPartModalBaseInfo } from './ViewPartModalBaseInfo';
import { ViewPartModalCompatibility } from './ViewPartModalCompatibility';
import { ViewPartModalFinancial } from './ViewPartModalFinancial';
import { ViewPartModalHeader } from './ViewPartModalHeader';
import { ViewPartModalNotes } from './ViewPartModalNotes';
import { ViewPartModalStats } from './ViewPartModalStats';
import { ViewPartModalStorage } from './ViewPartModalStorage';
import { ViewPartModalSupplier } from './ViewPartModalSupplier';
import { ViewPartModalWarranty } from './ViewPartModalWarranty';

import { InventoryPart } from '../../interfaces/inventory.interfaces';

interface ViewPartModalProps {
	selectedPart: InventoryPart | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	handleEdit: (part: InventoryPart) => void;
	handleHistory: (part: InventoryPart) => void;
}

export function ViewPartModal({
	selectedPart,
	open,
	onOpenChange,
	handleEdit,
	handleHistory,
}: ViewPartModalProps) {
	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='w-full sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6'>
				{selectedPart && (
					<>
						<ViewPartModalHeader
							selectedPart={selectedPart}
							onOpenChange={onOpenChange}
							handleEdit={handleEdit}
							handleHistory={handleHistory}
						/>
						<ScrollArea className='flex h-[70vh] -mr-4 pr-4'>
							<div className='space-y-6 pb-4'>
								<ViewPartModalStats
									inventory={selectedPart.inventory ?? []}
									minStock={selectedPart.minStock ?? 0}
								/>
								<ViewPartModalBaseInfo selectedPart={selectedPart} />
								<ViewPartModalCompatibility
									compatibility={selectedPart.compatibility}
								/>
								<ViewPartModalStorage selectedPart={selectedPart} />
								<ViewPartModalFinancial
									priceRules={selectedPart.priceRules ?? []}
								/>
								<ViewPartModalSupplier selectedPart={selectedPart} />
								<ViewPartModalWarranty selectedPart={selectedPart} />
								<ViewPartModalNotes notes={selectedPart.notes} />
							</div>
						</ScrollArea>
					</>
				)}
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
