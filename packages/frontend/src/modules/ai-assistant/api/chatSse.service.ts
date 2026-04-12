import { instance } from '@/api';

interface StreamPayload {
	type?: string;
	text?: string;
	message?: string;
}

interface StreamCallbacks {
	onChunk: (text: string) => void;
	onDone: () => void;
	onError: (errorMessage: string) => void;
	onStatus?: (message: string) => void;
}

function parsePayload(raw: string): StreamPayload | null {
	try {
		const parsed = JSON.parse(raw);
		if (parsed?.data && typeof parsed.data === 'object') {
			return parsed.data as StreamPayload;
		}
		return parsed as StreamPayload;
	} catch {
		return { type: 'text_chunk', text: raw };
	}
}

export function streamChatMessage(
	chatId: string,
	message: string,
	callbacks: StreamCallbacks,
): () => void {
	const baseUrl = instance.defaults.baseURL ?? 'http://localhost:4200/api';
	const query = new URLSearchParams({ message, chatId });
	const streamUrl = `${baseUrl}/chat/stream?${query.toString()}`;
	const source = new EventSource(streamUrl, { withCredentials: true });

	source.onmessage = event => {
		const payload = parsePayload(event.data);
		if (!payload) return;

		if (payload.type === 'text_chunk') {
			callbacks.onChunk(payload.text ?? '');
			return;
		}

		if (payload.type === 'status') {
			callbacks.onStatus?.(payload.message ?? '');
			return;
		}

		if (payload.type === 'done') {
			callbacks.onDone();
			source.close();
		}
	};

	source.onerror = () => {
		callbacks.onError('Unable to connect to AI stream.');
		source.close();
	};

	return () => source.close();
}
