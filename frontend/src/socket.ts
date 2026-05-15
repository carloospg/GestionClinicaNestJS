import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io("http://localhost:3000");

    socket.on("connect", () => {
      const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
      if (usuario.id) {
        socket!.emit("unirse-sala", usuario.id);
      }
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
