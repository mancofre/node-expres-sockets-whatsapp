import express from "express";
import http from "http";
import cors from "cors";
import morgan from "morgan";
import { initSocketServer } from "./utils/index.js"; 
import bodyParser from "body-parser";
import { autRoutes, userRoutes, chatRoutes, chatMessageRoutes, groupRoutes, groupMessageRoutes } from "./routes/index.js";

const app = express();
const server = http.createServer(app);
initSocketServer(server);

//Config body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Config static
app.use(express.static("uploads"));

// Config Header Http - Cors
app.use(cors());

//Config logger Http Morgar
app.use(morgan("dev")); 


// Config Routes
app.use("/api", autRoutes);
app.use("/api", userRoutes);
app.use("/api", chatRoutes);
app.use("/api", chatMessageRoutes);
app.use("/api", groupRoutes);
app.use("/api", groupMessageRoutes);


export { server };