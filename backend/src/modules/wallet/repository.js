import { query } from '../../config/database.js';

class WalletRepository {
  async getByDriverId(driverId) {
    const { rows } = await query(`SELECT * FROM wallets WHERE driver_id = $1 LIMIT 1`, [
      driverId,
    ]);
    return rows[0] || null;
  }

  async ensureForDriverId(driverId) {
    const existing = await this.getByDriverId(driverId);
    if (existing) return existing;
    const { rows } = await query(
      `INSERT INTO wallets (driver_id, balance)
       VALUES ($1, 0)
       ON CONFLICT (driver_id) DO UPDATE SET driver_id = EXCLUDED.driver_id
       RETURNING *`,
      [driverId]
    );
    return rows[0];
  }

  async credit({ walletId, tripId, amount }) {
    await query(
      `INSERT INTO wallet_transactions (wallet_id, trip_id, type, amount)
       VALUES ($1,$2,'CREDIT',$3)`,
      [walletId, tripId || null, amount]
    );

    const { rows } = await query(
      `UPDATE wallets
       SET balance = balance + $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING balance`,
      [amount, walletId]
    );
    return rows[0]?.balance ?? null;
  }

  async debit({ walletId, amount }) {
    await query(
      `INSERT INTO wallet_transactions (wallet_id, trip_id, type, amount)
       VALUES ($1, NULL, 'DEBIT', $2)`,
      [walletId, amount]
    );

    const { rows } = await query(
      `UPDATE wallets
       SET balance = balance - $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING balance`,
      [amount, walletId]
    );
    return rows[0]?.balance ?? null;
  }

  async listRecentTrips(driverId, limit = 5) {
    const lim = Number(limit) || 5;
    const { rows } = await query(
      `
      SELECT *
      FROM trips
      WHERE driver_id = $1
        AND status = 'COMPLETED'
      ORDER BY completed_at DESC NULLS LAST, created_at DESC
      LIMIT ${lim}
      `,
      [driverId]
    );
    return rows;
  }

  async listRecentTransactions(walletId, limit = 10) {
    const lim = Number(limit) || 10;
    const { rows } = await query(
      `
      SELECT *
      FROM wallet_transactions
      WHERE wallet_id = $1
      ORDER BY created_at DESC
      LIMIT ${lim}
      `,
      [walletId]
    );
    return rows;
  }
}

export default new WalletRepository();

