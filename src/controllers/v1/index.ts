import { Router } from "express";

import cryptoRouter from "./crypto.route";
import coinRouter from "./coin.route";
import chatRouter from "./chat.route";

const v1Router = Router();

v1Router.use("/cryptos", cryptoRouter);
v1Router.use("/coins", coinRouter);
v1Router.use("/chat", chatRouter);

export default v1Router;
