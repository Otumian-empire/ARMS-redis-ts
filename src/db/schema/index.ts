import { Schema, Entity } from "redis-om";
import AdminSchema from "./admin.schema";
import ApartmentSchema from "./apartment.schema";
import CashSchema from "./cash.schema";
import KinSchema from "./kin.schema";
import RentSchema from "./rent.schema";
import TenantSchema from "./tenant.schema";

export const adminSchema: Schema<Entity> = AdminSchema;
export const apartmentSchema: Schema<Entity> = ApartmentSchema;
export const cashSchema: Schema<Entity> = CashSchema;
export const kinSchema: Schema<Entity> = KinSchema;
export const rentSchema: Schema<Entity> = RentSchema;
export const tenantSchema: Schema<Entity> = TenantSchema;
