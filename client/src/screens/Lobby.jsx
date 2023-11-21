import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const LobbyScreen = () => {
    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");

    const navigate = useNavigate();
    const socket = useSocket();

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        socket.emit("room:join", { email, room });
    }, [email, room, socket]);

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;

        navigate(`/room/${room}`);
    }, [navigate]);
    
    useEffect(() => {
        socket.on("room:join", handleJoinRoom);

        // we are doing this return callback to prevent multiple join of a single user
        return () => {
            socket.off("room:join", handleJoinRoom);
        }
    }, [socket, handleJoinRoom])
    return (
        <div>
            <h1>lobby</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input type="email" placeholder="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <br />
                <label htmlFor="room">Room number</label>
                <input type="text" placeholder="room number" id="room" value={room} onChange={(e) => setRoom(e.target.value)} />
                <br />
                <button>connect</button>
            </form>
        </div>
    )
}

export default LobbyScreen