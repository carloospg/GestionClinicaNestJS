import { renderNavbar, initNavbarEvents } from "../components/navbar";

const API_URL = "http://localhost:3000/api";

export async function renderUsuarios() {
  const app = document.getElementById("app")!;
  const token = sessionStorage.getItem("token")!;
  const usuario = JSON.parse(sessionStorage.getItem("usuario")!);

  if (usuario.rol !== "admin") {
    window.dispatchEvent(new CustomEvent("navigate", { detail: "index" }));
    return;
  }

  app.innerHTML = `
    <div id="navbar-container">${renderNavbar("usuarios")}</div>

    <div class="container mt-4">
      <div class="row mb-3">
        <div class="col">
          <h4>Gestion de Usuarios</h4>
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
  `;

  initNavbarEvents();

  document
    .getElementById("btn-nuevo-usuario")!
    .addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("navigate", { detail: "registro" }));
    });

  await cargarUsuarios(token);
}

async function cargarUsuarios(token: string) {
  try {
    const response = await fetch(`${API_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!data.ok) {
      document.getElementById("error-msg")!.textContent = data.message;
      document.getElementById("error-msg")!.classList.remove("d-none");
      return;
    }

    const tbody = document.getElementById("tabla-usuarios")!;
    tbody.innerHTML = "";

    data.usuarios.forEach((u: any) => {
      tbody.innerHTML += `
        <tr>
          <td>${u.id}</td>
          <td>${u.nombre}</td>
          <td>${u.email}</td>
          <td>${u.rol}</td>
          <td>
            ${
              u.rol !== "admin"
                ? `
              <button class="btn btn-danger btn-sm" data-id="${u.id}">
                <i class="bi bi-trash"></i>
              </button>
            `
                : ""
            }
          </td>
        </tr>
      `;
    });

    tbody.querySelectorAll(".btn-danger").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = (btn as HTMLElement).dataset.id;
        await eliminarUsuario(token, Number(id));
      });
    });
  } catch (err) {
    document.getElementById("error-msg")!.textContent =
      "Error al conectar con el servidor";
    document.getElementById("error-msg")!.classList.remove("d-none");
  }
}

async function eliminarUsuario(token: string, id: number) {
  if (!confirm("¿Estas seguro de que quieres eliminar este usuario?")) return;

  try {
    const response = await fetch(`${API_URL}/usuarios/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!data.ok) {
      alert(data.message || "Error al eliminar usuario");
      return;
    }

    await cargarUsuarios(token);
  } catch (err) {
    alert("Error al conectar con el servidor");
  }
}
