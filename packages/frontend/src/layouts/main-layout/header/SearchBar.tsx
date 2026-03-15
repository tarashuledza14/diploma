import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../../shared/components/ui/input';

export function SearchBar() {
	const { t } = useTranslation();
	return (
		<div className='relative w-96'>
			<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
			<Input
				type='search'
				placeholder={t('search.globalPlaceholder')}
				className='pl-10'
				// TODO: Implement global search with debounce
				// onChange={(e) => debouncedSearch(e.target.value)}
			/>
		</div>
	);
}
