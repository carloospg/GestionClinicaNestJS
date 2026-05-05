export function renderNavbar(paginaActiva: string) {
  const usuario = JSON.parse(sessionStorage.getItem("usuario")!);

  const linkUsuarios =
    usuario.rol === "admin"
      ? `
    <li class="nav-item">
      <a class="nav-link ${paginaActiva === "usuarios" ? "active" : ""}" href="#" data-page="usuarios">
        <i class="bi bi-people-fill me-1"></i> Usuarios
      </a>
    </li>
  `
      : "";

  const navbarHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold" href="#" data-page="index">
          <i class="bi bi-hospital me-2"></i>Gestion Clinica
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${linkUsuarios}
          </ul>
          <div class="dropdown">
            <button class="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
              ${usuario.nombre}
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item py-2 text-danger fw-bold" id="btn-logout-nav">
                  <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `;

  return navbarHTML;
}

export function initNavbarEvents() {
  document.getElementById('btn-logout-nav')?.addEventListener('click', () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    window.location.reload();
  });

  document.querySelector('[data-page="index"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'index' }));
  });

  document.querySelector('[data-page="usuarios"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'usuarios' }));
  });
}
