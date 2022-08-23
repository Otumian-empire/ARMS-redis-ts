import { Entity, Schema, SchemaDefinition } from "redis-om";

interface KinEntity {
  tenantId: string;
  fullName: string;
  email: string;
  phone: string;
  residenceAddress: string;
}

class KinEntity extends Entity {}

const KinSchemaStructure: SchemaDefinition = {
  tenantId: {
    type: "string"
  },
  fullName: {
    type: "string"
  },
  email: {
    type: "string"
  },
  phone: {
    type: "string"
  },
  residenceAddress: {
    type: "string"
  }
};

export default new Schema(KinEntity, KinSchemaStructure, {
  dataStructure: "JSON"
});
