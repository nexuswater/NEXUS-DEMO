import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface OracleDetailProps {
  oracleIndex: string;
  onBack: () => void;
}

export default function OracleDetail({ oracleIndex, onBack }: OracleDetailProps) {
  const [oracleData, setOracleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For title and claim data
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [assetClass, setAssetClass] = useState<string | null>(null);
  const [claimData, setClaimData] = useState<null | {
    wtrClaims: number;
    wtrReceived: number;
    lastWtrClaim: string;
    engClaims: number;
    engReceived: number;
    lastEngClaim: string;
  }>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/oracle-data/read?oracleIndex=${oracleIndex}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOracleData(data.data);
          // Try to extract device name and asset class from first row
          if (data.data && data.data.length > 0) {
            setAssetClass(data.data[0].assetClass || null);
          }
        } else setError(data.error || "Failed to fetch oracle data");
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    // Fetch device name from /api/devices if possible
    fetch('/api/devices')
      .then(res => res.json())
      .then(data => {
        if (data.devices) {
          const found = data.devices.find((d: any) => d.oracleIndex === oracleIndex);
          setDeviceName(found?.name || null);
          // Set claim data if available
          if (found) {
            setClaimData({
              wtrClaims: found.wtrClaims ?? 0,
              wtrReceived: found.wtrReceived ?? 0,
              lastWtrClaim: found.lastWtrClaim ?? '',
              engClaims: found.engClaims ?? 0,
              engReceived: found.engReceived ?? 0,
              lastEngClaim: found.lastEngClaim ?? '',
            });
          }
        }
      });
  }, [oracleIndex]);


  // Only show these columns, and only if not all values are null
  const columns = ["timestamp", "ledger_index", "hash", "PRV", "TOV"];
  // Remove columns where all values are null or undefined
  const visibleColumns = columns.filter(col =>
    oracleData.some((row: any) => row[col] !== null && row[col] !== undefined)
  );

  function formatTimestamp(ts: any) {
    if (!ts) return "-";
    let date;
    if (typeof ts === 'number' || /^[0-9]+$/.test(ts)) {
      let n = Number(ts);
      if (n > 1000000000000) date = new Date(n);
      else date = new Date((n + 946684800) * 1000);
    } else {
      date = new Date(ts);
    }
    if (isNaN(date.getTime())) return String(ts);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) + ', ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  // Calculate totals
  const totalProduced = oracleData.reduce((sum, row) => sum + (parseFloat(row.PRV) || 0), 0);

  // Use classLetter multiplier for offset calculation (CO2e)
  let offsetMultiplier = 0;
  if (assetClass) {
    const classLetter = assetClass.slice(-1).toUpperCase();
    if (classLetter === 'A') offsetMultiplier = 100;
    else if (classLetter === 'B') offsetMultiplier = 75;
    else if (classLetter === 'C') offsetMultiplier = 50;
    else if (classLetter === 'D') offsetMultiplier = 25;
  }
  const totalCO2Saved = offsetMultiplier > 0 ? totalProduced * offsetMultiplier : totalProduced * 0.35;

  // Determine device type for claim display (WTR or ENG)
  let deviceType = 'WTR';
  if (assetClass && assetClass.toUpperCase().includes('ENG')) deviceType = 'ENG';
  // fallback: if claimData.engClaims > 0, prefer ENG
  if (claimData && claimData.engClaims > 0) deviceType = 'ENG';

  // Prepare chart data
  // Reverse data for left-to-right timeline (oldest to newest)
  const chartLabels = oracleData.map(row => formatTimestamp(row.timestamp)).reverse();
  const producedData = oracleData.map(row => Number(row.PRV) || 0).reverse();
  const totalData = oracleData.map(row => Number(row.TOV) || 0).reverse();

  const producedBarData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Produced (L)',
        data: producedData,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 4,
      },
    ],
  };
  const totalLineData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Total (L)',
        data: totalData,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 6,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: { grid: { color: '#222' }, beginAtZero: true },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-col gap-1 mb-1">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3 min-w-[200px]">
              <span className="text-3xl font-extrabold text-white leading-tight tracking-tight drop-shadow-sm">{deviceName}</span>
              <a
                href={`https://devnet.xrplwin.com/entry/${oracleIndex}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-primary underline break-all hover:text-blue-400 transition-colors px-2 py-1 rounded bg-primary/10 w-fit"
                title="View on XRPL Explorer"
              >
                {oracleIndex}
              </a>
            </div>
            {assetClass && (
              <span className="border border-blue-400/60 text-blue-300 bg-blue-400/10 px-3 py-1 rounded-lg text-sm font-semibold min-w-[120px] text-center">
                {assetClass}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-10 items-end text-base font-medium mt-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total Produced:</span>
            <span className="text-white font-bold">{totalProduced.toLocaleString(undefined, { maximumFractionDigits: 3 })}</span>
            <span className="text-muted-foreground">L</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">CO₂ Saved:</span>
            <span className="text-green-400 font-bold">{totalCO2Saved.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
            <span className="text-muted-foreground">g</span>
          </div>
          {claimData && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-base ml-2 min-w-[200px]">
              {deviceType === 'WTR' ? (
                <>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-muted-foreground">Claims:</span>
                    <span className="text-white font-bold">{claimData.wtrClaims}</span>
                    <span className="text-blue-300"></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-muted-foreground">Claimed:</span>
                    <span className="text-white font-bold">{claimData.wtrReceived.toLocaleString()}</span>
                    <span className="text-blue-300">($WTR)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-muted-foreground">Last Claim:</span>
                    <span className="text-white font-bold">{claimData.lastWtrClaim ? new Date(claimData.lastWtrClaim).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-muted-foreground">Claims:</span>
                    <span className="text-white font-bold">{claimData.engClaims}</span>
                    <span className="text-amber-300">(ENG)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-muted-foreground">Claimed:</span>
                    <span className="text-white font-bold">{claimData.engReceived.toLocaleString()}</span>
                    <span className="text-amber-300">(ENG)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-muted-foreground">Last Claim:</span>
                    <span className="text-white font-bold">{claimData.lastEngClaim ? new Date(claimData.lastEngClaim).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-6 mb-4">
            <div className="flex-1 min-w-[250px] h-48 bg-card/80 rounded-lg p-2 border border-border">
              <Bar
                data={producedBarData}
                options={{
                  ...chartOptions,
                  onClick: (evt, elements, chart) => {
                    if (elements && elements.length > 0) {
                      const idx = elements[0].index;
                      const hash = oracleData[oracleData.length - 1 - idx]?.hash;
                      if (hash) window.open(`https://devnet.xrplwin.com/tx/${hash}`, '_blank');
                    }
                  },
                }}
                height={180}
              />
            </div>
            <div className="flex-1 min-w-[250px] h-48 bg-card/80 rounded-lg p-2 border border-border">
              <Line
                data={totalLineData}
                options={{
                  ...chartOptions,
                  onClick: (evt, elements, chart) => {
                    if (elements && elements.length > 0) {
                      const idx = elements[0].index;
                      const hash = oracleData[oracleData.length - 1 - idx]?.hash;
                      if (hash) window.open(`https://devnet.xrplwin.com/tx/${hash}`, '_blank');
                    }
                  },
                }}
                height={180}
              />
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border bg-card p-2 shadow">
            <Table className="min-w-full text-sm">
              <TableHeader className="bg-muted">
                <TableRow>
                  {visibleColumns.map((key) => (
                    <TableHead key={key} className="px-3 py-2 text-left font-semibold">
                      {key === 'timestamp' ? 'timestamp' :
                        key === 'ledger_index' ? 'ledger_index' :
                        key === 'hash' ? 'hash' :
                        key === 'PRV' ? 'Produced (L)' :
                        key === 'TOV' ? 'Total (L)' : key}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {oracleData.map((row, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50">
                    {visibleColumns.map((col, i) => (
                      <TableCell key={i} className="px-3 py-2">
                        {col === 'timestamp' ? formatTimestamp(row[col]) :
                          col === 'hash' && typeof row[col] === 'string' && row[col].length > 12
                            ? <span className="font-mono text-primary cursor-pointer hover:underline">{row[col].slice(0, 6) + '...' + row[col].slice(-4)}</span>
                            : col === 'PRV' || col === 'TOV'
                              ? Number(row[col]).toLocaleString(undefined, { maximumFractionDigits: 3 })
                              : String(row[col])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      <div className="flex justify-end mt-6">
        <Button variant="outline" onClick={onBack}>&larr; Back to Explorer</Button>
      </div>
    </div>
  );
}
