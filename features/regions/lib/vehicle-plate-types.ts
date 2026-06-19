import type { VehiclePlateType } from "@prisma/client";

export const VEHICLE_PLATE_TYPES: VehiclePlateType[] = [
  "CAR",
  "MOTORCYCLE",
  "PUBLIC_TRANSPORT",
  "COMMERCIAL",
  "GOVERNMENT",
  "OTHER",
];

export function isVehiclePlateType(value: string): value is VehiclePlateType {
  return VEHICLE_PLATE_TYPES.includes(value as VehiclePlateType);
}
