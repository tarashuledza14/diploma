export enum VehicleStatus {
	OUT, // У клієнта (не на території СТО) - це дефолтний статус
	PENDING, // Приїхала, стоїть на парковці/прийманні (очікує майстра)
	IN_SERVICE, // Знаходиться в боксі (на підйомнику, в роботі)
	TEST_DRIVE, // На тест-драйві (перевірка майстром)
	READY, // Готова, стоїть на парковці видачі (чекає клієнта)
}
export type VehicleStatusType = keyof typeof VehicleStatus;
