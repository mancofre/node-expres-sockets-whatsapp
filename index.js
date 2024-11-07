import { server } from "./app.js";
import {IP_SERVER, PORT, DB_USER, DB_PASS, DB_HOST } from "./constants.js";
import { io } from "./utils/index.js"
import mongoose from "mongoose";

const mongoUrl = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/`;
mongoose.connect(mongoUrl)
.then( () => {
    server.listen(PORT, () => {
        console.log("###########################");
        console.log("######### API REST#########");
        console.log("###########################");
    
        console.log(`http://${IP_SERVER}:${PORT}/api`);
    
        io.sockets.on("connection", (socket) =>{
            console.log("Nuevo usuario en la app...");
    
            socket.on("disconnect", () => {
                console.log("Usuario Desconectado..")
            });
    
            socket.on("subscribe", (room) => {
                socket.join(room);
            } );
    
            socket.on("unsubscribe", (room) => {
                socket.leave(room);
            } );
        })
    });
}).catch( err => console.log(err));


/*mongoose.connect(mongoUrl,  (error) => {
    if ( error ) throw error;

    server.listen(PORT, () => {
        console.log("###########################");
        console.log("######### API REST#########");
        console.log("###########################");
    
        console.log(`http://${IP_SERVER}:${PORT}/api`);
    
        io.sockets.on("connection", (socket) =>{
            console.log("Nuevo usuario en la app...");
    
            socket.on("disconnect", () => {
                console.log("Usuario Desconectado..")
            });
    
            socket.on("subscribe", (room) => {
                socket.join(room);
            } );
    
            socket.on("unsubscribe", (room) => {
                socket.leave(room);
            } );
        })
    });
});*/

