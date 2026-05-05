export function renderDashboard() {
  const app = document.getElementById("app")!;
  const usuario = JSON.parse(sessionStorage.getItem("usuario")!);

  app.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold" href="#">
          <i class="bi bi-hospital me-2"></i>Gestion Clinica
        </a>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0" id="nav-links">
          </ul>
          <div class="dropdown">
            <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
              ${usuario.nombre}
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item py-2 text-danger fw-bold" id="btn-logout">
                  <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mt-4" id="contenido-principal">
      <h4>Bienvenido, ${usuario.nombre}</h4>
      <p class="text-muted">Panel principal</p>
    </div>
  `;

  document.getElementById("btn-logout")!.addEventListener("click", () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    window.location.reload();
  });
}
