import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.brand}>
            <div className={styles.logoIcon}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 3v16M3 11h16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className={styles.brandText}>PharmaSales</span>
          </div>

          <div className={styles.nav}>
            {user.role === 'admin' ? (
              <>
                <Link to="/admin/dashboard" className={`${styles.navLink} ${isActive('/admin/dashboard') ? styles.active : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h5v6H2V2zm7 0h5v4H9V2zM2 10h5v4H2v-4zm7-2h5v6H9V8z"/></svg>
                  Dashboard
                </Link>
                <Link to="/admin/users" className={`${styles.navLink} ${isActive('/admin/users') ? styles.active : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 7a3 3 0 100-6 3 3 0 000 6zm-6 9c0-3 2.5-5 6-5s6 2 6 5H2z"/></svg>
                  Users
                </Link>
              </>
            ) : (
              <Link to="/sales" className={`${styles.navLink} ${isActive('/sales') ? styles.active : ''}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h8v2H2v-2z"/></svg>
                Record Sale
              </Link>
            )}
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.userPill}>
            <div className={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userText}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>{user.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2H3.5A1.5 1.5 0 002 3.5v9A1.5 1.5 0 003.5 14H6M10.5 11.5L14 8l-3.5-3.5M14 8H6"/></svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
