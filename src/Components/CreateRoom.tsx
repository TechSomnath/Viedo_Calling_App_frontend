import { useContext } from "react";
import { SocketContext } from "../context/SocketContext";

const CreateRoom: React.FC = () => {
  const { socket } = useContext(SocketContext);

  const initRoom = () => {
    if (!socket) {
      console.error("❌ Socket not initialized.");
      return;
    }

    console.log("🚀 Initialising request to create a room...");
    socket.emit("create-room"); // 🔁 Emits to server
  };

  return (
    <div className="text-center my-4">
      <button onClick={initRoom} className="btn btn-secondary">
        🎥 Start a new meeting in a new room
      </button>
    </div>
  );
};

export default CreateRoom;
