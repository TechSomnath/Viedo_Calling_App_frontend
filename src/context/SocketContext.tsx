// src/context/SocketContext.ts
import { createContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import   SocketIoClient  from "socket.io-client";



// Connect to the Socket.IO server
const WS_Server ="http://localhost:5500"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SocketContext=createContext<any |null>(null);
const socket = SocketIoClient(WS_Server, {
  withCredentials: false,
  transports: ["polling", "websocket"]
});
interface Props  {
    children: React.ReactNode;
  };
// Export the socket for use in components
export const SocketProvider :React.FC<Props>=({children})=>{
    const navigate = useNavigate(); // will help to programatically handle navigation
    useEffect(() => {
      const enterRoom =({ roomId} : { roomId: string})=>{
        navigate(`/room/${roomId}`); 
      }
      socket.on("room-created", enterRoom);

    });

   return (
    <SocketContext.Provider value={{socket}}>
         {children}
    </SocketContext.Provider>
   )
};
