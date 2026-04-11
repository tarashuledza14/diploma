import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/shared/components/ui';
import { formatDate } from '@/shared/lib/format';
import { useTranslation } from 'react-i18next';
import { TeamUser } from '../interfaces/team-user.interface';

interface TeamTableProps {
	users: TeamUser[];
	onEdit: (user: TeamUser) => void;
	onBlock: (user: TeamUser) => void;
	isLoading?: boolean;
}

const roleBadgeClass: Record<TeamUser['role'], string> = {
	ADMIN: 'bg-red-100 text-red-700 border-red-200',
	MANAGER: 'bg-blue-100 text-blue-700 border-blue-200',
	MECHANIC: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const statusBadgeClass: Record<TeamUser['accountStatus'], string> = {
	ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
	PENDING_CONFIRMATION: 'bg-amber-100 text-amber-700 border-amber-200',
	BLOCKED: 'bg-zinc-100 text-zinc-700 border-zinc-200',
};

export function TeamTable({
	users,
	onEdit,
	onBlock,
	isLoading,
}: TeamTableProps) {
	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t('team.table.title')}</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<p className='text-sm text-muted-foreground'>{t('common.loading')}</p>
				) : users.length === 0 ? (
					<p className='text-sm text-muted-foreground'>
						{t('team.table.empty')}
					</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>{t('team.columns.fullName')}</TableHead>
								<TableHead>{t('common.email')}</TableHead>
								<TableHead>{t('team.columns.role')}</TableHead>
								<TableHead>{t('common.status')}</TableHead>
								<TableHead>{t('team.columns.createdAt')}</TableHead>
								<TableHead>{t('team.columns.openOrders')}</TableHead>
								<TableHead className='text-right'>
									{t('team.columns.actions')}
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map(user => (
								<TableRow key={user.id}>
									<TableCell className='font-medium'>{user.fullName}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>
										<Badge
											className={roleBadgeClass[user.role]}
											variant='outline'
										>
											{user.role}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge
											className={statusBadgeClass[user.accountStatus]}
											variant='outline'
										>
											{t(`team.status.${user.accountStatus}`)}
										</Badge>
									</TableCell>
									<TableCell>{formatDate(user.createdAt)}</TableCell>
									<TableCell>{user.openOrdersCount}</TableCell>
									<TableCell>
										<div className='flex justify-end gap-2'>
											<Button
												type='button'
												variant='outline'
												size='sm'
												disabled={user.isSelf}
												onClick={() => onEdit(user)}
											>
												{t('common.edit')}
											</Button>
											<Button
												type='button'
												variant='destructive'
												size='sm'
												disabled={
													user.isSelf || user.accountStatus === 'BLOCKED'
												}
												onClick={() => onBlock(user)}
											>
												{t('team.actions.block')}
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
