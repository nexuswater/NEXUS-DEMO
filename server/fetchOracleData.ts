import { Client, AccountTxResponse } from 'xrpl';
import path from 'path';
import fs from 'fs';
import { getDevicesByAccount, updateLastFetchTime, updateDataRecorded } from './devicesDb';
import Database from 'better-sqlite3';
import crypto from 'crypto';

// Define a type for the dynamic data columns
interface OracleDataRecord {
  uuid: string;
  provider: string;
  assetClass: string;
  timestamp: number;
  hash: string;
  ledger_index: number;
  TransactionResult: string;
  [key: string]: any; // Allow dynamic keys for data columns
}

// Utility function to convert hex to ASCII
function hexToAscii(hex: string): string {
  try {
    return Buffer.from(hex, 'hex').toString('utf8');
  } catch (error) {
    console.error(`Failed to convert hex to ASCII: ${hex}`, error);
    return hex; // Return the original hex string if conversion fails
  }
}

// Fetch transactions for a given account
async function getAccountTxns(account: string) {
  const client = new Client('wss://s.devnet.rippletest.net:51233');
  await client.connect();
  let allTx: any[] = [];
  let marker: string | undefined = undefined;
  do {
    const txResp: AccountTxResponse = await client.request({
      command: 'account_tx',
      account: account,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: 400,
      marker: marker,
    });
    allTx.push(...txResp.result.transactions);
    marker = txResp.result.marker as string | undefined;
  } while (marker);
  await client.disconnect();
  return allTx;
}

// Fetch oracle data for a given oracleIndex and account
async function fetchOracleData(oracleIndex: string, account: string) {
  console.log(`Starting fetchOracleData for oracleIndex: ${oracleIndex}, account: ${account}`);

  const txns = await getAccountTxns(account);
  console.log(`Fetched transactions for account ${account}:`, txns);

  // Filter transactions that modified the specific oracle
  const oracleTxns = txns.filter((tx) => {
    return tx.meta?.AffectedNodes?.some((node: any) => {
      return (
        node.ModifiedNode?.LedgerEntryType === 'Oracle' &&
        node.ModifiedNode?.LedgerIndex === oracleIndex
      );
    });
  });
  console.log(`Filtered oracle transactions:`, oracleTxns);

  // Extract Provider and AssetClass from the first transaction
  const firstOracleNode = oracleTxns[0]?.meta?.AffectedNodes.find(
    (node: any) =>
      node.ModifiedNode?.LedgerEntryType === 'Oracle' &&
      node.ModifiedNode?.LedgerIndex === oracleIndex
  );
  const providerHex = firstOracleNode?.ModifiedNode?.FinalFields?.Provider || 'Unknown';
  const assetClassHex = firstOracleNode?.ModifiedNode?.FinalFields?.AssetClass || 'Unknown';

  const provider = hexToAscii(providerHex);
  const assetClass = hexToAscii(assetClassHex);

  console.log(`Extracted Provider: ${provider}, AssetClass: ${assetClass}`);

  // Define columns dynamically based on asset class
  const dataColumns = ['FLR', 'PRV', 'TOV'];

  // Extract history from the transactions
  const history: OracleDataRecord[] = oracleTxns.map((tx) => {
    const oracleNode = tx.meta.AffectedNodes.find(
      (node: any) =>
        node.ModifiedNode?.LedgerEntryType === 'Oracle' &&
        node.ModifiedNode?.LedgerIndex === oracleIndex
    );
    const updatedSeries = oracleNode.ModifiedNode.FinalFields.PriceDataSeries.filter(
      (pd: any) => pd.PriceData && pd.PriceData.AssetPrice !== undefined
    );

    const dataValues: Record<string, number | null> = {};
    for (const pd of updatedSeries) {
      const quoteAsset = pd.PriceData.QuoteAsset;
      if (dataColumns.includes(quoteAsset)) {
        const value = parseInt(pd.PriceData.AssetPrice, 16) / Math.pow(10, pd.PriceData.Scale);
        dataValues[quoteAsset] = value !== 0 && !isNaN(value) ? value : null;
      }
    }

    return {
      uuid: crypto.randomUUID(),
      provider,
      assetClass,
      timestamp: tx.tx_json.LastUpdateTime,
      hash: tx.hash,
      ledger_index: tx.tx_json?.ledger_index || tx.ledger_index,
      TransactionResult: 'tesSUCCESS',
      ...dataValues,
    };
  });

  console.log(`Processed oracle data history:`, history);

  // Create or open the SQLite database for the oracleIndex
  const dbPath = path.join(
    path.resolve(),
    'coreDB/oracleData',
    `${oracleIndex}.db`
  );
  const db = new Database(dbPath);

  // Create the oracle_data table if it doesn't exist
  const createTableSQL = `CREATE TABLE IF NOT EXISTS oracle_data (
    uuid TEXT PRIMARY KEY,
    provider TEXT,
    assetClass TEXT,
    timestamp INTEGER,
    ${dataColumns.map((col) => `${col} REAL`).join(', ')},
    hash TEXT,
    ledger_index INTEGER,
    TransactionResult TEXT
  )`;
  db.exec(createTableSQL);

  // Clear existing data in the table
  db.exec(`DELETE FROM oracle_data;`);
  console.log(`Cleared existing data from oracle_data table.`);

  // Insert the data into the oracle_data table
  const insertStmt = db.prepare(`
    INSERT INTO oracle_data (uuid, provider, assetClass, timestamp, ${dataColumns.join(', ')}, hash, ledger_index, TransactionResult)
    VALUES (${['?', '?', '?', '?', ...dataColumns.map(() => '?'), '?', '?', '?'].join(', ')});
  `);

  for (const record of history) {
    const values = [
      record.uuid,
      record.provider,
      record.assetClass,
      record.timestamp,
      ...dataColumns.map((col) => record[col] || null),
      record.hash,
      record.ledger_index,
      record.TransactionResult,
    ];
    console.log(`Inserting record into database:`, record);
    insertStmt.run(values);
  }

  console.log(`Oracle data inserted into ${oracleIndex}.db`);

  // Update the last fetch time and set dataRecorded to true in the devices database
  const lastFetchTime = new Date().toISOString();
  updateLastFetchTime(oracleIndex, lastFetchTime);
  updateDataRecorded(oracleIndex, 1); // Set dataRecorded to true
  console.log(`Updated lastFetchTime and dataRecorded for oracleIndex ${oracleIndex}`);

  return history;
}

export { fetchOracleData };