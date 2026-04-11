import { Check, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from '../../../shared/components/ui/dropdown-menu';

const resolveLanguageCode = (language?: string) =>
	language?.split('-')[0] ?? 'uk';

export function UserLanguageSubmenu() {
	const { t, i18n } = useTranslation();
	const currentLanguage = resolveLanguageCode(
		i18n.resolvedLanguage ?? i18n.language,
	);

	const changeLanguage = (language: 'uk' | 'en') => {
		if (currentLanguage !== language) {
			void i18n.changeLanguage(language);
		}
	};

	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger>
				<Languages className='h-4 w-4' />
				{t('userMenu.language')}
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				<DropdownMenuItem onClick={() => changeLanguage('en')}>
					{t('userMenu.languages.english')}
					{currentLanguage === 'en' ? (
						<Check className='ml-auto h-4 w-4' />
					) : null}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => changeLanguage('uk')}>
					{t('userMenu.languages.ukrainian')}
					{currentLanguage === 'uk' ? (
						<Check className='ml-auto h-4 w-4' />
					) : null}
				</DropdownMenuItem>
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}
