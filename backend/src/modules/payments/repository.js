import { query } from '../../config/database.js';

class PaymentsRepository {
  async getWallet(driverId) {
    const { rows } = await query(
      'SELECT * FROM wallets WHERE driver_id = $1',
      [driverId]
    );
    return rows[0];
  }

  async credit(walletId, tripId, amount) {
    await query(
      `INSERT INTO wallet_transactions (wallet_id, trip_id, amount, type)
       VALUES ($1,$2,$3,'CREDIT')`,
      [walletId, tripId, amount]
    );

    await query(
      `UPDATE wallets
       SET balance = balance + $1
       WHERE id = $2`,
      [amount, walletId]
    );
  }

  async history(walletId) {
    const { rows } = await query(
      `SELECT * FROM wallet_transactions
       WHERE wallet_id = $1
       ORDER BY created_at DESC`,
      [walletId]
    );
    return rows;
  }
}

export default new PaymentsRepository();
