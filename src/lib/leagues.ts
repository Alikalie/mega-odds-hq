// Comprehensive list of football leagues worldwide
export const LEAGUES = [
  // England
  "Premier League",
  "EFL Championship",
  "EFL League One",
  "EFL League Two",
  "National League",
  "FA Cup",
  "EFL Cup (Carabao Cup)",
  // Spain
  "La Liga",
  "La Liga 2",
  "Copa del Rey",
  // Germany
  "Bundesliga",
  "2. Bundesliga",
  "3. Liga",
  "DFB-Pokal",
  // Italy
  "Serie A",
  "Serie B",
  "Coppa Italia",
  // France
  "Ligue 1",
  "Ligue 2",
  "Coupe de France",
  // Portugal
  "Primeira Liga",
  "Liga Portugal 2",
  "Taça de Portugal",
  // Netherlands
  "Eredivisie",
  "Eerste Divisie",
  "KNVB Cup",
  // Belgium
  "Belgian Pro League",
  "Belgian First Division B",
  // Turkey
  "Süper Lig",
  "TFF First League",
  "Turkish Cup",
  // Scotland
  "Scottish Premiership",
  "Scottish Championship",
  "Scottish Cup",
  // Russia
  "Russian Premier League",
  "Russian Cup",
  // Ukraine
  "Ukrainian Premier League",
  // Greece
  "Super League Greece",
  // Switzerland
  "Swiss Super League",
  "Swiss Challenge League",
  // Austria
  "Austrian Bundesliga",
  // Denmark
  "Danish Superliga",
  // Sweden
  "Allsvenskan",
  // Norway
  "Eliteserien",
  // Finland
  "Veikkausliiga",
  // Poland
  "Ekstraklasa",
  // Czech Republic
  "Czech First League",
  // Croatia
  "Croatian First Football League",
  // Serbia
  "Serbian SuperLiga",
  // Romania
  "Liga I",
  // Hungary
  "NB I (OTP Bank Liga)",
  // Bulgaria
  "Bulgarian First League",
  // Cyprus
  "Cypriot First Division",
  // Israel
  "Israeli Premier League",
  // South America
  "Brazilian Serie A",
  "Brazilian Serie B",
  "Copa do Brasil",
  "Argentine Primera División",
  "Copa de la Liga Profesional",
  "Copa Libertadores",
  "Copa Sudamericana",
  "Uruguayan Primera División",
  "Colombian Primera A",
  "Chilean Primera División",
  "Peruvian Primera División",
  "Paraguayan Primera División",
  "Ecuadorian Serie A",
  "Venezuelan Primera División",
  "Bolivian Primera División",
  // North/Central America
  "MLS (Major League Soccer)",
  "Liga MX",
  "Copa MX",
  "USL Championship",
  "CONCACAF Champions League",
  "Costa Rican Primera División",
  "Honduran Liga Nacional",
  // Africa
  "South African Premier Division",
  "Egyptian Premier League",
  "Moroccan Botola Pro",
  "Tunisian Ligue Professionnelle 1",
  "Algerian Ligue 1",
  "Nigerian Professional Football League",
  "Ghanaian Premier League",
  "Kenyan Premier League",
  "Tanzanian Premier League",
  "Zambian Super League",
  "Zimbabwe Premier Soccer League",
  "Ethiopian Premier League",
  "Ugandan Super League",
  "Sierra Leone Premier League",
  "CAF Champions League",
  "CAF Confederation Cup",
  "Africa Cup of Nations",
  // Asia
  "J1 League (Japan)",
  "K League 1 (South Korea)",
  "Chinese Super League",
  "Indian Super League",
  "I-League (India)",
  "Saudi Pro League",
  "UAE Pro League",
  "Qatar Stars League",
  "Thai League 1",
  "Malaysian Super League",
  "Indonesian Liga 1",
  "Vietnamese V.League 1",
  "A-League (Australia)",
  "AFC Champions League",
  "AFC Cup",
  // International
  "FIFA World Cup",
  "FIFA World Cup Qualifiers",
  "UEFA Champions League",
  "UEFA Europa League",
  "UEFA Conference League",
  "UEFA Euro",
  "UEFA Euro Qualifiers",
  "UEFA Nations League",
  "UEFA Super Cup",
  "FIFA Club World Cup",
  "Copa America",
  "AFCON Qualifiers",
  "International Friendlies",
  "Olympics Football",
] as const;

export type League = typeof LEAGUES[number];
