import { Admin } from "../db";
import { UNAUTHORIZED } from "../util/api.message";
import logger from "../config/logger";

export default async function AdminAuth(req, res, next) {
  try {
    const payload = req.payload;
    req.payload = undefined;

    await Admin.dropIndex();
    await Admin.createIndex();

    // we used the id, username and email in combination to seek out the
    // user in the js version but here redis is kind of different
    // we'd search the user based on the username and email
    // the check if it has the id
    const isAuthenticUser = await Admin.search()
      .where("username")
      .equals(payload.username)
      .and("email")
      .equals(payload.email)
      .return.first();

    if (!isAuthenticUser || isAuthenticUser.entityId !== payload.id) {
      return res.status(401).json({
        success: false,
        message: UNAUTHORIZED
      });
    }

    req.id = payload.id;

    return next();
  } catch (error) {
    logger.error(error.message);
    return res.json({ success: false, message: error.message });
  }
}
