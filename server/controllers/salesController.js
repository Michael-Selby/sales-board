const Sale = require('../models/Sale');
const DayClose = require('../models/DayClose');
const DaySession = require('../models/DaySession');

const getDateString = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getDayRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const openDay = async (req, res) => {
  try {
    const { openingBalance } = req.body;

    if (openingBalance == null || openingBalance < 0) {
      return res.status(400).json({ message: 'Please provide a valid opening balance' });
    }

    const todayStr = getDateString(new Date());

    const closed = await DayClose.findOne({ date: todayStr });
    if (closed) {
      return res.status(400).json({ message: 'Sales for today have been closed' });
    }

    const existing = await DaySession.findOne({ attendant: req.user._id, date: todayStr });
    if (existing) {
      return res.status(400).json({ message: 'You have already opened sales for today' });
    }

    const session = await DaySession.create({
      attendant: req.user._id,
      date: todayStr,
      openingBalance,
    });

    res.status(201).json({
      openingBalance: session.openingBalance,
      date: session.date,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getSession = async (req, res) => {
  try {
    const todayStr = getDateString(new Date());
    const session = await DaySession.findOne({ attendant: req.user._id, date: todayStr });
    const closed = await DayClose.findOne({ date: todayStr });

    res.json({
      session: session ? { openingBalance: session.openingBalance, date: session.date } : null,
      closed: !!closed,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createSale = async (req, res) => {
  try {
    const { itemName, quantity, price } = req.body;

    if (!itemName || !quantity || !price) {
      return res.status(400).json({ message: 'Please provide item name, quantity, and price' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    if (price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    const todayStr = getDateString(new Date());

    const closed = await DayClose.findOne({ date: todayStr });
    if (closed) {
      return res.status(400).json({ message: 'Sales for today have been closed' });
    }

    const session = await DaySession.findOne({ attendant: req.user._id, date: todayStr });
    if (!session) {
      return res.status(400).json({ message: 'Please enter your opening balance before recording sales' });
    }

    const total = quantity * price;

    const sale = await Sale.create({
      itemName,
      quantity,
      price,
      total,
      recordedBy: req.user._id,
    });

    const populated = await sale.populate('recordedBy', 'name');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getTodaySales = async (req, res) => {
  try {
    const now = new Date();
    const { start, end } = getDayRange(now);

    const filter = {
      createdAt: { $gte: start, $lt: end },
    };

    if (req.user.role !== 'admin') {
      filter.recordedBy = req.user._id;
    }

    const sales = await Sale.find(filter)
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 });

    const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);

    const todayStr = getDateString(now);
    const closed = await DayClose.findOne({ date: todayStr });

    res.json({
      sales,
      totalAmount,
      count: sales.length,
      closed: !!closed,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getWeeklySales = async (req, res) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 7);

    const sales = await Sale.find({
      createdAt: { $gte: monday, $lt: sunday },
    })
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 });

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);
      const dateStr = getDateString(date);
      const { start, end } = getDayRange(date);

      const daySales = sales.filter((s) => {
        const created = new Date(s.createdAt);
        return created >= start && created < end;
      });

      const totalAmount = daySales.reduce((sum, sale) => sum + sale.total, 0);
      const closed = await DayClose.findOne({ date: dateStr });

      days.push({
        name: dayNames[i],
        date: dateStr,
        sales: daySales,
        totalAmount,
        count: daySales.length,
        closed: !!closed,
      });
    }

    const weekTotal = sales.reduce((sum, sale) => sum + sale.total, 0);

    res.json({ days, weekTotal });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const closeDay = async (req, res) => {
  try {
    const todayStr = getDateString(new Date());

    const existing = await DayClose.findOne({ date: todayStr });
    if (existing) {
      return res.status(400).json({ message: 'Today\'s sales are already closed' });
    }

    const now = new Date();
    const { start, end } = getDayRange(now);

    const sales = await Sale.find({
      createdAt: { $gte: start, $lt: end },
    });

    const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);

    const dayClose = await DayClose.create({
      date: todayStr,
      totalAmount,
      totalTransactions: sales.length,
      closedBy: req.user._id,
    });

    res.status(201).json({
      message: 'Sales closed for today',
      summary: {
        date: dayClose.date,
        totalAmount: dayClose.totalAmount,
        totalTransactions: dayClose.totalTransactions,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const reopenDay = async (req, res) => {
  try {
    const todayStr = getDateString(new Date());

    const existing = await DayClose.findOne({ date: todayStr });
    if (!existing) {
      return res.status(400).json({ message: 'Today\'s sales are not closed' });
    }

    await DayClose.deleteOne({ date: todayStr });

    res.json({ message: 'Sales reopened for today' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDayStatus = async (req, res) => {
  try {
    const todayStr = getDateString(new Date());
    const closed = await DayClose.findOne({ date: todayStr });
    res.json({ closed: !!closed });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { openDay, getSession, createSale, getTodaySales, getWeeklySales, closeDay, reopenDay, getDayStatus };
