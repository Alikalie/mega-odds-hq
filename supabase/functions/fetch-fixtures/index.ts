import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Map league names to API-Football league IDs
const LEAGUE_ID_MAP: Record<string, number> = {
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
  "Scottish Premiership": 179,
  "Turkish Süper Lig": 203,
  "Greek Super League": 197,
  "Swiss Super League": 207,
  "Austrian Bundesliga": 218,
  "Danish Superliga": 119,
  "Norwegian Eliteserien": 103,
  "Swedish Allsvenskan": 113,
  "Russian Premier League": 235,
  "Ukrainian Premier League": 333,
  "Polish Ekstraklasa": 106,
  "Czech First League": 345,
  "Croatian First Football League": 210,
  "Serbian SuperLiga": 286,
  "Romanian Liga I": 283,
  "MLS": 253,
  "Liga MX": 262,
  "Argentine Primera División": 128,
  "Brazilian Serie A": 71,
  "Brazilian Serie B": 72,
  "Copa Libertadores": 13,
  "Copa Sudamericana": 11,
  "Copa America": 9,
  "J1 League": 98,
  "K League 1": 292,
  "Chinese Super League": 169,
  "A-League": 188,
  "Indian Super League": 323,
  "Saudi Pro League": 307,
  "Egyptian Premier League": 233,
  "South African Premier Division": 288,
  "Ghanaian Premier League": 332,
  "Nigerian Professional Football League": 336,
  "Kenyan Premier League": 276,
  "Tanzanian Premier League": 350,
  "Ugandan Premier League": 364,
  "UEFA Champions League": 2,
  "UEFA Europa League": 3,
  "UEFA Conference League": 848,
  "UEFA Super Cup": 531,
  "FIFA Club World Cup": 15,
  "FIFA World Cup": 1,
  "UEFA European Championship": 4,
  "Africa Cup of Nations": 6,
  "AFC Asian Cup": 7,
  "CONCACAF Gold Cup": 10,
  "FIFA World Cup Qualifiers": 32,
  "UEFA Nations League": 5,
  "CAF Champions League": 12,
  "AFC Champions League": 17,
  "CONCACAF Champions League": 16,
  "International Friendlies": 10,
  "Sierra Leone Premier League": 367,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
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

    const leagueId = LEAGUE_ID_MAP[league];
    if (!leagueId) {
      return new Response(JSON.stringify({ fixtures: [], message: `No API mapping for "${league}". Enter teams manually.` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) {
      return new Response(JSON.stringify({ error: 'RAPIDAPI_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const today = date || new Date().toISOString().split('T')[0];
    const season = new Date().getFullYear();

    const response = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${leagueId}&season=${season}&date=${today}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      // Try previous season if current season returns error
      const prevResponse = await fetch(
        `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=${leagueId}&season=${season - 1}&date=${today}`,
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
          },
        }
      );
      
      if (!prevResponse.ok) {
        const errText = await prevResponse.text();
        return new Response(JSON.stringify({ error: `API-Football error: ${prevResponse.status}`, details: errText }), {
          status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const prevData = await prevResponse.json();
      const fixtures = (prevData.response || []).map((f: any) => ({
        id: f.fixture.id,
        homeTeam: f.teams.home.name,
        awayTeam: f.teams.away.name,
        matchTime: new Date(f.fixture.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: f.fixture.status.short,
      }));

      return new Response(JSON.stringify({ fixtures }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const fixtures = (data.response || []).map((f: any) => ({
      id: f.fixture.id,
      homeTeam: f.teams.home.name,
      awayTeam: f.teams.away.name,
      matchTime: new Date(f.fixture.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: f.fixture.status.short,
    }));

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
