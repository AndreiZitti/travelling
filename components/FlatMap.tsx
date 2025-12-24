"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { getCountryByName } from "@/lib/countries";

interface FlatMapProps {
  visitedCountries: Set<string>;
  onCountryClick: (countryId: string) => void;
  isVisited: (countryId: string) => boolean;
}

interface CountryProperties {
  name: string;
}

// TopoJSON URL for world countries
const TOPOJSON_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map of numeric IDs to country names
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
};

export default function FlatMap({
  visitedCountries,
  onCountryClick,
  isVisited,
}: FlatMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    name: string;
    visited: boolean;
    visible: boolean;
  }>({ x: 0, y: 0, name: "", visited: false, visible: false });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  // Get country code from name
  const getCountryCode = useCallback((name: string): string => {
    const country = getCountryByName(name);
    return country?.id || "";
  }, []);

  // Render map
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0)
      return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create projection
    const projection = geoNaturalEarth1()
      .scale(dimensions.width / 5.5)
      .translate([dimensions.width / 2, dimensions.height / 2]);

    const pathGenerator = geoPath().projection(projection);

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create a group for the map
    const g = svg.append("g");

    // Add ocean background
    g.append("rect")
      .attr("width", dimensions.width * 3)
      .attr("height", dimensions.height * 3)
      .attr("x", -dimensions.width)
      .attr("y", -dimensions.height)
      .attr("fill", "#e8f4fc");

    // Fetch and render countries
    fetch(TOPOJSON_URL)
      .then((res) => res.json())
      .then((topology: Topology<{ countries: GeometryCollection<CountryProperties> }>) => {
        const countries = feature(
          topology,
          topology.objects.countries
        ) as unknown as GeoJSON.FeatureCollection<GeoJSON.Geometry, CountryProperties>;

        // Draw countries
        g.selectAll("path.country")
          .data(countries.features)
          .enter()
          .append("path")
          .attr("class", "country")
          .attr("d", (d) => pathGenerator(d as GeoPermissibleObjects) || "")
          .attr("fill", (d) => {
            const name = COUNTRY_NAMES[String(d.id)] || "";
            const code = getCountryCode(name);
            return code && isVisited(code) ? "#6366f1" : "#d1d5db";
          })
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 0.5)
          .style("cursor", "pointer")
          .on("mouseover", function (event, d) {
            const name = COUNTRY_NAMES[String(d.id)] || "Unknown";
            const code = getCountryCode(name);
            const visited = code && isVisited(code);

            d3.select(this)
              .attr("fill", visited ? "#4f46e5" : "#9ca3af")
              .attr("stroke-width", 1);

            setTooltip({
              x: event.pageX,
              y: event.pageY - 10,
              name,
              visited,
              visible: true,
            });
          })
          .on("mousemove", function (event) {
            setTooltip((prev) => ({
              ...prev,
              x: event.pageX,
              y: event.pageY - 10,
            }));
          })
          .on("mouseout", function (_, d) {
            const name = COUNTRY_NAMES[String(d.id)] || "";
            const code = getCountryCode(name);
            const visited = code && isVisited(code);

            d3.select(this)
              .attr("fill", visited ? "#6366f1" : "#d1d5db")
              .attr("stroke-width", 0.5);

            setTooltip((prev) => ({ ...prev, visible: false }));
          })
          .on("click", function (_, d) {
            const name = COUNTRY_NAMES[String(d.id)] || "";
            const code = getCountryCode(name);
            if (code) {
              onCountryClick(code);
            }
          });

        // Add zoom controls
        const zoomControls = svg.append("g")
          .attr("class", "zoom-controls")
          .attr("transform", `translate(${dimensions.width - 50}, 20)`);

        // Zoom in button
        zoomControls.append("rect")
          .attr("width", 32)
          .attr("height", 32)
          .attr("rx", 6)
          .attr("fill", "white")
          .attr("stroke", "#e2e8f0")
          .attr("cursor", "pointer")
          .on("click", () => svg.transition().call(zoom.scaleBy, 1.5));

        zoomControls.append("text")
          .attr("x", 16)
          .attr("y", 21)
          .attr("text-anchor", "middle")
          .attr("font-size", "18px")
          .attr("fill", "#64748b")
          .attr("pointer-events", "none")
          .text("+");

        // Zoom out button
        zoomControls.append("rect")
          .attr("y", 40)
          .attr("width", 32)
          .attr("height", 32)
          .attr("rx", 6)
          .attr("fill", "white")
          .attr("stroke", "#e2e8f0")
          .attr("cursor", "pointer")
          .on("click", () => svg.transition().call(zoom.scaleBy, 0.67));

        zoomControls.append("text")
          .attr("x", 16)
          .attr("y", 61)
          .attr("text-anchor", "middle")
          .attr("font-size", "18px")
          .attr("fill", "#64748b")
          .attr("pointer-events", "none")
          .text("−");

        // Reset button
        zoomControls.append("rect")
          .attr("y", 80)
          .attr("width", 32)
          .attr("height", 32)
          .attr("rx", 6)
          .attr("fill", "white")
          .attr("stroke", "#e2e8f0")
          .attr("cursor", "pointer")
          .on("click", () => svg.transition().call(zoom.transform, d3.zoomIdentity));

        zoomControls.append("text")
          .attr("x", 16)
          .attr("y", 101)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "#64748b")
          .attr("pointer-events", "none")
          .text("⟲");
      })
      .catch((err) => console.error("Failed to load map:", err));
  }, [dimensions, visitedCountries, onCountryClick, isVisited, getCountryCode]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#e8f4fc]">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block"
      />
      {tooltip.visible && (
        <div
          className="fixed z-50 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <span>{tooltip.name}</span>
            {tooltip.visited && (
              <span className="text-green-400">✓</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
