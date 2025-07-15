import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import UserFeedPlayer from "../Components/UserFeedPlayer";

const Room: React.FC = () => {
    const { id } = useParams();
    const { socket, user, stream, peers } = useContext(SocketContext);

    useEffect(() => {
        if (user) {
            console.log("New user with id", user._id, "has joined room", id);
            socket.emit("joined-room", { roomId: id, peerId: user._id });
        }
    }, [id, user, socket]);

    return (
        <div>
            room : {id}
            <br />
            Your own user feed
            <UserFeedPlayer stream={stream} />

            <div>
                Other Users feed
                {Object.keys(peers).map((peerId) => (
                    <UserFeedPlayer key={peerId} stream={peers[peerId].stream} />
                ))}
            </div>
        </div>
    );
};

export default Room;
