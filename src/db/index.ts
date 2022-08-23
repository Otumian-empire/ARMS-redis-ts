import { Entity, Repository } from "redis-om";

import client from "../redis.client";
import {
  adminSchema,
  apartmentSchema,
  cashSchema,
  kinSchema,
  rentSchema,
  tenantSchema
} from "./schema";

const Admin: Repository<Entity> = client.fetchRepository(adminSchema);
const Apartment: Repository<Entity> = client.fetchRepository(apartmentSchema);
const Cash: Repository<Entity> = client.fetchRepository(cashSchema);
const Kin: Repository<Entity> = client.fetchRepository(kinSchema);
const Rent: Repository<Entity> = client.fetchRepository(rentSchema);
const Tenant: Repository<Entity> = client.fetchRepository(tenantSchema);

export { Admin, Apartment, Cash, Kin, Rent, Tenant };
