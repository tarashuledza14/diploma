import {
	Button,
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogFooter,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from '@/shared/components/ui';
import { Loader2 } from 'lucide-react';
import { ReactNode, RefObject } from 'react';

interface DialogFormLayoutProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	onCancelClick?: () => void;
	formRef?: RefObject<HTMLFormElement | null>;
	isLoading?: boolean;
	submitButtonText?: string;
	cancelButtonText?: string;
	isSubmitDisabled?: boolean;
	children: ReactNode;
}

export function DialogFormLayout({
	open,
	onOpenChange,
	title,
	description,
	onCancelClick,
	formRef,
	isLoading = false,
	submitButtonText = 'Save Changes',
	cancelButtonText = 'Cancel',
	isSubmitDisabled = false,
	children,
}: DialogFormLayoutProps) {
	const handleCancel = () => {
		onCancelClick?.();
		onOpenChange(false);
	};
	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent className='max-w-lg'>
				<ResponsiveDialogHeader>
					<ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
					<ResponsiveDialogDescription>
						{description}
					</ResponsiveDialogDescription>
				</ResponsiveDialogHeader>
				{children}
				<ResponsiveDialogFooter>
					<Button variant='outline' type='button' onClick={handleCancel}>
						{cancelButtonText}
					</Button>
					<Button
						type='submit'
						disabled={isSubmitDisabled || isLoading}
						onClick={() => formRef?.current?.requestSubmit()}
					>
						{isLoading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Saving...
							</>
						) : (
							submitButtonText
						)}
					</Button>
				</ResponsiveDialogFooter>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
