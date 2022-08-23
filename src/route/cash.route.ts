import { Router } from "express";
import {
  AdminAuthentication,
  JWTAuthentication as Auth
} from "../authentication";
import { CashCaching } from "../caching";
import { cashController } from "../controller";
import joiMiddleware from "../util/joi.middleware";
import schemas from "../util/joi.schema";

const route = Router();

// TODO: think about adding an endpoint for reading using the cash's ID
// TODO: Refactor the middleware placements. Make use of route.use([...,])

route.get(
  "/",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    CashCaching.find
  ],
  cashController.find
);

// fetch an cash
route.get(
  "/:id",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    joiMiddleware(schemas.idRequestParams, "params"),
    CashCaching.findByTenantId
  ],
  cashController.findByTenantId
);

// create a cash - add cash data
route.post(
  "/:id",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    joiMiddleware(schemas.idRequestParams, "params"),
    joiMiddleware(schemas.cashCreateRequestBody)
  ],
  cashController.create
);

// delete cash data - cash privileges is needed
route.delete(
  "/:id",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    joiMiddleware(schemas.idRequestParams, "params")
  ],
  cashController.delete_
);

export default route;
