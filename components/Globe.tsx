"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { getCountryByName } from "@/lib/countries";

// Dynamic import to avoid SSR issues with react-globe.gl
const GlobeGL = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-globe-bg">
      <div className="text-white/50">Loading globe...</div>
    </div>
  ),
});

interface GlobeProps {
  visitedCountries: Set<string>;
  onCountryClick: (countryId: string) => void;
  isVisited: (countryId: string) => boolean;
}

interface CountryFeature {
  properties: {
    ADMIN?: string;
    NAME?: string;
    ISO_A2?: string;
    ISO_A3?: string;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface RingData {
  lat: number;
  lng: number;
  maxR: number;
  propagationSpeed: number;
  repeatPeriod: number;
}

// GeoJSON URL for country boundaries
const GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

export default function Globe({
  onCountryClick,
  isVisited,
}: GlobeProps) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [hoverCountry, setHoverCountry] = useState<CountryFeature | null>(null);
  const [rings, setRings] = useState<RingData[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [globeReady, setGlobeReady] = useState(false);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Load country data
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((res) => res.json())
      .then((data) => {
        setCountries(data.features);
      })
      .catch((err) => console.error("Failed to load countries:", err));
  }, []);

  // Setup globe controls after globe is ready
  useEffect(() => {
    if (globeReady && globeRef.current) {
      const globe = globeRef.current;

      // Set initial point of view
      globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

      // Configure controls
      const controls = globe.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableZoom = true;
        controls.minDistance = 150;
        controls.maxDistance = 500;
      }
    }
  }, [globeReady]);

  // Get country ISO code from feature
  const getCountryCode = useCallback((feature: CountryFeature): string => {
    const props = feature.properties;
    // Try different property names for ISO code
    if (props.ISO_A2 && props.ISO_A2 !== "-99") return props.ISO_A2;
    // Fallback to lookup by name
    const name = props.ADMIN || props.NAME || "";
    const country = getCountryByName(name);
    return country?.id || "";
  }, []);

  // Get country centroid for ripple effect
  const getCountryCentroid = useCallback(
    (feature: CountryFeature): [number, number] => {
      const coords = feature.geometry.coordinates;
      if (!coords || coords.length === 0) return [0, 0];

      // Handle both Polygon and MultiPolygon
      let allCoords: number[][] = [];
      if (feature.geometry.type === "Polygon") {
        allCoords = coords[0] as unknown as number[][];
      } else if (feature.geometry.type === "MultiPolygon") {
        // Get the largest polygon
        let maxLen = 0;
        for (const poly of coords) {
          const ring = (poly as unknown as number[][][])[0];
          if (ring && ring.length > maxLen) {
            maxLen = ring.length;
            allCoords = ring;
          }
        }
      }

      if (allCoords.length === 0) return [0, 0];

      // Calculate centroid
      let sumLng = 0;
      let sumLat = 0;
      for (const coord of allCoords) {
        sumLng += coord[0];
        sumLat += coord[1];
      }
      return [sumLng / allCoords.length, sumLat / allCoords.length];
    },
    []
  );

  // Handle country click
  const handleCountryClick = useCallback(
    (feature: CountryFeature) => {
      const countryCode = getCountryCode(feature);
      if (!countryCode) return;

      const wasVisited = isVisited(countryCode);
      onCountryClick(countryCode);

      // Add ripple effect when marking as visited
      if (!wasVisited) {
        const [lng, lat] = getCountryCentroid(feature);
        const newRing: RingData = {
          lat,
          lng,
          maxR: 8,
          propagationSpeed: 4,
          repeatPeriod: 1500,
        };
        setRings((prev) => [...prev, newRing]);

        // Remove ring after animation
        setTimeout(() => {
          setRings((prev) => prev.filter((r) => r !== newRing));
        }, 1500);
      }
    },
    [getCountryCode, isVisited, onCountryClick, getCountryCentroid]
  );

  // Stop auto-rotate on interaction, resume after 5s
  const handleInteractionStart = useCallback(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = false;

        // Resume after 5 seconds of no interaction
        setTimeout(() => {
          if (controls) {
            controls.autoRotate = true;
          }
        }, 5000);
      }
    }
  }, []);

  // Polygon styling
  const getPolygonColor = useCallback(
    (obj: object) => {
      const feature = obj as CountryFeature;
      const countryCode = getCountryCode(feature);
      const visited = countryCode && isVisited(countryCode);

      if (feature === hoverCountry) {
        return visited ? "rgba(99, 102, 241, 0.9)" : "rgba(75, 75, 100, 0.8)";
      }
      return visited ? "rgba(99, 102, 241, 0.8)" : "rgba(45, 45, 68, 0.6)";
    },
    [getCountryCode, isVisited, hoverCountry]
  );

  const getPolygonAltitude = useCallback(
    (obj: object) => {
      const feature = obj as CountryFeature;
      const countryCode = getCountryCode(feature);
      return countryCode && isVisited(countryCode) ? 0.01 : 0.005;
    },
    [getCountryCode, isVisited]
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full globe-container relative"
      onMouseDown={handleInteractionStart}
      onTouchStart={handleInteractionStart}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <GlobeGL
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          polygonsData={countries}
          polygonCapColor={getPolygonColor}
          polygonSideColor={() => "rgba(45, 45, 68, 0.3)"}
          polygonStrokeColor={() => "rgba(100, 100, 120, 0.3)"}
          polygonAltitude={getPolygonAltitude}
          polygonLabel={(feature: object) => {
            const f = feature as CountryFeature;
            const props = f.properties;
            const name = props.ADMIN || props.NAME || "Unknown";
            const code = getCountryCode(f);
            const visited = code && isVisited(code);
            return `
              <div class="tooltip">
                ${name} ${visited ? "✓" : ""}
              </div>
            `;
          }}
          onPolygonClick={(feature: object) =>
            handleCountryClick(feature as CountryFeature)
          }
          onPolygonHover={(feature: object | null) =>
            setHoverCountry(feature as CountryFeature | null)
          }
          polygonsTransitionDuration={300}
          atmosphereColor="#6366f1"
          atmosphereAltitude={0.15}
          ringsData={rings}
          ringColor={() => "#22d3ee"}
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
          onGlobeReady={() => setGlobeReady(true)}
        />
      )}
    </div>
  );
}
