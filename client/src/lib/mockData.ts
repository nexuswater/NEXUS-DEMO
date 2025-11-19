import { CloudSun, Droplets, Zap, Leaf, ShieldCheck, Activity } from "lucide-react";

export interface Batch {
  id: string;
  type: "WTR" | "ENG";
  name: string;
  description: string;
  region: string;
  tech: string[];
  vintage: string;
  unit: string;
  amount: number;
  peg: number; // g CO2e per unit
  icon: any;
  verified: boolean;
  status: "Minted" | "Retired" | "Trading";
  deviceHash: string;
  oracle: string;
}

export const MOCK_BATCHES: Batch[] = [
  {
    id: "WTR-PA-HNL-2025-000123",
    type: "WTR",
    name: "Hawaii AWG #123",
    description: "Water-savings micro credit (AWG/GWR) - Honolulu",
    region: "US-HI",
    tech: ["AWG", "GWR"],
    vintage: "2025-11",
    unit: "L",
    amount: 1000,
    peg: 77,
    icon: Droplets,
    verified: true,
    status: "Minted",
    deviceHash: "sha256:a1b2c3...",
    oracle: "Nexus Oracle Node 1"
  },
  {
    id: "ENG-PA-SF-2025-000987",
    type: "ENG",
    name: "SF Solar Array #987",
    description: "Energy-savings micro credit (Solar) - San Francisco",
    region: "US-CA",
    tech: ["SOLAR"],
    vintage: "2025-11",
    unit: "kWh",
    amount: 250,
    peg: 450, // approx generic grid displacement
    icon: Zap,
    verified: true,
    status: "Trading",
    deviceHash: "sha256:d4e5f6...",
    oracle: "Nexus Oracle Node 2"
  },
  {
    id: "WTR-PA-TX-2025-000456",
    type: "WTR",
    name: "Texas Rainwater #456",
    description: "Rainwater harvesting system - Austin",
    region: "US-TX",
    tech: ["RAIN"],
    vintage: "2025-10",
    unit: "L",
    amount: 5000,
    peg: 77,
    icon: CloudSun,
    verified: true,
    status: "Minted",
    deviceHash: "sha256:g7h8i9...",
    oracle: "Nexus Oracle Node 1"
  },
  {
    id: "ENG-PA-NY-2025-000111",
    type: "ENG",
    name: "NY Wind Farm #111",
    description: "Offshore wind energy credit",
    region: "US-NY",
    tech: ["WIND"],
    vintage: "2025-12",
    unit: "kWh",
    amount: 1500,
    peg: 450,
    icon: Activity,
    verified: true,
    status: "Retired",
    deviceHash: "sha256:j0k1l2...",
    oracle: "Nexus Oracle Node 3"
  }
];

export const MARKET_STATS = {
  wtrPrice: 0.45, // XRP
  engPrice: 0.12, // XRP
  totalRetired: 145000, // kgCO2e
  totalLiquidity: 540000 // XRP
};
