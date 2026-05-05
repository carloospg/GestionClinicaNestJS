import { renderDashboard } from "./pages/dashboard";
import { renderRegistro } from "./pages/registro";

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
    case "registro":
      renderRegistro();
      break;
    default:
      renderDashboard();
  }
}
