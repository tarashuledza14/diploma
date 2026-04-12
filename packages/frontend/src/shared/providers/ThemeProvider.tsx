import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type ThemePreset = 'purple' | 'blue' | 'default';
export type ThemeChromeMode = 'linked' | 'contrast';

export type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	defaultPreset?: ThemePreset;
	defaultChromeMode?: ThemeChromeMode;
	storageKey?: string;
	presetStorageKey?: string;
	chromeModeStorageKey?: string;
};

export type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	preset: ThemePreset;
	setPreset: (preset: ThemePreset) => void;
	chromeMode: ThemeChromeMode;
	setChromeMode: (mode: ThemeChromeMode) => void;
};

const initialState: ThemeProviderState = {
	theme: 'system',
	setTheme: () => null,
	preset: 'purple',
	setPreset: () => null,
	chromeMode: 'contrast',
	setChromeMode: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = 'system',
	defaultPreset = 'purple',
	defaultChromeMode = 'contrast',
	storageKey = 'vite-ui-theme',
	presetStorageKey = 'vite-ui-theme-preset',
	chromeModeStorageKey = 'vite-ui-theme-chrome-mode',
	...props
}: ThemeProviderProps) {
	const [preset, setPreset] = useState<ThemePreset>(() => {
		const value = localStorage.getItem(presetStorageKey);
		if (value === 'purple' || value === 'blue' || value === 'default') {
			return value;
		}

		return defaultPreset;
	});

	const [theme, setTheme] = useState<Theme>(
		() => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
	);

	const [chromeMode, setChromeModeState] = useState<ThemeChromeMode>(() => {
		const value = localStorage.getItem(chromeModeStorageKey);
		if (value === 'linked' || value === 'contrast') {
			return value;
		}

		return defaultChromeMode;
	});

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove('light', 'dark');
		if (theme === 'system') {
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
				.matches
				? 'dark'
				: 'light';
			root.classList.add(systemTheme);
			return;
		}
		root.classList.add(theme);
	}, [theme]);

	useEffect(() => {
		const root = window.document.documentElement;
		root.dataset.themePreset = preset;
	}, [preset]);

	useEffect(() => {
		const root = window.document.documentElement;
		root.dataset.chromeMode = chromeMode;
	}, [chromeMode]);

	const value = {
		theme,
		setTheme: (theme: Theme) => {
			localStorage.setItem(storageKey, theme);
			setTheme(theme);
		},
		preset,
		setPreset: (preset: ThemePreset) => {
			localStorage.setItem(presetStorageKey, preset);
			setPreset(preset);
		},
		chromeMode,
		setChromeMode: (mode: ThemeChromeMode) => {
			localStorage.setItem(chromeModeStorageKey, mode);
			setChromeModeState(mode);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);
	if (context === undefined)
		throw new Error('useTheme must be used within a ThemeProvider');
	return context;
};
