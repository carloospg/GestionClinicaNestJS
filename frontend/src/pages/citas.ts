import { Modal } from "bootstrap";
import { renderNavbar, initNavbarEvents } from "../components/navbar";

const API_URL = "http://localhost:3000/api";

export async function renderCitas() {
  const app = document.getElementById("app")!;
  const token = sessionStorage.getItem("token")!;
  const usuario = JSON.parse(sessionStorage.getItem("usuario")!);

  if (usuario.rol !== "admin" && usuario.rol !== "recepcionista") {
    window.dispatchEvent(new CustomEvent("navigate", { detail: "dashboard" }));
    return;
  }

  app.innerHTML = `
    <div id="navbar-container">${renderNavbar("citas")}</div>

    <div class="container mt-4">
      <div class="row mb-3">
        <div class="col">
          <h4>Gestión de Citas</h4>
          <p class="text-muted">Lista de todas las citas del sistema</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary btn-sm" id="btn-nueva-cita">
            <i class="bi bi-calendar-plus me-1"></i> Nueva Cita
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
                <th>Paciente</th>
                <th>Médico</th>
                <th>Fecha y Hora</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="tabla-citas"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal nueva cita -->
    <div class="modal fade" id="modal-cita" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nueva Cita</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div id="modal-error" class="alert alert-danger d-none"></div>
            <div class="mb-3">
              <label class="form-label">Paciente</label>
              <select class="form-select" id="select-paciente">
                <option value="">Selecciona un paciente...</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Médico</label>
              <select class="form-select" id="select-medico">
                <option value="">Selecciona un médico...</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Fecha y Hora</label>
              <input type="datetime-local" class="form-control" id="input-fecha-hora" />
            </div>
            <div class="mb-3">
              <label class="form-label">Motivo</label>
              <input type="text" class="form-control" id="input-motivo" placeholder="Motivo de la consulta" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-guardar-cita">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  initNavbarEvents();

  document
    .getElementById("btn-nueva-cita")!
    .addEventListener("click", async () => {
      document.getElementById("modal-error")!.classList.add("d-none");
      (document.getElementById("input-fecha-hora") as HTMLInputElement).value =
        "";
      (document.getElementById("input-motivo") as HTMLInputElement).value = "";
      await cargarSelectores(token);
      new Modal(document.getElementById("modal-cita")!).show();
    });

  document
    .getElementById("btn-guardar-cita")!
    .addEventListener("click", async () => {
      const id_paciente = (
        document.getElementById("select-paciente") as HTMLSelectElement
      ).value;
      const id_medico = (
        document.getElementById("select-medico") as HTMLSelectElement
      ).value;
      const fecha_hora = (
        document.getElementById("input-fecha-hora") as HTMLInputElement
      ).value;
      const motivo = (
        document.getElementById("input-motivo") as HTMLInputElement
      ).value.trim();
      const modalError = document.getElementById("modal-error")!;

      if (!id_paciente || !id_medico || !fecha_hora) {
        modalError.textContent = "Paciente, médico y fecha son obligatorios";
        modalError.classList.remove("d-none");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/citas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id_paciente: Number(id_paciente),
            id_medico: Number(id_medico),
            fecha_hora,
            motivo: motivo || undefined,
          }),
        });

        const data = await res.json();

        if (!data.ok) {
          modalError.textContent = data.message || "Error al crear la cita";
          modalError.classList.remove("d-none");
          return;
        }

        Modal.getInstance(document.getElementById("modal-cita")!)?.hide();
        await cargarCitas(token);
      } catch {
        modalError.textContent = "Error al conectar con el servidor";
        modalError.classList.remove("d-none");
      }
    });

  await cargarCitas(token);
}

async function cargarCitas(token: string) {
  try {
    const res = await fetch(`${API_URL}/citas`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.ok) {
      document.getElementById("error-msg")!.textContent = data.message;
      document.getElementById("error-msg")!.classList.remove("d-none");
      return;
    }

    const tbody = document.getElementById("tabla-citas")!;
    tbody.innerHTML = "";

    if (data.citas.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 7;
      td.textContent = "No hay citas registradas";
      td.className = "text-center text-muted py-3";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    data.citas.forEach((c: any) => {
      const tr = document.createElement("tr");

      const fecha = new Date(c.fecha_hora).toLocaleString("es-ES");
      const paciente = `${c.paciente.nombre} ${c.paciente.apellidos}`;
      const medico = c.medico.nombre;

      [c.id, paciente, medico, fecha, c.motivo || "-"].forEach((val) => {
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
        const btnCancelar = document.createElement("button");
        btnCancelar.className = "btn btn-danger btn-sm";
        btnCancelar.innerHTML = '<i class="bi bi-x-circle"></i>';
        btnCancelar.addEventListener("click", () => cancelarCita(token, c.id));
        tdAcciones.appendChild(btnCancelar);
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

async function cancelarCita(token: string, id: number) {
  if (!confirm("¿Estás seguro de que quieres cancelar esta cita?")) return;

  try {
    const res = await fetch(`${API_URL}/citas/${id}/cancelar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.message || "Error al cancelar la cita");
      return;
    }

    await cargarCitas(token);
  } catch {
    alert("Error al conectar con el servidor");
  }
}

async function cargarSelectores(token: string) {
  try {
    const [resPacientes, resMedicos] = await Promise.all([
      fetch(`${API_URL}/pacientes`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/usuarios/medicos`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const dataPacientes = await resPacientes.json();
    const dataMedicos = await resMedicos.json();

    const selectPaciente = document.getElementById(
      "select-paciente",
    ) as HTMLSelectElement;
    const selectMedico = document.getElementById(
      "select-medico",
    ) as HTMLSelectElement;

    selectPaciente.innerHTML =
      '<option value="">Selecciona un paciente...</option>';
    selectMedico.innerHTML =
      '<option value="">Selecciona un médico...</option>';

    if (dataPacientes.ok) {
      dataPacientes.pacientes.forEach((p: any) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.nombre} ${p.apellidos} - ${p.dni}`;
        selectPaciente.appendChild(opt);
      });
    }

    if (dataMedicos.ok) {
      dataMedicos.medicos.forEach((m: any) => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = `${m.nombre} (${m.email})`;
        selectMedico.appendChild(opt);
      });
    }
  } catch {
    console.error("Error al cargar selectores");
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
