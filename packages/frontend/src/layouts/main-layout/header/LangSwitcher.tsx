import { Button, ButtonGroup } from '@/shared/components/ui';
import { useTranslation } from 'react-i18next';

export function LangSwitcher() {
	const { i18n } = useTranslation();

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng);
	};
	return (
		<ButtonGroup>
			<Button
				variant={i18n.language === 'uk' ? 'default' : 'outline'}
				onClick={() => changeLanguage('uk')}
			>
				UA
			</Button>
			<Button
				variant={i18n.language === 'en' ? 'default' : 'outline'}
				onClick={() => changeLanguage('en')}
			>
				EN
			</Button>
		</ButtonGroup>
	);
}
