export interface ManualItem {
	id: string;
	filename: string;
	carModel: string | null;
	createdAt: string;
}

export interface ManualOpenLinkResponse {
	url: string;
	filename: string;
	carModel: string | null;
}

export interface ManualDeleteResponse {
	success: boolean;
	storageCleanupPending?: boolean;
}
