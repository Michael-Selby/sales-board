import { useState, useEffect } from 'react';
import api from '../api/axios';
import SaleItem from '../components/SaleItem';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [days, setDays] = useState([]);
  const [weekTotal, setWeekTotal] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchWeek = async () => {
    try {
      const res = await api.get('/sales/week');
      setDays(res.data.days);
      setWeekTotal(res.data.weekTotal);

      if (selectedDay === null) {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayIndex = res.data.days.findIndex((d) => d.date === todayStr);
        setSelectedDay(todayIndex >= 0 ? todayIndex : 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeek();
  }, []);

  const current = days[selectedDay] || null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sales Dashboard</h1>
          <p className={styles.weekTotal}>Week Total: <strong>GH₵{weekTotal.toLocaleString()}</strong></p>
        </div>
        <button onClick={fetchWeek} className={styles.refreshBtn}>Refresh</button>
      </div>

      <div className={styles.dayTabs}>
        {days.map((day, i) => (
          <button
            key={day.date}
            onClick={() => setSelectedDay(i)}
            className={`${styles.dayTab} ${selectedDay === i ? styles.activeTab : ''} ${day.closed ? styles.closedTab : ''}`}
          >
            <span className={styles.dayName}>{day.name.slice(0, 3)}</span>
            <span className={styles.dayAmount}>GH₵{day.totalAmount.toLocaleString()}</span>
            {day.closed && <span className={styles.closedBadge}>Closed</span>}
          </button>
        ))}
      </div>

      {current && (
        <>
          <div className={styles.summaryRow}>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Total Sales</span>
              <span className={styles.summaryValue}>GH₵{current.totalAmount.toLocaleString()}</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Transactions</span>
              <span className={styles.summaryValue}>{current.count}</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Status</span>
              <span className={`${styles.summaryValue} ${current.closed ? styles.statusClosed : styles.statusOpen}`}>
                {current.closed ? 'Closed' : 'Open'}
              </span>
            </div>
          </div>

          <div className={styles.listSection}>
            <h2 className={styles.listTitle}>{current.name}'s Sales</h2>
            {loading ? (
              <p className={styles.empty}>Loading sales...</p>
            ) : current.sales.length === 0 ? (
              <p className={styles.empty}>No sales recorded for {current.name}.</p>
            ) : (
              <div className={styles.salesList}>
                {current.sales.map((sale) => (
                  <SaleItem key={sale._id} sale={sale} showAttendant />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
