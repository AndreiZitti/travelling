/**
 * Location types and data for the travel map
 * Supports countries, territories, and US states with hierarchical relationships
 */

export type LocationType = "country" | "territory" | "state";

export type Location = {
  id: string; // ISO code or custom ID (e.g., "FR", "PF" for French Polynesia, "US-CA" for California)
  name: string;
  type: LocationType;
  continent: Continent;
  parentId?: string; // For territories/states - links to parent country
  countryCode?: string; // ISO 3166-1 alpha-2 for map matching
};

export const CONTINENTS = [
  "Africa",
  "Antarctica",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
] as const;

export type Continent = (typeof CONTINENTS)[number];

// ============================================================================
// COUNTRIES (197 UN-recognized + some additional)
// ============================================================================

export const COUNTRIES: Location[] = [
  { id: "AF", name: "Afghanistan", type: "country", continent: "Asia" },
  { id: "AL", name: "Albania", type: "country", continent: "Europe" },
  { id: "DZ", name: "Algeria", type: "country", continent: "Africa" },
  { id: "AD", name: "Andorra", type: "country", continent: "Europe" },
  { id: "AO", name: "Angola", type: "country", continent: "Africa" },
  { id: "AG", name: "Antigua and Barbuda", type: "country", continent: "North America" },
  { id: "AR", name: "Argentina", type: "country", continent: "South America" },
  { id: "AM", name: "Armenia", type: "country", continent: "Asia" },
  { id: "AU", name: "Australia", type: "country", continent: "Oceania" },
  { id: "AT", name: "Austria", type: "country", continent: "Europe" },
  { id: "AZ", name: "Azerbaijan", type: "country", continent: "Asia" },
  { id: "BS", name: "Bahamas", type: "country", continent: "North America" },
  { id: "BH", name: "Bahrain", type: "country", continent: "Asia" },
  { id: "BD", name: "Bangladesh", type: "country", continent: "Asia" },
  { id: "BB", name: "Barbados", type: "country", continent: "North America" },
  { id: "BY", name: "Belarus", type: "country", continent: "Europe" },
  { id: "BE", name: "Belgium", type: "country", continent: "Europe" },
  { id: "BZ", name: "Belize", type: "country", continent: "North America" },
  { id: "BJ", name: "Benin", type: "country", continent: "Africa" },
  { id: "BT", name: "Bhutan", type: "country", continent: "Asia" },
  { id: "BO", name: "Bolivia", type: "country", continent: "South America" },
  { id: "BA", name: "Bosnia and Herzegovina", type: "country", continent: "Europe" },
  { id: "BW", name: "Botswana", type: "country", continent: "Africa" },
  { id: "BR", name: "Brazil", type: "country", continent: "South America" },
  { id: "BN", name: "Brunei", type: "country", continent: "Asia" },
  { id: "BG", name: "Bulgaria", type: "country", continent: "Europe" },
  { id: "BF", name: "Burkina Faso", type: "country", continent: "Africa" },
  { id: "BI", name: "Burundi", type: "country", continent: "Africa" },
  { id: "CV", name: "Cabo Verde", type: "country", continent: "Africa" },
  { id: "KH", name: "Cambodia", type: "country", continent: "Asia" },
  { id: "CM", name: "Cameroon", type: "country", continent: "Africa" },
  { id: "CA", name: "Canada", type: "country", continent: "North America" },
  { id: "CF", name: "Central African Republic", type: "country", continent: "Africa" },
  { id: "TD", name: "Chad", type: "country", continent: "Africa" },
  { id: "CL", name: "Chile", type: "country", continent: "South America" },
  { id: "CN", name: "China", type: "country", continent: "Asia" },
  { id: "CO", name: "Colombia", type: "country", continent: "South America" },
  { id: "KM", name: "Comoros", type: "country", continent: "Africa" },
  { id: "CG", name: "Congo", type: "country", continent: "Africa" },
  { id: "CD", name: "Congo (DRC)", type: "country", continent: "Africa" },
  { id: "CR", name: "Costa Rica", type: "country", continent: "North America" },
  { id: "CI", name: "Ivory Coast", type: "country", continent: "Africa" },
  { id: "HR", name: "Croatia", type: "country", continent: "Europe" },
  { id: "CU", name: "Cuba", type: "country", continent: "North America" },
  { id: "CY", name: "Cyprus", type: "country", continent: "Europe" },
  { id: "CZ", name: "Czechia", type: "country", continent: "Europe" },
  { id: "DK", name: "Denmark", type: "country", continent: "Europe" },
  { id: "DJ", name: "Djibouti", type: "country", continent: "Africa" },
  { id: "DM", name: "Dominica", type: "country", continent: "North America" },
  { id: "DO", name: "Dominican Republic", type: "country", continent: "North America" },
  { id: "EC", name: "Ecuador", type: "country", continent: "South America" },
  { id: "EG", name: "Egypt", type: "country", continent: "Africa" },
  { id: "SV", name: "El Salvador", type: "country", continent: "North America" },
  { id: "GQ", name: "Equatorial Guinea", type: "country", continent: "Africa" },
  { id: "ER", name: "Eritrea", type: "country", continent: "Africa" },
  { id: "EE", name: "Estonia", type: "country", continent: "Europe" },
  { id: "SZ", name: "Eswatini", type: "country", continent: "Africa" },
  { id: "ET", name: "Ethiopia", type: "country", continent: "Africa" },
  { id: "FJ", name: "Fiji", type: "country", continent: "Oceania" },
  { id: "FI", name: "Finland", type: "country", continent: "Europe" },
  { id: "FR", name: "France", type: "country", continent: "Europe" },
  { id: "GA", name: "Gabon", type: "country", continent: "Africa" },
  { id: "GM", name: "Gambia", type: "country", continent: "Africa" },
  { id: "GE", name: "Georgia", type: "country", continent: "Asia" },
  { id: "DE", name: "Germany", type: "country", continent: "Europe" },
  { id: "GH", name: "Ghana", type: "country", continent: "Africa" },
  { id: "GR", name: "Greece", type: "country", continent: "Europe" },
  { id: "GD", name: "Grenada", type: "country", continent: "North America" },
  { id: "GT", name: "Guatemala", type: "country", continent: "North America" },
  { id: "GN", name: "Guinea", type: "country", continent: "Africa" },
  { id: "GW", name: "Guinea-Bissau", type: "country", continent: "Africa" },
  { id: "GY", name: "Guyana", type: "country", continent: "South America" },
  { id: "HT", name: "Haiti", type: "country", continent: "North America" },
  { id: "HN", name: "Honduras", type: "country", continent: "North America" },
  { id: "HU", name: "Hungary", type: "country", continent: "Europe" },
  { id: "IS", name: "Iceland", type: "country", continent: "Europe" },
  { id: "IN", name: "India", type: "country", continent: "Asia" },
  { id: "ID", name: "Indonesia", type: "country", continent: "Asia" },
  { id: "IR", name: "Iran", type: "country", continent: "Asia" },
  { id: "IQ", name: "Iraq", type: "country", continent: "Asia" },
  { id: "IE", name: "Ireland", type: "country", continent: "Europe" },
  { id: "IL", name: "Israel", type: "country", continent: "Asia" },
  { id: "IT", name: "Italy", type: "country", continent: "Europe" },
  { id: "JM", name: "Jamaica", type: "country", continent: "North America" },
  { id: "JP", name: "Japan", type: "country", continent: "Asia" },
  { id: "JO", name: "Jordan", type: "country", continent: "Asia" },
  { id: "KZ", name: "Kazakhstan", type: "country", continent: "Asia" },
  { id: "KE", name: "Kenya", type: "country", continent: "Africa" },
  { id: "KI", name: "Kiribati", type: "country", continent: "Oceania" },
  { id: "KP", name: "North Korea", type: "country", continent: "Asia" },
  { id: "KR", name: "South Korea", type: "country", continent: "Asia" },
  { id: "XK", name: "Kosovo", type: "country", continent: "Europe" },
  { id: "KW", name: "Kuwait", type: "country", continent: "Asia" },
  { id: "KG", name: "Kyrgyzstan", type: "country", continent: "Asia" },
  { id: "LA", name: "Laos", type: "country", continent: "Asia" },
  { id: "LV", name: "Latvia", type: "country", continent: "Europe" },
  { id: "LB", name: "Lebanon", type: "country", continent: "Asia" },
  { id: "LS", name: "Lesotho", type: "country", continent: "Africa" },
  { id: "LR", name: "Liberia", type: "country", continent: "Africa" },
  { id: "LY", name: "Libya", type: "country", continent: "Africa" },
  { id: "LI", name: "Liechtenstein", type: "country", continent: "Europe" },
  { id: "LT", name: "Lithuania", type: "country", continent: "Europe" },
  { id: "LU", name: "Luxembourg", type: "country", continent: "Europe" },
  { id: "MG", name: "Madagascar", type: "country", continent: "Africa" },
  { id: "MW", name: "Malawi", type: "country", continent: "Africa" },
  { id: "MY", name: "Malaysia", type: "country", continent: "Asia" },
  { id: "MV", name: "Maldives", type: "country", continent: "Asia" },
  { id: "ML", name: "Mali", type: "country", continent: "Africa" },
  { id: "MT", name: "Malta", type: "country", continent: "Europe" },
  { id: "MH", name: "Marshall Islands", type: "country", continent: "Oceania" },
  { id: "MR", name: "Mauritania", type: "country", continent: "Africa" },
  { id: "MU", name: "Mauritius", type: "country", continent: "Africa" },
  { id: "MX", name: "Mexico", type: "country", continent: "North America" },
  { id: "FM", name: "Micronesia", type: "country", continent: "Oceania" },
  { id: "MD", name: "Moldova", type: "country", continent: "Europe" },
  { id: "MC", name: "Monaco", type: "country", continent: "Europe" },
  { id: "MN", name: "Mongolia", type: "country", continent: "Asia" },
  { id: "ME", name: "Montenegro", type: "country", continent: "Europe" },
  { id: "MA", name: "Morocco", type: "country", continent: "Africa" },
  { id: "MZ", name: "Mozambique", type: "country", continent: "Africa" },
  { id: "MM", name: "Myanmar", type: "country", continent: "Asia" },
  { id: "NA", name: "Namibia", type: "country", continent: "Africa" },
  { id: "NR", name: "Nauru", type: "country", continent: "Oceania" },
  { id: "NP", name: "Nepal", type: "country", continent: "Asia" },
  { id: "NL", name: "Netherlands", type: "country", continent: "Europe" },
  { id: "NZ", name: "New Zealand", type: "country", continent: "Oceania" },
  { id: "NI", name: "Nicaragua", type: "country", continent: "North America" },
  { id: "NE", name: "Niger", type: "country", continent: "Africa" },
  { id: "NG", name: "Nigeria", type: "country", continent: "Africa" },
  { id: "MK", name: "North Macedonia", type: "country", continent: "Europe" },
  { id: "NO", name: "Norway", type: "country", continent: "Europe" },
  { id: "OM", name: "Oman", type: "country", continent: "Asia" },
  { id: "PK", name: "Pakistan", type: "country", continent: "Asia" },
  { id: "PW", name: "Palau", type: "country", continent: "Oceania" },
  { id: "PS", name: "Palestine", type: "country", continent: "Asia" },
  { id: "PA", name: "Panama", type: "country", continent: "North America" },
  { id: "PG", name: "Papua New Guinea", type: "country", continent: "Oceania" },
  { id: "PY", name: "Paraguay", type: "country", continent: "South America" },
  { id: "PE", name: "Peru", type: "country", continent: "South America" },
  { id: "PH", name: "Philippines", type: "country", continent: "Asia" },
  { id: "PL", name: "Poland", type: "country", continent: "Europe" },
  { id: "PT", name: "Portugal", type: "country", continent: "Europe" },
  { id: "QA", name: "Qatar", type: "country", continent: "Asia" },
  { id: "RO", name: "Romania", type: "country", continent: "Europe" },
  { id: "RU", name: "Russia", type: "country", continent: "Europe" },
  { id: "RW", name: "Rwanda", type: "country", continent: "Africa" },
  { id: "KN", name: "Saint Kitts and Nevis", type: "country", continent: "North America" },
  { id: "LC", name: "Saint Lucia", type: "country", continent: "North America" },
  { id: "VC", name: "Saint Vincent and the Grenadines", type: "country", continent: "North America" },
  { id: "WS", name: "Samoa", type: "country", continent: "Oceania" },
  { id: "SM", name: "San Marino", type: "country", continent: "Europe" },
  { id: "ST", name: "Sao Tome and Principe", type: "country", continent: "Africa" },
  { id: "SA", name: "Saudi Arabia", type: "country", continent: "Asia" },
  { id: "SN", name: "Senegal", type: "country", continent: "Africa" },
  { id: "RS", name: "Serbia", type: "country", continent: "Europe" },
  { id: "SC", name: "Seychelles", type: "country", continent: "Africa" },
  { id: "SL", name: "Sierra Leone", type: "country", continent: "Africa" },
  { id: "SG", name: "Singapore", type: "country", continent: "Asia" },
  { id: "SK", name: "Slovakia", type: "country", continent: "Europe" },
  { id: "SI", name: "Slovenia", type: "country", continent: "Europe" },
  { id: "SB", name: "Solomon Islands", type: "country", continent: "Oceania" },
  { id: "SO", name: "Somalia", type: "country", continent: "Africa" },
  { id: "ZA", name: "South Africa", type: "country", continent: "Africa" },
  { id: "SS", name: "South Sudan", type: "country", continent: "Africa" },
  { id: "ES", name: "Spain", type: "country", continent: "Europe" },
  { id: "LK", name: "Sri Lanka", type: "country", continent: "Asia" },
  { id: "SD", name: "Sudan", type: "country", continent: "Africa" },
  { id: "SR", name: "Suriname", type: "country", continent: "South America" },
  { id: "SE", name: "Sweden", type: "country", continent: "Europe" },
  { id: "CH", name: "Switzerland", type: "country", continent: "Europe" },
  { id: "SY", name: "Syria", type: "country", continent: "Asia" },
  { id: "TW", name: "Taiwan", type: "country", continent: "Asia" },
  { id: "TJ", name: "Tajikistan", type: "country", continent: "Asia" },
  { id: "TZ", name: "Tanzania", type: "country", continent: "Africa" },
  { id: "TH", name: "Thailand", type: "country", continent: "Asia" },
  { id: "TL", name: "Timor-Leste", type: "country", continent: "Asia" },
  { id: "TG", name: "Togo", type: "country", continent: "Africa" },
  { id: "TO", name: "Tonga", type: "country", continent: "Oceania" },
  { id: "TT", name: "Trinidad and Tobago", type: "country", continent: "North America" },
  { id: "TN", name: "Tunisia", type: "country", continent: "Africa" },
  { id: "TR", name: "Turkey", type: "country", continent: "Asia" },
  { id: "TM", name: "Turkmenistan", type: "country", continent: "Asia" },
  { id: "TV", name: "Tuvalu", type: "country", continent: "Oceania" },
  { id: "UG", name: "Uganda", type: "country", continent: "Africa" },
  { id: "UA", name: "Ukraine", type: "country", continent: "Europe" },
  { id: "AE", name: "United Arab Emirates", type: "country", continent: "Asia" },
  { id: "GB", name: "United Kingdom", type: "country", continent: "Europe" },
  { id: "US", name: "United States", type: "country", continent: "North America" },
  { id: "UY", name: "Uruguay", type: "country", continent: "South America" },
  { id: "UZ", name: "Uzbekistan", type: "country", continent: "Asia" },
  { id: "VU", name: "Vanuatu", type: "country", continent: "Oceania" },
  { id: "VA", name: "Vatican City", type: "country", continent: "Europe" },
  { id: "VE", name: "Venezuela", type: "country", continent: "South America" },
  { id: "VN", name: "Vietnam", type: "country", continent: "Asia" },
  { id: "YE", name: "Yemen", type: "country", continent: "Asia" },
  { id: "ZM", name: "Zambia", type: "country", continent: "Africa" },
  { id: "ZW", name: "Zimbabwe", type: "country", continent: "Africa" },
];

// ============================================================================
// TERRITORIES (Overseas territories, dependencies, etc.)
// ============================================================================

export const TERRITORIES: Location[] = [
  // French Territories
  { id: "PF", name: "French Polynesia", type: "territory", continent: "Oceania", parentId: "FR", countryCode: "PF" },
  { id: "NC", name: "New Caledonia", type: "territory", continent: "Oceania", parentId: "FR", countryCode: "NC" },
  { id: "RE", name: "Reunion", type: "territory", continent: "Africa", parentId: "FR", countryCode: "RE" },
  { id: "GP", name: "Guadeloupe", type: "territory", continent: "North America", parentId: "FR", countryCode: "GP" },
  { id: "MQ", name: "Martinique", type: "territory", continent: "North America", parentId: "FR", countryCode: "MQ" },
  { id: "GF", name: "French Guiana", type: "territory", continent: "South America", parentId: "FR", countryCode: "GF" },
  { id: "YT", name: "Mayotte", type: "territory", continent: "Africa", parentId: "FR", countryCode: "YT" },
  { id: "PM", name: "Saint Pierre and Miquelon", type: "territory", continent: "North America", parentId: "FR", countryCode: "PM" },
  { id: "WF", name: "Wallis and Futuna", type: "territory", continent: "Oceania", parentId: "FR", countryCode: "WF" },
  { id: "BL", name: "Saint Barthelemy", type: "territory", continent: "North America", parentId: "FR", countryCode: "BL" },
  { id: "MF", name: "Saint Martin (French)", type: "territory", continent: "North America", parentId: "FR", countryCode: "MF" },

  // UK Territories
  { id: "GI", name: "Gibraltar", type: "territory", continent: "Europe", parentId: "GB", countryCode: "GI" },
  { id: "FK", name: "Falkland Islands", type: "territory", continent: "South America", parentId: "GB", countryCode: "FK" },
  { id: "KY", name: "Cayman Islands", type: "territory", continent: "North America", parentId: "GB", countryCode: "KY" },
  { id: "BM", name: "Bermuda", type: "territory", continent: "North America", parentId: "GB", countryCode: "BM" },
  { id: "VG", name: "British Virgin Islands", type: "territory", continent: "North America", parentId: "GB", countryCode: "VG" },
  { id: "TC", name: "Turks and Caicos Islands", type: "territory", continent: "North America", parentId: "GB", countryCode: "TC" },
  { id: "MS", name: "Montserrat", type: "territory", continent: "North America", parentId: "GB", countryCode: "MS" },
  { id: "AI", name: "Anguilla", type: "territory", continent: "North America", parentId: "GB", countryCode: "AI" },
  { id: "SH", name: "Saint Helena", type: "territory", continent: "Africa", parentId: "GB", countryCode: "SH" },
  { id: "PN", name: "Pitcairn Islands", type: "territory", continent: "Oceania", parentId: "GB", countryCode: "PN" },
  { id: "IO", name: "British Indian Ocean Territory", type: "territory", continent: "Asia", parentId: "GB", countryCode: "IO" },

  // US Territories
  { id: "PR", name: "Puerto Rico", type: "territory", continent: "North America", parentId: "US", countryCode: "PR" },
  { id: "VI", name: "US Virgin Islands", type: "territory", continent: "North America", parentId: "US", countryCode: "VI" },
  { id: "GU", name: "Guam", type: "territory", continent: "Oceania", parentId: "US", countryCode: "GU" },
  { id: "AS", name: "American Samoa", type: "territory", continent: "Oceania", parentId: "US", countryCode: "AS" },
  { id: "MP", name: "Northern Mariana Islands", type: "territory", continent: "Oceania", parentId: "US", countryCode: "MP" },

  // Netherlands Territories
  { id: "AW", name: "Aruba", type: "territory", continent: "North America", parentId: "NL", countryCode: "AW" },
  { id: "CW", name: "Curacao", type: "territory", continent: "North America", parentId: "NL", countryCode: "CW" },
  { id: "SX", name: "Sint Maarten", type: "territory", continent: "North America", parentId: "NL", countryCode: "SX" },
  { id: "BQ", name: "Caribbean Netherlands", type: "territory", continent: "North America", parentId: "NL", countryCode: "BQ" },

  // Danish Territories
  { id: "GL", name: "Greenland", type: "territory", continent: "North America", parentId: "DK", countryCode: "GL" },
  { id: "FO", name: "Faroe Islands", type: "territory", continent: "Europe", parentId: "DK", countryCode: "FO" },

  // Australian Territories
  { id: "CX", name: "Christmas Island", type: "territory", continent: "Asia", parentId: "AU", countryCode: "CX" },
  { id: "CC", name: "Cocos (Keeling) Islands", type: "territory", continent: "Asia", parentId: "AU", countryCode: "CC" },
  { id: "NF", name: "Norfolk Island", type: "territory", continent: "Oceania", parentId: "AU", countryCode: "NF" },

  // New Zealand Territories
  { id: "CK", name: "Cook Islands", type: "territory", continent: "Oceania", parentId: "NZ", countryCode: "CK" },
  { id: "NU", name: "Niue", type: "territory", continent: "Oceania", parentId: "NZ", countryCode: "NU" },
  { id: "TK", name: "Tokelau", type: "territory", continent: "Oceania", parentId: "NZ", countryCode: "TK" },

  // Chinese Territories
  { id: "HK", name: "Hong Kong", type: "territory", continent: "Asia", parentId: "CN", countryCode: "HK" },
  { id: "MO", name: "Macau", type: "territory", continent: "Asia", parentId: "CN", countryCode: "MO" },

  // Other
  { id: "AX", name: "Aland Islands", type: "territory", continent: "Europe", parentId: "FI", countryCode: "AX" },
  { id: "SJ", name: "Svalbard and Jan Mayen", type: "territory", continent: "Europe", parentId: "NO", countryCode: "SJ" },

  // UK Overseas Territories (additional)
  { id: "GS", name: "South Georgia and the South Sandwich Islands", type: "territory", continent: "Antarctica", parentId: "GB", countryCode: "GS" },

  // Australian External Territories (additional)
  { id: "HM", name: "Heard Island and McDonald Islands", type: "territory", continent: "Antarctica", parentId: "AU", countryCode: "HM" },

  // Special Regions
  { id: "AQ", name: "Antarctica", type: "territory", continent: "Antarctica", countryCode: "AQ" },
];

// ============================================================================
// US STATES
// ============================================================================

export const US_STATES: Location[] = [
  { id: "US-AL", name: "Alabama", type: "state", continent: "North America", parentId: "US" },
  { id: "US-AK", name: "Alaska", type: "state", continent: "North America", parentId: "US" },
  { id: "US-AZ", name: "Arizona", type: "state", continent: "North America", parentId: "US" },
  { id: "US-AR", name: "Arkansas", type: "state", continent: "North America", parentId: "US" },
  { id: "US-CA", name: "California", type: "state", continent: "North America", parentId: "US" },
  { id: "US-CO", name: "Colorado", type: "state", continent: "North America", parentId: "US" },
  { id: "US-CT", name: "Connecticut", type: "state", continent: "North America", parentId: "US" },
  { id: "US-DE", name: "Delaware", type: "state", continent: "North America", parentId: "US" },
  { id: "US-FL", name: "Florida", type: "state", continent: "North America", parentId: "US" },
  { id: "US-GA", name: "Georgia", type: "state", continent: "North America", parentId: "US" },
  { id: "US-HI", name: "Hawaii", type: "state", continent: "North America", parentId: "US" },
  { id: "US-ID", name: "Idaho", type: "state", continent: "North America", parentId: "US" },
  { id: "US-IL", name: "Illinois", type: "state", continent: "North America", parentId: "US" },
  { id: "US-IN", name: "Indiana", type: "state", continent: "North America", parentId: "US" },
  { id: "US-IA", name: "Iowa", type: "state", continent: "North America", parentId: "US" },
  { id: "US-KS", name: "Kansas", type: "state", continent: "North America", parentId: "US" },
  { id: "US-KY", name: "Kentucky", type: "state", continent: "North America", parentId: "US" },
  { id: "US-LA", name: "Louisiana", type: "state", continent: "North America", parentId: "US" },
  { id: "US-ME", name: "Maine", type: "state", continent: "North America", parentId: "US" },
  { id: "US-MD", name: "Maryland", type: "state", continent: "North America", parentId: "US" },
  { id: "US-MA", name: "Massachusetts", type: "state", continent: "North America", parentId: "US" },
  { id: "US-MI", name: "Michigan", type: "state", continent: "North America", parentId: "US" },
  { id: "US-MN", name: "Minnesota", type: "state", continent: "North America", parentId: "US" },
  { id: "US-MS", name: "Mississippi", type: "state", continent: "North America", parentId: "US" },
  { id: "US-MO", name: "Missouri", type: "state", continent: "North America", parentId: "US" },
  { id: "US-MT", name: "Montana", type: "state", continent: "North America", parentId: "US" },
  { id: "US-NE", name: "Nebraska", type: "state", continent: "North America", parentId: "US" },
  { id: "US-NV", name: "Nevada", type: "state", continent: "North America", parentId: "US" },
  { id: "US-NH", name: "New Hampshire", type: "state", continent: "North America", parentId: "US" },
  { id: "US-NJ", name: "New Jersey", type: "state", continent: "North America", parentId: "US" },
  { id: "US-NM", name: "New Mexico", type: "state", continent: "North America", parentId: "US" },
  { id: "US-NY", name: "New York", type: "state", continent: "North America", parentId: "US" },
  { id: "US-NC", name: "North Carolina", type: "state", continent: "North America", parentId: "US" },
  { id: "US-ND", name: "North Dakota", type: "state", continent: "North America", parentId: "US" },
  { id: "US-OH", name: "Ohio", type: "state", continent: "North America", parentId: "US" },
  { id: "US-OK", name: "Oklahoma", type: "state", continent: "North America", parentId: "US" },
  { id: "US-OR", name: "Oregon", type: "state", continent: "North America", parentId: "US" },
  { id: "US-PA", name: "Pennsylvania", type: "state", continent: "North America", parentId: "US" },
  { id: "US-RI", name: "Rhode Island", type: "state", continent: "North America", parentId: "US" },
  { id: "US-SC", name: "South Carolina", type: "state", continent: "North America", parentId: "US" },
  { id: "US-SD", name: "South Dakota", type: "state", continent: "North America", parentId: "US" },
  { id: "US-TN", name: "Tennessee", type: "state", continent: "North America", parentId: "US" },
  { id: "US-TX", name: "Texas", type: "state", continent: "North America", parentId: "US" },
  { id: "US-UT", name: "Utah", type: "state", continent: "North America", parentId: "US" },
  { id: "US-VT", name: "Vermont", type: "state", continent: "North America", parentId: "US" },
  { id: "US-VA", name: "Virginia", type: "state", continent: "North America", parentId: "US" },
  { id: "US-WA", name: "Washington", type: "state", continent: "North America", parentId: "US" },
  { id: "US-WV", name: "West Virginia", type: "state", continent: "North America", parentId: "US" },
  { id: "US-WI", name: "Wisconsin", type: "state", continent: "North America", parentId: "US" },
  { id: "US-WY", name: "Wyoming", type: "state", continent: "North America", parentId: "US" },
  { id: "US-DC", name: "District of Columbia", type: "state", continent: "North America", parentId: "US" },
];

// ============================================================================
// COMBINED DATA & HELPERS
// ============================================================================

export const ALL_LOCATIONS: Location[] = [...COUNTRIES, ...TERRITORIES, ...US_STATES];

// Pre-computed lookup Map for O(1) access by ID
export const LOCATIONS_BY_ID: Map<string, Location> = new Map(
  ALL_LOCATIONS.map(loc => [loc.id, loc])
);

// Pre-computed lookup Map for O(1) access by name (lowercase)
export const LOCATIONS_BY_NAME: Map<string, Location> = new Map(
  ALL_LOCATIONS.map(loc => [loc.name.toLowerCase(), loc])
);

export const TOTAL_COUNTRIES = COUNTRIES.length;
export const TOTAL_TERRITORIES = TERRITORIES.length;
export const TOTAL_US_STATES = US_STATES.length;

// For backward compatibility with old countries.ts
export type Country = Location;

export function getLocationById(id: string): Location | undefined {
  return LOCATIONS_BY_ID.get(id);
}

export function getLocationByName(name: string): Location | undefined {
  return LOCATIONS_BY_NAME.get(name.toLowerCase());
}

export function getLocationsByContinent(continent: Continent): Location[] {
  return ALL_LOCATIONS.filter((loc) => loc.continent === continent);
}

export function getCountriesByContinent(continent: Continent): Location[] {
  return COUNTRIES.filter((c) => c.continent === continent);
}

export function getChildLocations(parentId: string): Location[] {
  return ALL_LOCATIONS.filter((loc) => loc.parentId === parentId);
}

export function getTerritoriesForCountry(countryId: string): Location[] {
  return TERRITORIES.filter((t) => t.parentId === countryId);
}

export function getStatesForCountry(countryId: string): Location[] {
  return US_STATES.filter((s) => s.parentId === countryId);
}

export function hasChildren(locationId: string): boolean {
  return ALL_LOCATIONS.some((loc) => loc.parentId === locationId);
}

// Backward compatibility exports
export function getCountryById(id: string): Location | undefined {
  return COUNTRIES.find((c) => c.id === id);
}

export function getCountryByName(name: string): Location | undefined {
  return COUNTRIES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
}
