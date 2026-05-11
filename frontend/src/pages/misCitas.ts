import { renderNavbar, initNavbarEvents } from "../components/navbar";

const API_URL = "http://localhost:3000/api";

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
              </tr>
            </thead>
            <tbody id="tabla-mis-citas"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  initNavbarEvents();
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
      td.colSpan = 5;
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

      tbody.appendChild(tr);
    });
  } catch {
    document.getElementById("error-msg")!.textContent =
      "Error al conectar con el servidor";
    document.getElementById("error-msg")!.classList.remove("d-none");
  }
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
