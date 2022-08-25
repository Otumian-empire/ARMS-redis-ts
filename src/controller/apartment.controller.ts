import logger from "../config/logger";
import { Apartment } from "../db";
import client from "../redis.client";
import {
  AN_ERROR_OCCURRED,
  APARTMENT_ALREADY_EXIST,
  APARTMENT_CREATED_SUCCESSFULLY,
  DELETED_SUCCESSFULLY,
  INVALID_PRICE,
  INVALID_ROOM_NUMBER,
  NOT_FOUND,
  UPDATE_SUCCESSFUL
} from "../util/api.message";
import { PAGINATION, REDIS_TTL } from "../util/app.constant";
import { isValidPrice, isValidRoomNumber, pagination } from "../util/function";

export default class ApartmentController {
  static async find(req, res) {
    try {
      const page = parseInt(req.query.page) || PAGINATION.page;
      const pageSize = parseInt(req.query.pageSize) || PAGINATION.pageSize;

      const { limit, skip } = pagination(page, pageSize);

      await Apartment.dropIndex();
      await Apartment.createIndex();

      const apartments = await Apartment.search().return.page(skip, limit);

      const redisKey = `APARTMENT:${page}:${pageSize}`;
      await client.execute([
        "SETEX",
        redisKey,
        REDIS_TTL,
        JSON.stringify(apartments)
      ]);

      return res.json(apartments);
    } catch (error) {
      logger.error(error.message);

      return res.json({
        success: false,
        message: AN_ERROR_OCCURRED
      });
    }
  }

  static async findById(req, res) {
    try {
      const id = req.params.id;
      const apartment = await Apartment.fetch(id);

      if (!apartment) {
        return res.json({
          success: false,
          message: NOT_FOUND
        });
      }

      const redisKey = `APARTMENT:${id}`;
      await client.execute([
        "SETEX",
        redisKey,
        REDIS_TTL,
        JSON.stringify(apartment)
      ]);

      return res.json(apartment);
    } catch (error) {
      logger.error(error.message);

      return res.json({
        success: false,
        message: error.message
      });
    }
  }

  static async hasDuplicate(data: any) {
    await Apartment.dropIndex();
    await Apartment.createIndex();

    const { roomNumber } = data;

    const result: any = await Apartment.search()
      .where("roomNumber")
      .equals(roomNumber)
      .return.first();

    return result;
  }

  static async create(req, res) {
    try {
      if (await ApartmentController.hasDuplicate(req.body)) {
        return res.json({
          success: false,
          message: APARTMENT_ALREADY_EXIST
        });
      }

      let { roomNumber, description, price } = req.body;

      if (!isValidRoomNumber(roomNumber)) {
        return res.json({
          success: false,
          message: INVALID_ROOM_NUMBER
        });
      }

      if (!isValidPrice(price)) {
        return res.json({
          success: false,
          message: INVALID_PRICE
        });
      }

      const apartment = Apartment.createEntity({
        roomNumber,
        description,
        price: Number(price)
      });

      const id = await Apartment.save(apartment);

      if (!id) {
        return res.json({
          success: false,
          message: AN_ERROR_OCCURRED
        });
      }

      return res.json({
        success: true,
        message: APARTMENT_CREATED_SUCCESSFULLY,
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

  static async update(req, res) {
    try {
      const id = req.params.id;
      const { roomNumber, description, price } = req.body;

      const apartment: any = await Apartment.fetch(id);

      if (!apartment) {
        return res.json({
          success: false,
          message: NOT_FOUND
        });
      }

      if (roomNumber) {
        if (!isValidRoomNumber(roomNumber)) {
          return res.json({
            success: false,
            message: INVALID_ROOM_NUMBER
          });
        }

        apartment.roomNumber = roomNumber;
      }

      if (description) {
        apartment.description = description;
      }

      if (price) {
        if (!isValidPrice(price)) {
          return res.json({
            success: false,
            message: INVALID_PRICE
          });
        }

        apartment.price = Number(price);
      }

      const updatedId = await Apartment.save(apartment);

      if (!updatedId) {
        return res.json({
          success: false,
          message: AN_ERROR_OCCURRED
        });
      }

      return res.json({
        success: true,
        message: UPDATE_SUCCESSFUL,
        id: updatedId
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

      await Apartment.remove(id);

      // delete the cache when the apartment is deleted
      const redisKey = `APARTMENT:${id}`;
      if (await client.execute(["GET", redisKey])) {
        await client.execute(["DEL", redisKey]);
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
