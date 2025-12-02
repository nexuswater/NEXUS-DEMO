import Database from 'better-sqlite3';

// Initialize or open the database
const db = new Database('./coreDB/users.db');
db.exec(`CREATE TABLE IF NOT EXISTS users (
  wallet_address TEXT PRIMARY KEY,
  last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
  xrp_balance TEXT,
  nxs_balance TEXT,
  wtr_balance TEXT,
  eng_balance TEXT,
  claimed INTEGER DEFAULT 0,
  retired INTEGER DEFAULT 0
);`);

type UserRow = {
  wallet_address: string;
  account_info: string;
  account_lines: string;
  mpt_objects: string | null;
  updated_at: string;
  last_login: string;
  xrp_balance: string;
  nxs_balance: string;
  wtr_balance: string;
  eng_balance: string;
  claimed: number;
  retired: number;
};

export function upsertUser(
  wallet_address: string,
  xrp_balance: string,
  nxs_balance: string,
  wtr_balance: string,
  eng_balance: string
) {
  const sql = `INSERT INTO users (wallet_address, last_login, xrp_balance, nxs_balance, wtr_balance, eng_balance, claimed, retired)
    VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, 0, 0)
    ON CONFLICT(wallet_address) DO UPDATE SET
      last_login=CURRENT_TIMESTAMP,
      xrp_balance=excluded.xrp_balance,
      nxs_balance=excluded.nxs_balance,
      wtr_balance=excluded.wtr_balance,
      eng_balance=excluded.eng_balance;`;
  const stmt = db.prepare(sql);
  try {
    stmt.run(wallet_address, xrp_balance, nxs_balance, wtr_balance, eng_balance);
    console.log(`[usersDb] Upserted user ${wallet_address}`);
  } catch (err) {
    console.error(`[usersDb] Failed to upsert user ${wallet_address}:`, err);
    throw err;
  }
}

export function getUser(wallet_address: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE wallet_address = ?');
  const row = stmt.get(wallet_address) as UserRow | undefined;
  if (!row) return null;
  return row;
}
