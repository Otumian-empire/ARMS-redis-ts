import { Entity, Repository } from "redis-om";

import client from "../redis.client";
import {
  adminSchema
  // apartmentSchema,
  // cashSchema,
  // kinSchema,
  // rentSchema,
  // tenantSchema
} from "./schema";

// class Admin extends Repository <Entity>{
//   protected writeEntity(key: string, data: EntityData): Promise<void> {
//     throw new Error("Method not implemented.");
//   }
//   protected readEntity(key: string): Promise<EntityData> {
//     throw new Error("Method not implemented.");
//   }
// }

// Repository is an abstract class
const Admin: Repository<Entity> = client.fetchRepository(adminSchema);

// const Admin = new Repository(client, adminSchema);
// const Apartment = new Repository(client, apartmentSchema);
// const Cash = new Repository(client, cashSchema);
// const Kin = new Repository(client, kinSchema);
// const Rent = new Repository(client, rentSchema);
// const Tenant = new Repository(client, tenantSchema);

export { Admin /*  Apartment, Cash, Kin, Rent, Tenant */ };
