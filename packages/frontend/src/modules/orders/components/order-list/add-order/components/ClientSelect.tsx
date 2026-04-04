import {
	Button,
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	Label,
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ClientSelectProps {
	clients: any[];
	selectedClient: string;
	setSelectedClient: (id: string) => void;
	setSelectedVehicle: (id: string) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
}

export const ClientSelect: React.FC<ClientSelectProps> = ({
	clients,
	selectedClient,
	setSelectedClient,
	setSelectedVehicle,
	open,
	setOpen,
}) => {
	const { t } = useTranslation();
	const selectedClientData = clients.find(c => c.id === selectedClient);
	return (
		<div className='space-y-2'>
			<Label>{t('orders.newOrder.fields.client')} *</Label>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						role='combobox'
						aria-expanded={open}
						className='w-full justify-between bg-transparent'
					>
						{selectedClientData ? (
							<div className='flex items-center gap-2'>
								<User className='h-4 w-4 text-muted-foreground' />
								<span>{selectedClientData.name}</span>
								<span className='text-muted-foreground'>
									({selectedClientData.email})
								</span>
							</div>
						) : (
							<span className='text-muted-foreground'>
								{t('orders.newOrder.placeholders.selectClient')}
							</span>
						)}
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[500px] p-0' align='start'>
					<Command>
						<CommandInput placeholder={t('orders.filters.searchClient')} />
						<CommandList>
							<CommandEmpty>
								{t('orders.newOrder.empty.noClientFound')}
							</CommandEmpty>
							<CommandGroup>
								{clients.map(client => (
									<CommandItem
										key={client.id}
										value={client.name}
										onSelect={() => {
											setSelectedClient(client.id);
											setSelectedVehicle(''); // Reset vehicle when client changes
											setOpen(false);
										}}
									>
										<Check
											className={cn(
												'mr-2 h-4 w-4',
												selectedClient === client.id
													? 'opacity-100'
													: 'opacity-0',
											)}
										/>
										<div className='flex flex-col'>
											<span>{client.name}</span>
											<span className='text-xs text-muted-foreground'>
												{client.email} | {client.phone}
											</span>
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
};
