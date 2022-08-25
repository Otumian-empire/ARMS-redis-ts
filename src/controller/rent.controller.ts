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

      const redisKey = `RENT:${page}:${pageSize}`;
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

      const rent: any = await Rent.fetch(id);

      if (!rent || !rent.tenantId || !rent.cashId || !rent.apartmentId) {
        return res.json({
          success: false,
          message: NOT_FOUND
        });
      }

      const redisKey = `RENT:${id}`;
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

      if (!id || !cashId || !apartmentId) {
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

      const cash: any = await Cash.fetch(cashId);

      if (!cash || cash.tenantId !== id) {
        return res.json({
          success: false,
          message: NOT_FOUND
        });
      }

      const apartment: any = await Apartment.fetch(apartmentId);

      if (!apartment || !apartment.roomNumber) {
        return res.json({
          success: false,
          message: INVALID_CREDENTIALS
        });
      }

      await Rent.dropIndex();
      await Rent.createIndex();

      // we could use the tenantId, apartment and cashId to search for the rented apartment
      // the idea is that a tenant can not use the same cash Id twice
      // so we can just use the cashId instead
      const isInvalidRental: any = await Rent.search()
        .where("cashId")
        .equals(cashId)
        .or("apartmentId")
        .equals(apartmentId)
        .return.first();

      // this may mean that the cashed Id has been used or the apartment is occupied
      if (isInvalidRental) {
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
        cashId,
        rentedAt: Date.now()
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

      await Rent.remove(id);

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
