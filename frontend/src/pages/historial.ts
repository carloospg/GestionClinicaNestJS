import { renderNavbar, initNavbarEvents } from "../components/navbar";

const API_URL = "http://localhost:3000/api";

export async function renderHistorial() {
  const app = document.getElementById("app")!;
  const token = sessionStorage.getItem("token")!;
  const usuario = JSON.parse(sessionStorage.getItem("usuario")!);

  if (usuario.rol !== "medico" && usuario.rol !== "admin") {
    window.dispatchEvent(new CustomEvent("navigate", { detail: "dashboard" }));
    return;
  }

  app.innerHTML = `
    <div id="navbar-container">${renderNavbar("historial")}</div>

    <div class="container mt-4">
      <div class="row mb-3">
        <div class="col">
          <h4>Historial Clínico</h4>
          <p class="text-muted">Consulta el historial clínico de un paciente</p>
        </div>
      </div>

      <div class="card shadow mb-4">
        <div class="card-body">
          <div class="row align-items-end">
            <div class="col-md-8">
              <label class="form-label">Selecciona un paciente</label>
              <select class="form-select" id="select-paciente">
                <option value="">Selecciona un paciente...</option>
              </select>
            </div>
            <div class="col-md-4">
              <button class="btn btn-primary w-100" id="btn-buscar">
                <i class="bi bi-search me-1"></i> Consultar Historial
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="error-msg" class="alert alert-danger d-none"></div>
      <div id="sin-historial" class="alert alert-info d-none">
        Este paciente no tiene historial clínico.
      </div>

      <div id="contenedor-historial" class="d-none">
        <h5 class="mb-3">Entradas del historial</h5>
        <div id="lista-entradas"></div>
      </div>
    </div>
  `;

  initNavbarEvents();
  await cargarPacientes(token);

  document.getElementById("btn-buscar")!.addEventListener("click", async () => {
    const id_paciente = (
      document.getElementById("select-paciente") as HTMLSelectElement
    ).value;
    const errorMsg = document.getElementById("error-msg")!;
    const sinHistorial = document.getElementById("sin-historial")!;
    const contenedor = document.getElementById("contenedor-historial")!;

    if (!id_paciente) {
      errorMsg.textContent = "Selecciona un paciente";
      errorMsg.classList.remove("d-none");
      return;
    }

    errorMsg.classList.add("d-none");
    sinHistorial.classList.add("d-none");
    contenedor.classList.add("d-none");

    try {
      const res = await fetch(`${API_URL}/historial/${id_paciente}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!data.ok) {
        sinHistorial.classList.remove("d-none");
        return;
      }

      const listaEntradas = document.getElementById("lista-entradas")!;
      listaEntradas.innerHTML = "";

      if (data.historial.entradas.length === 0) {
        sinHistorial.classList.remove("d-none");
        return;
      }

      data.historial.entradas.forEach((entrada: any, index: number) => {
        const card = document.createElement("div");
        card.className = "card shadow-sm mb-3";
        card.innerHTML = `
          <div class="card-header bg-primary text-white">
            <strong>Entrada ${index + 1}</strong> — ${new Date(entrada.fecha).toLocaleString("es-ES")}
          </div>
          <div class="card-body">
            <div class="mb-2">
              <span class="text-muted fw-semibold">Médico ID:</span> ${entrada.id_medico}
            </div>
            <div class="mb-2">
              <span class="text-muted fw-semibold">Observaciones:</span> ${entrada.observaciones}
            </div>
            <div class="mb-2">
              <span class="text-muted fw-semibold">Diagnóstico:</span> ${entrada.diagnostico}
            </div>
            <div class="mb-2">
              <span class="text-muted fw-semibold">Tratamiento:</span> ${entrada.tratamiento}
            </div>
          </div>
        `;
        listaEntradas.appendChild(card);
      });

      contenedor.classList.remove("d-none");
    } catch {
      errorMsg.textContent = "Error al conectar con el servidor";
      errorMsg.classList.remove("d-none");
    }
  });
}

async function cargarPacientes(token: string) {
  try {
    const res = await fetch(`${API_URL}/pacientes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    const select = document.getElementById(
      "select-paciente",
    ) as HTMLSelectElement;

    if (data.ok) {
      data.pacientes.forEach((p: any) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.nombre} ${p.apellidos} - ${p.dni}`;
        select.appendChild(opt);
      });
    }
  } catch {
    console.error("Error al cargar pacientes");
  }
}
