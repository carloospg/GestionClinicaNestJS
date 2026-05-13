import { Modal } from "bootstrap";
import { renderNavbar, initNavbarEvents } from "../components/navbar";

const API_URL = "http://localhost:3000/api";

let citaFinalizandoId: number | null = null;

export async function renderMisCitas() {
  const app = document.getElementById("app")!;
  const token = sessionStorage.getItem("token")!;
  const usuario = JSON.parse(sessionStorage.getItem("usuario")!);

  if (usuario.rol !== "medico") {
    window.dispatchEvent(new CustomEvent("navigate", { detail: "dashboard" }));
    return;
  }

  app.innerHTML = `
    <div id="navbar-container">${renderNavbar("misCitas")}</div>

    <div class="container mt-4">
      <div class="row mb-3">
        <div class="col">
          <h4>Mis Citas</h4>
          <p class="text-muted">Lista de tus citas asignadas</p>
        </div>
      </div>

      <div id="error-msg" class="alert alert-danger d-none"></div>

      <div class="card shadow">
        <div class="card-body">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Fecha y Hora</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="tabla-mis-citas"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal finalizar cita -->
    <div class="modal fade" id="modal-finalizar" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Finalizar Cita</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div id="modal-error" class="alert alert-danger d-none"></div>
            <div class="mb-3">
              <label class="form-label">Observaciones</label>
              <textarea class="form-control" id="input-observaciones" rows="3" placeholder="Observaciones de la consulta"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Diagnóstico</label>
              <input type="text" class="form-control" id="input-diagnostico" placeholder="Diagnóstico" />
            </div>
            <div class="mb-3">
              <label class="form-label">Tratamiento</label>
              <textarea class="form-control" id="input-tratamiento" rows="2" placeholder="Tratamiento indicado"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-success" id="btn-confirmar-finalizar">Finalizar Cita</button>
          </div>
        </div>
      </div>
    </div>
  `;

  initNavbarEvents();

  document
    .getElementById("btn-confirmar-finalizar")!
    .addEventListener("click", async () => {
      const observaciones = (
        document.getElementById("input-observaciones") as HTMLTextAreaElement
      ).value.trim();
      const diagnostico = (
        document.getElementById("input-diagnostico") as HTMLInputElement
      ).value.trim();
      const tratamiento = (
        document.getElementById("input-tratamiento") as HTMLTextAreaElement
      ).value.trim();
      const modalError = document.getElementById("modal-error")!;

      if (!observaciones || !diagnostico || !tratamiento) {
        modalError.textContent = "Todos los campos son obligatorios";
        modalError.classList.remove("d-none");
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/citas/${citaFinalizandoId}/estado`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              estado: "finalizada",
              observaciones,
              diagnostico,
              tratamiento,
            }),
          },
        );

        const data = await res.json();

        if (!data.ok) {
          modalError.textContent = data.message || "Error al finalizar la cita";
          modalError.classList.remove("d-none");
          return;
        }

        Modal.getInstance(document.getElementById("modal-finalizar")!)?.hide();
        await cargarMisCitas(token);
      } catch {
        modalError.textContent = "Error al conectar con el servidor";
        modalError.classList.remove("d-none");
      }
    });

  await cargarMisCitas(token);
}

async function cargarMisCitas(token: string) {
  try {
    const res = await fetch(`${API_URL}/citas/mis-citas`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.ok) {
      document.getElementById("error-msg")!.textContent = data.message;
      document.getElementById("error-msg")!.classList.remove("d-none");
      return;
    }

    const tbody = document.getElementById("tabla-mis-citas")!;
    tbody.innerHTML = "";

    if (data.citas.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 6;
      td.textContent = "No tienes citas asignadas";
      td.className = "text-center text-muted py-3";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    data.citas.forEach((c: any) => {
      const tr = document.createElement("tr");

      const fecha = new Date(c.fecha_hora).toLocaleString("es-ES");
      const paciente = `${c.paciente.nombre} ${c.paciente.apellidos}`;

      [c.id, paciente, fecha, c.motivo || "-"].forEach((val) => {
        const td = document.createElement("td");
        td.textContent = String(val);
        tr.appendChild(td);
      });

      const tdEstado = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `badge bg-${getBadgeColor(c.estado)}`;
      badge.textContent = c.estado;
      tdEstado.appendChild(badge);
      tr.appendChild(tdEstado);

      const tdAcciones = document.createElement("td");

      if (c.estado === "pendiente") {
        const btnIniciar = document.createElement("button");
        btnIniciar.className = "btn btn-primary btn-sm";
        btnIniciar.innerHTML = '<i class="bi bi-play-circle"></i>';
        btnIniciar.addEventListener("click", () =>
          cambiarEstado(token, c.id, "en_curso"),
        );
        tdAcciones.appendChild(btnIniciar);
      }

      if (c.estado === "en_curso") {
        const btnFinalizar = document.createElement("button");
        btnFinalizar.className = "btn btn-success btn-sm";
        btnFinalizar.innerHTML = '<i class="bi bi-check-circle"></i>';
        btnFinalizar.addEventListener("click", () => abrirModalFinalizar(c.id));
        tdAcciones.appendChild(btnFinalizar);
      }

      tr.appendChild(tdAcciones);
      tbody.appendChild(tr);
    });
  } catch {
    document.getElementById("error-msg")!.textContent =
      "Error al conectar con el servidor";
    document.getElementById("error-msg")!.classList.remove("d-none");
  }
}

async function cambiarEstado(token: string, id: number, estado: string) {
  try {
    const res = await fetch(`${API_URL}/citas/${id}/estado`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ estado }),
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.message || "Error al cambiar estado");
      return;
    }

    await cargarMisCitas(token);
  } catch {
    alert("Error al conectar con el servidor");
  }
}

function abrirModalFinalizar(id: number) {
  citaFinalizandoId = id;
  (
    document.getElementById("input-observaciones") as HTMLTextAreaElement
  ).value = "";
  (document.getElementById("input-diagnostico") as HTMLInputElement).value = "";
  (document.getElementById("input-tratamiento") as HTMLTextAreaElement).value =
    "";
  document.getElementById("modal-error")!.classList.add("d-none");
  new Modal(document.getElementById("modal-finalizar")!).show();
}

function getBadgeColor(estado: string): string {
  switch (estado) {
    case "pendiente":
      return "warning";
    case "en_curso":
      return "primary";
    case "finalizada":
      return "success";
    case "cancelada":
      return "danger";
    default:
      return "secondary";
  }
}
