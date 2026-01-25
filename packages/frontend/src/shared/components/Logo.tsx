import { Wrench } from 'lucide-react';

export default function Logo() {
	return (
		<div className='flex items-center justify-center gap-2 mb-8'>
			<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary'>
				<Wrench className='h-6 w-6 text-primary-foreground' />
			</div>
			<span className='text-2xl font-bold'>AutoCRM</span>
		</div>
	);
}
