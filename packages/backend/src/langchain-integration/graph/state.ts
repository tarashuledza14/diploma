import { BaseMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';

export const AgentState = Annotation.Root({
	
	messages: Annotation<BaseMessage[]>({
		reducer: (state, update) => state.concat(update),
		default: () => [],
	}),

	
	next: Annotation<string>({
		reducer: (state, update) => update ?? state,
		default: () => 'supervisor',
	}),

	
	sender: Annotation<string>({
		reducer: (state, update) => update ?? state,
		default: () => 'user',
	}),

	
	carContext: Annotation<string | null>({
		reducer: (state, update) => update ?? state,
		default: () => null,
	}),

	
	userRole: Annotation<string>({
		reducer: (state, update) => update ?? state,
		default: () => 'MECHANIC',
	}),

	
	organizationId: Annotation<string | null>({
		reducer: (state, update) => update ?? state,
		default: () => null,
	}),
});
