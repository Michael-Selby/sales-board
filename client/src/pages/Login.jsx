import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate(user.role === 'admin' ? '/admin/dashboard' : '/sales', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(username, password);
      navigate(loggedInUser.role === 'admin' ? '/admin/dashboard' : '/sales', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.leftPanel}>
        <div className={styles.brandContent}>
          <div className={styles.logoIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="rgba(255,255,255,0.15)" />
              <path d="M10 20h28v18a2 2 0 01-2 2H12a2 2 0 01-2-2V20z" fill="rgba(255,255,255,0.2)" />
              <path d="M8 14l4-6h24l4 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 14h32v6H8z" fill="rgba(255,255,255,0.3)" />
              <rect x="18" y="28" width="12" height="12" rx="1" fill="rgba(255,255,255,0.35)" />
              <path d="M24 28v12" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className={styles.brandName}>MartSales</h1>
          <p className={styles.brandTagline}>Mini Mart Sales Management System</p>

          <div className={styles.illustration}>
            <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="50" y="70" width="200" height="110" rx="6" fill="rgba(255,255,255,0.1)" />
              <path d="M40 70l25-35h170l25 35" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
              <rect x="40" y="70" width="220" height="16" rx="3" fill="rgba(255,255,255,0.15)" />
              <rect x="70" y="100" width="50" height="60" rx="4" fill="rgba(255,255,255,0.12)" />
              <rect x="75" y="105" width="40" height="30" rx="2" fill="rgba(255,255,255,0.08)" />
              <rect x="130" y="100" width="50" height="60" rx="4" fill="rgba(255,255,255,0.12)" />
              <rect x="135" y="105" width="40" height="30" rx="2" fill="rgba(255,255,255,0.08)" />
              <rect x="190" y="100" width="50" height="80" rx="4" fill="rgba(255,255,255,0.12)" />
              <rect x="195" y="105" width="40" height="40" rx="2" fill="rgba(255,255,255,0.08)" />
              <path d="M205 155h20" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="150" cy="50" r="6" fill="rgba(255,255,255,0.2)" />
              <path d="M150 44v-8M144 50h-8M156 50h8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="70" y="168" width="50" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
              <rect x="130" y="168" width="50" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
            </svg>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a1 1 0 00-1 1v1a1 1 0 001 1h1l1.3 7.2a2 2 0 002 1.8h5.4a2 2 0 002-1.8L17 6H6.1L5.8 4.4A1 1 0 004.8 3H4zm4 14a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg>
              </span>
              <span>Track daily sales in real time</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zm0 6a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"/></svg>
              </span>
              <span>Weekly reports & summaries</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v1H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 6V7a3 3 0 016 0v1H7z"/></svg>
              </span>
              <span>Secure role-based access</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.formHeader}>
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 11.5a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg>
                <span>{error}</span>
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="username">Username</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="6" r="3.5"/><path d="M2.5 16.5c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/></svg>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="8" width="12" height="8" rx="2"/><path d="M6 8V5.5a3 3 0 016 0V8"/></svg>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span className={styles.spinner}></span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
