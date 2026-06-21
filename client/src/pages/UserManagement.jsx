import { useState, useEffect } from 'react';
import api from '../api/axios';
import styles from './UserManagement.module.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', username: '', password: '' });
    setEditingUser(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, username: user.username, password: '' });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      if (editingUser) {
        const updateData = { name: formData.name, username: formData.username };
        if (formData.password) updateData.password = formData.password;
        await api.put(`/users/${editingUser._id}`, updateData);
      } else {
        await api.post('/users', formData);
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete "${user.name}"?`)) return;

    try {
      await api.delete(`/users/${user._id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Attendants</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={styles.addBtn}
        >
          {showForm ? 'Cancel' : '+ Add Attendant'}
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>
            {editingUser ? 'Edit Attendant' : 'New Attendant'}
          </h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. janedoe"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="password">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••"
                  {...(!editingUser && { required: true })}
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={formLoading}>
              {formLoading
                ? 'Saving...'
                : editingUser
                  ? 'Update Attendant'
                  : 'Create Attendant'}
            </button>
          </form>
        </div>
      )}

      <div className={styles.tableCard}>
        {loading ? (
          <p className={styles.empty}>Loading...</p>
        ) : users.length === 0 ? (
          <p className={styles.empty}>No attendants yet. Add one above.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleEdit(user)}
                        className={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
