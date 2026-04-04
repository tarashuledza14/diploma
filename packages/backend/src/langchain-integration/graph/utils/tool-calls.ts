import { BaseMessageLike } from '@langchain/core/messages';

type ToolCall = {
	name: string;
	id?: string;
};

type ToolResponseLike = {
	content?: unknown;
};

type InvokableTool = {
	invoke: (input: any, config?: any) => Promise<any>;
};

function normalizeToolContent(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (Array.isArray(value)) {
		return value
			.map(part => {
				if (typeof part === 'string') return part;
				if (part && typeof part === 'object' && 'text' in part) {
					const text = (part as { text?: unknown }).text;
					return typeof text === 'string' ? text : '';
				}
				return '';
			})
			.join('');
	}

	if (value && typeof value === 'object' && 'content' in value) {
		const response = value as ToolResponseLike;
		return normalizeToolContent(response.content);
	}

	try {
		return JSON.stringify(value);
	} catch {
		return String(value ?? '');
	}
}

export async function handleToolCalls(
	response: { tool_calls?: ToolCall[] },
	toolsByName: Record<string, InvokableTool>,
): Promise<BaseMessageLike[]> {
	const toolCalls = response.tool_calls || [];
	const toolMessages: BaseMessageLike[] = [];

	for (const toolCall of toolCalls) {
		const tool = toolsByName[toolCall.name];
		if (!tool) {
			continue;
		}

		const toolResponse = await tool.invoke(toolCall);
		console.log('toolResponse', toolResponse);
		toolMessages.push({
			role: 'tool',
			content: normalizeToolContent(toolResponse),
			tool_call_id: toolCall.id,
		});
	}

	return toolMessages;
}
