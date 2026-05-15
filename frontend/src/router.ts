import { renderDashboard } from "./pages/dashboard";
import { renderPacientes } from "./pages/pacientes";
import { renderRegistro } from "./pages/registro";
import { renderUsuarios } from "./pages/usuarios";
import { renderCitas } from "./pages/citas";
import { renderMisCitas } from "./pages/misCitas";
import { renderHistorial } from "./pages/historial";
import { renderMetricas } from "./pages/metricas";

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
    case "pacientes":
      renderPacientes();
      break;
    case "citas":
      renderCitas();
      break;
    case "misCitas":
      renderMisCitas()
      break;
    case "historial":
      renderHistorial();
      break;
    case "metricas":
      renderMetricas();
      break;
    default:
      renderDashboard();
  }
}
