import {
	AppSettingsService,
	LogoCropperDialog,
	appSettingsKeys,
	useUpdateBrandingMutation,
	useUploadLogoMutation,
} from '@/modules/app-settings';
import { AuthAPI } from '@/modules/auth/api/auth.api';
import { TeamService } from '@/modules/team/api/team.service';
import { InviteLanguage } from '@/modules/team/interfaces/team-user.interface';
import { UserRole } from '@/shared/interfaces/user.interface';
import {
	Button,
	FileUpload,
	FileUploadDropzone,
	FileUploadTrigger,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	cn,
} from '@/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, CloudUpload, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const STEPS = 3;


function BrandingStep({ onNext }: { onNext: () => void }) {
	const [appName, setAppName] = useState('');
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
	const [isCropperOpen, setIsCropperOpen] = useState(false);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);

	const { mutateAsync: updateBranding, isPending: isUpdating } =
		useUpdateBrandingMutation();
	const { mutateAsync: uploadLogo, isPending: isUploading } =
		useUploadLogoMutation();

	const isPending = isUpdating || isUploading;

	const handleNext = async () => {
		const trimmed = appName.trim();
		if (!trimmed) {
			toast.error('Введіть назву системи');
			return;
		}

		try {
			await updateBranding({ appName: trimmed, currency: 'UAH' });
			if (logoFile) {
				await uploadLogo(logoFile);
			}
			onNext();
		} catch {
			toast.error('Не вдалося зберегти налаштування');
		}
	};

	const handleLogoCropped = (file: File) => {
		setLogoFile(file);
		setLogoPreview(URL.createObjectURL(file));
		setCropSourceFile(null);
	};

	return (
		<div className='space-y-5'>
			<div className='space-y-1.5'>
				<Label htmlFor='onboarding-app-name'>Назва системи</Label>
				<Input
					id='onboarding-app-name'
					placeholder='Наприклад: AutoCRM'
					value={appName}
					onChange={e => setAppName(e.target.value)}
				/>
			</div>

			<div className='space-y-1.5'>
				<Label>Логотип (необов'язково)</Label>
				{logoPreview ? (
					<div className='flex items-center gap-3'>
						<img
							src={logoPreview}
							alt='Логотип'
							className='h-16 w-16 rounded-lg object-cover'
						/>
						<Button
							type='button'
							variant='outline'
							size='sm'
							onClick={() => {
								setLogoFile(null);
								setLogoPreview(null);
							}}
						>
							Видалити
						</Button>
					</div>
				) : (
					<FileUpload
						accept='image/*'
						maxFiles={1}
						onValueChange={files => {
							if (files[0]) {
								setCropSourceFile(files[0]);
								setIsCropperOpen(true);
							}
						}}
					>
						<FileUploadDropzone className='cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50'>
							<FileUploadTrigger asChild>
								<div className='flex flex-col items-center gap-2 text-muted-foreground'>
									<CloudUpload className='h-8 w-8' />
									<p className='text-sm'>Натисніть або перетягніть логотип</p>
								</div>
							</FileUploadTrigger>
						</FileUploadDropzone>
					</FileUpload>
				)}
			</div>

			<Button className='w-full' onClick={handleNext} disabled={isPending}>
				{isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
				Далі
			</Button>

			<LogoCropperDialog
				open={isCropperOpen}
				file={cropSourceFile}
				onOpenChange={setIsCropperOpen}
				onApply={handleLogoCropped}
			/>
		</div>
	);
}

function PasswordStep({ onNext }: { onNext: () => void }) {
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const { mutateAsync: setPassword, isPending } = useMutation({
		mutationFn: (newPassword: string) => AuthAPI.setPassword(newPassword),
	});

	const handleNext = async () => {
		if (!newPassword || !confirmPassword) {
			toast.error('Заповніть усі поля');
			return;
		}
		if (newPassword.length < 8) {
			toast.error('Пароль має містити щонайменше 8 символів');
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error('Паролі не збігаються');
			return;
		}

		try {
			await setPassword(newPassword);
			onNext();
		} catch {
			toast.error('Не вдалося встановити пароль');
		}
	};

	return (
		<div className='space-y-4'>
			<div className='space-y-1.5'>
				<Label htmlFor='new-password'>Новий пароль</Label>
				<Input
					id='new-password'
					type='password'
					value={newPassword}
					onChange={e => setNewPassword(e.target.value)}
				/>
			</div>
			<div className='space-y-1.5'>
				<Label htmlFor='confirm-password'>Повторіть пароль</Label>
				<Input
					id='confirm-password'
					type='password'
					value={confirmPassword}
					onChange={e => setConfirmPassword(e.target.value)}
				/>
			</div>

			<Button className='w-full' onClick={handleNext} disabled={isPending}>
				{isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
				Далі
			</Button>
		</div>
	);
}

function InviteStep({ onComplete }: { onComplete: () => Promise<void> }) {
	const [email, setEmail] = useState('');
	const [fullName, setFullName] = useState('');
	const [role, setRole] = useState<UserRole>('MECHANIC');
	const [language, setLanguage] = useState<InviteLanguage>('UK');
	const [isCompleting, setIsCompleting] = useState(false);

	const { mutateAsync: createUser, isPending: isInviting } = useMutation({
		mutationFn: (payload: {
			email: string;
			fullName?: string;
			role: UserRole;
			language: InviteLanguage;
		}) => TeamService.createUser(payload),
	});

	const handleInvite = async () => {
		if (!email.trim()) {
			toast.error('Введіть email');
			return;
		}

		try {
			await createUser({
				email: email.trim(),
				fullName: fullName.trim() || undefined,
				role,
				language,
			});
			toast.success('Запрошення надіслано!');
			await onComplete();
		} catch {
			toast.error('Не вдалося надіслати запрошення');
		}
	};

	const handleSkip = async () => {
		setIsCompleting(true);
		try {
			await onComplete();
		} finally {
			setIsCompleting(false);
		}
	};

	const isPending = isInviting || isCompleting;

	return (
		<div className='space-y-4'>
			<div className='space-y-1.5'>
				<Label htmlFor='invite-email'>Email</Label>
				<Input
					id='invite-email'
					type='email'
					placeholder='colleague@company.com'
					value={email}
					onChange={e => setEmail(e.target.value)}
				/>
			</div>
			<div className='space-y-1.5'>
				<Label htmlFor='invite-name'>Ім'я (необов'язково)</Label>
				<Input
					id='invite-name'
					placeholder='Іван Петренко'
					value={fullName}
					onChange={e => setFullName(e.target.value)}
				/>
			</div>
			<div className='grid grid-cols-2 gap-3'>
				<div className='space-y-1.5'>
					<Label>Роль</Label>
					<Select value={role} onValueChange={v => setRole(v as UserRole)}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='ADMIN'>Адмін</SelectItem>
							<SelectItem value='MANAGER'>Менеджер</SelectItem>
							<SelectItem value='MECHANIC'>Механік</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className='space-y-1.5'>
					<Label>Мова листа</Label>
					<Select
						value={language}
						onValueChange={v => setLanguage(v as InviteLanguage)}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='UK'>Українська</SelectItem>
							<SelectItem value='EN'>English</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className='flex gap-2 pt-1'>
				<Button
					variant='outline'
					className='flex-1'
					onClick={handleSkip}
					disabled={isPending}
				>
					{isCompleting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
					Пропустити
				</Button>
				<Button className='flex-1' onClick={handleInvite} disabled={isPending}>
					{isInviting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
					Запросити
				</Button>
			</div>
		</div>
	);
}

const STEP_META = [
	{
		title: 'Налаштуйте систему',
		description: 'Вкажіть назву вашої системи та завантажте логотип.',
		hint: 'Назву та логотип можна змінити пізніше в налаштуваннях.',
	},
	{
		title: 'Змініть пароль',
		description: 'Встановіть надійний пароль для вашого облікового запису.',
		hint: 'Використовуйте щонайменше 8 символів.',
	},
	{
		title: 'Запросіть колегу',
		description: 'Додайте першого члена команди.',
		hint: 'Цей крок можна пропустити і зробити пізніше.',
	},
];

export function OnboardingPage() {
	const [step, setStep] = useState(1);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const handleComplete = async () => {
		try {
			await AppSettingsService.completeOnboarding();
			queryClient.setQueryData(
				appSettingsKeys.branding(),
				(old: Record<string, unknown> | undefined) =>
					old ? { ...old, isOnboardingCompleted: true } : old,
			);
			navigate('/', { replace: true });
		} catch {
			toast.error('Не вдалося завершити налаштування');
		}
	};

	const meta = STEP_META[step - 1];

	return (
		<div className='flex h-dvh w-full'>
			{}
			<div className='hidden w-105 shrink-0 flex-col justify-between bg-foreground p-10 text-background lg:flex'>
				<div className='text-lg font-semibold tracking-tight'>AutoCRM</div>

				<div className='space-y-10'>
					{STEP_META.map((s, i) => {
						const idx = i + 1;
						const isDone = step > idx;
						const isCurrent = step === idx;
						return (
							<div key={idx} className='flex items-start gap-4'>
								<div
									className={cn(
										'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all',
										isDone
											? 'border-background/30 bg-background/20 text-background'
											: isCurrent
												? 'border-background bg-background text-foreground'
												: 'border-background/20 text-background/40',
									)}
								>
									{isDone ? <Check className='h-3.5 w-3.5' /> : idx}
								</div>
								<div>
									<p
										className={cn(
											'text-sm font-medium',
											isCurrent ? 'text-background' : 'text-background/40',
										)}
									>
										{s.title}
									</p>
									<p
										className={cn(
											'mt-0.5 text-xs',
											isCurrent ? 'text-background/60' : 'text-background/25',
										)}
									>
										{s.description}
									</p>
								</div>
							</div>
						);
					})}
				</div>

				<p className='text-xs text-background/30'>
					Крок {step} з {STEPS}
				</p>
			</div>

			{}
			<div className='flex flex-1 flex-col items-center justify-center overflow-y-auto p-8'>
				<div className='w-full max-w-sm'>
					<div className='mb-8'>
						<p className='text-xs font-medium uppercase tracking-widest text-muted-foreground'>
							Крок {step} з {STEPS}
						</p>
						<h1 className='mt-2 text-2xl font-bold tracking-tight'>{meta.title}</h1>
						<p className='mt-1 text-sm text-muted-foreground'>{meta.description}</p>
					</div>

					{step === 1 && <BrandingStep onNext={() => setStep(2)} />}
					{step === 2 && <PasswordStep onNext={() => setStep(3)} />}
					{step === 3 && <InviteStep onComplete={handleComplete} />}

					<p className='mt-6 text-center text-xs text-muted-foreground'>{meta.hint}</p>
				</div>
			</div>
		</div>
	);
}
