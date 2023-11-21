import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../service/peer";

const RoomScreen = () => {
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const socket = useSocket();

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log("user joined : ", { email, id });
        setRemoteSocketId(id);
    }, []);

    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });

        const offer = await peer.getOffer();
        socket.emit("user:call", { to: remoteSocketId, offer });
        setMyStream(stream);
    }, [socket, remoteSocketId])

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        console.log("incoming call : ", {
            from, offer
        });

        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });

        setMyStream(stream);
        const ans = await peer.getAnswer(offer);

        socket.emit("call:accepted", { to: from, ans });
    }, [remoteSocketId, socket]);

    const handleCallAccepted = useCallback(({ from, ans }) => {
        peer.setLocalDescription(ans);
        console.log("accepted");
    }, [])

    useEffect(() => {
        socket.on("user:joined", handleUserJoined);
        socket.on("incoming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);

        // now clearn up and deregister the event once listening is done
        return () => {
            socket.off("user:joined", handleUserJoined);
            socket.off("incoming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted);
        }

    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);

    return (
        <div>
            <h1>Room Page</h1>
            <h4>{remoteSocketId ? "connected" : "No one in this room"}</h4>

            {remoteSocketId && (
                <button onClick={handleCallUser}>call</button>
            )}

            {myStream && <ReactPlayer playing height="100px" width="200px" url={myStream} />}
        </div>
    )
}

export default RoomScreen