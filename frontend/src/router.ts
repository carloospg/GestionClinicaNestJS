import { renderDashboard } from "./pages/dashboard";
import { renderRegistro } from "./pages/registro";
import { renderUsuarios } from "./pages/usuarios";

export function initRouter() {
  window.addEventListener("navigate", (e: Event) => {
    const page = (e as CustomEvent).detail;
    navigate(page);
  });
}

export function navigate(page: string) {
  switch (page) {
    case "index":
      renderDashboard();
      break;
    case "usuarios":
      renderUsuarios();
      break;
    case "registro":
      renderRegistro();
      break;
    default:
      renderDashboard();
  }
}
