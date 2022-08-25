import client from "../redis.client";
import logger from "../config/logger";
import { Cash, Tenant } from "../db";
import {
  AN_ERROR_OCCURRED,
  CASH_ADDED_SUCCESSFULLY,
  DELETED_SUCCESSFULLY,
  INVALID_CREDENTIALS,
  NOT_FOUND
} from "../util/api.message";
import { PAGINATION, REDIS_TTL } from "../util/app.constant";
import { generateToken, pagination } from "../util/function";

export default class CashController {
  static async find(req, res) {
    try {
      const page = parseInt(req.query.page) || PAGINATION.page;
      const pageSize = parseInt(req.query.pageSize) || PAGINATION.pageSize;

      const { limit, skip } = pagination(page, pageSize);

      await Cash.dropIndex();
      await Cash.createIndex();

      const cashes = await Cash.search().return.page(skip, limit);

      const redisKey = `CASH:${page}:${pageSize}`;
      await client.execute([
        "SETEX",
        redisKey,
        REDIS_TTL,
        JSON.stringify(cashes)
      ]);

      return res.json(cashes);
    } catch (error) {
      logger.error(error.message);

      return res.json({
        success: false,
        message: AN_ERROR_OCCURRED
      });
    }
  }

  static async findByTenantId(req, res) {
    try {
      const page = parseInt(req.query.page) || PAGINATION.page;
      const pageSize = parseInt(req.query.pageSize) || PAGINATION.pageSize;

      const { limit, skip } = pagination(page, pageSize);
      const id = req.params.id;

      const cashes = await Cash.search()
        .where("tenantId")
        .equals(id)
        .return.page(skip, limit);

      const redisKey = `CASH:${id}:${page}:${pageSize}`;
      await client.execute([
        "SETEX",
        redisKey,
        REDIS_TTL,
        JSON.stringify(cashes)
      ]);

      return res.json(cashes);
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
      const amount = Number(req.body.amount) || 0;

      if (!id || !amount) {
        return res.json({
          success: false,
          message: AN_ERROR_OCCURRED
        });
      }

      const tenant: any = await Tenant.fetch(id);

      if (!tenant || !tenant.username || !tenant.email) {
        return res.json({
          success: false,
          message: INVALID_CREDENTIALS
        });
      }

      const token = generateToken();

      const cash = await Cash.createEntity({
        tenantId: tenant.entityId,
        token,
        amount,
        paidAt: Date.now()
      });

      const cashId = await Cash.save(cash);

      if (!cashId) {
        return res.json({
          success: false,
          message: AN_ERROR_OCCURRED
        });
      }

      return res.json({
        success: true,
        message: CASH_ADDED_SUCCESSFULLY,
        id: cashId
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

      await Cash.remove(id);

      return res.json({
        success: true,
        message: DELETED_SUCCESSFULLY,
        id: id
      });
    } catch (error) {
      logger.error(error.message);

      return res.json({
        success: false,
        message: INVALID_CREDENTIALS
      });
    }
  }
}
