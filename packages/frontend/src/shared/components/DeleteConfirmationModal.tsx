import { Loader2 } from 'lucide-react';
import { PropsWithChildren } from 'react';
import {
	Button,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from './ui';

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	loadingText?: string;
	isLoading?: boolean;
	onConfirm: () => void;
	variant?: 'destructive' | 'default';
}

export function DeleteConfirmationModal({
	open,
	onOpenChange,
	title,
	description,
	confirmText = 'Delete',
	cancelText = 'Cancel',
	loadingText = 'Deleting...',
	isLoading = false,
	onConfirm,
	variant = 'destructive',
	children,
}: PropsWithChildren<Props>) {
	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='max-w-md'>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						{description}
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>

				{children && (
					<div className='flex items-center gap-3 p-3 bg-muted rounded-lg'>
						{children}
					</div>
				)}

				<ResponsiveDialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)}>
						{cancelText}
					</Button>
					<Button variant={variant} onClick={onConfirm} disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								{loadingText}
							</>
						) : (
							confirmText
						)}
					</Button>
				</ResponsiveDialogFooter>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
