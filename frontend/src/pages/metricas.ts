import { renderNavbar, initNavbarEvents } from "../components/navbar";

const API_URL = "http://localhost:3000/api";

export async function renderMetricas() {
  const app = document.getElementById("app")!;
  const token = sessionStorage.getItem("token")!;
  const usuario = JSON.parse(sessionStorage.getItem("usuario")!);

  if (usuario.rol !== "admin" && usuario.rol !== "medico") {
    window.dispatchEvent(new CustomEvent("navigate", { detail: "dashboard" }));
    return;
  }

  app.innerHTML = `
    <div id="navbar-container">${renderNavbar("metricas")}</div>

    <div class="container mt-4">
      <div class="row mb-3">
        <div class="col">
          <h4>Métricas</h4>
          <p class="text-muted">Consultas y estadísticas del sistema</p>
        </div>
      </div>

      <div id="error-msg" class="alert alert-danger d-none"></div>

      <div class="card shadow mb-4">
        <div class="card-header bg-primary text-white">
          <i class="bi bi-bar-chart me-2"></i>Citas finalizadas por médico
        </div>
        <div class="card-body">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Médico</th>
                <th>Citas finalizadas</th>
              </tr>
            </thead>
            <tbody id="tabla-finalizadas"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  initNavbarEvents();
  await cargarFinalizadasPorMedico(token);
}

async function cargarFinalizadasPorMedico(token: string) {
  try {
    const res = await fetch(`${API_URL}/citas/stats/finalizadas`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.ok) {
      document.getElementById("error-msg")!.textContent =
        "Error al cargar métricas";
      document.getElementById("error-msg")!.classList.remove("d-none");
      return;
    }

    const tbody = document.getElementById("tabla-finalizadas")!;
    tbody.innerHTML = "";

    if (data.datos.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 2;
      td.textContent = "No hay citas finalizadas";
      td.className = "text-center text-muted py-3";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    data.datos.forEach((d: any) => {
      const tr = document.createElement("tr");

      const tdMedico = document.createElement("td");
      tdMedico.textContent = d.medico;

      const tdTotal = document.createElement("td");
      tdTotal.textContent = d.total;

      tr.append(tdMedico, tdTotal);
      tbody.appendChild(tr);
    });
  } catch {
    document.getElementById("error-msg")!.textContent =
      "Error al conectar con el servidor";
    document.getElementById("error-msg")!.classList.remove("d-none");
  }
}
