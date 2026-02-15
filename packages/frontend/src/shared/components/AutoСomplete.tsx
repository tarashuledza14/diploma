import { Button, cn, Popover, PopoverContent, PopoverTrigger } from '@/shared';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/shared/components/ui/command';
import { debounce } from 'lodash';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export interface Option {
	id: string;
	label: string;
	description?: string;
	[key: string]: any;
}
interface AsyncComboboxProps<T extends Option> {
	value?: string | null;
	selectedOption?: T | null;
	onSelect: (value: string | null, option: T | null) => void;
	onSearch: (query: string) => void;
	options: T[];
	isLoading?: boolean;
	placeholder?: string;
	emptyMessage?: string;
	className?: string;
}

export function AutoComplete<T extends Option>({
	value,
	selectedOption,
	onSelect,
	onSearch,
	options,
	isLoading = false,
	placeholder = 'Select...',
	emptyMessage = 'No results found.',
	className,
}: AsyncComboboxProps<T>) {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState('');

	// Debounce пошуку (500ms)
	// Використовуємо useCallback, щоб функція не перестворювалась
	const handleSearch = useCallback(
		debounce((term: string) => {
			onSearch(term);
		}, 500),
		[onSearch],
	);

	// Очищаємо інпут при закритті, щоб наступного разу пошук був чистим
	useEffect(() => {
		if (!open) {
			setInputValue('');
		}
	}, [open]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					role='combobox'
					aria-expanded={open}
					className={cn('w-full justify-between', className)}
				>
					{selectedOption ? (
						<div className='flex flex-col items-start text-left'>
							<span className='font-medium'>{selectedOption.label}</span>
						</div>
					) : (
						<span className='text-muted-foreground'>{placeholder}</span>
					)}
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				className='w-(--radix-popover-trigger-width) p-0'
				align='start'
			>
				{/* shouldFilter={false} ОБОВ'ЯЗКОВО, бо фільтруємо на бекенді */}
				<Command shouldFilter={false}>
					<CommandInput
						placeholder={placeholder}
						value={inputValue}
						onValueChange={val => {
							setInputValue(val);
							handleSearch(val);
						}}
					/>
					<CommandList>
						{isLoading ? (
							<div className='flex items-center justify-center p-4'>
								<Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
							</div>
						) : (
							<>
								{options.length === 0 && (
									<CommandEmpty>{emptyMessage}</CommandEmpty>
								)}
								<CommandGroup>
									{options.map(option => (
										<CommandItem
											key={option.id}
											value={option.id}
											onSelect={() => {
												onSelect(option.id, option);
												setOpen(false);
											}}
										>
											<Check
												className={cn(
													'mr-2 h-4 w-4 shrink-0',
													value === option.id ? 'opacity-100' : 'opacity-0',
												)}
											/>
											<div className='flex flex-col'>
												<span>{option.label}</span>
												{option.description && (
													<span className='text-xs text-muted-foreground'>
														{option.description}
													</span>
												)}
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
