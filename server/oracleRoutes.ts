import express from 'express';
import { fetchOracleData } from './fetchOracleData';
import { oracleIndexExists } from './devicesDb';
import { db } from './devicesDb';
import path from 'path';
import Database from 'better-sqlite3';

const router = express.Router();

// Define the type for the result object
interface DeviceResult {
  account: string;
}

// Define the type for the TOV query result
interface TOVResult {
  TOV: number;
}

// POST /api/oracle-data/fetch
router.post('/oracle-data/fetch', async (req, res) => {
  const { oracleIndex } = req.body;

  if (!oracleIndex) {
    console.error('Missing oracleIndex in request body');
    return res.status(400).json({ error: 'Missing oracleIndex' });
  }

  try {
    console.log(`Fetching oracle data for oracleIndex: ${oracleIndex}`);

    // Validate oracleIndex and retrieve associated account
    const stmt = db.prepare('SELECT account FROM devices WHERE oracleIndex = ?');
    const result = stmt.get(oracleIndex) as DeviceResult;

    if (!result) {
      console.error(`Oracle index not found: ${oracleIndex}`);
      return res.status(404).json({ error: 'Oracle index not found' });
    }

    const { account } = result;
    console.log(`Found account for oracleIndex ${oracleIndex}: ${account}`);

    // Fetch oracle data
    const data = await fetchOracleData(oracleIndex as string, account as string);
    console.log(`Fetched oracle data:`, data);

    // Send success response
    const response = { success: true, data };
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching oracle data:', error);
    res.status(500).json({ error: 'Failed to fetch oracle data' });
  }
});

// Endpoint to fetch oracle data
router.get('/fetch', async (req, res) => {
  const { oracleIndex, account } = req.query;

  if (!oracleIndex || !account) {
    return res.status(400).json({ error: 'oracleIndex and account are required' });
  }

  try {
    const data = await fetchOracleData(oracleIndex as string, account as string);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching oracle data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch oracle data' });
  }
});

// Endpoint to fetch the most recent TOV value for a given oracleIndex
router.get('/oracle-data/tov', async (req, res) => {
  const { oracleIndex } = req.query;

  if (!oracleIndex) {
    console.error('Missing oracleIndex in request query');
    return res.status(400).json({ error: 'Missing oracleIndex' });
  }

  try {
    console.log(`Fetching most recent TOV and AssetClass for oracleIndex: ${oracleIndex}`);

    // Open the SQLite database for the oracleIndex
    const dbPath = path.join(
      path.resolve(),
      'coreDB/oracleData',
      `${oracleIndex}.db`
    );
    let db;
    try {
      db = new Database(dbPath);
    } catch (err) {
      // If DB file does not exist, treat as no data
      return res.status(404).json({ error: 'No TOV value found' });
    }

    // Check if oracle_data table exists
    const tableCheck = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='oracle_data';`).get();
    if (!tableCheck) {
      return res.status(404).json({ error: 'No TOV value found' });
    }

    // Query the most recent TOV value and AssetClass
    const stmt = db.prepare(
      `SELECT TOV, assetClass FROM oracle_data ORDER BY timestamp DESC LIMIT 1;`
    );
    const result = stmt.get() as { TOV: number; assetClass: string };

    if (!result || result.TOV === null) {
      return res.status(404).json({ error: 'No TOV value found' });
    }

    console.log(`Fetched TOV value: ${result.TOV}, AssetClass: ${result.assetClass}`);
    res.json({ success: true, tov: result.TOV, assetClass: result.assetClass });
  } catch (error) {
    // Only log unexpected errors
    console.error('Error fetching TOV value:', error);
    res.status(500).json({ error: 'Failed to fetch TOV value' });
  }
});

// GET /api/oracle-data/read?oracleIndex=...
router.get('/oracle-data/read', async (req, res) => {
  const { oracleIndex } = req.query;
  if (!oracleIndex) {
    return res.status(400).json({ error: 'Missing oracleIndex' });
  }
  try {
    const dbPath = path.join(
      path.resolve(),
      'coreDB/oracleData',
      `${oracleIndex}.db`
    );
    const db = new Database(dbPath);
    const rows = db.prepare('SELECT * FROM oracle_data ORDER BY timestamp DESC').all();
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error reading oracle data from DB:', error);
    res.status(500).json({ error: 'Failed to read oracle data from DB' });
  }
});

export default router;