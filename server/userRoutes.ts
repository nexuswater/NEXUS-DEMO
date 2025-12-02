
console.log('[userRoutes.ts] userRoutes loaded');
import { upsertUser } from './usersDb';
import express from 'express';

const router = express.Router();

// POST /api/user
// { wallet_address, account_info, account_lines }
router.post('/user', async (req, res) => {
  const { wallet_address, xrp_balance, nxs_balance, wtr_balance, eng_balance } = req.body;
  console.log('[POST /api/user] body:', req.body);
  if (!wallet_address || xrp_balance === undefined || nxs_balance === undefined || wtr_balance === undefined || eng_balance === undefined) {
    console.error('[POST /api/user] Missing required fields:', req.body);
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    upsertUser(wallet_address, xrp_balance, nxs_balance, wtr_balance, eng_balance);
    console.log(`[POST /api/user] Upserted user: ${wallet_address}`);
    res.json({ success: true });
  } catch (err) {
    console.error('[POST /api/user] Failed to upsert user:', err);
    res.status(500).json({ error: 'Failed to upsert user' });
  }
});

export default router;
