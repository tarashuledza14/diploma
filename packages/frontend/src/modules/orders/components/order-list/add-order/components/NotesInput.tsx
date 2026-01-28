import { Label, Textarea } from '@/shared/components/ui';
import React from 'react';

export interface NotesInputProps {
	notes: string;
	setNotes: (notes: string) => void;
}

export const NotesInput: React.FC<NotesInputProps> = ({ notes, setNotes }) => {
	return (
		<div className='space-y-2'>
			<Label>Notes</Label>
			<Textarea
				placeholder='Add any additional notes or instructions...'
				value={notes}
				onChange={e => setNotes(e.target.value)}
				rows={3}
			/>
		</div>
	);
};
