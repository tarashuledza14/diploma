import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getClientInitials(name: string) {
	return name
		.split(' ')
		.map((n: string) => n[0])
		.join('');
}
