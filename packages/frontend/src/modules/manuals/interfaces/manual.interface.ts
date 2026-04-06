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
