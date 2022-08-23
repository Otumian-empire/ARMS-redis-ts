import { Entity, Schema, SchemaDefinition } from "redis-om";

interface AdminEntity {
  username: string;
  password: string;
  email: string;
}

class AdminEntity extends Entity {}

const AdminSchemaStructure: SchemaDefinition = {
  username: {
    type: "string"
  },
  password: {
    type: "string"
  },
  email: {
    type: "string"
  }
};

export default new Schema(AdminEntity, AdminSchemaStructure, {
  dataStructure: "JSON"
});
