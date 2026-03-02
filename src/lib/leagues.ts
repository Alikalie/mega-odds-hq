// Comprehensive list of football leagues worldwide with country codes for flags
export interface LeagueInfo {
  name: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
}

// Convert country code to flag emoji
export const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const LEAGUES: LeagueInfo[] = [
  // England
  { name: "Premier League", country: "England", countryCode: "GB" },
  { name: "EFL Championship", country: "England", countryCode: "GB" },
  { name: "EFL League One", country: "England", countryCode: "GB" },
  { name: "EFL League Two", country: "England", countryCode: "GB" },
  { name: "National League", country: "England", countryCode: "GB" },
  { name: "FA Cup", country: "England", countryCode: "GB" },
  { name: "EFL Cup (Carabao Cup)", country: "England", countryCode: "GB" },
  // Spain
  { name: "La Liga", country: "Spain", countryCode: "ES" },
  { name: "La Liga 2", country: "Spain", countryCode: "ES" },
  { name: "Copa del Rey", country: "Spain", countryCode: "ES" },
  // Germany
  { name: "Bundesliga", country: "Germany", countryCode: "DE" },
  { name: "2. Bundesliga", country: "Germany", countryCode: "DE" },
  { name: "3. Liga", country: "Germany", countryCode: "DE" },
  { name: "DFB-Pokal", country: "Germany", countryCode: "DE" },
  // Italy
  { name: "Serie A", country: "Italy", countryCode: "IT" },
  { name: "Serie B", country: "Italy", countryCode: "IT" },
  { name: "Coppa Italia", country: "Italy", countryCode: "IT" },
  // France
  { name: "Ligue 1", country: "France", countryCode: "FR" },
  { name: "Ligue 2", country: "France", countryCode: "FR" },
  { name: "Coupe de France", country: "France", countryCode: "FR" },
  // Portugal
  { name: "Primeira Liga", country: "Portugal", countryCode: "PT" },
  { name: "Liga Portugal 2", country: "Portugal", countryCode: "PT" },
  { name: "Taça de Portugal", country: "Portugal", countryCode: "PT" },
  // Netherlands
  { name: "Eredivisie", country: "Netherlands", countryCode: "NL" },
  { name: "Eerste Divisie", country: "Netherlands", countryCode: "NL" },
  { name: "KNVB Cup", country: "Netherlands", countryCode: "NL" },
  // Belgium
  { name: "Belgian Pro League", country: "Belgium", countryCode: "BE" },
  { name: "Belgian First Division B", country: "Belgium", countryCode: "BE" },
  // Turkey
  { name: "Süper Lig", country: "Turkey", countryCode: "TR" },
  { name: "TFF First League", country: "Turkey", countryCode: "TR" },
  { name: "Turkish Cup", country: "Turkey", countryCode: "TR" },
  // Scotland
  { name: "Scottish Premiership", country: "Scotland", countryCode: "GB" },
  { name: "Scottish Championship", country: "Scotland", countryCode: "GB" },
  { name: "Scottish Cup", country: "Scotland", countryCode: "GB" },
  // Russia
  { name: "Russian Premier League", country: "Russia", countryCode: "RU" },
  { name: "Russian Cup", country: "Russia", countryCode: "RU" },
  // Ukraine
  { name: "Ukrainian Premier League", country: "Ukraine", countryCode: "UA" },
  // Greece
  { name: "Super League Greece", country: "Greece", countryCode: "GR" },
  // Switzerland
  { name: "Swiss Super League", country: "Switzerland", countryCode: "CH" },
  { name: "Swiss Challenge League", country: "Switzerland", countryCode: "CH" },
  // Austria
  { name: "Austrian Bundesliga", country: "Austria", countryCode: "AT" },
  // Denmark
  { name: "Danish Superliga", country: "Denmark", countryCode: "DK" },
  // Sweden
  { name: "Allsvenskan", country: "Sweden", countryCode: "SE" },
  // Norway
  { name: "Eliteserien", country: "Norway", countryCode: "NO" },
  // Finland
  { name: "Veikkausliiga", country: "Finland", countryCode: "FI" },
  // Poland
  { name: "Ekstraklasa", country: "Poland", countryCode: "PL" },
  // Czech Republic
  { name: "Czech First League", country: "Czech Republic", countryCode: "CZ" },
  // Croatia
  { name: "Croatian First Football League", country: "Croatia", countryCode: "HR" },
  // Serbia
  { name: "Serbian SuperLiga", country: "Serbia", countryCode: "RS" },
  // Romania
  { name: "Liga I", country: "Romania", countryCode: "RO" },
  // Hungary
  { name: "NB I (OTP Bank Liga)", country: "Hungary", countryCode: "HU" },
  // Bulgaria
  { name: "Bulgarian First League", country: "Bulgaria", countryCode: "BG" },
  // Cyprus
  { name: "Cypriot First Division", country: "Cyprus", countryCode: "CY" },
  // Israel
  { name: "Israeli Premier League", country: "Israel", countryCode: "IL" },
  // South America
  { name: "Brazilian Serie A", country: "Brazil", countryCode: "BR" },
  { name: "Brazilian Serie B", country: "Brazil", countryCode: "BR" },
  { name: "Copa do Brasil", country: "Brazil", countryCode: "BR" },
  { name: "Argentine Primera División", country: "Argentina", countryCode: "AR" },
  { name: "Copa de la Liga Profesional", country: "Argentina", countryCode: "AR" },
  { name: "Copa Libertadores", country: "South America", countryCode: "BR" },
  { name: "Copa Sudamericana", country: "South America", countryCode: "BR" },
  { name: "Uruguayan Primera División", country: "Uruguay", countryCode: "UY" },
  { name: "Colombian Primera A", country: "Colombia", countryCode: "CO" },
  { name: "Chilean Primera División", country: "Chile", countryCode: "CL" },
  { name: "Peruvian Primera División", country: "Peru", countryCode: "PE" },
  { name: "Paraguayan Primera División", country: "Paraguay", countryCode: "PY" },
  { name: "Ecuadorian Serie A", country: "Ecuador", countryCode: "EC" },
  { name: "Venezuelan Primera División", country: "Venezuela", countryCode: "VE" },
  { name: "Bolivian Primera División", country: "Bolivia", countryCode: "BO" },
  // North/Central America
  { name: "MLS (Major League Soccer)", country: "USA", countryCode: "US" },
  { name: "Liga MX", country: "Mexico", countryCode: "MX" },
  { name: "Copa MX", country: "Mexico", countryCode: "MX" },
  { name: "USL Championship", country: "USA", countryCode: "US" },
  { name: "CONCACAF Champions League", country: "International", countryCode: "US" },
  { name: "Costa Rican Primera División", country: "Costa Rica", countryCode: "CR" },
  { name: "Honduran Liga Nacional", country: "Honduras", countryCode: "HN" },
  // Africa
  { name: "South African Premier Division", country: "South Africa", countryCode: "ZA" },
  { name: "Egyptian Premier League", country: "Egypt", countryCode: "EG" },
  { name: "Moroccan Botola Pro", country: "Morocco", countryCode: "MA" },
  { name: "Tunisian Ligue Professionnelle 1", country: "Tunisia", countryCode: "TN" },
  { name: "Algerian Ligue 1", country: "Algeria", countryCode: "DZ" },
  { name: "Nigerian Professional Football League", country: "Nigeria", countryCode: "NG" },
  { name: "Ghanaian Premier League", country: "Ghana", countryCode: "GH" },
  { name: "Kenyan Premier League", country: "Kenya", countryCode: "KE" },
  { name: "Tanzanian Premier League", country: "Tanzania", countryCode: "TZ" },
  { name: "Zambian Super League", country: "Zambia", countryCode: "ZM" },
  { name: "Zimbabwe Premier Soccer League", country: "Zimbabwe", countryCode: "ZW" },
  { name: "Ethiopian Premier League", country: "Ethiopia", countryCode: "ET" },
  { name: "Ugandan Super League", country: "Uganda", countryCode: "UG" },
  { name: "Sierra Leone Premier League", country: "Sierra Leone", countryCode: "SL" },
  { name: "Cameroon Elite One", country: "Cameroon", countryCode: "CM" },
  { name: "Senegalese Ligue 1", country: "Senegal", countryCode: "SN" },
  { name: "Ivorian Ligue 1", country: "Ivory Coast", countryCode: "CI" },
  { name: "Malian Première Division", country: "Mali", countryCode: "ML" },
  { name: "Guinean Ligue 1", country: "Guinea", countryCode: "GN" },
  { name: "Liberian First Division", country: "Liberia", countryCode: "LR" },
  { name: "Gambian GFF League", country: "Gambia", countryCode: "GM" },
  { name: "CAF Champions League", country: "Africa", countryCode: "ZA" },
  { name: "CAF Confederation Cup", country: "Africa", countryCode: "ZA" },
  { name: "Africa Cup of Nations", country: "Africa", countryCode: "ZA" },
  // Asia
  { name: "J1 League (Japan)", country: "Japan", countryCode: "JP" },
  { name: "K League 1 (South Korea)", country: "South Korea", countryCode: "KR" },
  { name: "Chinese Super League", country: "China", countryCode: "CN" },
  { name: "Indian Super League", country: "India", countryCode: "IN" },
  { name: "I-League (India)", country: "India", countryCode: "IN" },
  { name: "Saudi Pro League", country: "Saudi Arabia", countryCode: "SA" },
  { name: "UAE Pro League", country: "UAE", countryCode: "AE" },
  { name: "Qatar Stars League", country: "Qatar", countryCode: "QA" },
  { name: "Thai League 1", country: "Thailand", countryCode: "TH" },
  { name: "Malaysian Super League", country: "Malaysia", countryCode: "MY" },
  { name: "Indonesian Liga 1", country: "Indonesia", countryCode: "ID" },
  { name: "Vietnamese V.League 1", country: "Vietnam", countryCode: "VN" },
  { name: "A-League (Australia)", country: "Australia", countryCode: "AU" },
  { name: "AFC Champions League", country: "Asia", countryCode: "JP" },
  { name: "AFC Cup", country: "Asia", countryCode: "JP" },
  // International
  { name: "FIFA World Cup", country: "International", countryCode: "UN" },
  { name: "FIFA World Cup Qualifiers", country: "International", countryCode: "UN" },
  { name: "UEFA Champions League", country: "Europe", countryCode: "EU" },
  { name: "UEFA Europa League", country: "Europe", countryCode: "EU" },
  { name: "UEFA Conference League", country: "Europe", countryCode: "EU" },
  { name: "UEFA Euro", country: "Europe", countryCode: "EU" },
  { name: "UEFA Euro Qualifiers", country: "Europe", countryCode: "EU" },
  { name: "UEFA Nations League", country: "Europe", countryCode: "EU" },
  { name: "UEFA Super Cup", country: "Europe", countryCode: "EU" },
  { name: "FIFA Club World Cup", country: "International", countryCode: "UN" },
  { name: "Copa America", country: "South America", countryCode: "BR" },
  { name: "AFCON Qualifiers", country: "Africa", countryCode: "ZA" },
  { name: "International Friendlies", country: "International", countryCode: "UN" },
  { name: "Olympics Football", country: "International", countryCode: "UN" },
];

export type League = typeof LEAGUES[number]["name"];
