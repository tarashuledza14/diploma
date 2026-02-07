import { Button, Card, CardContent, Textarea } from '@/shared/components/ui';
import { Edit, Save, X } from 'lucide-react';
import {
	FieldErrors,
	UseFormHandleSubmit,
	UseFormRegister,
} from 'react-hook-form';

interface NotesFormData {
	notes: string;
}

interface NotesTabProps {
	isEditingNotes: boolean;
	setIsEditingNotes: (editing: boolean) => void;
	selectedClient: any;
	registerNotes: UseFormRegister<NotesFormData>;
	handleSubmitNotes: UseFormHandleSubmit<NotesFormData>;
	notesErrors: FieldErrors<NotesFormData>;
	handleSaveNotes: (data: NotesFormData) => void;
	handleCancelNotes: () => void;
}

export function NotesTab({
	isEditingNotes,
	setIsEditingNotes,
	selectedClient,
	registerNotes,
	handleSubmitNotes,
	notesErrors,
	handleSaveNotes,
	handleCancelNotes,
}: NotesTabProps) {
	return (
		<>
			{!isEditingNotes ? (
				<>
					<Card>
						<CardContent className='p-4'>
							<div className='flex items-start justify-between'>
								<div className='flex-1'>
									{selectedClient.notes ? (
										<p className='text-sm'>{selectedClient.notes}</p>
									) : (
										<p className='text-sm text-muted-foreground italic'>
											No notes for this client.
										</p>
									)}
								</div>
								<Button
									variant='ghost'
									size='sm'
									onClick={() => setIsEditingNotes(true)}
								>
									<Edit className='h-4 w-4' />
								</Button>
							</div>
						</CardContent>
					</Card>
					<div className='mt-3 text-xs text-muted-foreground'>
						<p>
							Client since:{' '}
							{selectedClient.createdAt
								? new Date(selectedClient.createdAt).toLocaleDateString()
								: 'N/A'}
						</p>
					</div>
				</>
			) : (
				<Card>
					<CardContent className='p-4'>
						<form onSubmit={handleSubmitNotes(handleSaveNotes)}>
							<Textarea
								placeholder='Add notes about this client...'
								{...registerNotes('notes')}
								rows={5}
								className='mb-3'
							/>
							{notesErrors.notes && (
								<span className='text-red-500 text-xs'>
									{notesErrors.notes.message}
								</span>
							)}
							<div className='flex gap-2 justify-end mt-3'>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={handleCancelNotes}
								>
									<X className='h-4 w-4 mr-1' />
									Cancel
								</Button>
								<Button type='submit' size='sm'>
									<Save className='h-4 w-4 mr-1' />
									Save Notes
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			)}
		</>
	);
}
