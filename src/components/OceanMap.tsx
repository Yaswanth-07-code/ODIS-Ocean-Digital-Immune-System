import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { OceanRisk } from "@/lib/odis-data";
import { CATEGORY_META, LEVEL_COLOR } from "@/lib/odis-data";

interface OceanMapProps {
  risks: OceanRisk[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function levelRadius(level: OceanRisk["level"]) {
  return level === "critical" ? 16 : level === "warning" ? 12 : 8;
}

function FlyToSelected({
  risks,
  selectedId,
}: {
  risks: OceanRisk[];
  selectedId: string | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const r = risks.find((x) => x.id === selectedId);
    if (!r) return;
    map.flyTo([r.lat, r.lng], 4, { duration: 1.2 });
  }, [selectedId, risks, map]);
  return null;
}

export default function OceanMap({ risks, selectedId, onSelect }: OceanMapProps) {
  // Ensure Leaflet default icon paths don't blow up in SSR / bundlers
  useEffect(() => {
    // @ts-expect-error internal
    delete L.Icon.Default.prototype._getIconUrl;
  }, []);

  return (
    <MapContainer
      center={[15, 10]}
      zoom={2}
      minZoom={2}
      maxZoom={7}
      worldCopyJump
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      {/* Dark ocean base */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        subdomains={["a", "b", "c", "d"]}
      />
      {/* Real NASA GIBS chlorophyll-a monthly overlay */}
      <TileLayer
        url="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_L3_Chlorophyll_A_Monthly/default/2024-01-01/GoogleMapsCompatible_Level6/{z}/{y}/{x}.png"
        attribution="Chlorophyll-a: NASA EOSDIS GIBS · MODIS Aqua"
        opacity={0.45}
        maxNativeZoom={6}
      />

      <FlyToSelected risks={risks} selectedId={selectedId} />

      {risks.map((r) => {
        const color = LEVEL_COLOR[r.level];
        const radius = levelRadius(r.level);
        const selected = selectedId === r.id;
        return (
          <CircleMarker
            key={r.id}
            center={[r.lat, r.lng]}
            radius={radius}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: selected ? 0.85 : 0.55,
              weight: selected ? 3 : 2,
              opacity: 1,
            }}
            eventHandlers={{
              click: () => onSelect(r.id),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                <strong>{CATEGORY_META[r.category].short}</strong> · {r.probability}%
              </div>
            </Tooltip>
            <Popup>
              <div style={{ minWidth: 220 }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: 1,
                    color: "var(--cyan-glow)",
                    textTransform: "uppercase",
                  }}
                >
                  {CATEGORY_META[r.category].label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  {r.name}
                </div>
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 24,
                      fontWeight: 700,
                      color,
                    }}
                  >
                    {r.probability}%
                  </span>
                  <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                    probability · ETA {r.eta}
                  </span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
