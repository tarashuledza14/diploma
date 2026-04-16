export function sanitizeAssistantContent(content: string): string {
	if (!content) {
		return '';
	}

	const withoutToolDirectives = content
		.replace(/BEGIN_TOOL_CALL\.[\w-]+\([\s\S]*?\)\s*/gi, '')
		.replace(/BEGIN_TOOL_CALL[\s\S]*?END_TOOL_CALL\s*/gi, '')
		.replace(/BEGIN_TOOL_CALL[\s\S]*$/gi, '');

	// Collapse accidental 3+ blank lines from model/tool output into standard paragraph breaks.
	return withoutToolDirectives
		.replace(/\n{3,}/g, '\n\n')
		.replace(/[ \t]+\n/g, '\n')
		.trim();
}
