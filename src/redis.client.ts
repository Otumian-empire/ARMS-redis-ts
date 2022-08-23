import { Client } from "redis-om";

import logger from "./config/logger";
import { REDIS_URI } from "./util/app.constant";

const client: Client = new Client();

(async () => {
  if (!client.isOpen()) {
    await client.open(REDIS_URI);
  }

  logger.debug(await client.execute(["PING", "Redis server running"]));
})();

export default client;
