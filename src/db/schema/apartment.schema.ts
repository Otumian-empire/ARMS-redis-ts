import { Entity, Schema, SchemaDefinition } from "redis-om";

interface ApartmentEntity {
  roomNumber: string;
  description: string;
  prince: number;
}

class ApartmentEntity extends Entity {}

const ApartmentSchemaStructure: SchemaDefinition = {
  roomNumber: {
    type: "string"
  },
  description: {
    type: "string"
  },
  price: {
    type: "number"
  }
};

export default new Schema(ApartmentEntity, ApartmentSchemaStructure, {
  dataStructure: "JSON"
});
