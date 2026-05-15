const API_URL = "http://localhost:3000/api";

export function renderLogin() {
  const app = document.getElementById("app")!;

  app.innerHTML = `
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-4">
          <div class="card shadow">
            <div class="card-body p-4">

              <h2 class="text-center mb-4">Gestion Clinica</h2>
              <h5 class="text-center text-muted mb-4">Iniciar Sesion</h5>

              <div id="error-msg" class="alert alert-danger d-none"></div>

              <form id="login-form">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" id="email" placeholder="Correo Electronico" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Contraseña</label>
                  <div class="input-group">
                    <input type="password" class="form-control" id="password" placeholder="Contraseña" required />
                    <button class="btn btn-outline-secondary" type="button" id="toggle-password">
                      <i class="bi bi-eye" id="icono-ojo"></i>
                    </button>
                  </div>
                </div>
                <button type="submit" class="btn btn-primary w-100">Entrar</button>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  `;

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

  document
    .getElementById("login-form")!
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = (document.getElementById("email") as HTMLInputElement)
        .value;
      const password = (document.getElementById("password") as HTMLInputElement)
        .value;
      const errorMsg = document.getElementById("error-msg")!;

      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!data.ok) {
          errorMsg.textContent = data.msg || "Error al iniciar sesion";
          errorMsg.classList.remove("d-none");
          return;
        }

        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("usuario", JSON.stringify(data.usuario));

        window.location.reload();
      } catch (err) {
        errorMsg.textContent = "Error al conectar con el servidor";
        errorMsg.classList.remove("d-none");
      }
    });
}
