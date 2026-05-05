import { renderNavbar, initNavbarEvents } from "../components/navbar";

export function renderDashboard() {
  const app = document.getElementById("app")!;
  const usuario = JSON.parse(sessionStorage.getItem("usuario")!);

  app.innerHTML = `
    <div id="navbar-container">${renderNavbar("index")}</div>

    <div class="container mt-4">
      <div class="row mb-3">
        <div class="col">
          <h4>Bienvenido, ${usuario.nombre}</h4>
          <p class="text-muted">Panel principal</p>
        </div>
      </div>

      ${
        usuario.rol === "admin"
          ? `
        <div class="card shadow mb-3">
          <div class="card-body">
            <h5 class="card-title">Acciones rapidas</h5>
            <button class="btn btn-primary btn-sm" id="btn-registrar">
              <i class="bi bi-person-plus me-1"></i> Registrar Usuario
            </button>
          </div>
        </div>
      `
          : ""
      }
    </div>
  `;

  initNavbarEvents();

  if (usuario.rol === "admin") {
    document.getElementById("btn-registrar")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("navigate", { detail: "registro" }));
    });
  }
}
