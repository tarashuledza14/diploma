import { useAsRef } from '@/hooks/use-as-ref';
import { useLazyRef } from '@/hooks/use-lazy-ref';
import { cn } from '@/lib/utils';
import {
	FileArchiveIcon,
	FileAudioIcon,
	FileCodeIcon,
	FileCogIcon,
	FileIcon,
	FileTextIcon,
	FileVideoIcon,
} from 'lucide-react';
import {
	Direction as DirectionPrimitive,
	Slot as SlotPrimitive,
} from 'radix-ui';
import * as React from 'react';

const ROOT_NAME = 'FileUpload';
const DROPZONE_NAME = 'FileUploadDropzone';
const TRIGGER_NAME = 'FileUploadTrigger';
const LIST_NAME = 'FileUploadList';
const ITEM_NAME = 'FileUploadItem';
const ITEM_PREVIEW_NAME = 'FileUploadItemPreview';
const ITEM_METADATA_NAME = 'FileUploadItemMetadata';
const ITEM_PROGRESS_NAME = 'FileUploadItemProgress';
const ITEM_DELETE_NAME = 'FileUploadItemDelete';
const CLEAR_NAME = 'FileUploadClear';

function formatBytes(bytes: number) {
	if (bytes === 0) return '0 B';
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function getFileIcon(file: File) {
	const type = file.type;
	const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

	if (type.startsWith('video/')) {
		return <FileVideoIcon />;
	}

	if (type.startsWith('audio/')) {
		return <FileAudioIcon />;
	}

	if (
		type.startsWith('text/') ||
		['txt', 'md', 'rtf', 'pdf'].includes(extension)
	) {
		return <FileTextIcon />;
	}

	if (
		[
			'html',
			'css',
			'js',
			'jsx',
			'ts',
			'tsx',
			'json',
			'xml',
			'php',
			'py',
			'rb',
			'java',
			'c',
			'cpp',
			'cs',
		].includes(extension)
	) {
		return <FileCodeIcon />;
	}

	if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
		return <FileArchiveIcon />;
	}

	if (
		['exe', 'msi', 'app', 'apk', 'deb', 'rpm'].includes(extension) ||
		type.startsWith('application/')
	) {
		return <FileCogIcon />;
	}

	return <FileIcon />;
}

type Direction = 'ltr' | 'rtl';

interface FileState {
	file: File;
	progress: number;
	error?: string;
	status: 'idle' | 'uploading' | 'error' | 'success';
}

interface StoreState {
	files: Map<File, FileState>;
	dragOver: boolean;
	invalid: boolean;
}

type StoreAction =
	| { type: 'ADD_FILES'; files: File[] }
	| { type: 'SET_FILES'; files: File[] }
	| { type: 'SET_PROGRESS'; file: File; progress: number }
	| { type: 'SET_SUCCESS'; file: File }
	| { type: 'SET_ERROR'; file: File; error: string }
	| { type: 'REMOVE_FILE'; file: File }
	| { type: 'SET_DRAG_OVER'; dragOver: boolean }
	| { type: 'SET_INVALID'; invalid: boolean }
	| { type: 'CLEAR' };

type Store = {
	getState: () => StoreState;
	dispatch: (action: StoreAction) => void;
	subscribe: (listener: () => void) => () => void;
};

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
	const context = React.useContext(StoreContext);
	if (!context) {
		throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
	}
	return context;
}

function useStore<T>(selector: (state: StoreState) => T): T {
	const store = useStoreContext('useStore');

	const lastValueRef = useLazyRef<{ value: T; state: StoreState } | null>(
		() => null,
	);

	const getSnapshot = React.useCallback(() => {
		const state = store.getState();
		const prevValue = lastValueRef.current;

		if (prevValue && prevValue.state === state) {
			return prevValue.value;
		}

		const nextValue = selector(state);
		lastValueRef.current = { value: nextValue, state };
		return nextValue;
	}, [store, selector, lastValueRef]);

	return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface FileUploadContextValue {
	inputId: string;
	dropzoneId: string;
	listId: string;
	labelId: string;
	disabled: boolean;
	dir: Direction;
	inputRef: React.RefObject<HTMLInputElement | null>;
	urlCache: WeakMap<File, string>;
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(
	null,
);

function useFileUploadContext(consumerName: string) {
	const context = React.useContext(FileUploadContext);
	if (!context) {
		throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
	}
	return context;
}

interface FileUploadProps extends Omit<
	React.ComponentProps<'div'>,
	'defaultValue' | 'onChange'
> {
	value?: File[];
	defaultValue?: File[];
	onValueChange?: (files: File[]) => void;
	onAccept?: (files: File[]) => void;
	onFileAccept?: (file: File) => void;
	onFileReject?: (file: File, message: string) => void;
	onFileValidate?: (file: File) => string | null | undefined;
	onUpload?: (
		files: File[],
		options: {
			onProgress: (file: File, progress: number) => void;
			onSuccess: (file: File) => void;
			onError: (file: File, error: Error) => void;
		},
	) => Promise<void> | void;
	accept?: string;
	maxFiles?: number;
	maxSize?: number;
	dir?: Direction;
	label?: string;
	name?: string;
	asChild?: boolean;
	disabled?: boolean;
	invalid?: boolean;
	multiple?: boolean;
	required?: boolean;
}

function FileUpload(props: FileUploadProps) {
	const {
		value,
		defaultValue,
		onValueChange,
		onAccept,
		onFileAccept,
		onFileReject,
		onFileValidate,
		onUpload,
		accept,
		maxFiles,
		maxSize,
		dir: dirProp,
		label,
		name,
		asChild,
		disabled = false,
		invalid = false,
		multiple = false,
		required = false,
		children,
		className,
		...rootProps
	} = props;

	const inputId = React.useId();
	const dropzoneId = React.useId();
	const listId = React.useId();
	const labelId = React.useId();

	const dir = DirectionPrimitive.useDirection(dirProp);
	const listeners = useLazyRef(() => new Set<() => void>()).current;
	const files = useLazyRef<Map<File, FileState>>(() => new Map()).current;
	const urlCache = useLazyRef(() => new WeakMap<File, string>()).current;
	const inputRef = React.useRef<HTMLInputElement>(null);
	const isControlled = value !== undefined;

	const propsRef = useAsRef({
		onValueChange,
		onAccept,
		onFileAccept,
		onFileReject,
		onFileValidate,
		onUpload,
	});

	const store = React.useMemo<Store>(() => {
		let state: StoreState = {
			files,
			dragOver: false,
			invalid: invalid,
		};

		function reducer(state: StoreState, action: StoreAction): StoreState {
			switch (action.type) {
				case 'ADD_FILES': {
					for (const file of action.files) {
						files.set(file, {
							file,
							progress: 0,
							status: 'idle',
						});
					}

					if (propsRef.current.onValueChange) {
						const fileList = Array.from(files.values()).map(
							fileState => fileState.file,
						);
						propsRef.current.onValueChange(fileList);
					}
					return { ...state, files };
				}

				case 'SET_FILES': {
					const newFileSet = new Set(action.files);
					for (const existingFile of files.keys()) {
						if (!newFileSet.has(existingFile)) {
							files.delete(existingFile);
						}
					}

					for (const file of action.files) {
						const existingState = files.get(file);
						if (!existingState) {
							files.set(file, {
								file,
								progress: 0,
								status: 'idle',
							});
						}
					}
					return { ...state, files };
				}

				case 'SET_PROGRESS': {
					const fileState = files.get(action.file);
					if (fileState) {
						files.set(action.file, {
							...fileState,
							progress: action.progress,
							status: 'uploading',
						});
					}
					return { ...state, files };
				}

				case 'SET_SUCCESS': {
					const fileState = files.get(action.file);
					if (fileState) {
						files.set(action.file, {
							...fileState,
							progress: 100,
							status: 'success',
						});
					}
					return { ...state, files };
				}

				case 'SET_ERROR': {
					const fileState = files.get(action.file);
					if (fileState) {
						files.set(action.file, {
							...fileState,
							error: action.error,
							status: 'error',
						});
					}
					return { ...state, files };
				}

				case 'REMOVE_FILE': {
					const cachedUrl = urlCache.get(action.file);
					if (cachedUrl) {
						URL.revokeObjectURL(cachedUrl);
						urlCache.delete(action.file);
					}

					files.delete(action.file);

					if (propsRef.current.onValueChange) {
						const fileList = Array.from(files.values()).map(
							fileState => fileState.file,
						);
						propsRef.current.onValueChange(fileList);
					}
					return { ...state, files };
				}

				case 'SET_DRAG_OVER': {
					return { ...state, dragOver: action.dragOver };
				}

				case 'SET_INVALID': {
					return { ...state, invalid: action.invalid };
				}

				case 'CLEAR': {
					for (const file of files.keys()) {
						const cachedUrl = urlCache.get(file);
						if (cachedUrl) {
							URL.revokeObjectURL(cachedUrl);
							urlCache.delete(file);
						}
					}

					files.clear();
					if (propsRef.current.onValueChange) {
						propsRef.current.onValueChange([]);
					}
					return { ...state, files, invalid: false };
				}

				default:
					return state;
			}
		}

		return {
			getState: () => state,
			dispatch: action => {
				state = reducer(state, action);
				for (const listener of listeners) {
					listener();
				}
			},
			subscribe: listener => {
				listeners.add(listener);
				return () => listeners.delete(listener);
			},
		};
	}, [listeners, files, invalid, propsRef, urlCache]);

	const acceptTypes = React.useMemo(
		() => accept?.split(',').map(t => t.trim()) ?? null,
		[accept],
	);

	const onProgress = useLazyRef(() => {
		let frame = 0;
		return (file: File, progress: number) => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				store.dispatch({
					type: 'SET_PROGRESS',
					file,
					progress: Math.min(Math.max(0, progress), 100),
				});
			});
		};
	}).current;

	React.useEffect(() => {
		if (isControlled) {
			store.dispatch({ type: 'SET_FILES', files: value });
		} else if (
			defaultValue &&
			defaultValue.length > 0 &&
			!store.getState().files.size
		) {
			store.dispatch({ type: 'SET_FILES', files: defaultValue });
		}
	}, [value, defaultValue, isControlled, store]);

	React.useEffect(() => {
		return () => {
			for (const file of files.keys()) {
				const cachedUrl = urlCache.get(file);
				if (cachedUrl) {
					URL.revokeObjectURL(cachedUrl);
				}
			}
		};
	}, [files, urlCache]);

	const onFilesUpload = React.useCallback(
		async (files: File[]) => {
			try {
				for (const file of files) {
					store.dispatch({ type: 'SET_PROGRESS', file, progress: 0 });
				}

				if (propsRef.current.onUpload) {
					await propsRef.current.onUpload(files, {
						onProgress,
						onSuccess: file => {
							store.dispatch({ type: 'SET_SUCCESS', file });
						},
						onError: (file, error) => {
							store.dispatch({
								type: 'SET_ERROR',
								file,
								error: error.message ?? 'Upload failed',
							});
						},
					});
				} else {
					for (const file of files) {
						store.dispatch({ type: 'SET_SUCCESS', file });
					}
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Upload failed';
				for (const file of files) {
					store.dispatch({
						type: 'SET_ERROR',
						file,
						error: errorMessage,
					});
				}
			}
		},
		[store, propsRef, onProgress],
	);

	const onFilesChange = React.useCallback(
		(originalFiles: File[]) => {
			if (disabled) return;

			let filesToProcess = [...originalFiles];
			let invalid = false;

			if (maxFiles) {
				const currentCount = store.getState().files.size;
				const remainingSlotCount = Math.max(0, maxFiles - currentCount);

				if (remainingSlotCount < filesToProcess.length) {
					const rejectedFiles = filesToProcess.slice(remainingSlotCount);
					invalid = true;

					filesToProcess = filesToProcess.slice(0, remainingSlotCount);

					for (const file of rejectedFiles) {
						let rejectionMessage = `Maximum ${maxFiles} files allowed`;

						if (propsRef.current.onFileValidate) {
							const validationMessage = propsRef.current.onFileValidate(file);
							if (validationMessage) {
								rejectionMessage = validationMessage;
							}
						}

						propsRef.current.onFileReject?.(file, rejectionMessage);
					}
				}
			}

			const acceptedFiles: File[] = [];
			const rejectedFiles: { file: File; message: string }[] = [];

			for (const file of filesToProcess) {
				let rejected = false;
				let rejectionMessage = '';

				if (propsRef.current.onFileValidate) {
					const validationMessage = propsRef.current.onFileValidate(file);
					if (validationMessage) {
						rejectionMessage = validationMessage;
						propsRef.current.onFileReject?.(file, rejectionMessage);
						rejected = true;
						invalid = true;
						continue;
					}
				}

				if (acceptTypes) {
					const fileType = file.type;
					const fileExtension = `.${file.name.split('.').pop()}`;

					if (
						!acceptTypes.some(
							type =>
								type === fileType ||
								type === fileExtension ||
								(type.includes('