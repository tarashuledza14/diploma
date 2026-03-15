import { useTranslation } from 'react-i18next';
import { AddVehicleDialog } from './AddVehicleDialog';

export function VehiclesHeader() {
	const { t } = useTranslation();
	return (
		<div className='flex items-center justify-between'>
			<div>
				<h1 className='text-2xl font-bold'>{t('vehicles.title')}</h1>
				<p className='text-muted-foreground'>{t('vehicles.subtitle')}</p>
			</div>
			<AddVehicleDialog />
		</div>
	);
}
