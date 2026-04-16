import { BaseMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';

export const AgentState = Annotation.Root({
	// 1. Історія листування
	messages: Annotation<BaseMessage[]>({
		reducer: (state, update) => state.concat(update),
		default: () => [],
	}),

	// 2. Хто має працювати наступним
	next: Annotation<string>({
		reducer: (state, update) => update ?? state,
		default: () => 'supervisor',
	}),

	// 3. Хто щойно закінчив роботу
	sender: Annotation<string>({
		reducer: (state, update) => update ?? state,
		default: () => 'user',
	}),

	// 4. Контекст автомобіля (Марка/Модель, про яку йде мова)
	carContext: Annotation<string | null>({
		reducer: (state, update) => update ?? state,
		default: () => null,
	}),

	// 5. Роль користувача (для перевірки доступів)
	userRole: Annotation<string>({
		reducer: (state, update) => update ?? state,
		default: () => 'MECHANIC',
	}),

	// 6. Організація користувача для tenant-scoped запитів у db_node
	organizationId: Annotation<string | null>({
		reducer: (state, update) => update ?? state,
		default: () => null,
	}),
});
