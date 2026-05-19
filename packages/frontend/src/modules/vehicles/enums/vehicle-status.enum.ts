export enum VehicleStatus {
  OUT = "OUT",
  PENDING = "PENDING",
  IN_SERVICE = "IN_SERVICE",
  TEST_DRIVE = "TEST_DRIVE",
  READY = "READY",
}
export type VehicleStatusType = keyof typeof VehicleStatus;
