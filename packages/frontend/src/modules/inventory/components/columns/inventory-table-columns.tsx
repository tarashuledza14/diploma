import {
	InventoryDictionaries,
	InventoryPart,
} from '@/modules/inventory/interfaces/inventory.interfaces';
import {
	Badge,
	Button,
	Checkbox,
	DataTableColumnHeader,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Progress,
} from '@/shared';
import { DataTableRowAction } from '@/types/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import {
	Edit,
	EllipsisVertical,
	Eye,
	History,
	MapPin,
	Trash2,
} from 'lucide-react';

interface GetInventoryTableColumnsProps {
	setRowAction: React.Dispatch<
		React.SetStateAction<DataTableRowAction<InventoryPart> | null>
	>;
	dictionaries?: InventoryDictionaries;
	t: TFunction;
}

export function getInventoryTableColumns({
	setRowAction,
	dictionaries,
	t,
}: GetInventoryTableColumnsProps): ColumnDef<InventoryPart>[] {
	return [
		{
			id: 'select',
			header: ({ table }) => (
				<Checkbox
					aria-label={t('table.selectAll')}
					className='translate-y-0.5'
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && 'indeterminate')
					}
					onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					aria-label={t('table.selectRow')}
					className='translate-y-0.5'
					checked={row.getIsSelected()}
					onCheckedChange={value => row.toggleSelected(!!value)}
				/>
			),
			enableHiding: false,
			enableSorting: false,
			size: 40,
		},
		{
			id: 'name',
			accessorKey: 'name',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('inventory.columns.part')}
				/>
			),
			cell: ({ row }) => (
				<div>
					<p className='font-medium'>{row.original.name}</p>
					<p className='text-xs text-muted-foreground'>
						{row.original.barcode || t('inventory.noBarcode')} |{' '}
						{row.original.oem || t('inventory.noOem')}
					</p>
				</div>
			),
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: false,
			meta: {
				label: t('inventory.columns.part'),
				variant: 'text',
			},
		},
		{
			id: 'category.name',
			accessorKey: 'category.name',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('inventory.columns.category')}
				/>
			),
			cell: ({ row }) => <Badge>{row.original.category?.name}</Badge>,
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: t('inventory.columns.category'),
				variant: 'multiSelect',
				options:
					dictionaries?.categories.map(category => ({
						value: category.name,
						label: category.name,
					})) ?? [],
			},
		},
		{
			id: 'oem',
			accessorKey: 'oem',
			meta: {
				label: 'OEM',
				placeholder: t('inventory.filters.searchOem'),
				variant: 'text',
			},
			enableColumnFilter: true,
			enableSorting: true,
			enableHiding: true,
		},
		{
			id: 'barcode',
			accessorKey: 'barcode',
			meta: {
				label: t('inventory.columns.barcode'),
				placeholder: t('inventory.filters.searchBarcode'),
				variant: 'text',
			},
			enableColumnFilter: true,
			enableSorting: true,
			enableHiding: true,
		},
		{
			id: 'brand',
			accessorKey: 'brand.name',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('inventory.columns.brand')}
				/>
			),
			cell: ({ cell }) => <Badge>{cell.getValue<string>()}</Badge>,
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: t('inventory.columns.brand'),
				variant: 'multiSelect',
				options:
					dictionaries?.brands.map(brand => ({
						value: brand.name,
						label: brand.name,
					})) ?? [],
			},
		},
		{
			id: 'location',
			// Збираємо унікальні локації з усіх партій на складі для пошуку/сортування
			accessorFn: row => {
				const locations =
					row.inventory?.map(i => i.location).filter(Boolean) || [];
				return Array.from(new Set(locations)).join(', ');
			},
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('inventory.columns.location')}
				/>
			),
			cell: ({ cell }) => {
				const value = cell.getValue<string>();
				return (
					<span>
						<MapPin className='size-5 mr-1 inline-block text-muted-foreground' />
						{value || '—'}
					</span>
				);
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: t('inventory.columns.location'),
				variant: 'text',
			},
		},
		{
			id: 'stock',
			// Вираховуємо загальну кількість для правильного сортування
			accessorFn: row =>
				row.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0,
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('inventory.columns.stock')}
				/>
			),
			cell: ({ row }) => {
				const minStock = row.original.minStock || 1;
				const totalQuantity =
					row.original.inventory?.reduce(
						(sum, item) => sum + item.quantity,
						0,
					) || 0;

				const stockPercent = Math.min(
					(totalQuantity / (minStock * 2)) * 100,
					100,
				);

				return (
					<div className='w-28 space-y-1'>
						<div className='flex justify-between text-xs'>
							<span>
								{totalQuantity} {row.original.unit || 'шт'}
							</span>
						</div>
						<Progress
							value={stockPercent}
							className={`h-1.5 ${totalQuantity === 0 ? '[&>div]:bg-red-500' : totalQuantity < minStock ? '[&>div]:bg-amber-500' : ''}`}
						/>
					</div>
				);
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: t('inventory.columns.stock'),
				variant: 'number',
			},
		},
		{
			id: 'supplier',
			accessorKey: 'supplier.name',
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('inventory.columns.supplier')}
				/>
			),
			cell: ({ cell }) => <span>{cell.getValue<string>() || '—'}</span>,
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: t('inventory.columns.supplier'),
				variant: 'multiSelect',
				options: dictionaries?.suppliers.map(supplier => ({
					value: supplier.name,
					label: supplier.name,
				})) ?? [{ value: 'Unknown', label: t('inventory.unknown') }],
			},
		},
		{
			id: 'retailPrice',
			// Шукаємо роздрібну ціну для сортування
			accessorFn: row => {
				const retailRule =
					row.priceRules?.find(r => r.clientType === 'RETAIL') ||
					row.priceRules?.[0];
				return retailRule?.fixedPrice ? Number(retailRule.fixedPrice) : 0;
			},
			header: ({ column }) => (
				<DataTableColumnHeader
					column={column}
					label={t('inventory.columns.price')}
				/>
			),
			cell: ({ row }) => {
				// Беремо роздрібну ціну
				const retailRule =
					row.original.priceRules?.find(r => r.clientType === 'RETAIL') ||
					row.original.priceRules?.[0];
				const retailPrice = retailRule?.fixedPrice;
				const markup = retailRule?.markupPercent;

				// Беремо закупівельну ціну з останньої партії
				const latestInventory = row.original.inventory?.[0];
				const purchasePrice = latestInventory?.purchasePrice;

				const formatPrice = (value: unknown) => {
					if (value == null) return '—';
					const num = typeof value === 'number' ? value : Number(value);
					return !isNaN(num) ? `$${num.toFixed(2)}` : '—';
				};

				return (
					<div>
						<p className='font-medium'>
							{retailPrice != null ? (
								formatPrice(retailPrice)
							) : (
								<span className='text-muted-foreground'>—</span>
							)}
						</p>

						<p className='text-xs text-muted-foreground'>
							{purchasePrice != null ? formatPrice(purchasePrice) : '—'}
							{markup ? ` (+${markup}%)` : ''}
						</p>
					</div>
				);
			},
			enableSorting: true,
			enableColumnFilter: true,
			enableHiding: true,
			meta: {
				label: t('inventory.columns.price'),
				variant: 'number',
			},
		},
		{
			id: 'actions',
			cell: function Cell({ row }) {
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								aria-label={t('table.openMenu')}
								variant='ghost'
								className='flex size-8 p-0 data-[state=open]:bg-muted'
							>
								<EllipsisVertical className='size-4' aria-hidden='true' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-40'>
							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'view' })}
							>
								<Eye className='h-4 w-4 mr-2' />
								{t('common.view')}
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'update' })}
							>
								<Edit className='h-4 w-4 mr-2' />
								{t('common.edit')}
							</DropdownMenuItem>

							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'history' })}
							>
								<History className='h-4 w-4 mr-2' />
								{t('inventory.actions.movementHistory')}
							</DropdownMenuItem>
							<DropdownMenuItem
								onSelect={() => setRowAction({ row, variant: 'delete' })}
							>
								<Trash2 className='h-4 w-4 mr-2' />
								{t('common.delete')}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
			size: 40,
		},
	];
}
