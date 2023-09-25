import { createServer } from "http"
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"],
    }
})
io.on('connection', socket => {
    console.log(`User ${socket.id} connected`);

    socket.on('message', data => {
        console.log(`${socket.id}: ${data}`)
        io.emit('message', { id: socket.id, shortId: socket.id.substring(0, 5), text: data, type: "message" });
    })
    socket.on('disconnect', () => {
        io.emit('message', { id: socket.id, shortId: socket.id.substring(0, 5), type: "disconnect" });
        console.log(`User ${socket.id} disconnected`)
    })
})

httpServer.listen(3500, () => console.log('Listening on port 3500'))