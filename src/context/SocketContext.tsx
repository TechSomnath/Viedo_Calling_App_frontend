import SocketIoClient from "socket.io-client";
import { createContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "peerjs";
import { v4 as UUIDv4 } from "uuid";

import { addPeerAction } from "../Actions/peerAction";
import { peerReducer } from "../Reducers/peerReducer";

const WS_Server = "http://localhost:5500";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SocketContext = createContext<any | null>(null);

const socket = SocketIoClient(WS_Server, {
  withCredentials: false,
  transports: ["polling", "websocket"],
});

interface Props {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Peer>();
  const [stream, setStream] = useState<MediaStream>();
  const [peers, dispatch] = useReducer(peerReducer, {});

  const fetchParticipantList = ({
    roomId,
    participants,
  }: {
    roomId: string;
    participants: (string | null)[];
  }) => {
    const validParticipants = [...new Set(participants.filter(Boolean))];
    console.log("✅ Fetched room participants:", roomId, validParticipants);
  };

  const fetchUserFeed = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(userStream);
    } catch (err) {
      console.error("❌ Failed to access user media:", err);
    }
  };

  useEffect(() => {
    const userId = UUIDv4();
    const newPeer = new Peer(userId, {
      host: "localhost",
      port: 9000,
      path: "/peerjs",
    });

    setUser(newPeer);
    fetchUserFeed();

    const enterRoom = ({ roomId }: { roomId: string }) => {
      navigate(`/room/${roomId}`);
    };

    socket.on("room-created", enterRoom);
    socket.on("get-users", fetchParticipantList);

    return () => {
      socket.off("room-created", enterRoom);
      socket.off("get-users", fetchParticipantList);
    };
  }, [navigate]);

  useEffect(() => {
    if (!user || !stream) return;

    socket.on("user-joined", ({ peerId }) => {
      if (!peerId) return;

      console.log("📞 Calling the new peer", peerId);
      const call = user.call(peerId, stream);

      if (!call) {
        console.error("❌ Failed to initiate call to", peerId);
        return;
      }

      call.on("stream", (remoteStream) => {
        console.log("✅ Received stream from peer", peerId);
        dispatch(addPeerAction(peerId, remoteStream));
      });

      call.on("error", (err) => {
        console.error("❌ Peer call error:", err);
      });
    });

    user.on("call", (call) => {
      console.log("📥 Receiving a call from", call.peer);
      call.answer(stream);

      call.on("stream", (remoteStream) => {
        console.log("✅ Received stream from", call.peer);
        dispatch(addPeerAction(call.peer, remoteStream));
      });

      call.on("error", (err) => {
        console.error("❌ Call receive error:", err);
      });
    });

    socket.emit("ready");

    return () => {
      socket.off("user-joined");
      user.off("call");
    };
  }, [user, stream]);

  return (
    <SocketContext.Provider value={{ socket, user, stream, peers }}>
      {children}
    </SocketContext.Provider>
  );
};
