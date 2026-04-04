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
import { Check, ChevronsUpDown } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ServicesSelectProps {
	services: any[];
	selectedServices: string[];
	handleServiceToggle: (id: string) => void;
	open: boolean;
	setOpen: (open: boolean) => void;
}

export const ServicesSelect: React.FC<ServicesSelectProps> = ({
	services,
	selectedServices,
	handleServiceToggle,
	open,
	setOpen,
}) => {
	const { t } = useTranslation();
	return (
		<div className='space-y-2'>
			<Label>{t('orders.newOrder.fields.services')} *</Label>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						role='combobox'
						aria-expanded={open}
						className='w-full justify-between bg-transparent'
					>
						<span className='text-muted-foreground'>
							{selectedServices.length > 0
								? t('orders.newOrder.labels.servicesSelected', {
										count: selectedServices.length,
									})
								: t('orders.newOrder.placeholders.selectService')}
						</span>
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-125 p-0' align='start'>
					<Command>
						<CommandInput placeholder={t('orders.filters.searchServices')} />
						<CommandList>
							<CommandEmpty>
								{t('orders.newOrder.empty.noServiceFound')}
							</CommandEmpty>
							<CommandGroup>
								{services.map(service => (
									<CommandItem
										key={service.id}
										value={service.name}
										onSelect={() => handleServiceToggle(service.id)}
									>
										<Check
											className={cn(
												'mr-2 h-4 w-4',
												selectedServices.includes(service.id)
													? 'opacity-100'
													: 'opacity-0',
											)}
										/>
										<div className='flex flex-1 items-center justify-between'>
											<div className='flex flex-col'>
												<span>{service.name}</span>
												<span className='text-xs text-muted-foreground'>
													{t('orders.newOrder.labels.estimatedHours', {
														duration: service.duration,
													})}
												</span>
											</div>
											<span className='font-medium'>
												${service.price.toFixed(2)}
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
