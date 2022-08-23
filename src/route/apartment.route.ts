import { Router } from "express";
import {
  AdminAuthentication,
  JWTAuthentication as Auth
} from "../authentication";
import { ApartmentCaching } from "../caching";
import { apartmentController } from "../controller";
import joiMiddleware from "../util/joi.middleware";
import schemas from "../util/joi.schema";

const route = Router();

// fetch all apartments
route.get(
  "/",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    ApartmentCaching.find
  ],
  apartmentController.find
);

// fetch an apartment
route.get(
  "/:id",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    joiMiddleware(schemas.idRequestParams, "params"),
    ApartmentCaching.findById
  ],
  apartmentController.findById
);

// create a apartment - add apartment data
route.post(
  "/",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    joiMiddleware(schemas.apartmentCreateRequestBody)
  ],
  apartmentController.create
);

// update - apartment may update the room_number, description, fee
route.put(
  "/:id",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    joiMiddleware(schemas.idRequestParams, "params"),
    joiMiddleware(schemas.apartmentUpdateRequestBody)
  ],
  apartmentController.update
);

// delete an apartment data - admin privileges is needed
route.delete(
  "/:id",
  [
    Auth.hasBearerToken,
    Auth.hasExpiredToken,
    AdminAuthentication,
    joiMiddleware(schemas.idRequestParams, "params")
  ],
  apartmentController.delete_
);

export default route;
