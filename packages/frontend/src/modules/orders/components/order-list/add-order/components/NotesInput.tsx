import { Label, Textarea } from '@/shared/components/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface NotesInputProps {
	notes: string;
	setNotes: (notes: string) => void;
}

export const NotesInput: React.FC<NotesInputProps> = ({ notes, setNotes }) => {
	const { t } = useTranslation();
	return (
		<div className='space-y-2'>
			<Label>{t('common.notes')}</Label>
			<Textarea
				placeholder={t('orders.newOrder.placeholders.additionalNotes')}
				value={notes}
				onChange={e => setNotes(e.target.value)}
				rows={3}
			/>
		</div>
	);
};
