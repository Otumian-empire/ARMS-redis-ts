import { Entity, Schema, SchemaDefinition } from "redis-om";

interface TenantEntity {
  fullName: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  dob: Date;
  prevResidenceAddress: string;
}

class TenantEntity extends Entity {}

const TenantSchemaStructure: SchemaDefinition = {
  fullName: {
    type: "string"
  },
  username: {
    type: "string"
  },
  password: {
    type: "string"
  },
  email: {
    type: "string"
  },
  phone: {
    type: "string"
  },
  // date of birth
  dob: {
    type: "date"
  },
  prevResidenceAddress: {
    type: "string"
  }
};

export default new Schema(TenantEntity, TenantSchemaStructure, {
  dataStructure: "JSON"
});
