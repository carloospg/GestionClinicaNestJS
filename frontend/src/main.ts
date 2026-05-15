import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { renderLogin } from './pages/login';
import { renderDashboard } from './pages/dashboard';
import { initRouter } from './router';
import { initNotificaciones } from './components/notificaciones';

const token = sessionStorage.getItem('token');

if (!token) {
  renderLogin();
} else {
  initNotificaciones();
  initRouter();
  renderDashboard();
}