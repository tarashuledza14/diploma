import { Badge } from '@/shared/components/ui';
import { X } from 'lucide-react';
import React from 'react';

export interface SelectedServicesTagsProps {
	selectedServicesData: any[];
	removeService: (id: string) => void;
}

export const SelectedServicesTags: React.FC<SelectedServicesTagsProps> = ({
	selectedServicesData,
	removeService,
}) => {
	if (!selectedServicesData.length) return null;
	return (
		<div className='flex flex-wrap gap-2 mt-2'>
			{selectedServicesData.map(service => (
				<Badge key={service.id} variant='secondary' className='gap-1'>
					{service.name} (${service.price})
					<button
						type='button'
						onClick={() => removeService(service.id)}
						className='ml-1 hover:text-destructive'
					>
						<X className='h-3 w-3' />
						<span className='sr-only'>Remove {service.name}</span>
					</button>
				</Badge>
			))}
		</div>
	);
};
