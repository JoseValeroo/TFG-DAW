import { Link } from 'react-router-dom';
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  Users,
  User,
  MoreHorizontal,
  Feather,
} from 'lucide-react';
import lureLogo from '../../assets/Icons/Logo.svg';
import './Sidebar.css';

const navItems = [
  { icon: Home, label: 'Inicio', to: '/' },
  { icon: Search, label: 'Explorar', to: null },
  { icon: Bell, label: 'Notificaciones', to: null },
  { icon: Mail, label: 'Mensajes', to: null },
  { icon: Bookmark, label: 'Guardados', to: null },
  { icon: Users, label: 'Comunidades', to: null },
  { icon: User, label: 'Perfil', to: '/profilePage' },
  { icon: MoreHorizontal, label: 'Más opciones', to: null },
];

function Sidebar() {
  return (
    <header className="x-sidebar">
      <div className="x-sidebar-inner">
        <Link to="/" className="x-logo" aria-label="Inicio">
          <img src={lureLogo} alt="Lure" />
        </Link>

        <nav className="x-nav">
          {navItems.map(({ icon: Icon, label, to }) =>
            to ? (
              <Link key={label} to={to} className="x-nav-item">
                <Icon size={26} strokeWidth={1.9} />
                <span>{label}</span>
              </Link>
            ) : (
              <button key={label} type="button" className="x-nav-item">
                <Icon size={26} strokeWidth={1.9} />
                <span>{label}</span>
              </button>
            ),
          )}
        </nav>

        <button type="button" className="x-post-btn">
          <span className="x-post-btn-label">Postear</span>
          <Feather className="x-post-btn-icon" size={24} />
        </button>

        <Link to="/login" className="x-account" aria-label="Cuenta">
          <span className="x-avatar">L</span>
          <span className="x-account-info">
            <strong>Invitado</strong>
            <span>@invitado</span>
          </span>
          <MoreHorizontal size={18} />
        </Link>
      </div>
    </header>
  );
}

export default Sidebar;
