import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  return user.role === 'admin' ? <Outlet /> : <Navigate to="/sales" replace />;
};

export default AdminRoute;
