import cors from "cors";
import express from "express";

import httpLogger from "./config/http.logger";
import logger from "./config/logger";
import { port } from "./util/app.constant";

import {
  adminRoute,
  apartmentRoute,
  cashRoute,
  // kinRoute, // TODO: add route and controller for kin
  rentRoute,
  tenantRoute
} from "./route";

const app: any = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Http logger
app.use(httpLogger);

// Cors
app.use(cors());

// Routes
app.use("/admin", adminRoute);
app.use("/apartment", apartmentRoute);
app.use("/tenant", tenantRoute);
// app.use("/kin", kinRoute); // TODO:add route and controller for kin
app.use("/cash", cashRoute);
app.use("/rent", rentRoute);

// handle other routes that does not exist
app.use((_req, res) => {
  return res.status(200).json({
    success: false,
    message: "Hello!! 😏️☺️, this route does not exist. 🙀️"
  });
});

app.listen(port, () => logger.debug(`server started on port ${port}`));

export default app;
