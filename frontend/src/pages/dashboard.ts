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
    </div>
  `;

  initNavbarEvents();

  if (usuario.rol === "admin") {
    document.getElementById("btn-registrar")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("navigate", { detail: "registro" }));
    });
  }
}
