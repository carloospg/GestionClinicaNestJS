import { Modal } from "bootstrap";
import { renderNavbar, initNavbarEvents } from "../components/navbar";

const API_URL = "http://localhost:3000/api";

let usuarioEditandoId: number | null = null;

export async function renderUsuarios() {
  const app = document.getElementById("app")!;
  const token = sessionStorage.getItem("token")!;
  const usuario = JSON.parse(sessionStorage.getItem("usuario")!);

  if (usuario.rol !== "admin") {
    window.dispatchEvent(new CustomEvent("navigate", { detail: "dashboard" }));
    return;
  }

  app.innerHTML = `
    <div id="navbar-container">${renderNavbar("usuarios")}</div>

    <div class="container mt-4">
      <div class="row mb-3">
        <div class="col">
          <h4>Gestión de Usuarios</h4>
          <p class="text-muted">Lista de todos los usuarios del sistema</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary btn-sm" id="btn-nuevo-usuario">
            <i class="bi bi-person-plus me-1"></i> Registrar Usuario
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
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="tabla-usuarios"></tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="modal-rol" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Modificar Rol</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <label class="form-label">Selecciona el nuevo rol</label>
            <select class="form-select" id="select-rol">
              <option value="admin">Admin</option>
              <option value="medico">Médico</option>
              <option value="recepcionista">Recepcionista</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-guardar-rol">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  initNavbarEvents();

  document
    .getElementById("btn-nuevo-usuario")!
    .addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("navigate", { detail: "registro" }));
    });

  document
    .getElementById("btn-guardar-rol")!
    .addEventListener("click", async () => {
      const rol = (document.getElementById("select-rol") as HTMLSelectElement)
        .value;

      try {
        const res = await fetch(
          `${API_URL}/usuarios/${usuarioEditandoId}/rol`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rol }),
          },
        );

        const data = await res.json();

        if (!data.ok) {
          alert(data.message || "Error al actualizar rol");
          return;
        }

        Modal.getInstance(document.getElementById("modal-rol")!)?.hide();
        await cargarUsuarios(token);
      } catch {
        alert("Error al conectar con el servidor");
      }
    });

  await cargarUsuarios(token);
}

async function cargarUsuarios(token: string) {
  try {
    const res = await fetch(`${API_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.ok) {
      document.getElementById("error-msg")!.textContent = data.message;
      document.getElementById("error-msg")!.classList.remove("d-none");
      return;
    }

    const tbody = document.getElementById("tabla-usuarios")!;
    tbody.innerHTML = "";

    data.usuarios.forEach((u: any) => {
      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = u.id;

      const tdNombre = document.createElement("td");
      tdNombre.textContent = u.nombre;

      const tdEmail = document.createElement("td");
      tdEmail.textContent = u.email;

      const tdRol = document.createElement("td");
      tdRol.textContent = u.rol;

      const tdAcciones = document.createElement("td");

      const btnEditar = document.createElement("button");
      btnEditar.className = "btn btn-primary btn-sm me-1";
      btnEditar.innerHTML = '<i class="bi bi-pencil"></i>';
      btnEditar.addEventListener("click", () => {
        usuarioEditandoId = u.id;
        (document.getElementById("select-rol") as HTMLSelectElement).value =
          u.rol;
        new Modal(document.getElementById("modal-rol")!).show();
      });
      tdAcciones.appendChild(btnEditar);

      if (u.rol !== "admin") {
        const btnEliminar = document.createElement("button");
        btnEliminar.className = "btn btn-danger btn-sm";
        btnEliminar.innerHTML = '<i class="bi bi-trash"></i>';
        btnEliminar.addEventListener("click", () =>
          eliminarUsuario(token, u.id),
        );
        tdAcciones.appendChild(btnEliminar);
      }

      tr.append(tdId, tdNombre, tdEmail, tdRol, tdAcciones);
      tbody.appendChild(tr);
    });
  } catch {
    document.getElementById("error-msg")!.textContent =
      "Error al conectar con el servidor";
    document.getElementById("error-msg")!.classList.remove("d-none");
  }
}

async function eliminarUsuario(token: string, id: number) {
  if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return;

  try {
    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.ok) {
      alert(data.message || "Error al eliminar usuario");
      return;
    }

    await cargarUsuarios(token);
  } catch {
    alert("Error al conectar con el servidor");
  }
}
