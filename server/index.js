const { Server } = require("socket.io");
const io = new Server(8000, {
    cors: true
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on("connection", (socket) => {
    console.log("socket connected : ", socket.id);

    socket.on("room:join", (data) => {
        const { email, room } = data;

        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);

        // the following two line is telling if there is already a user on that room we will tell him
        // to listen to this event
        io.to(room).emit("user:joined", { email, id: socket.id });
        socket.join(room);
        // we are sending back the data we just got from the user back to him after assigning to our email and socket id map
        // in short , je user join korte caise, takei tar sockt.id r dara same data abar pathai disi
        io.to(socket.id).emit("room:join", data);
    })

    socket.on("user:call", ({ to, offer }) => {
        console.log("forwarding this sdp : ", {
            to, offer
        })
        io.to(to).emit("incoming:call", { from: socket.id, offer });
    })

    socket.on("call:accepted", ({ to, ans }) => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
    })
})