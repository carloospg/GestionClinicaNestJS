import { getSocket } from "../socket";

export function mostrarNotificacion(mensaje: string, tipo = "primary") {
  const contenedor = document.getElementById("contenedor-notificaciones");
  if (!contenedor) return;
  const id = `notif-${Date.now()}`;

  const toast = document.createElement("div");
  toast.id = id;
  toast.className = `toast align-items-center text-bg-${tipo} border-0 show mb-2`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="bi bi-bell-fill me-2"></i>${mensaje}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto"></button>
    </div>
  `;
  toast.querySelector("button")!.addEventListener("click", () => toast.remove());
  contenedor.appendChild(toast);
  setTimeout(() => { if (document.getElementById(id)) toast.remove(); }, 5000);
}

export function initNotificaciones() {
  const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
  if (!usuario.rol) return;

  const socket = getSocket();

  socket.off("cita-asignada");
  socket.off("cita-cancelada-medico");
  socket.off("cita-estado-cambiado");

  if (usuario.rol === "medico") {
    socket.on("cita-asignada", (data) => {
      mostrarNotificacion(data.msg, "primary");
    });

    socket.on("cita-cancelada-medico", (data) => {
      mostrarNotificacion(data.msg, "danger");
    });

    socket.on("cita-estado-cambiado", (data) => {
      const tipo = data.estado === "finalizada" ? "success" : "warning";
      mostrarNotificacion(data.msg, tipo);
    });
  }
}