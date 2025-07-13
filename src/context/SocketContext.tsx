// src/context/SocketContext.ts
import { createContext } from "react";
import   SocketIoClient  from "socket.io-client";



// Connect to the Socket.IO server
const WS_Server ="http://localhost:5500"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SocketContext=createContext<any |null>(null);
const socket= SocketIoClient(WS_Server);
interface Props  {
    children: React.ReactNode;
  };
// Export the socket for use in components
export const SocketProvider :React.FC<Props>=({children})=>{
   return (
    <SocketContext.Provider value={{socket}}>
         {children}
    </SocketContext.Provider>
   )
};
