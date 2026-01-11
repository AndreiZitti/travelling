"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { getLocationByName } from "@/lib/locations";

// Dynamic import to avoid SSR issues
const GlobeGL = dynamic(() => import("react-globe.gl").then(mod => mod.default), {
  ssr: false,
});

interface GlobeProps {
  visitedCountries: Set<string>;
  onCountryClick: (countryId: string) => void;
  onCountryLongPress?: (countryId: string) => void;
  isVisited: (countryId: string) => boolean;
}

interface CountryProperties {
  name: string;
}

interface CountryFeature {
  id?: string | number;
  properties: CountryProperties;
  geometry: GeoJSON.Geometry;
}

// Same TopoJSON source as FlatMap (50m has better territory coverage)
const TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

// Same mapping as FlatMap
const normalizeId = (id: string | number | undefined): string => {
  if (id === undefined) return "";
  return String(parseInt(String(id), 10));
};

const COUNTRY_NAMES: Record<string, string> = {
  "4": "Afghanistan", "8": "Albania", "12": "Algeria", "20": "Andorra",
  "24": "Angola", "28": "Antigua and Barbuda", "32": "Argentina",
  "51": "Armenia", "36": "Australia", "40": "Austria", "31": "Azerbaijan",
  "44": "Bahamas", "48": "Bahrain", "50": "Bangladesh", "52": "Barbados",
  "112": "Belarus", "56": "Belgium", "84": "Belize", "204": "Benin",
  "64": "Bhutan", "68": "Bolivia", "70": "Bosnia and Herzegovina",
  "72": "Botswana", "76": "Brazil", "96": "Brunei", "100": "Bulgaria",
  "854": "Burkina Faso", "108": "Burundi", "132": "Cabo Verde",
  "116": "Cambodia", "120": "Cameroon", "124": "Canada",
  "140": "Central African Republic", "148": "Chad", "152": "Chile",
  "156": "China", "170": "Colombia", "174": "Comoros", "178": "Congo",
  "180": "Congo (DRC)", "188": "Costa Rica", "384": "Ivory Coast",
  "191": "Croatia", "192": "Cuba", "196": "Cyprus", "203": "Czechia",
  "208": "Denmark", "262": "Djibouti", "212": "Dominica",
  "214": "Dominican Republic", "218": "Ecuador", "818": "Egypt",
  "222": "El Salvador", "226": "Equatorial Guinea", "232": "Eritrea",
  "233": "Estonia", "748": "Eswatini", "231": "Ethiopia", "242": "Fiji",
  "246": "Finland", "250": "France", "266": "Gabon", "270": "Gambia",
  "268": "Georgia", "276": "Germany", "288": "Ghana", "300": "Greece",
  "308": "Grenada", "320": "Guatemala", "324": "Guinea",
  "624": "Guinea-Bissau", "328": "Guyana", "332": "Haiti", "340": "Honduras",
  "348": "Hungary", "352": "Iceland", "356": "India", "360": "Indonesia",
  "364": "Iran", "368": "Iraq", "372": "Ireland", "376": "Israel",
  "380": "Italy", "388": "Jamaica", "392": "Japan", "400": "Jordan",
  "398": "Kazakhstan", "404": "Kenya", "296": "Kiribati",
  "408": "North Korea", "410": "South Korea", "414": "Kuwait",
  "417": "Kyrgyzstan", "418": "Laos", "428": "Latvia", "422": "Lebanon",
  "426": "Lesotho", "430": "Liberia", "434": "Libya", "438": "Liechtenstein",
  "440": "Lithuania", "442": "Luxembourg", "450": "Madagascar",
  "454": "Malawi", "458": "Malaysia", "462": "Maldives", "466": "Mali",
  "470": "Malta", "584": "Marshall Islands", "478": "Mauritania",
  "480": "Mauritius", "484": "Mexico", "583": "Micronesia", "498": "Moldova",
  "492": "Monaco", "496": "Mongolia", "499": "Montenegro", "504": "Morocco",
  "508": "Mozambique", "104": "Myanmar", "516": "Namibia", "520": "Nauru",
  "524": "Nepal", "528": "Netherlands", "554": "New Zealand",
  "558": "Nicaragua", "562": "Niger", "566": "Nigeria",
  "807": "North Macedonia", "578": "Norway", "512": "Oman", "586": "Pakistan",
  "585": "Palau", "275": "Palestine", "591": "Panama",
  "598": "Papua New Guinea", "600": "Paraguay", "604": "Peru",
  "608": "Philippines", "616": "Poland", "620": "Portugal", "634": "Qatar",
  "642": "Romania", "643": "Russia", "646": "Rwanda",
  "659": "Saint Kitts and Nevis", "662": "Saint Lucia",
  "670": "Saint Vincent and the Grenadines", "882": "Samoa",
  "674": "San Marino", "678": "Sao Tome and Principe", "682": "Saudi Arabia",
  "686": "Senegal", "688": "Serbia", "690": "Seychelles",
  "694": "Sierra Leone", "702": "Singapore", "703": "Slovakia",
  "705": "Slovenia", "90": "Solomon Islands", "706": "Somalia",
  "710": "South Africa", "728": "South Sudan", "724": "Spain",
  "144": "Sri Lanka", "729": "Sudan", "740": "Suriname", "752": "Sweden",
  "756": "Switzerland", "760": "Syria", "158": "Taiwan", "762": "Tajikistan",
  "834": "Tanzania", "764": "Thailand", "626": "Timor-Leste", "768": "Togo",
  "776": "Tonga", "780": "Trinidad and Tobago", "788": "Tunisia",
  "792": "Turkey", "795": "Turkmenistan", "798": "Tuvalu", "800": "Uganda",
  "804": "Ukraine", "784": "United Arab Emirates", "826": "United Kingdom",
  "840": "United States", "858": "Uruguay", "860": "Uzbekistan",
  "548": "Vanuatu", "336": "Vatican City", "862": "Venezuela",
  "704": "Vietnam", "887": "Yemen", "894": "Zambia", "716": "Zimbabwe",
  "-99": "Kosovo",
  // Territories and regions in TopoJSON
  "238": "Falkland Islands", "260": "French Southern Territories",
  "304": "Greenland", "540": "New Caledonia", "630": "Puerto Rico",
  "732": "Western Sahara",
  // French territories
  "258": "French Polynesia", "254": "French Guiana", "312": "Guadeloupe",
  "474": "Martinique", "175": "Mayotte", "638": "Reunion",
  "666": "Saint Pierre and Miquelon", "876": "Wallis and Futuna",
  "652": "Saint Barthelemy", "663": "Saint Martin (French)",
  // UK territories
  "292": "Gibraltar", "136": "Cayman Islands", "60": "Bermuda",
  "92": "British Virgin Islands", "796": "Turks and Caicos Islands",
  "500": "Montserrat", "660": "Anguilla", "654": "Saint Helena",
  "612": "Pitcairn Islands", "86": "British Indian Ocean Territory",
  // US territories
  "850": "US Virgin Islands", "316": "Guam", "16": "American Samoa",
  "580": "Northern Mariana Islands",
  // Dutch territories
  "533": "Aruba", "531": "Curacao", "534": "Sint Maarten",
  // Danish territories
  "234": "Faroe Islands",
  // Australian territories
  "162": "Christmas Island", "166": "Cocos (Keeling) Islands", "574": "Norfolk Island",
  // NZ territories
  "184": "Cook Islands", "570": "Niue", "772": "Tokelau",
  // Chinese territories
  "344": "Hong Kong", "446": "Macau",
  // Finnish territories
  "248": "Aland Islands",
  // Norwegian territories
  "744": "Svalbard and Jan Mayen",
  // Special regions and disputed territories
  "10": "Antarctica", "239": "South Georgia and the South Sandwich Islands",
  "334": "Heard Island and McDonald Islands", "535": "Caribbean Netherlands",
  // Disputed/unrecognized (shown on map but may not be in our locations)
  "900": "N. Cyprus", "901": "Somaliland", "902": "Siachen Glacier",
};

export default function Globe({
  onCountryClick,
  onCountryLongPress,
  isVisited,
}: GlobeProps) {
  const globeEl = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Refs for long press handling
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressFiredRef = useRef(false);

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

  // Load country data from same source as FlatMap
  useEffect(() => {
    fetch(TOPOJSON_URL)
      .then((res) => res.json())
      .then((topology: Topology<{ countries: GeometryCollection<CountryProperties> }>) => {
        const geojson = feature(topology, topology.objects.countries);
        setCountries((geojson as any).features);
      })
      .catch((err) => console.error("Failed to load countries:", err));
  }, []);

  // Setup globe after it's ready
  const handleGlobeReady = useCallback(() => {
    if (globeEl.current) {
      // Set initial view
      globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

      // Configure controls
      const controls = globeEl.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        controls.enableZoom = true;
      }
    }
  }, []);

  // Get country code from feature
  const getCountryCode = useCallback((feat: CountryFeature): string => {
    const name = COUNTRY_NAMES[normalizeId(feat.id)] || "";
    if (!name) return "";
    const location = getLocationByName(name);
    return location?.id || "";
  }, []);

  // Handle click
  const handleClick = useCallback((feat: object) => {
    // Don't trigger click if long press fired
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    const code = getCountryCode(feat as CountryFeature);
    if (code) {
      onCountryClick(code);
    }
  }, [getCountryCode, onCountryClick]);

  // Handle right-click for desktop
  const handleRightClick = useCallback((feat: object, event: MouseEvent) => {
    event.preventDefault();
    const code = getCountryCode(feat as CountryFeature);
    if (code && isVisited(code) && onCountryLongPress) {
      onCountryLongPress(code);
    }
  }, [getCountryCode, isVisited, onCountryLongPress]);

  // Handle pointer down for long press (works for both touch and mouse)
  const handlePointerDown = useCallback((feat: object) => {
    const code = getCountryCode(feat as CountryFeature);
    if (!code || !isVisited(code)) return;

    longPressFiredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      if (onCountryLongPress) {
        onCountryLongPress(code);
      }
    }, 500);
  }, [getCountryCode, isVisited, onCountryLongPress]);

  // Handle pointer up to cancel long press
  const handlePointerUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Get color for country
  const getColor = useCallback((feat: object): string => {
    const code = getCountryCode(feat as CountryFeature);
    if (code && isVisited(code)) {
      return "rgba(99, 102, 241, 0.9)"; // indigo for visited
    }
    return "rgba(30, 30, 46, 0.8)"; // dark for not visited
  }, [getCountryCode, isVisited]);

  // Get altitude for country
  const getAltitude = useCallback((feat: object): number => {
    const code = getCountryCode(feat as CountryFeature);
    return code && isVisited(code) ? 0.02 : 0.005;
  }, [getCountryCode, isVisited]);

  // Get label
  const getLabel = useCallback((feat: object): string => {
    const f = feat as CountryFeature;
    const name = COUNTRY_NAMES[normalizeId(f.id)] || "Unknown";
    const code = getCountryCode(f);
    const visited = code && isVisited(code);
    return `<div style="background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${name}${visited ? " ✓" : ""}</div>`;
  }, [getCountryCode, isVisited]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full touch-none"
      style={{ background: "#0a0a1a", touchAction: "none" }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && countries.length > 0 && (
        <GlobeGL
          ref={globeEl}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
          polygonsData={countries}
          polygonCapColor={getColor}
          polygonSideColor={() => "rgba(100, 100, 120, 0.2)"}
          polygonStrokeColor={() => "#333"}
          polygonAltitude={getAltitude}
          polygonLabel={getLabel}
          onPolygonClick={handleClick}
          onPolygonRightClick={handleRightClick}
          atmosphereColor="#6366f1"
          atmosphereAltitude={0.2}
          onGlobeReady={handleGlobeReady}
        />
      )}
    </div>
  );
}
