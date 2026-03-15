import { TabsList, TabsTrigger } from '@/shared/components/ui';
import { useTranslation } from 'react-i18next';

interface TabsNavProps {
	servicesCount: number;
	partsCount: number;
	mediaCount: number;
}

export function TabsNav({
	servicesCount,
	partsCount,
	mediaCount,
}: TabsNavProps) {
	const { t } = useTranslation();
	return (
		<TabsList className='mb-4'>
			<TabsTrigger value='general'>
				{t('orders.detailsTabs.general')}
			</TabsTrigger>
			<TabsTrigger value='services'>
				{t('orders.detailsTabs.services', { count: servicesCount })}
			</TabsTrigger>
			<TabsTrigger value='parts'>
				{t('orders.detailsTabs.parts', { count: partsCount })}
			</TabsTrigger>
			<TabsTrigger value='media'>
				{t('orders.detailsTabs.media', { count: mediaCount })}
			</TabsTrigger>
		</TabsList>
	);
}
