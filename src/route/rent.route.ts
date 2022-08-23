import { Router } from "express";
import {
  AdminAuthentication,
  JWTAuthentication as Auth
} from "../authentication";
import { RentCaching } from "../caching";
import { rentController } from "../controller";
import joiMiddleware from "../util/joi.middleware";
import schemas from "../util/joi.schema";

const route = Router();

// fetch all Rents
route.get(
  "/",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    RentCaching.find
  ],
  rentController.find
);

// fetch a Rent by Rent id
route.get(
  "/:id",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    joiMiddleware(schemas.idRequestParams, "params"),
    RentCaching.findOneByRentId
  ],
  rentController.findOneByRentId
);

// create a Rent - add Rent data
route.post(
  "/:id",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    joiMiddleware(schemas.idRequestParams, "params"),
    joiMiddleware(schemas.rentCreateRequestBody)
  ],
  rentController.create
);

// delete Rent data - admin privileges is needed
route.delete(
  "/:id",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    joiMiddleware(schemas.idRequestParams, "params")
  ],
  rentController.delete_
);

export default route;
