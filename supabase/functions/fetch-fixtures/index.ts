import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Map league names to league IDs used by free-api-live-football-data
// These IDs come from the free API's league list
const LEAGUE_ID_MAP: Record<string, string> = {
  // England
  "Premier League": "47",
  "EFL Championship": "48",
  "EFL League One": "49",
  "EFL League Two": "50",
  "National League": "51",
  "FA Cup": "132",
  "EFL Cup (Carabao Cup)": "133",
  // Spain
  "La Liga": "87",
  "La Liga 2": "88",
  "Copa del Rey": "134",
  // Germany
  "Bundesliga": "54",
  "2. Bundesliga": "55",
  "3. Liga": "56",
  "DFB-Pokal": "135",
  // Italy
  "Serie A": "55",
  "Serie B": "56",
  "Coppa Italia": "136",
  // France
  "Ligue 1": "53",
  "Ligue 2": "54",
  "Coupe de France": "137",
  // Portugal
  "Primeira Liga": "61",
  // Netherlands
  "Eredivisie": "57",
  // Belgium
  "Belgian Pro League": "58",
  // Turkey
  "Süper Lig": "52",
  // Scotland
  "Scottish Premiership": "62",
  // International
  "UEFA Champions League": "7",
  "UEFA Europa League": "679",
  "UEFA Conference League": "882",
  "FIFA World Cup": "1",
  // South America
  "Brazilian Serie A": "71",
  "Argentine Primera División": "72",
  "Copa Libertadores": "384",
  // Africa
  "South African Premier Division": "288",
  "Egyptian Premier League": "233",
  "Nigerian Professional Football League": "336",
  "CAF Champions League": "383",
  // USA
  "MLS (Major League Soccer)": "253",
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { league, date } = await req.json();
    
    if (!league) {
      return new Response(JSON.stringify({ error: 'League is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) {
      return new Response(JSON.stringify({ error: 'RAPIDAPI_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Case-insensitive league lookup
    const leagueKey = Object.keys(LEAGUE_ID_MAP).find(
      (k) => k.toLowerCase() === league.toLowerCase()
    );
    const leagueId = leagueKey ? LEAGUE_ID_MAP[leagueKey] : undefined;
    
    if (!leagueId) {
      // Try fetching from api-football-v1 as fallback with the full league map
      return await fetchFromApiFootball(league, date, RAPIDAPI_KEY, corsHeaders);
    }

    const fetchDate = date || new Date().toISOString().split('T')[0];

    console.log(`Fetching fixtures from free API: league=${league}, leagueId=${leagueId}, date=${fetchDate}`);

    // Use api-football-v1.p.rapidapi.com which is the standard API-Football on RapidAPI
    const season = new Date(fetchDate).getFullYear();
    
    // Try current season first, then previous season
    let fixtures = await fetchApiFootballFixtures(leagueId, season, fetchDate, RAPIDAPI_KEY);
    
    if (fixtures.length === 0) {
      console.log(`No fixtures for season ${season}, trying ${season - 1}`);
      fixtures = await fetchApiFootballFixtures(leagueId, season - 1, fetchDate, RAPIDAPI_KEY);
    }

    return new Response(JSON.stringify({ fixtures }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Extended league map for api-football-v1
const API_FOOTBALL_LEAGUE_MAP: Record<string, number> = {
  "Premier League": 39,
  "EFL Championship": 40,
  "EFL League One": 41,
  "EFL League Two": 42,
  "National League": 43,
  "FA Cup": 45,
  "EFL Cup (Carabao Cup)": 46,
  "La Liga": 140,
  "La Liga 2": 141,
  "Copa del Rey": 143,
  "Bundesliga": 78,
  "2. Bundesliga": 79,
  "3. Liga": 80,
  "DFB-Pokal": 81,
  "Serie A": 135,
  "Serie B": 136,
  "Coppa Italia": 137,
  "Ligue 1": 61,
  "Ligue 2": 62,
  "Coupe de France": 66,
  "Primeira Liga": 94,
  "Liga Portugal 2": 95,
  "Taça de Portugal": 96,
  "Eredivisie": 88,
  "Eerste Divisie": 89,
  "KNVB Cup": 90,
  "Belgian Pro League": 144,
  "Belgian First Division B": 145,
  "Süper Lig": 203,
  "TFF First League": 204,
  "Turkish Cup": 205,
  "Scottish Premiership": 179,
  "Scottish Championship": 180,
  "Scottish Cup": 181,
  "Russian Premier League": 235,
  "Russian Cup": 236,
  "Ukrainian Premier League": 333,
  "Super League Greece": 197,
  "Swiss Super League": 207,
  "Swiss Challenge League": 208,
  "Austrian Bundesliga": 218,
  "Danish Superliga": 119,
  "Allsvenskan": 113,
  "Eliteserien": 103,
  "Veikkausliiga": 244,
  "Ekstraklasa": 106,
  "Czech First League": 345,
  "Croatian First Football League": 210,
  "Serbian SuperLiga": 286,
  "Liga I": 283,
  "NB I (OTP Bank Liga)": 271,
  "Bulgarian First League": 172,
  "Cypriot First Division": 318,
  "Israeli Premier League": 384,
  "Brazilian Serie A": 71,
  "Brazilian Serie B": 72,
  "Copa do Brasil": 73,
  "Argentine Primera División": 128,
  "Copa de la Liga Profesional": 129,
  "Copa Libertadores": 13,
  "Copa Sudamericana": 11,
  "Uruguayan Primera División": 268,
  "Colombian Primera A": 239,
  "Chilean Primera División": 265,
  "Peruvian Primera División": 281,
  "Paraguayan Primera División": 279,
  "Ecuadorian Serie A": 242,
  "Venezuelan Primera División": 299,
  "Bolivian Primera División": 157,
  "MLS (Major League Soccer)": 253,
  "Liga MX": 262,
  "Copa MX": 263,
  "USL Championship": 254,
  "CONCACAF Champions League": 16,
  "Costa Rican Primera División": 230,
  "Honduran Liga Nacional": 256,
  "South African Premier Division": 288,
  "Egyptian Premier League": 233,
  "Moroccan Botola Pro": 200,
  "Tunisian Ligue Professionnelle 1": 202,
  "Algerian Ligue 1": 186,
  "Nigerian Professional Football League": 336,
  "Ghanaian Premier League": 332,
  "Kenyan Premier League": 276,
  "Tanzanian Premier League": 350,
  "Zambian Super League": 377,
  "Zimbabwe Premier Soccer League": 378,
  "Ethiopian Premier League": 363,
  "Ugandan Super League": 364,
  "Sierra Leone Premier League": 367,
  "Cameroon Elite One": 406,
  "Senegalese Ligue 1": 307,
  "Ivorian Ligue 1": 373,
  "Malian Première Division": 375,
  "Guinean Ligue 1": 374,
  "Liberian First Division": 376,
  "Gambian GFF League": 379,
  "CAF Champions League": 12,
  "CAF Confederation Cup": 14,
  "Africa Cup of Nations": 6,
  "J1 League (Japan)": 98,
  "K League 1 (South Korea)": 292,
  "Chinese Super League": 169,
  "Indian Super League": 323,
  "I-League (India)": 324,
  "Saudi Pro League": 307,
  "UAE Pro League": 305,
  "Qatar Stars League": 301,
  "Thai League 1": 296,
  "Malaysian Super League": 302,
  "Indonesian Liga 1": 274,
  "Vietnamese V.League 1": 340,
  "A-League (Australia)": 188,
  "AFC Champions League": 17,
  "AFC Cup": 18,
  "FIFA World Cup": 1,
  "FIFA World Cup Qualifiers": 32,
  "UEFA Champions League": 2,
  "UEFA Europa League": 3,
  "UEFA Conference League": 848,
  "UEFA Euro": 4,
  "UEFA Euro Qualifiers": 960,
  "UEFA Nations League": 5,
  "UEFA Super Cup": 531,
  "FIFA Club World Cup": 15,
  "Copa America": 9,
  "AFCON Qualifiers": 36,
  "International Friendlies": 10,
  "Olympics Football": 480,
};

async function fetchApiFootballFixtures(leagueId: string | number, season: number, date: string, apiKey: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${leagueId}&season=${season}&date=${date}`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      console.error(`api-football-v1 error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return (data.response || []).map((f: any) => ({
      id: f.fixture.id,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      matchTime: new Date(f.fixture.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: f.fixture.status.short,
    }));
  } catch (err) {
    console.error('fetchApiFootballFixtures error:', err);
    return [];
  }
}

async function fetchFromApiFootball(league: string, date: string | undefined, apiKey: string, corsHeaders: Record<string, string>) {
  const leagueKey = Object.keys(API_FOOTBALL_LEAGUE_MAP).find(
    (k) => k.toLowerCase() === league.toLowerCase()
  );
  const leagueId = leagueKey ? API_FOOTBALL_LEAGUE_MAP[leagueKey] : undefined;

  if (!leagueId) {
    return new Response(JSON.stringify({ fixtures: [], message: `No API mapping for "${league}". Enter teams manually.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const fetchDate = date || new Date().toISOString().split('T')[0];
  const season = new Date(fetchDate).getFullYear();

  let fixtures = await fetchApiFootballFixtures(leagueId, season, fetchDate, apiKey);
  if (fixtures.length === 0) {
    fixtures = await fetchApiFootballFixtures(leagueId, season - 1, fetchDate, apiKey);
  }

  return new Response(JSON.stringify({ fixtures }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
