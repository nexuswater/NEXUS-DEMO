import xrpl from 'xrpl'
import fs from 'fs'
import path from 'path'

// Account and Oracle Ledger Entry 
const ACCOUNT = 'r4b2UDfcaLxpMorJ39C66KZD4c2h6iRfjc'
const ORACLE_INDEX = '8F47A5B8820C27486D01616BCBBEF7071FE5FCB1470C07CC98AFA8FA73511C45'

async function getAccountTxns(account) {
  const client = new xrpl.Client('wss://s.devnet.rippletest.net:51233')
  await client.connect()
  let allTx = []
  let marker = undefined
  do {
    const txResp = await client.request({
      command: 'account_tx',
      account: account,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit: 400,
      marker: marker
    })
    allTx.push(...txResp.result.transactions)
    marker = txResp.result.marker
  } while (marker)
  await client.disconnect()
  return allTx
}

const txns = await getAccountTxns(ACCOUNT)

// Filter for transactions that modified the specific oracle
const oracleTxns = txns.filter(tx => {
  return tx.meta?.AffectedNodes?.some(node => {
    return node.ModifiedNode?.LedgerEntryType === 'Oracle' && node.ModifiedNode?.LedgerIndex === ORACLE_INDEX
  })
})

// Extract history from the transactions
const history = oracleTxns.map(tx => {
  const oracleNode = tx.meta.AffectedNodes.find(node => 
    node.ModifiedNode?.LedgerEntryType === 'Oracle' && node.ModifiedNode?.LedgerIndex === ORACLE_INDEX
  )
  const updatedSeries = oracleNode.ModifiedNode.FinalFields.PriceDataSeries.filter(
    pd => pd.PriceData && pd.PriceData.AssetPrice !== undefined
  )
  return {
    ledger_index: tx.tx_json?.ledger_index || tx.ledger_index,
    timestamp: tx.tx_json.LastUpdateTime,
    hash: tx.hash,
    PriceDataSeries: updatedSeries
  }
}).sort((a, b) => a.ledger_index - b.ledger_index) // oldest first

const filePath = path.join(path.resolve(), `${ORACLE_INDEX}.json`)
fs.writeFileSync(filePath, JSON.stringify(history, null, 2))
console.log(`Oracle history written to ${filePath}`)
