import { useTranslation } from 'react-i18next';
import './App.css';

function App() {
	const { t, i18n } = useTranslation();

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng);
	};

	return (
		<div className='App'>
			<header className='App-header'>
				<div className='language-switcher'>
					<button
						onClick={() => changeLanguage('uk')}
						className={i18n.language === 'uk' ? 'active' : ''}
					>
						{t('languages.ukrainian')}
					</button>
					<button
						onClick={() => changeLanguage('en')}
						className={i18n.language === 'en' ? 'active' : ''}
					>
						{t('languages.english')}
					</button>
				</div>
				<h1>{t('title')}</h1>
				{/* {loading ? (
					<p>{t('loading')}</p>
				) : error ? (
					<p className='error'>{error}</p>
				) : (
					<p>{languages.join(', ')}</p>
				)} */}
			</header>
		</div>
	);
}

export default App;
