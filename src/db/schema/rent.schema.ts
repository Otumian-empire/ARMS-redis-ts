import { Entity, Schema, SchemaDefinition } from "redis-om";

interface RentEntity {
  tenantId: string;
  apartmentId: string;
  cashId: string;
  rentedAt: Date;
}

class RentEntity extends Entity {}

const RentSchemaStructure: SchemaDefinition = {
  tenantId: {
    type: "string"
  },
  apartmentId: {
    type: "string"
  },
  cashId: {
    type: "string"
  },
  rentedAt: {
    type: "date"
  }
};

export default new Schema(RentEntity, RentSchemaStructure, {
  dataStructure: "JSON"
});
