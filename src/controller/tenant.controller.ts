import { compare, hash } from "bcrypt";
import { JWTAuthentication as Auth } from "../authentication";
import client from "../redis.client";
import logger from "../config/logger";
import { Tenant } from "../db";
import {
  AN_ERROR_OCCURRED,
  DELETED_SUCCESSFULLY,
  INVALID_CREDENTIALS,
  KIN_IS_REQUIRED,
  LOGIN_SUCCESSFUL,
  NOT_FOUND,
  TENANT_CREATED_SUCCESSFULLY,
  UPDATE_SUCCESSFUL
} from "../util/api.message";
import { PAGINATION, REDIS_TTL, rounds } from "../util/app.constant";
import { pagination } from "../util/function";

export default class TenantController {
  static async find(req, res) {
    try {
      const page = parseInt(req.query.page) || PAGINATION.page;
      const pageSize = parseInt(req.query.pageSize) || PAGINATION.pageSize;

      const { limit, skip } = pagination(page, pageSize);

      const tenants = await Tenant.search().return.page(skip, limit);

      const redisKey = `TENANT:${page}:${pageSize}`;
      await client.execute([
        "SETEX",
        redisKey,
        REDIS_TTL,
        JSON.stringify(tenants)
      ]);

      return res.json(tenants);
    } catch (error) {
      logger.error(error.message);

      return res.json({
        success: false,
        message: error.message
      });
    }
  }

  static async findById(req, res) {
    try {
      const id = req.params.id;

      const tenant: any = await Tenant.fetch(id);

      if (!tenant || !tenant.username || !tenant.email) {
        return res.json({
          success: false,
          message: NOT_FOUND
        });
      }

      const redisKey = `TENANT:${id}`;
      await client.execute([
        "SETEX",
        redisKey,
        REDIS_TTL,
        JSON.stringify(tenant)
      ]);

      return res.json(tenant);
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
      let {
        fullName,
        username,
        password,
        email,
        phone,
        dob,
        prevResidenceAddress,
        kin
      } = req.body;

      if (!kin.fullName || !kin.email || !kin.phone || !kin.residenceAddress) {
        return res.json({
          success: false,
          message: KIN_IS_REQUIRED
        });
      }

      const hashedPassword = await hash(password, rounds);

      let tenant = await Tenant.createEntity({
        fullName,
        username,
        password: hashedPassword,
        email,
        phone,
        dob,
        prevResidenceAddress,
        kin
      });

      const id = await Tenant.save(tenant);

      if (!id) {
        return res.json({
          success: false,
          message: AN_ERROR_OCCURRED
        });
      }

      return res.json({
        success: true,
        message: TENANT_CREATED_SUCCESSFULLY,
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

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      const tenant: any = await Tenant.search()
        .where("username")
        .equals(username)
        .return.first();

      if (!tenant || !tenant.email || !tenant.username) {
        return res.json({
          success: false,
          message: INVALID_CREDENTIALS
        });
      }

      const same = await compare(password, tenant.password);

      if (!same) {
        return res.json({
          success: false,
          message: INVALID_CREDENTIALS
        });
      }

      const token = await Auth.generateJWT({
        id: tenant.entityId,
        username: tenant.username,
        email: tenant.email
      });

      return res.json({
        success: true,
        message: LOGIN_SUCCESSFUL,
        id: tenant.entityId,
        auth: token
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
      const { email, phone, kin } = req.body;
      const id = req.params.id;

      const tenant: any = await Tenant.fetch(id);

      if (!tenant || !tenant.email || !tenant.username) {
        return res.json({
          success: false,
          message: INVALID_CREDENTIALS
        });
      }

      if (email) {
        tenant.email = email;
      }

      if (phone) {
        tenant.phone = phone;
      }

      if (kin) {
        if (kin.email) {
          tenant.kin.email = kin.email;
        }

        if (kin.phone) {
          tenant.kin.phone = kin.phone;
        }
      }

      const updatedId = await Tenant.save(tenant);

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

      const result: any = await Tenant.remove(id);

      if (result) {
        return res.json({
          success: false,
          message: INVALID_CREDENTIALS
        });
      }

      return res.json({
        success: true,
        message: DELETED_SUCCESSFULLY,
        id: result
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
