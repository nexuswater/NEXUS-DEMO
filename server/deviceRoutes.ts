import express from 'express';
import { addDevice, getDevicesByAccount, getAllDevices, deviceNameExists, oracleIndexExists } from './devicesDb';
import { deleteDevice } from './devicesDb'; // Import deleteDevice function

const router = express.Router();

// POST /api/device
// { name, description, region, tech, oracleIndex, account }
router.post('/device', (req, res) => {
  const { name, description, region, tech, oracleIndex, account } = req.body;
  if (!name || !description || !region || !tech || !oracleIndex || !account) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Fail fast for duplicate name or oracleIndex
  if (deviceNameExists(name)) {
    return res.status(409).json({ error: 'Device name already exists', field: 'name' });
  }
  if (oracleIndexExists(oracleIndex)) {
    return res.status(409).json({ error: 'Oracle index already exists', field: 'oracleIndex' });
  }
  try {
    addDevice({ name, description, region, tech, oracleIndex, account });
    res.json({ success: true });
  } catch (err: any) {
    if (err && err.code === 'DUPLICATE_NAME') {
      return res.status(409).json({ error: 'Device name already exists', field: 'name' });
    }
    if (err && err.code === 'DUPLICATE_ORACLE') {
      return res.status(409).json({ error: 'Oracle index already exists', field: 'oracleIndex' });
    }
    res.status(500).json({ error: 'Failed to add device' });
  }
});

// GET /api/devices/:account
router.get('/devices/:account', (req, res) => {
  const { account } = req.params;
  if (!account) return res.status(400).json({ error: 'Missing account' });
  try {
    const devices = getDevicesByAccount(account);
    res.json({ devices });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// GET /api/devices
router.get('/devices', (req, res) => {
  try {
    const devices = getAllDevices();
    res.json({ devices });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// DELETE /api/device/:account/:name
router.delete('/device/:account/:name', (req, res) => {
  const { account, name } = req.params;
  if (!account || !name) {
    return res.status(400).json({ error: 'Missing account or device name' });
  }
  try {
    deleteDevice(account, name);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

export default router;
