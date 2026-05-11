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

  const linkPacientes =
    usuario.rol === "admin" || usuario.rol === "recepcionista"
      ? `
    <li class="nav-item">
      <a class="nav-link ${paginaActiva === "pacientes" ? "active" : ""}" href="#" data-page="pacientes">
        <i class="bi bi-person-vcard me-1"></i> Pacientes
      </a>
    </li>
  `
      : "";

  const linkCitas =
    usuario.rol === "admin" || usuario.rol === "recepcionista"
      ? `
  <li class="nav-item">
    <a class="nav-link ${paginaActiva === "citas" ? "active" : ""}" href="#" data-page="citas">
      <i class="bi bi-calendar-check me-1"></i> Citas
    </a>
  </li>
`
      : "";

  return `
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
            ${linkPacientes}
            ${linkCitas}
          </ul>
          <div class="position-relative">
            <button class="btn btn-light" id="btn-usuario-nav">
              ${usuario.nombre} <i class="bi bi-chevron-down ms-1"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2 position-absolute end-0"
                id="menu-usuario" style="display:none; min-width: 160px;">
              <li>
                <button class="dropdown-item py-2 text-danger fw-bold" id="btn-logout-nav">
                  <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `;
}

export function initNavbarEvents() {
  const btnUsuario = document.getElementById("btn-usuario-nav");
  const menuUsuario = document.getElementById("menu-usuario");

  btnUsuario?.addEventListener("click", (e) => {
    e.stopPropagation();
    const visible = menuUsuario!.style.display === "block";
    menuUsuario!.style.display = visible ? "none" : "block";
  });

  document.addEventListener("click", () => {
    if (menuUsuario) menuUsuario.style.display = "none";
  });

  document.getElementById("btn-logout-nav")?.addEventListener("click", () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");
    window.location.reload();
  });

  document
    .querySelector('[data-page="index"]')
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("navigate", { detail: "index" }));
    });

  document
    .querySelector('[data-page="usuarios"]')
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("navigate", { detail: "usuarios" }));
    });

  document
    .querySelector('[data-page="pacientes"]')
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      window.dispatchEvent(
        new CustomEvent("navigate", { detail: "pacientes" }),
      );
    });

  document
    .querySelector('[data-page="citas"]')
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent("navigate", { detail: "citas" }));
    });
}
