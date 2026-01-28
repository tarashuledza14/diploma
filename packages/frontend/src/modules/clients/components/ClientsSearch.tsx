import { Card, CardContent, Input } from '@/shared/components/ui';
import { Search } from 'lucide-react';

interface ClientsSearchProps {
	searchQuery: string;
	setSearchQuery: (v: string) => void;
}

export function ClientsSearch({
	searchQuery,
	setSearchQuery,
}: ClientsSearchProps) {
	return (
		<Card>
			<CardContent className='pt-6'>
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						placeholder='Search by name, email, or phone...'
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className='pl-9'
					/>
				</div>
			</CardContent>
		</Card>
	);
}
