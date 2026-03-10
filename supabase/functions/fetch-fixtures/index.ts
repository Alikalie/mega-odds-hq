import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Map league names to API-Football league IDs — keys MUST match leagues.ts exactly
const LEAGUE_ID_MAP: Record<string, number> = {
  // England
  "Premier League": 39,
  "EFL Championship": 40,
  "EFL League One": 41,
  "EFL League Two": 42,
  "National League": 43,
  "FA Cup": 45,
  "EFL Cup (Carabao Cup)": 46,
  // Spain
  "La Liga": 140,
  "La Liga 2": 141,
  "Copa del Rey": 143,
  // Germany
  "Bundesliga": 78,
  "2. Bundesliga": 79,
  "3. Liga": 80,
  "DFB-Pokal": 81,
  // Italy
  "Serie A": 135,
  "Serie B": 136,
  "Coppa Italia": 137,
  // France
  "Ligue 1": 61,
  "Ligue 2": 62,
  "Coupe de France": 66,
  // Portugal
  "Primeira Liga": 94,
  "Liga Portugal 2": 95,
  "Taça de Portugal": 96,
  // Netherlands
  "Eredivisie": 88,
  "Eerste Divisie": 89,
  "KNVB Cup": 90,
  // Belgium
  "Belgian Pro League": 144,
  "Belgian First Division B": 145,
  // Turkey
  "Süper Lig": 203,
  "TFF First League": 204,
  "Turkish Cup": 205,
  // Scotland
  "Scottish Premiership": 179,
  "Scottish Championship": 180,
  "Scottish Cup": 181,
  // Russia
  "Russian Premier League": 235,
  "Russian Cup": 236,
  // Ukraine
  "Ukrainian Premier League": 333,
  // Greece
  "Super League Greece": 197,
  // Switzerland
  "Swiss Super League": 207,
  "Swiss Challenge League": 208,
  // Austria
  "Austrian Bundesliga": 218,
  // Denmark
  "Danish Superliga": 119,
  // Sweden
  "Allsvenskan": 113,
  // Norway
  "Eliteserien": 103,
  // Finland
  "Veikkausliiga": 244,
  // Poland
  "Ekstraklasa": 106,
  // Czech Republic
  "Czech First League": 345,
  // Croatia
  "Croatian First Football League": 210,
  // Serbia
  "Serbian SuperLiga": 286,
  // Romania
  "Liga I": 283,
  // Hungary
  "NB I (OTP Bank Liga)": 271,
  // Bulgaria
  "Bulgarian First League": 172,
  // Cyprus
  "Cypriot First Division": 318,
  // Israel
  "Israeli Premier League": 384,
  // South America
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
  // North/Central America
  "MLS (Major League Soccer)": 253,
  "Liga MX": 262,
  "Copa MX": 263,
  "USL Championship": 254,
  "CONCACAF Champions League": 16,
  "Costa Rican Primera División": 230,
  "Honduran Liga Nacional": 256,
  // Africa
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
  // Asia
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
  // International
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

    // Case-insensitive league lookup
    const leagueKey = Object.keys(LEAGUE_ID_MAP).find(
      (k) => k.toLowerCase() === league.toLowerCase()
    );
    const leagueId = leagueKey ? LEAGUE_ID_MAP[leagueKey] : undefined;
    
    if (!leagueId) {
      return new Response(JSON.stringify({ fixtures: [], message: `No API mapping for "${league}". Enter teams manually.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) {
      return new Response(JSON.stringify({ error: 'RAPIDAPI_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const fetchDate = date || new Date().toISOString().split('T')[0];
    const season = new Date(fetchDate).getFullYear();

    console.log(`Fetching fixtures: league=${leagueId}, season=${season}, date=${fetchDate}`);

    const response = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${leagueId}&season=${season}&date=${fetchDate}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        },
      }
    );

    const parseFixtures = (data: any) => (data.response || []).map((f: any) => ({
      id: f.fixture.id,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      matchTime: new Date(f.fixture.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: f.fixture.status.short,
    }));

    if (!response.ok) {
      // Try previous season
      const prevResponse = await fetch(
        `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${leagueId}&season=${season - 1}&date=${fetchDate}`,
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
          },
        }
      );
      
      if (!prevResponse.ok) {
        const errText = await prevResponse.text();
        console.error(`API error: ${prevResponse.status} - ${errText}`);
        return new Response(JSON.stringify({ error: `API-Football error: ${prevResponse.status}`, details: errText }), {
          status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const prevData = await prevResponse.json();
      return new Response(JSON.stringify({ fixtures: parseFixtures(prevData) }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    let fixtures = parseFixtures(data);

    // If no fixtures found with current season, try previous season
    if (fixtures.length === 0) {
      console.log(`No fixtures for season ${season}, trying ${season - 1}`);
      const prevResponse = await fetch(
        `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${leagueId}&season=${season - 1}&date=${fetchDate}`,
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
          },
        }
      );
      if (prevResponse.ok) {
        const prevData = await prevResponse.json();
        fixtures = parseFixtures(prevData);
      }
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
