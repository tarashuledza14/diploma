import { TabsList, TabsTrigger } from '@/shared/components/ui';

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
	return (
		<TabsList className='mb-4'>
			<TabsTrigger value='general'>General</TabsTrigger>
			<TabsTrigger value='services'>Services ({servicesCount})</TabsTrigger>
			<TabsTrigger value='parts'>Parts ({partsCount})</TabsTrigger>
			<TabsTrigger value='media'>Media ({mediaCount})</TabsTrigger>
		</TabsList>
	);
}
