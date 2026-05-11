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
          <p class="text-muted">Citas médicas del sistema</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary btn-sm" id="btn-nueva-cita">
            <i class="bi bi-calendar-plus me-1"></i> Nueva Cita
          </button>
        </div>
      </div>

      <div id="error-msg" class="alert alert-danger d-none"></div>
      <div id="success-msg" class="alert alert-success d-none"></div>
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
        const successMsg = document.getElementById("success-msg")!;
        successMsg.textContent = "Cita creada correctamente";
        successMsg.classList.remove("d-none");
        setTimeout(() => successMsg.classList.add("d-none"), 3000);
      } catch {
        modalError.textContent = "Error al conectar con el servidor";
        modalError.classList.remove("d-none");
      }
    });
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
