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
		label: 'aiAssistant.suggestedQueries.vehicleHistory.label',
		query: 'aiAssistant.suggestedQueries.vehicleHistory.query',
	},
	{
		icon: ClipboardList,
		label: 'aiAssistant.suggestedQueries.overdueOrders.label',
		query: 'aiAssistant.suggestedQueries.overdueOrders.query',
	},
	{
		icon: Package,
		label: 'aiAssistant.suggestedQueries.lowStock.label',
		query: 'aiAssistant.suggestedQueries.lowStock.query',
	},
	{
		icon: Users,
		label: 'aiAssistant.suggestedQueries.topClients.label',
		query: 'aiAssistant.suggestedQueries.topClients.query',
	},
	{
		icon: Wrench,
		label: 'aiAssistant.suggestedQueries.mechanicLoad.label',
		query: 'aiAssistant.suggestedQueries.mechanicLoad.query',
	},
	{
		icon: Lightbulb,
		label: 'aiAssistant.suggestedQueries.recommendations.label',
		query: 'aiAssistant.suggestedQueries.recommendations.query',
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
