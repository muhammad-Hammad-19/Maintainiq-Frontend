import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, { // ⚠️ SOCKET_URL use karein, API_URL nahi
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
};