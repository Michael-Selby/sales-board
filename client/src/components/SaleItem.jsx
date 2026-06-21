import styles from './SaleItem.module.css';

const SaleItem = ({ sale, showAttendant = false }) => {
  const time = new Date(sale.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={styles.item}>
      <div className={styles.main}>
        <span className={styles.name}>{sale.itemName}</span>
        <span className={styles.time}>{time}</span>
      </div>
      <div className={styles.details}>
        <span>Qty: {sale.quantity}</span>
        <span>Price: GH₵{sale.price.toLocaleString()}</span>
        <span className={styles.total}>Total: GH₵{sale.total.toLocaleString()}</span>
        {showAttendant && sale.recordedBy && (
          <span className={styles.attendant}>By: {sale.recordedBy.name}</span>
        )}
      </div>
    </div>
  );
};

export default SaleItem;
