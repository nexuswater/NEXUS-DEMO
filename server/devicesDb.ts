// Device DB for storing registered devices/nodes
// Primary key: name (device name)
// Fields: name, description, region, tech, oracleIndex, account, createdAt, lastFetchTime, dataRecorded

import Database from 'better-sqlite3';
const db = new Database('./coreDB/devices.db');

db.exec(`
CREATE TABLE IF NOT EXISTS devices (
  name TEXT PRIMARY KEY,
  description TEXT,
  region TEXT,
  tech TEXT,
  oracleIndex TEXT,
  account TEXT,
  createdAt TEXT,
  lastFetchTime TEXT,
  dataRecorded INTEGER DEFAULT 0,
  lastWtrClaim TEXT DEFAULT 0,
  lastEngClaim TEXT DEFAULT 0
);
`);

// Helper function to check if a column exists in the devices table
function columnExists(columnName: string): boolean {
  const stmt = db.prepare(`PRAGMA table_info(devices)`);
  const columns = stmt.all();
  return columns.some((col: any) => col.name === columnName);
}

// Add columns only if they don't exist
if (!columnExists('lastFetchTime')) {
  db.exec(`ALTER TABLE devices ADD COLUMN lastFetchTime TEXT;`);
}
if (!columnExists('dataRecorded')) {
  db.exec(`ALTER TABLE devices ADD COLUMN dataRecorded INTEGER DEFAULT 0;`);
}
if (!columnExists('wtrClaims')) {
  db.exec(`ALTER TABLE devices ADD COLUMN wtrClaims INTEGER DEFAULT 0;`);
}
if (!columnExists('engClaims')) {
  db.exec(`ALTER TABLE devices ADD COLUMN engClaims INTEGER DEFAULT 0;`);
}
if (!columnExists('wtrReceived')) {
  db.exec(`ALTER TABLE devices ADD COLUMN wtrReceived INTEGER DEFAULT 0;`);
}
if (!columnExists('engReceived')) {
  db.exec(`ALTER TABLE devices ADD COLUMN engReceived INTEGER DEFAULT 0;`);
}
if (!columnExists('lastWtrClaim')) {
  db.exec(`ALTER TABLE devices ADD COLUMN lastWtrClaim TEXT;`);
}
if (!columnExists('lastEngClaim')) {
  db.exec(`ALTER TABLE devices ADD COLUMN lastEngClaim TEXT;`);
}

type Device = {
  name: string;
  description: string;
  region: string;
  tech: string;
  oracleIndex: string;
  account: string;
  lastFetchTime?: string; // Optional for backward compatibility
  wtrClaims: number;
  engClaims: number;
  wtrReceived: number;
  engReceived: number;
  dataRecorded: boolean;
  lastWtrClaim: string;
  lastEngClaim: string;
};

function deviceNameExists(name: string): boolean {
  const stmt = db.prepare('SELECT 1 FROM devices WHERE name = ?');
  return !!stmt.get(name);
}

function oracleIndexExists(oracleIndex: string): boolean {
  const stmt = db.prepare('SELECT 1 FROM devices WHERE oracleIndex = ?');
  return !!stmt.get(oracleIndex);
}

function addDevice({ name, description, region, tech, oracleIndex, account }: Device) {
  if (deviceNameExists(name)) {
    const err: any = new Error('Device name already exists');
    err.code = 'DUPLICATE_NAME';
    throw err;
  }
  if (oracleIndexExists(oracleIndex)) {
    const err: any = new Error('Oracle index already exists');
    err.code = 'DUPLICATE_ORACLE';
    throw err;
  }
  const createdAt = new Date().toISOString();
  try {
    const stmt = db.prepare(
      `INSERT INTO devices (name, description, region, tech, oracleIndex, account, createdAt, lastFetchTime, dataRecorded, lastWtrClaim, lastEngClaim) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      name,
      description,
      region,
      tech,
      oracleIndex,
      account,
      createdAt,
      null, // lastFetchTime is initially null
      0, // dataRecorded is initially false, represented as 0
      0, // lastWtrClaim is initially false, represented as 0
      0 // lastEngClaim is initially false, represented as 0
    );
  } catch (error) {
    console.error("Failed to add device:", error);
    throw new Error("Failed to add device");
  }
}

function getDevicesByAccount(account: string) {
  const stmt = db.prepare(`SELECT * FROM devices WHERE account = ?`);
  return stmt.all(account);
}

function getAllDevices() {
  return db.prepare('SELECT * FROM devices').all();
}

function deleteDevice(account: string, name: string) {
  const stmt = db.prepare('DELETE FROM devices WHERE account = ? AND name = ?');
  stmt.run(account, name);
}


function updateLastFetchTime(oracleIndex: string, lastFetchTime: string) {
  const stmt = db.prepare('UPDATE devices SET lastFetchTime = ? WHERE oracleIndex = ?');
  stmt.run(lastFetchTime, oracleIndex);
}

function updateDataRecorded(oracleIndex: string, dataRecorded: number) {
  const stmt = db.prepare('UPDATE devices SET dataRecorded = ? WHERE oracleIndex = ?');
  stmt.run(dataRecorded, oracleIndex);
}

// --- New functions for WTR claims/received/lastClaim ---
function incrementWtrClaimsAndReceived(account: string, amount: number) {
  // Increase wtrClaims by 1, wtrReceived by amount, and update lastWtrClaim timestamp
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE devices
    SET wtrClaims = COALESCE(wtrClaims,0) + 1,
        wtrReceived = COALESCE(wtrReceived,0) + ?,
        lastWtrClaim = ?
    WHERE account = ?
  `);
  stmt.run(amount, now, account);
}

function incrementEngClaimsAndReceived(account: string, amount: number) {
  // For ENG tokens (if needed in future)
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE devices
    SET engClaims = COALESCE(engClaims,0) + 1,
        engReceived = COALESCE(engReceived,0) + ?,
        lastEngClaim = ?
    WHERE account = ?
  `);
  stmt.run(amount, now, account);
}

export {
  addDevice,
  getDevicesByAccount,
  getAllDevices,
  deviceNameExists,
  oracleIndexExists,
  deleteDevice,
  updateLastFetchTime,
  updateDataRecorded,
  incrementWtrClaimsAndReceived,
  incrementEngClaimsAndReceived,
  db
};
