
export type RiskCategory =
  | "algal_bloom"
  | "plastic"
  | "coral_bleaching"
  | "oil_spill"
  | "illegal_fishing"
  | "sewage";

export type RiskLevel = "healthy" | "warning" | "critical";

export interface OceanRisk {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: RiskCategory;
  level: RiskLevel;
  probability: number; // 0-100
  eta: string; // "3d 14h"
  region: string;
  signals: { label: string; value: string; delta?: number }[];
  narrative: string;
}

export const CATEGORY_META: Record<
  RiskCategory,
  { label: string; icon: string; short: string }
> = {
  algal_bloom: { label: "Harmful algal bloom", icon: "◉", short: "HAB" },
  plastic: { label: "Plastic accumulation", icon: "▲", short: "PLA" },
  coral_bleaching: { label: "Coral bleaching", icon: "✳", short: "CBL" },
  oil_spill: { label: "Oil spill risk", icon: "⬢", short: "OIL" },
  illegal_fishing: { label: "Illegal fishing", icon: "⌖", short: "IUU" },
  sewage: { label: "Sewage discharge", icon: "≈", short: "SWG" },
};

export const LEVEL_COLOR: Record<RiskLevel, string> = {
  healthy: "var(--status-healthy)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
};

export const RISKS: OceanRisk[] = [
  {
    id: "gbr-01",
    name: "Great Barrier Reef — Central sector",
    lat: -18.286,
    lng: 147.7,
    category: "coral_bleaching",
    level: "critical",
    probability: 87,
    eta: "4d 06h",
    region: "Coral Sea, AU",
    signals: [
      { label: "SST anomaly", value: "+2.4 °C", delta: 12 },
      { label: "DHW", value: "8.1", delta: 34 },
      { label: "Wind shear", value: "3.1 m/s", delta: -8 },
      { label: "Cloud cover", value: "18%", delta: -22 },
    ],
    narrative:
      "Degree-heating-weeks crossed bleaching threshold. Low cloud cover and calm winds sustain thermal stress across mid-shelf reefs.",
  },
  {
    id: "gulf-mex-01",
    name: "Gulf of Mexico — Louisiana shelf",
    lat: 28.9,
    lng: -90.4,
    category: "algal_bloom",
    level: "critical",
    probability: 84,
    eta: "3d 12h",
    region: "Gulf of Mexico, US",
    signals: [
      { label: "Chlorophyll-a", value: "18.4 mg/m³", delta: 42 },
      { label: "Nitrate runoff", value: "High", delta: 30 },
      { label: "SST", value: "29.6 °C", delta: 6 },
      { label: "Rainfall (7d)", value: "112 mm", delta: 55 },
    ],
    narrative:
      "Mississippi runoff pulse plus persistent warm surface layer. Model expects rapid dinoflagellate bloom onset along coastal shelf.",
  },
  {
    id: "npg-01",
    name: "North Pacific Gyre — convergence zone",
    lat: 32.5,
    lng: -145.0,
    category: "plastic",
    level: "warning",
    probability: 71,
    eta: "6d 00h",
    region: "North Pacific",
    signals: [
      { label: "Current convergence", value: "0.42 /day", delta: 18 },
      { label: "Debris density", value: "94 kg/km²", delta: 9 },
      { label: "Wind (10m)", value: "5.8 m/s", delta: -4 },
      { label: "Ship traffic", value: "moderate" },
    ],
    narrative:
      "Ekman transport is compressing surface debris into a new secondary hotspot 220 km east of the primary patch.",
  },
  {
    id: "mediterranean-01",
    name: "Ligurian Sea — Genoa approach",
    lat: 43.9,
    lng: 8.9,
    category: "oil_spill",
    level: "warning",
    probability: 62,
    eta: "1d 20h",
    region: "Mediterranean, IT",
    signals: [
      { label: "SAR anomaly", value: "detected" },
      { label: "AIS gap", value: "2 vessels", delta: 100 },
      { label: "Surface slick", value: "3.2 km²" },
      { label: "Wind", value: "SW 4.1 m/s" },
    ],
    narrative:
      "Synthetic-aperture radar flagged a linear low-backscatter signature co-located with two vessels that dropped AIS 40 minutes ago.",
  },
  {
    id: "westafrica-01",
    name: "Gulf of Guinea — offshore Lagos",
    lat: 5.2,
    lng: 3.8,
    category: "illegal_fishing",
    level: "critical",
    probability: 91,
    eta: "0d 08h",
    region: "Gulf of Guinea, NG",
    signals: [
      { label: "Dark vessels", value: "7", delta: 40 },
      { label: "Night-light delta", value: "+2.8σ" },
      { label: "MPA proximity", value: "12 km" },
      { label: "Historical hits", value: "23 events" },
    ],
    narrative:
      "VIIRS night-light cluster with no matching AIS beacons drifting toward a protected spawning ground. High confidence IUU event.",
  },
  {
    id: "mumbai-01",
    name: "Mumbai coastline — Mahim bay",
    lat: 19.05,
    lng: 72.83,
    category: "sewage",
    level: "warning",
    probability: 68,
    eta: "2d 04h",
    region: "Arabian Sea, IN",
    signals: [
      { label: "Turbidity", value: "24 NTU", delta: 51 },
      { label: "Rainfall (24h)", value: "68 mm", delta: 78 },
      { label: "Tidal flush", value: "low" },
      { label: "E. coli proxy", value: "elevated" },
    ],
    narrative:
      "Monsoon overflow overwhelming storm drains. Low tidal exchange means bacterial load will pool along the bay for ~48h.",
  },
  {
    id: "chile-01",
    name: "Humboldt Current — Chiloé shelf",
    lat: -42.5,
    lng: -74.5,
    category: "algal_bloom",
    level: "warning",
    probability: 74,
    eta: "5d 10h",
    region: "Southeast Pacific, CL",
    signals: [
      { label: "Upwelling index", value: "1.9", delta: 22 },
      { label: "SST", value: "13.8 °C", delta: 4 },
      { label: "Chlorophyll-a", value: "11.2 mg/m³", delta: 28 },
      { label: "Salmon farms", value: "48 in range" },
    ],
    narrative:
      "Upwelling-driven nutrient pulse plus persistent warm anomaly favor Alexandrium catenella. Salmon aquaculture at high exposure.",
  },
  {
    id: "arctic-01",
    name: "Barents Sea — ice-edge zone",
    lat: 76.0,
    lng: 32.0,
    category: "coral_bleaching",
    level: "healthy",
    probability: 12,
    eta: "—",
    region: "Arctic, NO",
    signals: [
      { label: "SST anomaly", value: "-0.1 °C" },
      { label: "Ice concentration", value: "42%" },
      { label: "Chlorophyll-a", value: "nominal" },
    ],
    narrative: "All monitored indicators within baseline envelope. No intervention needed.",
  },
  {
    id: "caribbean-01",
    name: "Belize barrier reef — southern lagoon",
    lat: 16.2,
    lng: -88.1,
    category: "coral_bleaching",
    level: "warning",
    probability: 66,
    eta: "7d 18h",
    region: "Caribbean, BZ",
    signals: [
      { label: "SST anomaly", value: "+1.6 °C", delta: 8 },
      { label: "DHW", value: "4.9", delta: 15 },
      { label: "Sargassum influx", value: "moderate" },
    ],
    narrative:
      "Approaching bleaching alert level 1. Sargassum mats reducing light penetration and compounding thermal stress.",
  },
  {
    id: "bengal-01",
    name: "Bay of Bengal — Sundarbans mouth",
    lat: 21.6,
    lng: 89.2,
    category: "plastic",
    level: "critical",
    probability: 82,
    eta: "2d 22h",
    region: "Bay of Bengal, BD/IN",
    signals: [
      { label: "River discharge", value: "3.4× normal", delta: 62 },
      { label: "Debris flux", value: "high" },
      { label: "Ship traffic", value: "heavy" },
    ],
    narrative:
      "Post-monsoon riverine plume carrying macroplastic load into mangrove-fringed delta. High ecological consequence.",
  },
  {
    id: "california-01",
    name: "Monterey Bay — offshore canyon",
    lat: 36.7,
    lng: -122.2,
    category: "algal_bloom",
    level: "healthy",
    probability: 18,
    eta: "—",
    region: "California Current, US",
    signals: [
      { label: "SST", value: "14.1 °C" },
      { label: "Upwelling index", value: "0.7" },
      { label: "Chlorophyll-a", value: "baseline" },
    ],
    narrative: "Cool upwelling regime holding. System nominal.",
  },
  {
    id: "redsea-01",
    name: "Red Sea — Farasan Islands",
    lat: 16.7,
    lng: 41.9,
    category: "coral_bleaching",
    level: "warning",
    probability: 58,
    eta: "9d 00h",
    region: "Red Sea, SA",
    signals: [
      { label: "SST anomaly", value: "+1.2 °C" },
      { label: "DHW", value: "3.4" },
      { label: "Wind stress", value: "low" },
    ],
    narrative:
      "Slow-onset warming trend. Early warning issued for reef managers to prepare shading and monitoring assets.",
  },
];
