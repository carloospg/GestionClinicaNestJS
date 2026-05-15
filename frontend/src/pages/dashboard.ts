import { renderNavbar, initNavbarEvents } from "../components/navbar";
import { getSocket } from "../socket";

const API_URL = "http://localhost:3000/api";

export async function renderDashboard() {
  const app = document.getElementById("app")!;
  const token = sessionStorage.getItem("token")!;
  const usuario = JSON.parse(sessionStorage.getItem("usuario")!);

  app.innerHTML = `
    <div id="navbar-container">${renderNavbar("index")}</div>

    <div class="container mt-4">
      <div class="row mb-3">
        <div class="col">
          <h4>Panel Principal</h4>
          <p class="text-muted">Bienvenido, ${usuario.nombre}</p>
        </div>
      </div>

      <!-- Panel Admin -->
      <div id="panel-admin" class="d-none">
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card shadow text-center">
              <div class="card-body">
                <i class="bi bi-people-fill fs-1 text-primary"></i>
                <h5 class="mt-2">Usuarios</h5>
                <h2 id="total-usuarios">-</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow text-center">
              <div class="card-body">
                <i class="bi bi-person-vcard-fill fs-1 text-success"></i>
                <h5 class="mt-2">Pacientes</h5>
                <h2 id="total-pacientes">-</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow text-center">
              <div class="card-body">
                <i class="bi bi-calendar-check-fill fs-1 text-warning"></i>
                <h5 class="mt-2">Citas Hoy</h5>
                <h2 id="citas-hoy">-</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow text-center">
              <div class="card-body">
                <i class="bi bi-person-badge-fill fs-1 text-info"></i>
                <h5 class="mt-2">Médicos</h5>
                <h2 id="total-medicos">-</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel Médico -->
      <div id="panel-medico" class="d-none">
        <div class="card shadow mb-4">
          <div class="card-header bg-warning text-white d-flex justify-content-between align-items-center">
            <span class="text-black"><i class="bi bi-calendar-check me-2 text-black"></i>Mis citas pendientes hoy</span>
            <span class="badge bg-light text-dark" id="contador-citas-medico">0</span>
          </div>
          <div class="card-body">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Paciente</th>
                  <th>Hora</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody id="tabla-citas-medico"></tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Panel Recepcionista -->
      <div id="panel-recepcionista" class="d-none">
        <div class="card shadow mb-4">
          <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
            <span><i class="bi bi-calendar-check me-2"></i>Citas pendientes hoy</span>
            <span class="badge bg-light text-dark" id="contador-citas-recepcionista">0</span>
          </div>
          <div class="card-body">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Hora</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody id="tabla-citas-recepcionista"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  initNavbarEvents();
  mostrarPanel(usuario.rol);
  await cargarDatos(token, usuario);

  const socket = getSocket();

  socket.off("actualizar-citas");
  socket.on("actualizar-citas", () => cargarDatos(token, usuario));
}

function mostrarPanel(rol: string) {
  if (rol === "admin") {
    document.getElementById("panel-admin")!.classList.remove("d-none");
  } else if (rol === "medico") {
    document.getElementById("panel-medico")!.classList.remove("d-none");
  } else if (rol === "recepcionista") {
    document.getElementById("panel-recepcionista")!.classList.remove("d-none");
  }
}

async function cargarDatos(token: string, usuario: any) {
  if (usuario.rol === "admin") {
    await cargarMetricasAdmin(token);
  } else if (usuario.rol === "medico") {
    await cargarCitasMedico(token);
  } else if (usuario.rol === "recepcionista") {
    await cargarCitasRecepcionista(token);
  }
}

async function cargarMetricasAdmin(token: string) {
  try {
    const [resUsuarios, resPacientes, resCitas] = await Promise.all([
      fetch(`${API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/pacientes`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const dataUsuarios = await resUsuarios.json();
    const dataPacientes = await resPacientes.json();
    const dataCitas = await resCitas.json();

    document.getElementById("total-usuarios")!.textContent =
      dataUsuarios.usuarios.length;
    document.getElementById("total-pacientes")!.textContent =
      dataPacientes.pacientes.length;
    document.getElementById("total-medicos")!.textContent =
      dataUsuarios.usuarios.filter((u: any) => u.rol === "medico").length;

    const hoy = new Date().toDateString();
    const citasHoy = dataCitas.citas.filter(
      (c: any) =>
        c.estado === "pendiente" &&
        new Date(c.fecha_hora).toDateString() === hoy,
    );
    document.getElementById("citas-hoy")!.textContent = citasHoy.length;
  } catch {
    console.error("Error al cargar métricas admin");
  }
}

async function cargarCitasMedico(token: string) {
  try {
    const res = await fetch(`${API_URL}/citas/mis-citas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const hoy = new Date().toDateString();
    const citasHoy = data.citas.filter(
      (c: any) =>
        c.estado === "pendiente" &&
        new Date(c.fecha_hora).toDateString() === hoy,
    );

    document.getElementById("contador-citas-medico")!.textContent =
      citasHoy.length;

    const tbody = document.getElementById("tabla-citas-medico")!;
    tbody.innerHTML = "";

    if (citasHoy.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No tienes citas pendientes hoy";
      td.className = "text-center text-muted";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    citasHoy.forEach((c: any) => {
      const tr = document.createElement("tr");
      [
        c.id,
        `${c.paciente.nombre} ${c.paciente.apellidos}`,
        new Date(c.fecha_hora).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        c.motivo || "-",
      ].forEach((val) => {
        const td = document.createElement("td");
        td.textContent = String(val);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  } catch {
    console.error("Error al cargar citas médico");
  }
}

async function cargarCitasRecepcionista(token: string) {
  try {
    const res = await fetch(`${API_URL}/citas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const hoy = new Date().toDateString();
    const citasHoy = data.citas.filter(
      (c: any) =>
        c.estado === "pendiente" &&
        new Date(c.fecha_hora).toDateString() === hoy,
    );

    document.getElementById("contador-citas-recepcionista")!.textContent =
      citasHoy.length;

    const tbody = document.getElementById("tabla-citas-recepcionista")!;
    tbody.innerHTML = "";

    if (citasHoy.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.textContent = "No hay citas pendientes hoy";
      td.className = "text-center text-muted";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    citasHoy.forEach((c: any) => {
      const tr = document.createElement("tr");
      [
        c.id,
        `${c.paciente.nombre} ${c.paciente.apellidos}`,
        c.medico.nombre,
        new Date(c.fecha_hora).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        c.motivo || "-",
      ].forEach((val) => {
        const td = document.createElement("td");
        td.textContent = String(val);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  } catch {
    console.error("Error al cargar citas recepcionista");
  }
}
