import mongoose from "mongoose";
import { server } from "./app.js";
import {
  IP_SERVER,
  PORT,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_NAME,
} from "./constans.js";
import { io } from "./utils/index.js";

const mongoDbUrL = `mongodb+srv://${encodeURIComponent(
  DB_USER
)}:${encodeURIComponent(
  DB_PASSWORD
)}${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function startServer() {
  try {
    await mongoose.connect(mongoDbUrL, options);

    server.listen(PORT, () => {
      console.log("##########################");
      console.log("####### API REST #########");
      console.log("##########################");
      console.log(`http://${IP_SERVER}:${PORT}/api`);

      io.sockets.on("connection", (socket) => {
        console.log("NUEVO USUARIO CONECTADO");

        socket.on("disconnect", () => {
          console.log("USUARIO DESCONECTADO");
        });

        socket.on("subscribe", (room) => {
          socket.join(room);
        });

        socket.on("unsubscribe", (room) => {
          socket.leave(room);
        });
      });
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

startServer();
