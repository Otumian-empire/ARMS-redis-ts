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

class TenantEntity extends Entity {
  toJSON() {
    return {
      fullName: this.fullName,
      username: this.username,
      email: this.email,
      phone: this.phone,
      dob: this.dob,
      prevResidenceAddress: this.prevResidenceAddress,
      entityId: this.entityId
    };
  }
}

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
