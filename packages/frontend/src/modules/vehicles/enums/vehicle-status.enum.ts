export enum VehicleStatus {
	OUT = 'OUT', // У клієнта (не на території СТО) - це дефолтний статус
	PENDING = 'PENDING', // Приїхала, стоїть на парковці/прийманні (очікує майстра)
	IN_SERVICE = 'IN_SERVICE', // Знаходиться в боксі (на підйомнику, в роботі)
	TEST_DRIVE = 'TEST_DRIVE', // На тест-драйві (перевірка майстром)
	READY = 'READY', // Готова, стоїть на парковці видачі (чекає клієнта)
}
export type VehicleStatusType = keyof typeof VehicleStatus;
