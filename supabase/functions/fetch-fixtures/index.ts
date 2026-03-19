import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

const API_HOST = "api-football-v1.p.rapidapi.com";
const API_BASE_URL = `https://${API_HOST}/v3/fixtures`;
const LOOKAHEAD_DAYS = 7;

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

interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  matchTime: string;
  status: string;
}

type FixtureLookupResult =
  | { ok: true; fixtures: Fixture[] }
  | { ok: false; status: number; error: string };

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders });

const normaliseLeagueName = (league: string) =>
  Object.keys(LEAGUE_ID_MAP).find((key) => key.toLowerCase() === league.toLowerCase());

const toApiDate = (date: string) => {
  const parsedDate = new Date(`${date}T12:00:00Z`);
  return parsedDate.toISOString().split("T")[0];
};

const shiftDate = (date: string, days: number) => {
  const parsedDate = new Date(`${date}T12:00:00Z`);
  parsedDate.setUTCDate(parsedDate.getUTCDate() + days);
  return parsedDate.toISOString().split("T")[0];
};

const getSeasonCandidates = (fetchDate: string) => {
  const year = new Date(`${fetchDate}T12:00:00Z`).getUTCFullYear();
  return [year, year - 1].filter((season, index, seasons) => seasons.indexOf(season) === index);
};

const parseFixtures = (payload: any): Fixture[] =>
  (payload.response || [])
    .sort((a: any, b: any) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())
    .map((fixture: any) => ({
      id: fixture.fixture.id,
      homeTeam: fixture.teams.home.name,
      awayTeam: fixture.teams.away.name,
      matchTime: new Date(fixture.fixture.date).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      status: fixture.fixture.status.short,
    }));

const dedupeFixtures = (fixtures: Fixture[]) => Array.from(new Map(fixtures.map((fixture) => [fixture.id, fixture])).values());

const fetchApiFixtures = async (rapidApiKey: string, query: string): Promise<FixtureLookupResult> => {
  const response = await fetch(`${API_BASE_URL}?${query}`, {
    headers: {
      "X-RapidAPI-Key": rapidApiKey,
      "X-RapidAPI-Host": API_HOST,
    },
  });

  const bodyText = await response.text();

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: bodyText,
    };
  }

  const payload = bodyText ? JSON.parse(bodyText) : {};

  return {
    ok: true,
    fixtures: dedupeFixtures(parseFixtures(payload)),
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { league, date } = await req.json();

    if (!league) {
      return jsonResponse({ error: "League is required" }, 400);
    }

    const leagueKey = normaliseLeagueName(league);
    const leagueId = leagueKey ? LEAGUE_ID_MAP[leagueKey] : undefined;

    if (!leagueId) {
      return jsonResponse({ fixtures: [], message: `No API mapping for "${league}". Enter teams manually.` });
    }

    const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
    if (!rapidApiKey) {
      return jsonResponse({ error: "RAPIDAPI_KEY not configured" }, 500);
    }

    const fetchDate = typeof date === "string" && date ? toApiDate(date) : new Date().toISOString().split("T")[0];
    const upcomingToDate = shiftDate(fetchDate, LOOKAHEAD_DAYS);
    const strategies = getSeasonCandidates(fetchDate).flatMap((season) => [
      {
        label: `exact-date season=${season}`,
        query: `league=${leagueId}&season=${season}&date=${fetchDate}`,
        message: `Loaded fixtures for ${leagueKey} on ${fetchDate}.`,
      },
      {
        label: `lookahead season=${season}`,
        query: `league=${leagueId}&season=${season}&from=${fetchDate}&to=${upcomingToDate}`,
        message: `No exact-date fixtures found, showing upcoming ${leagueKey} fixtures instead.`,
      },
    ]);

    let lastApiError: string | null = null;

    for (const strategy of strategies) {
      console.log(`Trying fixture strategy: ${strategy.label}`);
      const result = await fetchApiFixtures(rapidApiKey, strategy.query);

      if (!result.ok) {
        lastApiError = `${result.status} - ${result.error}`;
        console.error(`Fixture provider error (${strategy.label}): ${lastApiError}`);
        continue;
      }

      if (result.fixtures.length > 0) {
        return jsonResponse({
          fixtures: result.fixtures,
          message: strategy.message,
        });
      }
    }

    if (lastApiError) {
      return jsonResponse({ error: "Fixture provider unavailable", details: lastApiError }, 502);
    }

    return jsonResponse({
      fixtures: [],
      message: `No fixtures found for ${leagueKey} starting from ${fetchDate}. Enter teams manually.`,
    });
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500,
    );
  }
});