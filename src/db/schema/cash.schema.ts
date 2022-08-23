import { Entity, Schema, SchemaDefinition } from "redis-om";

interface CashEntity {
  tenantId: string;
  token: string;
  amount: number;
  paidAt: Date;
}

class CashEntity extends Entity {}

const CashSchemaStructure: SchemaDefinition = {
  tenantId: {
    type: "string"
  },
  token: {
    type: "string"
  },
  amount: {
    type: "number"
  },
  paidAt: {
    type: "date"
  }
};

export default new Schema(CashEntity, CashSchemaStructure, {
  dataStructure: "JSON"
});
