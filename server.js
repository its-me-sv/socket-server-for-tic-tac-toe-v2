const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const origins = [
    "http://192.168.29.97:3000/Tic-Tac-Toe-v2",
    "http://localhost:3000/Tic-Tac-Toe-v2",
    "http://192.168.29.97:3000",
    "http://localhost:3000",
    "https://its-me-sv.github.io/Tic-Tac-Toe-v2/"
];
const io = new Server(httpServer, {
    cors: {
        origin: [...origins]
    }
});

io.on("connection", socket => {
    console.log(`${socket.id} Connected`);
    socket.on("disconnect", () => {
        console.log(`${socket.id} Disconnected`);
    });
    socket.on("joinRoom", roomId => {
        let rooms = io.of("/").adapter.rooms;
        if (!rooms.has(roomId)) {
            socket.join(roomId);
            socket.emit("first", socket.id);
            return;
        }
        let clients = [...rooms.get(roomId)];
        if (clients.length == 2) {
            socket.emit("roomFull");
            return;
        }
        socket.join(roomId);
        if (clients.length == 0)
            socket.emit("first", socket.id);
        else
            socket.emit("second", socket.id);
    });
    socket.on("nameChanged", ({roomId, name}) => {
        socket.broadcast.to(roomId).emit("nameChanged", name);
    });
    socket.on("updateBoard", ({pos, weapon, roomId}) => {
        socket.broadcast.to(roomId).emit("updateBoard", {pos, weapon});
    });
    socket.on("gameResult", ({ result, roomId }) => {
        socket.broadcast.to(roomId).emit("gameResult", {result});
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.clear();
    console.log(`[SERVER] Listening on port ${PORT}`)
});