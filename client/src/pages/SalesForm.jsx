import { useState, useEffect } from 'react';
import api from '../api/axios';
import SaleItem from '../components/SaleItem';
import styles from './SalesForm.module.css';

const SalesForm = () => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [dayClosed, setDayClosed] = useState(false);
  const [closing, setClosing] = useState(false);

  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [openingBalance, setOpeningBalance] = useState('');
  const [openingError, setOpeningError] = useState('');
  const [openingLoading, setOpeningLoading] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await api.get('/sales/session');
      setSession(res.data.session);
      setDayClosed(res.data.closed);
    } catch {
      // silent
    } finally {
      setSessionLoading(false);
    }
  };

  const fetchMySales = async () => {
    try {
      const res = await api.get('/sales/today');
      setSales(res.data.sales);
      setDayClosed(res.data.closed);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchSession();
    fetchMySales();
  }, []);

  const handleOpenDay = async (e) => {
    e.preventDefault();
    setOpeningError('');
    setOpeningLoading(true);

    try {
      const res = await api.post('/sales/open', { openingBalance: Number(openingBalance) });
      setSession(res.data);
    } catch (err) {
      setOpeningError(err.response?.data?.message || 'Failed to set opening balance');
    } finally {
      setOpeningLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/sales', {
        itemName: itemName.trim(),
        quantity: Number(quantity),
        price: Number(price),
      });
      setSuccess('Sale recorded successfully!');
      setItemName('');
      setQuantity('');
      setPrice('');
      fetchMySales();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDay = async () => {
    if (!window.confirm('Are you sure you want to close sales for today? You will not be able to record any more sales.')) return;
    setClosing(true);
    try {
      await api.post('/sales/close');
      fetchMySales();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close sales');
    } finally {
      setClosing(false);
    }
  };

  const [reopening, setReopening] = useState(false);

  const handleReopenDay = async () => {
    if (!window.confirm('Reopen sales for today? You will be able to record new sales again.')) return;
    setReopening(true);
    try {
      await api.post('/sales/reopen');
      setDayClosed(false);
      fetchMySales();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reopen sales');
    } finally {
      setReopening(false);
    }
  };

  if (sessionLoading) return null;

  // State 1: Day is closed
  if (dayClosed) {
    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
    const closedDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className={styles.closedPage}>
        <div className={styles.closedHeader}>
          <div className={styles.closedBadge}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="8" width="12" height="8" rx="2"/><path d="M6 8V5.5a3 3 0 016 0V8"/></svg>
            Day Closed
          </div>
          <h1 className={styles.closedTitle}>End of Day Summary</h1>
          <p className={styles.closedDate}>{closedDate}</p>
          <button onClick={handleReopenDay} className={styles.reopenBtn} disabled={reopening}>
            {reopening ? 'Reopening...' : 'Reopen Sales'}
          </button>
        </div>

        <div className={styles.closedGrid}>
          <div className={styles.closedStatCard}>
            <span className={styles.closedStatLabel}>Opening Balance</span>
            <span className={styles.closedStatValue}>GH₵{(session?.openingBalance || 0).toLocaleString()}</span>
          </div>
          <div className={styles.closedStatCard}>
            <span className={styles.closedStatLabel}>Total Sales</span>
            <span className={`${styles.closedStatValue} ${styles.closedStatSales}`}>GH₵{totalSales.toLocaleString()}</span>
          </div>
          <div className={styles.closedStatCard}>
            <span className={styles.closedStatLabel}>Items Sold</span>
            <span className={styles.closedStatValue}>{sales.length}</span>
          </div>
          <div className={`${styles.closedStatCard} ${styles.closedStatGrand}`}>
            <span className={styles.closedStatLabel}>Grand Total</span>
            <span className={styles.closedStatValue}>GH₵{((session?.openingBalance || 0) + totalSales).toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.closedTableCard}>
          <div className={styles.closedTableHeader}>
            <h2>Sales Breakdown</h2>
            <span className={styles.closedCount}>{sales.length} transactions</span>
          </div>
          {sales.length > 0 ? (
            <table className={styles.closedTable}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td className={styles.closedItemName}>{sale.itemName}</td>
                    <td>{sale.quantity}</td>
                    <td>GH₵{sale.price.toLocaleString()}</td>
                    <td className={styles.closedItemTotal}>GH₵{sale.total.toLocaleString()}</td>
                    <td className={styles.closedItemTime}>
                      {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className={styles.closedFootLabel}>Total</td>
                  <td className={styles.closedFootValue}>GH₵{totalSales.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className={styles.empty}>No sales were recorded today.</p>
          )}
        </div>
      </div>
    );
  }

  // State 2: No session yet — enter opening balance
  if (!session) {
    return (
      <div className={styles.openingContainer}>
        <div className={styles.card}>
          <h2 className={styles.title}>Start Your Day</h2>
          <p className={styles.openingDesc}>
            Enter the amount of cash available before you begin recording sales.
          </p>

          <form onSubmit={handleOpenDay} className={styles.form}>
            {openingError && <div className={styles.error}>{openingError}</div>}

            <div className={styles.field}>
              <label htmlFor="openingBalance">Opening Balance (GH₵)</label>
              <input
                id="openingBalance"
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                autoFocus
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={openingLoading}>
              {openingLoading ? 'Starting...' : 'Begin Sales'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // State 3: Session open — record sales
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <>
    <div className={styles.container}>
      <div className={styles.formSection}>
        <div className={styles.card}>
          <h2 className={styles.title}>Record a Sale</h2>

          <div className={styles.balanceBadge}>
            Opening Balance: GH₵{session.openingBalance.toLocaleString()}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <div className={styles.field}>
              <label htmlFor="itemName">Item Name</label>
              <input
                id="itemName"
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. Milo, Milk"
                required
                autoFocus
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  min="1"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="price">Price (GH₵)</label>
                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {quantity && price && (
              <div className={styles.preview}>
                Total: GH₵{(Number(quantity) * Number(price)).toLocaleString()}
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Recording...' : 'Record Sale'}
            </button>
          </form>
        </div>
      </div>

      <div className={styles.listSection}>
        <h3 className={styles.listTitle}>My Sales Today ({sales.length})</h3>
        <div className={styles.salesList}>
          {sales.length === 0 ? (
            <p className={styles.empty}>No sales recorded today yet.</p>
          ) : (
            <>
              {sales.map((sale) => <SaleItem key={sale._id} sale={sale} />)}

              <div className={styles.summaryBox}>
                <div className={styles.summaryLine}>
                  <span>Opening Balance</span>
                  <span>GH₵{session.openingBalance.toLocaleString()}</span>
                </div>
                <div className={styles.summaryLine}>
                  <span>Total Sales ({sales.length} items)</span>
                  <span>GH₵{totalSales.toLocaleString()}</span>
                </div>
                <div className={`${styles.summaryLine} ${styles.grandTotal}`}>
                  <span>Grand Total</span>
                  <span>GH₵{(session.openingBalance + totalSales).toLocaleString()}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

      {sales.length > 0 && (
        <div className={styles.closeBar}>
          <div className={styles.closeBarInner}>
            <div className={styles.closeBarSummary}>
              <span className={styles.closeBarLabel}>Grand Total</span>
              <span className={styles.closeBarAmount}>GH₵{(session.openingBalance + totalSales).toLocaleString()}</span>
            </div>
            <button
              onClick={handleCloseDay}
              className={styles.closeBtn}
              disabled={closing}
            >
              {closing ? 'Closing...' : 'Close Sales for Today'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesForm;
