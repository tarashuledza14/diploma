import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui';
import { TrendingUp, Wrench } from 'lucide-react';

export function TopMechanicsCard({ topMechanics }: { topMechanics: any[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Wrench className='h-5 w-5' />
					Top Mechanics
				</CardTitle>
				<CardDescription>Best performing this month</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{topMechanics.map((mechanic, index) => (
						<div
							key={mechanic.name}
							className='flex items-center justify-between rounded-lg border p-3'
						>
							<div className='flex items-center gap-3'>
								<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary'>
									{index + 1}
								</div>
								<Avatar className='h-9 w-9'>
									<AvatarImage src={mechanic.avatar || '/placeholder.svg'} />
									<AvatarFallback>
										{mechanic.name
											.split(' ')
											// .map(n => n[0])
											.join('')}
									</AvatarFallback>
								</Avatar>
								<div>
									<p className='text-sm font-medium'>{mechanic.name}</p>
									<p className='text-xs text-muted-foreground'>
										{mechanic.orders} orders completed
									</p>
								</div>
							</div>
							<div className='flex items-center gap-1 text-sm'>
								<TrendingUp className='h-4 w-4 text-green-500' />
								{mechanic.rating}
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
