import { compare, hash } from "bcrypt";
import { JWTAuthentication as Auth } from "../authentication";
import logger from "../config/logger";
import { Admin } from "../db";
import client from "../redis.client";
import {
  ADMIN_CREATED_SUCCESSFULLY,
  AN_ERROR_OCCURRED,
  DELETED_SUCCESSFULLY,
  INVALID_CREDENTIALS,
  LOGIN_IN,
  LOGIN_SUCCESSFUL,
  NOT_FOUND,
  UPDATE_SUCCESSFUL
} from "../util/api.message";
import { REDIS_TTL, rounds } from "../util/app.constant";

// `admin.auth.js`
// there is a `req.id` that is part of the payload passed by the `admin.auth.js`
// middleware. we can further use this req.id to check if the admin making the
// request (user) and admin made the request on (resource) correspond
// (user->resource). We can use this to restrict one admin from accessing
// another's data

export default class AdminController {
  static async findById(req, res) {
    try {
      const id = req.params.id;

      await Admin.dropIndex();
      await Admin.createIndex();

      const admin: any = await Admin.fetch(id);

      if (!admin || !admin.username || !admin.email) {
        return res.json({
          success: false,
          message: NOT_FOUND
        });
      }

      const result: any = {
        id: admin.entityId,
        username: admin.username,
        email: admin.email
      };

      const redisKey = `ADMIN:${id}`;
      await client.execute([
        "SETEX",
        redisKey,
        REDIS_TTL,
        JSON.stringify(result)
      ]);

      return res.json(result);
    } catch (error) {
      logger.error(error.message);

      return res.json({
        success: false,
        message: error.message
      });
    }
  }

  static async hasDuplicate(data: any) {
    await Admin.dropIndex();
    await Admin.createIndex();

    const { email, username } = data;
    const result: any = await Admin.search()
      .where("username")
      .equals(username)
      .or("email")
      .equals(email)
      .return.first();

    return result;
  }

  static async create(req, res) {
    try {
      if (await AdminController.hasDuplicate(req.body)) {
        return res.json({
          success: false,
          message: LOGIN_IN
        });
      }

      const { username, password, email } = req.body;
      const hashedPassword = await hash(password, rounds);

      let admin = Admin.createEntity({
        username,
        email,
        password: hashedPassword
      });

      const id = await Admin.save(admin);

      return res.json({
        success: true,
        message: ADMIN_CREATED_SUCCESSFULLY,
        id: id
      });
    } catch (error) {
      logger.error(error.message);

      return res.json({
        success: false,
        message: AN_ERROR_OCCURRED
      });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      await Admin.dropIndex();
      await Admin.createIndex();

      const result: any = await Admin.search()
        .where("username")
        .equals(username)
        .return.first();

      if (!result) {
        return res.json({
          success: false,
          message: NOT_FOUND
        });
      }

      const same = await compare(password, result.password);

      if (!same) {
        return res.json({
          success: false,
          message: INVALID_CREDENTIALS
        });
      }

      const token: any = await Auth.generateJWT({
        id: result.entityId,
        username: result.username,
        email: result.email
      });

      return res.json({
        success: true,
        message: LOGIN_SUCCESSFUL,
        id: result.id,
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
      const id = req.params.id;
      const email = req.body.email;

      const result: any = await Admin.fetch(id);

      if (!result || !result.email || !result.username) {
        return res.json({
          success: false,
          message: NOT_FOUND
        });
      }

      if (email) {
        result.email = email;
      }

      const updatedId = await Admin.save(result);

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

      await Admin.remove(id);

      // delete the cache when the admin is deleted
      const redisKey = `ADMIN:${id}`;
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
