import client from "../redis.client";
import logger from "../config/logger";
import { Apartment, Cash, Rent, Tenant } from "../db";
import {
  AN_ERROR_OCCURRED,
  APARTMENT_IS_OCCUPIED,
  DELETED_SUCCESSFULLY,
  INVALID_CREDENTIALS,
  NOT_FOUND,
  RENT_ADDED_SUCCESSFULLY
} from "../util/api.message";
import { PAGINATION, REDIS_TTL } from "../util/app.constant";
import { pagination } from "../util/function";

export default class RentController {
  static async find(req, res) {
    try {
      const page = parseInt(req.query.page) || PAGINATION.page;
      const pageSize = parseInt(req.query.pageSize) || PAGINATION.pageSize;

      const { limit, skip } = pagination(page, pageSize);

      const rents = await Rent.search().return.page(skip, limit);

      const redisKey = `CASH:${page}:${pageSize}`;
      await client.execute([
        "SETEX",
        redisKey,
        REDIS_TTL,
        JSON.stringify(rents)
      ]);

      return res.json(rents);
    } catch (error) {
      logger.error(error.message);

      return res.json({
        success: false,
        message: AN_ERROR_OCCURRED
      });
    }
  }

  static async findOneByRentId(req, res) {
    try {
      const id = req.params.id;
      const rent = await Rent.fetch(id);

      const redisKey = `RentEntity:${id}`;
      await client.execute([
        "SETEX",
        redisKey,
        REDIS_TTL,
        JSON.stringify(rent)
      ]);

      return res.json(rent);
    } catch (error) {
      logger.error(error.message);

      return res.json({
        success: false,
        message: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const id = req.params.id;
      const { apartmentId, cashId } = req.body;

      if (!id || !apartmentId || !cashId) {
        return res.json({
          success: false,
          message: INVALID_CREDENTIALS
        });
      }

      const tenant: any = await Tenant.fetch(id);

      if (!tenant || !tenant.username || !tenant.email) {
        return res.json({
          success: false,
          message: INVALID_CREDENTIALS
        });
      }

      await Cash.dropIndex();
      await Cash.createIndex();

      const cash: any = await Cash.search()
        .where("tenantId")
        .equals(id)
        .return.first();

      if (!cash || cash.entityId !== cashId) {
        return res.json({
          success: false,
          message: NOT_FOUND
        });
      }

      const apartment = await Apartment.fetch(apartmentId);

      if (apartment) {
        return res.json({
          success: false,
          message: INVALID_CREDENTIALS
        });
      }

      await Rent.dropIndex();
      await Rent.createIndex();

      const isOccupied: any = await Rent.search()
        .where("apartmentId")
        .equals(apartmentId)
        .return.first();

      if (isOccupied.tenantId) {
        return res.json({
          success: false,
          message: APARTMENT_IS_OCCUPIED
        });
      }

      // TODO: add a field to the cash table that indicates the
      // status of cash. we can not rent with an apartment with
      // a used cash ID
      const rent = await Rent.createEntity({
        tenantId: id,
        apartmentId,
        cashId
      });

      const rentId = await Rent.save(rent);

      if (!rentId) {
        return res.json({
          success: false,
          message: AN_ERROR_OCCURRED
        });
      }

      return res.json({
        success: true,
        message: RENT_ADDED_SUCCESSFULLY,
        id: rentId
      });
    } catch (error) {
      logger.error(error.message);

      return res.json({
        success: false,
        message: error.message
      });
    }
  }

  static async delete_(req, res) {
    try {
      const id = req.params.id;

      const result: any = await Rent.remove(id);

      if (result) {
        return res.json({
          success: false,
          message: NOT_FOUND
        });
      }

      return res.json({
        success: true,
        message: DELETED_SUCCESSFULLY,
        id: id
      });
    } catch (error) {
      logger.error(error.message);

      return res.json({
        success: false,
        message: error.message
      });
    }
  }
}
