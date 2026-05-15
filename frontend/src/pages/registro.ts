import { renderNavbar, initNavbarEvents } from "../components/navbar";

const API_URL = "http://localhost:3000/api";

export function renderRegistro() {
  const app = document.getElementById("app")!;
  const token = sessionStorage.getItem("token")!;

  app.innerHTML = `
    <div id="navbar-container">${renderNavbar("usuarios")}</div>

    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-body p-4">

              <h4 class="card-title mb-4">Registrar Usuario</h4>

              <div id="error-msg" class="alert alert-danger d-none"></div>
              <div id="success-msg" class="alert alert-success d-none"></div>

              <form id="registro-form">
                <div class="mb-3">
                  <label class="form-label">Nombre</label>
                  <input type="text" class="form-control" id="nombre" placeholder="Nombre completo" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" id="email" placeholder="Correo Electronico" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Contrasena</label>
                  <div class="input-group">
                    <input type="password" class="form-control" id="password" placeholder="Contrasena" required />
                    <button class="btn btn-outline-secondary" type="button" id="toggle-password">
                      <i class="bi bi-eye" id="icono-ojo"></i>
                    </button>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Rol</label>
                  <select class="form-select" id="rol" required>
                    <option value="">Selecciona un rol</option>
                    <option value="medico">Medico</option>
                    <option value="recepcionista">Recepcionista</option>
                  </select>
                </div>

                <div class="d-flex justify-content-between mt-2">
                  <button type="button" class="btn btn-secondary" id="btn-volver">
                    Volver
                  </button>
                  <button type="submit" class="btn btn-primary">
                    Registrar
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  initNavbarEvents();

  document.getElementById("toggle-password")!.addEventListener("click", () => {
    const input = document.getElementById("password") as HTMLInputElement;
    const icono = document.getElementById("icono-ojo")!;
    if (input.type === "password") {
      input.type = "text";
      icono.classList.replace("bi-eye", "bi-eye-slash");
    } else {
      input.type = "password";
      icono.classList.replace("bi-eye-slash", "bi-eye");
    }
  });

  document.getElementById("btn-volver")!.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("navigate", { detail: "usuarios" }));
  });

  document
    .getElementById("registro-form")!
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = (document.getElementById("nombre") as HTMLInputElement)
        .value;
      const email = (document.getElementById("email") as HTMLInputElement)
        .value;
      const password = (document.getElementById("password") as HTMLInputElement)
        .value;
      const rol = (document.getElementById("rol") as HTMLSelectElement).value;

      const errorMsg = document.getElementById("error-msg")!;
      const successMsg = document.getElementById("success-msg")!;

      try {
        const response = await fetch(`${API_URL}/auth/registro`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ nombre, email, password, rol }),
        });

        const data = await response.json();

        if (!data.ok) {
          errorMsg.textContent = data.message || "Error al registrar usuario";
          errorMsg.classList.remove("d-none");
          successMsg.classList.add("d-none");
          return;
        }

        successMsg.textContent = `Usuario ${data.usuario.nombre} creado correctamente`;
        successMsg.classList.remove("d-none");
        errorMsg.classList.add("d-none");
        (document.getElementById("registro-form") as HTMLFormElement).reset();
      } catch (err) {
        errorMsg.textContent = "Error al conectar con el servidor";
        errorMsg.classList.remove("d-none");
      }
    });
}
