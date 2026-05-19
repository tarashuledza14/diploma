import i18n from "@/i18n/config";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Checkbox,
  DataTableColumnHeader,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  getClientInitials,
} from "@/shared";
import { DataTableRowAction } from "@/types/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, EllipsisVertical, Eye, Trash2 } from "lucide-react";
import { OrderListItem } from "../../interfaces/order.interface";

interface GetOrdersTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<OrderListItem> | null>
  >;
}

export function getOrdersTableColumns({
  setRowAction,
}: GetOrdersTableColumnsProps): ColumnDef<OrderListItem>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label={i18n.t("table.selectAll")}
          className="translate-y-0.5"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={i18n.t("table.selectRow")}
          className="translate-y-0.5"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableHiding: false,
      enableSorting: false,
      size: 40,
    },
    {
      id: "client",
      accessorFn: (row) => row.client.fullName,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t("orders.columns.client")}
        />
      ),
      cell: ({ row }) => {
        const fullName = row.original.client.fullName;
        const initials = getClientInitials(fullName);
        return (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <p>{fullName}</p>
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: true,
      enableHiding: false,
      meta: {
        label: i18n.t("orders.columns.client"),
        placeholder: i18n.t("orders.filters.searchClient"),
        variant: "text",
      },
    },
    {
      id: "vehicle",
      accessorFn: (row) =>
        `${row.vehicle.year} ${row.vehicle.brand} ${row.vehicle.model}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t("orders.columns.vehicle")}
        />
      ),
      cell: ({ row }) => {
        const v = row.original.vehicle;
        return (
          <div>
            <p className="font-medium">
              {v.year} {v.brand} {v.model}
            </p>
            <p className="text-xs text-muted-foreground">
              {v.plateNumber || v.color || "—"}
            </p>
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: true,
      enableHiding: false,
      meta: {
        label: i18n.t("orders.columns.vehicle"),
        placeholder: i18n.t("orders.filters.searchVehicle"),
        variant: "text",
      },
    },
    {
      id: "services",
      accessorFn: (row) => row.services.map((s) => s.name).join(", "),
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t("orders.columns.services")}
        />
      ),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.services.slice(0, 2).map((s) => (
            <Badge key={s.id} variant="secondary" className="text-xs">
              {s.name}
            </Badge>
          ))}
          {row.original.services.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{row.original.services.length - 2}
            </Badge>
          )}
        </div>
      ),
      meta: {
        label: i18n.t("orders.columns.services"),
        placeholder: i18n.t("orders.filters.searchServices"),
        variant: "text",
      },
      enableColumnFilter: true,
      enableSorting: true,
      enableHiding: true,
    },

    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t("common.status")}
        />
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {i18n.t(`orderStatus.${row.original.status}`)}
        </Badge>
      ),
      meta: {
        label: i18n.t("common.status"),
        placeholder: i18n.t("orders.filters.filterByStatus"),
        variant: "text",
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: "priority",
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t("common.priority")}
        />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {i18n.t(`orderPriority.${row.original.priority}`)}
        </Badge>
      ),
      meta: {
        label: i18n.t("common.priority"),
        placeholder: i18n.t("orders.filters.filterByPriority"),
        variant: "text",
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: "endDate",
      accessorKey: "endDate",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t("orders.columns.endDate")}
        />
      ),
      cell: ({ row }) => {
        const d = row.original.endDate;
        return d ? new Date(d).toLocaleDateString() : "—";
      },
      meta: {
        label: i18n.t("orders.columns.endDate"),
        variant: "date",
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: "totalAmount",
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          label={i18n.t("orders.columns.total")}
          className="text-right"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">{row.original.totalAmount}</div>
      ),
      meta: {
        label: i18n.t("orders.columns.total"),
        variant: "text",
      },
      enableColumnFilter: true,
      enableSorting: true,
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={i18n.t("table.openMenu")}
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <EllipsisVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "view" })}
              >
                <Eye className="h-4 w-4 mr-2" />
                {i18n.t("common.view")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, variant: "update" })}
              >
                <Edit className="h-4 w-4 mr-2" />
                {i18n.t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() => setRowAction({ row, variant: "delete" })}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {i18n.t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];
}
