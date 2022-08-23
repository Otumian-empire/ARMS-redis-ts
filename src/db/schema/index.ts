import { Schema, SchemaDefinition, Entity } from "redis-om";
import AdminSchema from "./admin.schema";
// import ApartmentSchema from "./apartment.schema.js";
// import CashSchema from "./cash.schema.js";
// import KinSchema from "./kin.schema.js";
// import RentSchema from "./rent.schema.js";
// import TenantSchema from "./tenant.schema.js";

export const adminSchema: Schema<Entity> = AdminSchema;
// export const apartmentSchema = ApartmentSchema;
// export const cashSchema = CashSchema;
// export const kinSchema = KinSchema;
// export const rentSchema = RentSchema;
// export const tenantSchema = TenantSchema;
