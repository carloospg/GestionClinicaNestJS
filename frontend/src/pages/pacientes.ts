import { Modal } from "bootstrap";
import { renderNavbar, initNavbarEvents } from "../components/navbar";

const API_URL = "http://localhost:3000/api";

export async function renderPacientes() {
  const app = document.getElementById("app")!;
  const token = sessionStorage.getItem("token")!;
  const usuario = JSON.parse(sessionStorage.getItem("usuario")!);
  const esAdmin = usuario.rol === "admin";
  const hoy = new Date().toISOString().split("T")[0];

  if (usuario.rol !== "admin" && usuario.rol !== "recepcionista") {
    window.dispatchEvent(new CustomEvent("navigate", { detail: "dashboard" }));
    return;
  }

  app.innerHTML = `
    <div id="navbar-container">${renderNavbar("pacientes")}</div>

    <div class="container mt-4">
      <div class="row mb-3">
        <div class="col">
          <h4>Gestión de Pacientes</h4>
          <p class="text-muted">Lista de todos los pacientes del sistema</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary" id="btn-nuevo-paciente">
            <i class="bi bi-person-plus me-1"></i> Nuevo Paciente
          </button>
        </div>
      </div>

      <div id="error-msg" class="alert alert-danger d-none"></div>

      <div class="card shadow">
        <div class="card-body">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>DNI</th>
                <th>Teléfono</th>
                <th>Fecha Nacimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="tabla-pacientes"></tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="modal-paciente" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nuevo Paciente</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div id="modal-error" class="alert alert-danger d-none"></div>
            <div class="mb-3">
              <label class="form-label">Nombre</label>
              <input type="text" class="form-control" id="input-nombre" placeholder="Nombre" />
            </div>
            <div class="mb-3">
              <label class="form-label">Apellidos</label>
              <input type="text" class="form-control" id="input-apellidos" placeholder="Apellidos" />
            </div>
            <div class="mb-3">
              <label class="form-label">DNI</label>
              <input type="text" class="form-control" id="input-dni"
                     placeholder="12345678A" maxlength="9" />
            </div>
            <div class="mb-3">
              <label class="form-label">Teléfono</label>
              <input type="text" class="form-control" id="input-telefono"
                     placeholder="666777888" maxlength="9" />
            </div>
            <div class="mb-3">
              <label class="form-label">Fecha de Nacimiento</label>
              <input type="date" class="form-control" id="input-fecha" max="${hoy}" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-guardar-paciente">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  initNavbarEvents();

  document
    .getElementById("btn-nuevo-paciente")!
    .addEventListener("click", () => {
      (document.getElementById("input-nombre") as HTMLInputElement).value = "";
      (document.getElementById("input-apellidos") as HTMLInputElement).value =
        "";
      (document.getElementById("input-dni") as HTMLInputElement).value = "";
      (document.getElementById("input-telefono") as HTMLInputElement).value =
        "";
      (document.getElementById("input-fecha") as HTMLInputElement).value = "";
      document.getElementById("modal-error")!.classList.add("d-none");
      new Modal(document.getElementById("modal-paciente")!).show();
    });

  document
    .getElementById("btn-guardar-paciente")!
    .addEventListener("click", async () => {
      const nombre = (
        document.getElementById("input-nombre") as HTMLInputElement
      ).value.trim();
      const apellidos = (
        document.getElementById("input-apellidos") as HTMLInputElement
      ).value.trim();
      const dni = (
        document.getElementById("input-dni") as HTMLInputElement
      ).value.trim();
      const telefono = (
        document.getElementById("input-telefono") as HTMLInputElement
      ).value.trim();
      const fecha_nacimiento = (
        document.getElementById("input-fecha") as HTMLInputElement
      ).value;
      const modalError = document.getElementById("modal-error")!;

      if (!nombre || !apellidos || !dni) {
        modalError.textContent = "Nombre, apellidos y DNI son obligatorios";
        modalError.classList.remove("d-none");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/pacientes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre,
            apellidos,
            dni,
            telefono: telefono || undefined,
            fecha_nacimiento: fecha_nacimiento || undefined,
          }),
        });

        const data = await res.json();

        if (!data.ok) {
          modalError.textContent = data.message || "Error al crear paciente";
          modalError.classList.remove("d-none");
          return;
        }

        Modal.getInstance(document.getElementById("modal-paciente")!)?.hide();
        await cargarPacientes(token, esAdmin);
      } catch {
        modalError.textContent = "Error al conectar con el servidor";
        modalError.classList.remove("d-none");
      }
    });

  await cargarPacientes(token, esAdmin);
}

async function cargarPacientes(token: string, esAdmin: boolean) {
  try {
    const res = await fetch(`${API_URL}/pacientes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.ok) {
      document.getElementById("error-msg")!.textContent = data.message;
      document.getElementById("error-msg")!.classList.remove("d-none");
      return;
    }

    const tbody = document.getElementById("tabla-pacientes")!;
    tbody.innerHTML = "";

    if (data.pacientes.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 7;
      td.textContent = "No hay pacientes registrados";
      td.className = "text-center text-muted py-3";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    data.pacientes.forEach((p: any) => {
      const tr = document.createElement("tr");

      const fnac = p.fecha_nacimiento
        ? new Date(p.fecha_nacimiento).toLocaleDateString("es-ES")
        : "-";

      [p.id, p.nombre, p.apellidos, p.dni, p.telefono || "-", fnac].forEach(
        (val) => {
          const td = document.createElement("td");
          td.textContent = String(val);
          tr.appendChild(td);
        },
      );

      const tdAcciones = document.createElement("td");
      if (esAdmin) {
        const btnEliminar = document.createElement("button");
        btnEliminar.className = "btn btn-danger btn-sm";
        btnEliminar.innerHTML = '<i class="bi bi-trash"></i>';
        btnEliminar.addEventListener("click", () =>
          eliminarPaciente(token, p.id, esAdmin),
        );
        tdAcciones.appendChild(btnEliminar);
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

async function eliminarPaciente(token: string, id: number, esAdmin: boolean) {
  if (!confirm("¿Estás seguro de que quieres eliminar este paciente?")) return;

  try {
    const res = await fetch(`${API_URL}/pacientes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.message || "Error al eliminar paciente");
      return;
    }

    await cargarPacientes(token, esAdmin);
  } catch {
    alert("Error al conectar con el servidor");
  }
}
