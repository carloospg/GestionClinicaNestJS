import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { renderLogin } from './pages/login';
import { renderDashboard } from './pages/dashboard';
import { initRouter } from './router';

const token = sessionStorage.getItem('token');

if (!token) {
  renderLogin();
} else {
  initRouter();
  renderDashboard();
}