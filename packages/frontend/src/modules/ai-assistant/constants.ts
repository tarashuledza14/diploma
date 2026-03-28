import {
	Car,
	ClipboardList,
	Lightbulb,
	Package,
	Users,
	Wrench,
} from 'lucide-react';

import type { AssistantMessage, SuggestedQuery } from './types';

export const suggestedQueries: SuggestedQuery[] = [
	{
		icon: Car,
		label: 'Vehicle History',
		query: 'Show me the service history for vehicle plate ABC-1234',
	},
	{
		icon: ClipboardList,
		label: 'Overdue Orders',
		query: 'What orders are currently overdue?',
	},
	{
		icon: Package,
		label: 'Low Stock',
		query: 'Which parts need to be reordered?',
	},
	{
		icon: Users,
		label: 'Top Clients',
		query: 'Who are our top 5 clients by revenue this month?',
	},
	{
		icon: Wrench,
		label: 'Mechanic Load',
		query: 'How many orders does each mechanic have assigned?',
	},
	{
		icon: Lightbulb,
		label: 'Recommendations',
		query: 'What services should we recommend for a 2022 BMW X5 at 50,000 km?',
	},
];

export function createInitialConversation(): AssistantMessage[] {
	return [
		{
			id: '1',
			role: 'assistant',
			content:
				"Hello! I'm your AutoCRM AI Assistant. I can help you with:\n\n- Finding order information\n- Checking vehicle service history\n- Inventory status and recommendations\n- Client insights and analytics\n- Service recommendations\n\nHow can I help you today?",
			timestamp: new Date(),
		},
	];
}
