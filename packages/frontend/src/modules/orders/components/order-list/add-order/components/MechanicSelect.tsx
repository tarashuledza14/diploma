import {
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface MechanicSelectProps {
	mechanics: any[];
	assignedMechanic: string;
	setAssignedMechanic: (id: string) => void;
}

export const MechanicSelect: React.FC<MechanicSelectProps> = ({
	mechanics,
	assignedMechanic,
	setAssignedMechanic,
}) => {
	const { t } = useTranslation();
	return (
		<div className='space-y-2'>
			<Label>{t('orders.newOrder.fields.assignMechanic')}</Label>
			<Select value={assignedMechanic} onValueChange={setAssignedMechanic}>
				<SelectTrigger>
					<SelectValue
						placeholder={t(
							'orders.newOrder.placeholders.selectMechanicOptional',
						)}
					/>
				</SelectTrigger>
				<SelectContent>
					{mechanics.map(mechanic => (
						<SelectItem key={mechanic.id} value={mechanic.id}>
							<div className='flex flex-col'>
								<span>{mechanic.name}</span>
								<span className='text-xs text-muted-foreground'>
									{mechanic.specialty}
								</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
};
