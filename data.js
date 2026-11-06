/* Matchday — sample data.
   Everything here is demo content until a live data feed is connected.
   Swap the functions in DataSource (app.js) to load real data later. */

window.MD_DATA = (function () {
  // Teams by league (2026–27 club lists). [key, name, color, other names used in news headlines]
  const TEAM_GROUPS = {
    "Premier League": [
      ["ARS", "Arsenal", "#DB0007"],
      ["AVL", "Aston Villa", "#670E36"],
      ["BOU", "Bournemouth", "#DA291C"],
      ["BRE", "Brentford", "#E30613"],
      ["BHA", "Brighton", "#0057B8", "Brighton & Hove Albion"],
      ["CHE", "Chelsea", "#034694"],
      ["COV", "Coventry City", "#59B9E5", "Coventry"],
      ["CRY", "Crystal Palace", "#1B458F"],
      ["EVE", "Everton", "#003399"],
      ["FUL", "Fulham", "#222222"],
      ["HUL", "Hull City", "#F5A12D"],
      ["IPS", "Ipswich Town", "#0044A9", "Ipswich"],
      ["LEE", "Leeds United", "#FFCD00", "Leeds"],
      ["LIV", "Liverpool", "#C8102E"],
      ["MCI", "Man City", "#6CABDD", "Manchester City"],
      ["MUN", "Man United", "#DA291C", "Manchester United|Man Utd"],
      ["NEW", "Newcastle", "#241F20", "Newcastle United"],
      ["NFO", "Nottingham Forest", "#DD0000", "Nott'm Forest"],
      ["SUN", "Sunderland", "#EB172B"],
      ["TOT", "Tottenham", "#132257", "Spurs|Tottenham Hotspur"]
    ],
    "La Liga": [
      ["ALA", "Alavés", "#0761AF", "Alaves"],
      ["ATH", "Athletic Club", "#EE2523", "Athletic Bilbao"],
      ["ATM", "Atlético Madrid", "#CB3524", "Atletico Madrid|Atlético de Madrid"],
      ["BAR", "Barcelona", "#A50044", "Barca|Barça"],
      ["CEL", "Celta Vigo", "#8AC3EE", "Celta"],
      ["DEP", "Deportivo La Coruña", "#1F4FA3", "Deportivo|Depor"],
      ["ELC", "Elche", "#05642C"],
      ["ESP", "Espanyol", "#007FC8"],
      ["GET", "Getafe", "#005999"],
      ["LEV", "Levante", "#B4053F"],
      ["MAL", "Málaga", "#3D8BCF", "Malaga"],
      ["OSA", "Osasuna", "#D91A21"],
      ["RAC", "Racing Santander", "#00965E"],
      ["RAY", "Rayo Vallecano", "#E53027"],
      ["BET", "Real Betis", "#0BB363", "Betis"],
      ["RMA", "Real Madrid", "#FEBE10"],
      ["RSO", "Real Sociedad", "#143C8B"],
      ["SEV", "Sevilla", "#D7191C"],
      ["VAL", "Valencia", "#EE3524"],
      ["VIL", "Villarreal", "#E8C800"]
    ],
    "Serie A": [
      ["MIL", "AC Milan", "#FB090B"],
      ["ATA", "Atalanta", "#1E71B8"],
      ["BOL", "Bologna", "#A21C26"],
      ["CAG", "Cagliari", "#002350"],
      ["COM", "Como", "#003DA5"],
      ["FIO", "Fiorentina", "#482E92"],
      ["FRO", "Frosinone", "#E5C100"],
      ["GEN", "Genoa", "#AD1919"],
      ["INT", "Inter", "#0068A8", "Inter Milan|Internazionale"],
      ["JUV", "Juventus", "#2B2B2B"],
      ["LAZ", "Lazio", "#5BB8E8"],
      ["LCE", "Lecce", "#E2B600"],
      ["MON", "Monza", "#CE0E2D"],
      ["NAP", "Napoli", "#12A0D7"],
      ["PAR", "Parma", "#E2B600"],
      ["ROM", "Roma", "#8E1F2F", "AS Roma"],
      ["SAS", "Sassuolo", "#00A752"],
      ["TOR", "Torino", "#8A1E03"],
      ["UDI", "Udinese", "#2B2B2B"],
      ["VEN", "Venezia", "#E8641B"]
    ],
    "Bundesliga": [
      ["FCA", "Augsburg", "#BA3733"],
      ["B04", "Bayer Leverkusen", "#E32221", "Leverkusen"],
      ["BAY", "Bayern Munich", "#DC052D", "Bayern"],
      ["BVB", "Dortmund", "#E2C200", "Borussia Dortmund"],
      ["BMG", "Mönchengladbach", "#1E8F4E", "Gladbach|Monchengladbach"],
      ["SGE", "Eintracht Frankfurt", "#E1000F", "Frankfurt"],
      ["SCF", "Freiburg", "#C8102E"],
      ["HSV", "Hamburg", "#0A3F86", "Hamburger SV|HSV"],
      ["TSG", "Hoffenheim", "#1961B5"],
      ["KOE", "Köln", "#ED1C24", "Koln|Cologne"],
      ["RBL", "RB Leipzig", "#DD0741", "Leipzig"],
      ["M05", "Mainz", "#C8102E"],
      ["VFB", "Stuttgart", "#E32219"],
      ["FCU", "Union Berlin", "#EB1923"],
      ["SVW", "Werder Bremen", "#1D9053", "Bremen"],
      ["S04", "Schalke", "#004D9D", "Schalke 04"],
      ["SVE", "Elversberg", "#2B2B2B"],
      ["SCP", "Paderborn", "#005CA9"]
    ],
    "Ligue 1": [
      ["ANG", "Angers", "#2B2B2B"],
      ["AUX", "Auxerre", "#0055A4"],
      ["BRS", "Brest", "#E30613", "Stade Brestois"],
      ["HAC", "Le Havre", "#4A9BD1"],
      ["RCL", "Lens", "#E2B600", "RC Lens"],
      ["LIL", "Lille", "#E01E13"],
      ["LOR", "Lorient", "#F58113"],
      ["LYO", "Lyon", "#1A3E8C", "Olympique Lyonnais"],
      ["MAR", "Marseille", "#2FAEE0", "Olympique de Marseille"],
      ["ASM", "Monaco", "#E7182C", "AS Monaco"],
      ["NIC", "Nice", "#C8102E", "OGC Nice"],
      ["PFC", "Paris FC", "#1E2D5A"],
      ["PSG", "Paris Saint-Germain", "#004170", "PSG"],
      ["REN", "Rennes", "#E13327"],
      ["STR", "Strasbourg", "#009FE3"],
      ["TFC", "Toulouse", "#5B2D8E"],
      ["TRO", "Troyes", "#005BAC"],
      ["LMA", "Le Mans", "#C8102E"]
    ],
    "MLS": [
      ["ATL", "Atlanta United", "#80000A"],
      ["AUS", "Austin FC", "#00A040"],
      ["CLT", "Charlotte FC", "#1A85C8"],
      ["CHI", "Chicago Fire", "#AF2626"],
      ["CIN", "FC Cincinnati", "#F05323"],
      ["COL", "Colorado Rapids", "#960A2C"],
      ["CLB", "Columbus Crew", "#E2C200"],
      ["DCU", "D.C. United", "#2B2B2B", "DC United"],
      ["DAL", "FC Dallas", "#E81F3E"],
      ["HOU", "Houston Dynamo", "#FF6B00"],
      ["MIA", "Inter Miami", "#F7B5CD"],
      ["LAG", "LA Galaxy", "#00245D"],
      ["LAFC", "LAFC", "#B08A4E", "Los Angeles FC"],
      ["MIN", "Minnesota United", "#5BA9D6"],
      ["MTL", "CF Montréal", "#0033A1", "CF Montreal"],
      ["NSH", "Nashville SC", "#D9D23A", "Nashville"],
      ["NER", "New England Revolution", "#0A2240"],
      ["NYC", "New York City FC", "#6CACE4", "NYCFC"],
      ["RBNY", "New York Red Bulls", "#ED1E36", "NY Red Bulls"],
      ["ORL", "Orlando City", "#633492"],
      ["PHI", "Philadelphia Union", "#071B2C"],
      ["POR", "Portland Timbers", "#004812"],
      ["RSL", "Real Salt Lake", "#B30838"],
      ["SDF", "San Diego FC", "#0B1F3A"],
      ["SJE", "San Jose Earthquakes", "#0067B1"],
      ["SEA", "Seattle Sounders", "#5D9741"],
      ["SKC", "Sporting Kansas City", "#7FA1C8", "Sporting KC"],
      ["STL", "St. Louis City", "#EC1458"],
      ["TRT", "Toronto FC", "#B81137"],
      ["VAN", "Vancouver Whitecaps", "#7FA8D6"]
    ],
    "Liga MX": [
      ["AME", "América", "#E2BC00", "Club América|Club America"],
      ["ATE", "Atlante", "#003DA5"],
      ["ATS", "Atlas", "#C8102E"],
      ["ASL", "Atlético San Luis", "#D52B1E", "Atletico San Luis"],
      ["CAZ", "Cruz Azul", "#00539F"],
      ["CHV", "Chivas", "#CD1F2D", "Guadalajara"],
      ["JUA", "FC Juárez", "#5AAE3A", "Juarez"],
      ["LEO", "León", "#00703C", "Club León"],
      ["MTY", "Monterrey", "#00205B", "Rayados"],
      ["NEC", "Necaxa", "#D52B1E"],
      ["PAC", "Pachuca", "#1C3F94"],
      ["PUE", "Puebla", "#1F3C88"],
      ["QRO", "Querétaro", "#0055A5", "Queretaro"],
      ["SLA", "Santos Laguna", "#00703C"],
      ["TIJ", "Tijuana", "#C8102E", "Xolos"],
      ["TOL", "Toluca", "#D50032"],
      ["TIG", "Tigres", "#E5A800", "Tigres UANL"],
      ["PUM", "Pumas", "#002B5C", "Pumas UNAM"]
    ],
    "Brasileirão": [
      ["CAP", "Athletico-PR", "#CE181E", "Athletico Paranaense"],
      ["CAM", "Atlético Mineiro", "#2B2B2B", "Atletico Mineiro|Atlético-MG"],
      ["BAH", "Bahia", "#0060AA"],
      ["BOT", "Botafogo", "#2B2B2B"],
      ["RBB", "Bragantino", "#D7182A", "Red Bull Bragantino"],
      ["CHA", "Chapecoense", "#00A651"],
      ["COR", "Corinthians", "#2B2B2B"],
      ["CFC", "Coritiba", "#00544D"],
      ["CRU", "Cruzeiro", "#0047AB"],
      ["FLA", "Flamengo", "#C52613"],
      ["FLU", "Fluminense", "#870A28"],
      ["GRE", "Grêmio", "#0D80BF", "Gremio"],
      ["SCI", "Internacional", "#E5050F"],
      ["MIR", "Mirassol", "#D4B000"],
      ["PAL", "Palmeiras", "#006437"],
      ["REM", "Remo", "#1B3A8C"],
      ["SAN", "Santos", "#444444", "Santos FC"],
      ["SAO", "São Paulo", "#E4002B", "Sao Paulo"],
      ["VAS", "Vasco da Gama", "#2B2B2B", "Vasco"],
      ["VIT", "Vitória", "#E30613", "Vitoria"]
    ],
    "Other clubs": [
      ["BRU", "Club Brugge", "#0067CE"],
      ["BEN", "Benfica", "#E83030"],
      ["FCP", "Porto", "#003893", "FC Porto"],
      ["SPO", "Sporting CP", "#008057", "Sporting Lisbon"],
      ["AJA", "Ajax", "#D2122E"],
      ["PSV", "PSV Eindhoven", "#E30613", "PSV"],
      ["FEY", "Feyenoord", "#E10600"],
      ["CLC", "Celtic", "#018749"],
      ["RAN", "Rangers", "#1B458F"],
      ["GAL", "Galatasaray", "#A90432"],
      ["FEN", "Fenerbahçe", "#002D72", "Fenerbahce"],
      ["HIL", "Al-Hilal", "#0059A9", "Al Hilal"],
      ["NAS", "Al-Nassr", "#E2C800", "Al Nassr"],
      ["WHU", "West Ham", "#7A263A", "West Ham United"],
      ["WOL", "Wolves", "#E5A100", "Wolverhampton"],
      ["BUR", "Burnley", "#6C1D45"]
    ],
    "National teams": [
      ["N-ARG", "Argentina", "#6CACE4"],
      ["N-BRA", "Brazil", "#E2C200"],
      ["N-FRA", "France", "#002395"],
      ["N-ENG", "England", "#CE1124"],
      ["N-ESP", "Spain", "#C60B1E"],
      ["N-GER", "Germany", "#2B2B2B"],
      ["N-POR", "Portugal", "#006600"],
      ["N-NED", "Netherlands", "#F36C21", "Holland"],
      ["N-BEL", "Belgium", "#E30613"],
      ["N-ITA", "Italy", "#0066CC"],
      ["N-CRO", "Croatia", "#E50000"],
      ["N-URU", "Uruguay", "#5CBFEB"],
      ["N-COL", "Colombia", "#E2B800"],
      ["N-MEX", "Mexico", "#006847"],
      ["N-USA", "USA", "#0A3161", "USMNT|United States"],
      ["N-CAN", "Canada", "#D80621"],
      ["N-JPN", "Japan", "#1E3C8C"],
      ["N-KOR", "South Korea", "#C60C30"],
      ["N-MAR", "Morocco", "#C1272D"],
      ["N-SEN", "Senegal", "#00853F"],
      ["N-NGA", "Nigeria", "#008751"],
      ["N-GHA", "Ghana", "#CE1126"],
      ["N-EGY", "Egypt", "#C8102E"],
      ["N-CIV", "Ivory Coast", "#FF8200", "Côte d'Ivoire"],
      ["N-CMR", "Cameroon", "#007A5E"],
      ["N-ALG", "Algeria", "#006233"],
      ["N-TUN", "Tunisia", "#E70013"],
      ["N-RSA", "South Africa", "#D9A400"],
      ["N-AUS", "Australia", "#D9B000", "Socceroos"],
      ["N-KSA", "Saudi Arabia", "#006C35"],
      ["N-IRN", "Iran", "#239F40"],
      ["N-QAT", "Qatar", "#8A1538"],
      ["N-IND", "India", "#1E64C8"],
      ["N-SUI", "Switzerland", "#D52B1E"],
      ["N-DEN", "Denmark", "#C60C30"],
      ["N-SWE", "Sweden", "#006AA7"],
      ["N-NOR", "Norway", "#BA0C2F"],
      ["N-POL", "Poland", "#DC143C"],
      ["N-AUT", "Austria", "#ED2939"],
      ["N-SCO", "Scotland", "#0065BD"],
      ["N-WAL", "Wales", "#C8102E"],
      ["N-IRL", "Republic of Ireland", "#169B62", "Ireland"],
      ["N-NIR", "Northern Ireland", "#00843D"],
      ["N-TUR", "Turkey", "#E30A17", "Türkiye"],
      ["N-UKR", "Ukraine", "#0057B7"],
      ["N-SRB", "Serbia", "#C6363C"],
      ["N-CZE", "Czechia", "#11457E", "Czech Republic"],
      ["N-ECU", "Ecuador", "#E2BA00"],
      ["N-PAR", "Paraguay", "#D52B1E"],
      ["N-PER", "Peru", "#D91023"],
      ["N-CHI", "Chile", "#D52B1E"],
      ["N-VEN", "Venezuela", "#800020"],
      ["N-CRC", "Costa Rica", "#002B7F"],
      ["N-PAN", "Panama", "#DA121A"],
      ["N-JAM", "Jamaica", "#009B3A"],
      ["N-HAI", "Haiti", "#00209F"],
      ["N-NZL", "New Zealand", "#2B2B2B"],
      ["N-UZB", "Uzbekistan", "#0099B5"],
      ["N-JOR", "Jordan", "#007A3D"]
    ]
  };
  const TEAMS = {};
  Object.keys(TEAM_GROUPS).forEach((group) => TEAM_GROUPS[group].forEach(([key, name, color, aliases]) => {
    TEAMS[key] = { name, color, group, league: group === 'National teams' ? 'National team' : group, short: key.replace(/^N-/, ''), national: group === 'National teams', aliases: aliases ? aliases.split('|') : [] };
  }));

  const LEAGUES = [
    { id: 'PL', name: 'Premier League', country: 'England' },
    { id: 'LL', name: 'La Liga', country: 'Spain' },
    { id: 'SA', name: 'Serie A', country: 'Italy' },
    { id: 'BL', name: 'Bundesliga', country: 'Germany' },
    { id: 'L1', name: 'Ligue 1', country: 'France' },
    { id: 'MLS', name: 'MLS', country: 'USA' },
    { id: 'UCL', name: 'Champions League', country: 'Europe' },
    { id: 'MX', name: 'Liga MX', country: 'Mexico' },
    { id: 'BR', name: 'Brasileirão', country: 'Brazil' }
  ];

  // Tournaments people can search for: the leagues above plus major cups.
  const CUPS = [
    { id: 'UEL', name: 'Europa League', country: 'Europe' },
    { id: 'UECL', name: 'Conference League', country: 'Europe' },
    { id: 'WC', name: 'FIFA World Cup', country: 'World', national: true },
    { id: 'EURO', name: 'European Championship', country: 'Europe', national: true, aliases: 'Euros|Euro' },
    { id: 'CA', name: 'Copa América', country: 'South America', national: true, aliases: 'Copa America' },
    { id: 'AFCON', name: 'Africa Cup of Nations', country: 'Africa', national: true, aliases: 'AFCON' },
    { id: 'LIB', name: 'Copa Libertadores', country: 'South America' },
    { id: 'FAC', name: 'FA Cup', country: 'England' },
    { id: 'CDR', name: 'Copa del Rey', country: 'Spain' },
    { id: 'DFB', name: 'DFB-Pokal', country: 'Germany', aliases: 'German Cup' },
    { id: 'CI', name: 'Coppa Italia', country: 'Italy', aliases: 'Italian Cup' },
    { id: 'CDF', name: 'Coupe de France', country: 'France', aliases: 'French Cup' },
    { id: 'LGC', name: 'Leagues Cup', country: 'USA & Mexico' }
  ];
  const TOURNAMENTS = LEAGUES.map((l) => Object.assign({ type: l.id === 'UCL' ? 'Cup' : 'League' }, l)).concat(CUPS.map((c) => Object.assign({ type: c.national ? 'National teams' : 'Cup' }, c)));

  // Fixtures. date = 'YYYY-MM-DD', time = local 24h 'HH:MM'.
  // Live / full-time status is worked out from the real clock in app.js.
  const FIXTURES = [
    { id: 'm1', league: 'Premier League', date: '2026-11-05', time: '14:00', home: 'ARS', away: 'CHE', status: 'live', minute: 67, hs: 2, as: 1, featured: true },
    { id: 'm2', league: 'Premier League', date: '2026-11-05', time: '15:00', home: 'LIV', away: 'MCI', status: 'upcoming' },
    { id: 'm3', league: 'La Liga', date: '2026-11-05', time: '12:00', home: 'BAR', away: 'SEV', status: 'ft', hs: 3, as: 0 },
    { id: 'm4', league: 'La Liga', date: '2026-11-05', time: '15:00', home: 'RMA', away: 'VAL', status: 'upcoming' },
    { id: 'm5', league: 'Serie A', date: '2026-11-05', time: '14:45', home: 'INT', away: 'JUV', status: 'live', minute: 54, hs: 1, as: 1 },
    { id: 'm6', league: 'Bundesliga', date: '2026-11-05', time: '12:30', home: 'BAY', away: 'BVB', status: 'ft', hs: 2, as: 2 },
    { id: 'm7', league: 'MLS', date: '2026-11-05', time: '19:30', home: 'MIA', away: 'LAG', status: 'upcoming' },
    { id: 'm8', league: 'Champions League', date: '2026-11-05', time: '15:00', home: 'BRU', away: 'BAR', status: 'upcoming' },
    { id: 'm9', league: 'Liga MX', date: '2026-11-05', time: '22:00', home: 'AME', away: 'CHV', status: 'upcoming' },
    { id: 'm10', league: 'Brasileirão', date: '2026-11-05', time: '18:00', home: 'FLA', away: 'PAL', status: 'upcoming' },
    { id: 'f1', league: 'La Liga', date: '2026-11-01', time: '10:15', home: 'BAR', away: 'ELC', status: 'ft', hs: 4, as: 1 },
    { id: 'f2', league: 'Premier League', date: '2026-11-08', time: '12:30', home: 'SUN', away: 'ARS', status: 'upcoming' },
    { id: 'f3', league: 'La Liga', date: '2026-11-08', time: '15:00', home: 'BAR', away: 'CEL', status: 'upcoming' },
    { id: 'f4', league: 'MLS', date: '2026-11-09', time: '20:00', home: 'MIA', away: 'NSH', status: 'upcoming' },
    { id: 'f5', league: 'MLS', date: '2026-11-15', time: '19:30', home: 'MIA', away: 'ORL', status: 'upcoming' },
    { id: 'f6', league: 'Premier League', date: '2026-11-22', time: '11:30', home: 'ARS', away: 'TOT', status: 'upcoming' },
    { id: 'f7', league: 'La Liga', date: '2026-11-23', time: '10:00', home: 'BAR', away: 'ATH', status: 'upcoming' },
    { id: 'f8', league: 'Champions League', date: '2026-11-26', time: '15:00', home: 'ARS', away: 'BAY', status: 'upcoming' },
    { id: 'f9', league: 'Premier League', date: '2026-11-29', time: '11:30', home: 'CHE', away: 'ARS', status: 'upcoming' },
    { id: 'f10', league: 'La Liga', date: '2026-11-29', time: '08:00', home: 'BAR', away: 'ALA', status: 'upcoming' },
    { id: 'f11', league: 'Premier League', date: '2026-12-03', time: '14:30', home: 'ARS', away: 'LIV', status: 'upcoming' },
    { id: 'f12', league: 'La Liga', date: '2026-12-06', time: '15:00', home: 'RMA', away: 'BAR', status: 'upcoming' },
    { id: 'f13', league: 'Premier League', date: '2026-12-13', time: '10:00', home: 'MCI', away: 'ARS', status: 'upcoming' }
  ];

  // Match detail for the featured live match.
  const MATCH_DETAIL = {
    m1: {
      venue: 'Emirates Stadium',
      events: [
        { min: 12, type: 'goal', team: 'ARS', title: 'Goal — Saka', sub: 'Assist: Rice' },
        { min: 31, type: 'goal', team: 'CHE', title: 'Goal — Palmer', sub: 'Penalty' },
        { min: 40, type: 'yellow', team: 'CHE', title: 'Yellow card — Caicedo', sub: 'Foul' },
        { min: 46, type: 'sub', team: 'CHE', title: 'Substitution', sub: 'Nkunku on for Jackson' },
        { min: 58, type: 'goal', team: 'ARS', title: 'Goal — Ødegaard', sub: 'Assist: Saka' }
      ],
      players: [
        { name: 'Saka', role: 'ARS · RW', spots: [[80, 22, 140, .85], [62, 18, 110, .6], [88, 36, 90, .7], [45, 25, 90, .35], [70, 10, 80, .5]], stats: [['Touches', '48'], ['Distance', '8.1 km'], ['Shots', '3']] },
        { name: 'Ødegaard', role: 'ARS · CM', spots: [[55, 45, 150, .8], [68, 40, 120, .7], [42, 55, 100, .45], [75, 60, 90, .5], [60, 30, 90, .4]], stats: [['Touches', '61'], ['Distance', '9.4 km'], ['Passes', '44']] },
        { name: 'Palmer', role: 'CHE · AM', spots: [[30, 50, 140, .85], [38, 70, 110, .6], [22, 40, 100, .65], [50, 60, 90, .35], [18, 62, 80, .5]], stats: [['Touches', '39'], ['Distance', '7.6 km'], ['Shots', '2']] }
      ]
    }
  };


  // Skills tutorials: each step = title, body, tip, drill.
  const SKILLS = [
    { id: 'laces', cat: 'Shooting', name: 'Laces shot (driven shot)', level: 'Beginner', figs: true, steps: [
      ['Pick your target and approach at an angle', 'Look at the goal and choose a corner before you move. Start 3 to 5 steps back and slightly to the side of the ball, about 30°, so your hips can swing through. Make your last stride a little longer.', 'A straight-on run-up makes it hard to get your laces on the ball. Coming in at an angle lines it up for you.', 'Place a cone 4 steps back at an angle. Jog the run-up 10 times without kicking until the last long stride feels natural.'],
      ['Plant your standing foot beside the ball', 'Put your non-kicking foot next to the ball, about a hand-width to the side, with your toes pointing at your target. Bend that knee slightly to stay balanced.', 'Your standing foot aims the shot. If it points left, the ball usually goes left.', 'Walk up and plant next to a ball 10 times, then check: is the foot level with the ball and pointing at the target?'],
      ['Lock your ankle', 'Point the toes of your kicking foot down toward the ground and hold the ankle firm. You will strike with the hard, flat part on top of your foot: the laces.', 'A floppy ankle loses power. Think "foot like a hammer", not a flipper.', 'Drop a ball from your hands and hit it on the half-volley into a wall with a locked ankle. 10 reps each foot.'],
      ['Strike through the middle of the ball', 'Swing from the hip and hit the centre of the ball with your laces. Keep your head down, chest over the ball, and the knee of your kicking leg over the ball as you strike.', 'Knee over the ball keeps the shot low and hard. Leaning back sends it over the bar.', 'From 12–15 steps out, hit 10 shots at a wall or goal, aiming below waist height.'],
      ['Follow through toward the target', 'Keep swinging after contact so your kicking leg finishes pointing at the target. Land on your kicking foot and let your body move forward with the shot.', 'If you stop your leg at the ball, the shot dies. Let the leg carry through.', 'Shoot 10 times and freeze after landing: is your kicking foot ahead of you and pointing at the goal?'],
      ['Fix the common mistakes', 'Most problems come from three things: leaning back, a loose ankle, or a standing foot aimed the wrong way. Check them one at a time when shots go wrong.', 'Film yourself from the side with a phone. Body position is easier to see on video.', 'Take 20 shots: 5 to each corner. Count how many stay below the crossbar and on target.']
    ]},
    { id: 'finesse', cat: 'Shooting', name: 'Curled finesse shot', level: 'Intermediate', steps: [
      ['Choose the far post', 'Finesse shots work best curled toward the far corner, away from the keeper. Pick the spot just inside the far post before you shoot.', 'Aim a little wide of the post: the curl brings it back in.', 'Put a cone just outside the far post and try to bend 10 shots around it into the net.'],
      ['Open your body', 'Approach from a slight angle and plant your standing foot a little behind and beside the ball, so your hips can open toward the target.', 'Open hips let your leg wrap around the ball.', 'Practise the run-up and plant 10 times without the ball.'],
      ['Strike with the inside of your foot', 'Hit the outer half of the ball (the side away from your target) with the inside of your foot, near the big toe.', 'Off-centre contact is what makes the ball spin and curve.', 'From 10 steps out, pass the ball with spin into a wall. Watch it curve.'],
      ['Wrap your foot across the ball', 'Swing your leg across your body, so your foot brushes around the ball as it leaves.', 'Think "brush", not "smash". Placement beats power here.', '10 shots at 70% power, focusing only on the curl.'],
      ['Finish across your body', 'Your kicking leg should end up crossing in front of your standing leg, pointing past the target.', 'If your leg finishes straight at the goal, you probably hit it too centrally.', 'Shoot 20 times: 10 from the left side of the box, 10 from the right.'],
      ['Mix it up', 'Once the curl is reliable, add a little more power and practise with your weaker foot too.', 'Keepers read a player who always curls the same way. Have a second option.', 'Alternate finesse shots and laces shots, 10 of each.']
    ]},
    { id: 'knuckle', cat: 'Shooting', name: 'Knuckleball free kick', level: 'Advanced', steps: [
      ['Set the ball with the valve facing you', 'Many players place the valve toward their foot, because striking near it helps keep spin low. Set the ball, then take 4–5 steps straight back.', 'The goal is almost no spin: that makes the ball wobble and dip.', 'Practise setting up and stepping back the same way every time.'],
      ['Run up straight', 'Unlike the curled free kick, approach the ball almost in a straight line.', 'A straight run-up helps you hit the ball dead centre.', '10 run-ups, stopping at the ball, checking your line.'],
      ['Strike the centre-low part of the ball', 'Use a small area of the foot: the bony part between the laces and big toe. Hit through the middle, slightly below centre.', 'Any off-centre contact adds spin and kills the knuckle effect.', 'Mark a dot on the ball with tape and try to hit it 10 times.'],
      ['Short, punchy follow-through', 'Stop your leg quickly after contact instead of swinging all the way through. Many players hop forward onto the kicking foot.', 'A short, stabbing follow-through keeps spin to a minimum.', 'Hit 10 shots focusing only on a sharp stop after contact.'],
      ['Keep your body over the ball', 'Lean forward and keep your chest over the ball so the shot stays on target.', 'Leaning back sends it into the stands.', 'From 20–25 steps out, aim 10 shots at the middle of the goal.'],
      ['Read the ball\'s flight', 'Watch how the ball moves. Wobbling and dipping means low spin; curving means you hit off-centre.', 'This takes hundreds of reps. Don\'t worry if it only works sometimes.', 'Take 15 shots and count how many wobble.'],
      ['Practise at match distance', 'Put a wall (or cones) 9 metres from the ball and practise over it.', 'Real free kicks have a wall. Train for it.', 'Set 3 cones as a wall and take 15 free kicks over it.']
    ]},
    { id: 'volley', cat: 'Shooting', name: 'Volley', level: 'Intermediate', steps: [
      ['Watch the ball all the way', 'Keep your eyes on the ball from the moment it is in the air until your foot hits it.', 'Most missed volleys come from looking at the goal too early.', 'Have a friend toss the ball; just catch it on your foot 10 times.'],
      ['Get your body in line', 'Move so the ball will drop beside or slightly in front of you. Stay balanced on your standing leg.', 'Small adjusting steps help a lot.', 'Toss the ball up yourself and move under it 10 times.'],
      ['Lock the ankle, toes down', 'Point your toes down and keep the ankle firm, like the laces shot.', 'A loose ankle sends volleys anywhere.', 'Drop-volley into a wall: 10 each foot.'],
      ['Knee over the ball', 'Bring the knee of your kicking leg up and over the ball as you strike, to keep it down.', 'Knee below the ball = shot over the bar.', 'Volley 10 tosses, aiming below waist height.'],
      ['Short, controlled swing', 'Use a compact swing; the ball already has speed, so you need timing more than power.', 'Timing beats power on volleys.', '20 volleys from tosses at different heights.']
    ]},
    { id: 'chip', cat: 'Shooting', name: 'Chip shot', level: 'Intermediate', steps: [
      ['Spot the keeper off their line', 'A chip works when the goalkeeper has come forward. Glance up before you shoot.', 'The chip is a decision as much as a technique.', 'In small games, call "chip!" every time the keeper rushes out.'],
      ['Plant close to the ball', 'Put your standing foot slightly behind and close to the ball.', 'Planting behind helps you get under it.', 'Practise the plant 10 times.'],
      ['Stab under the ball', 'Use the laces or toes to scoop under the bottom of the ball, with a short jab.', 'Get under the ball, don\'t swing through it.', 'Chip 10 balls over a cone 3 metres away.'],
      ['Little or no follow-through', 'Stop your foot quickly after contact to add backspin and keep the ball soft.', 'Backspin makes the ball drop sooner.', 'Chip 10 balls into a target zone (a hoop or cones).'],
      ['Control the height', 'You need just enough height to clear the keeper, not a rainbow.', 'Too high gives defenders time to recover.', 'Chip over a friend standing 4 metres away, 10 times.']
    ]},
    { id: 'stepover', cat: 'Dribbling', name: 'Step-over', level: 'Beginner', steps: [
      ['Approach the defender with the ball close', 'Dribble toward the defender at a controlled pace with the ball near your feet.', 'Too fast and you lose control; too slow and they close you down.', 'Dribble between two cones 10 metres apart, keeping the ball within one step.'],
      ['Swing your foot around the ball', 'Lift your foot and circle it over the ball from the inside to the outside, without touching it.', 'Keep it quick and low — a big slow step-over is easy to read.', 'Do 20 stationary step-overs, alternating feet.'],
      ['Sell it with your body', 'Drop your shoulder and lean in the direction of the step-over, as if you are going that way.', 'The body feint is what fools the defender, not the foot.', 'Practise in a mirror: does it look like you are going that way?'],
      ['Push the ball the other way', 'Plant the step-over foot and use the outside of your other foot to push the ball the opposite way.', 'Explode after the push: the change of speed is the skill.', 'Step-over then push past a cone, 10 times each side.'],
      ['Accelerate away', 'Sprint 3–4 steps after the push to get past the defender.', 'A skill without acceleration just gives the ball back.', 'Do it against a passive friend 10 times.']
    ]},
    { id: 'cruyff', cat: 'Dribbling', name: 'Cruyff turn', level: 'Beginner', steps: [
      ['Fake a pass or cross', 'Dribble forward and shape your body as if you are about to pass or cross.', 'The fake needs to look real for the turn to work.', 'Practise the fake motion 10 times without the ball.'],
      ['Plant beside the ball', 'Plant your standing foot slightly in front of and beside the ball.', 'This leaves room to drag the ball behind you.', 'Plant beside a still ball 10 times.'],
      ['Drag the ball behind your standing leg', 'Instead of kicking, use the inside of your kicking foot to push the ball back behind your standing leg.', 'Push, don\'t kick. Small, controlled touch.', '10 drags each foot, stationary.'],
      ['Turn and go', 'Spin your body in the direction of the ball and accelerate away.', 'Turn your body fast; the ball only moves a little.', 'Dribble, Cruyff turn at a cone, sprint back. 10 reps.'],
      ['Use it in games', 'It is great near the sideline when defenders expect a cross.', 'Look up before you turn so you know where the space is.', 'Play 1v1 and try it 5 times.']
    ]},
    { id: 'croqueta', cat: 'Dribbling', name: 'La Croqueta', level: 'Intermediate', steps: [
      ['Keep the ball in the middle', 'Have the ball right between your feet as the defender comes in.', 'Being balanced is key: you need both feet ready.', 'Tap the ball side to side between your feet 30 times.'],
      ['Touch it across with one foot', 'Use the inside of one foot to roll the ball sideways across your body.', 'Quick and short — about one ball-width.', '10 touches each way.'],
      ['Catch it with the other foot', 'Immediately touch it forward with the inside of your other foot.', 'The two touches should feel like one smooth motion.', '20 two-touch croquetas, slowly then faster.'],
      ['Time it against the defender', 'Do it just as the defender sticks a leg out, so the ball slips past their foot.', 'Too early and they adjust; too late and they win it.', 'Play 1v1 against a friend and try it 10 times.'],
      ['Accelerate through the gap', 'After the move, burst forward into the space.', 'The move creates space; the sprint uses it.', 'Croqueta past a cone and sprint 5 steps, 10 reps.']
    ]},
    { id: 'elastico', cat: 'Dribbling', name: 'Elastico', level: 'Advanced', steps: [
      ['Start with the ball on your strong foot', 'Have the ball just in front of your dominant foot.', 'This move needs a soft touch, so master the basic dribble first.', 'Dribble slowly with only the outside of your foot, 20 touches.'],
      ['Push out with the outside of the foot', 'Push the ball a little outward with the outside of your foot.', 'Keep the touch tiny so you can bring it back.', '10 small outside pushes.'],
      ['Snap it back with the inside', 'Without lifting your foot, quickly bring it around the ball and pull it back across with the inside.', 'It should feel like an elastic band snapping back.', 'Practise the snap slowly, stationary, 20 reps.'],
      ['Sell the first direction', 'Lean your body the way of the first push to make the defender commit.', 'The bigger the fake, the more space you get.', 'Do it in a mirror to check your lean.'],
      ['Speed it up', 'Once smooth, make the push and snap one fast movement.', 'Speed comes from practice, not force.', '10 elasticos at full speed, then 10 past a cone.'],
      ['Use it in 1v1s', 'Best when a defender is square on to you and close.', 'Don\'t try it when you\'re surrounded — keep it simple.', 'Play 1v1 and try it 5 times.']
    ]},
    { id: 'pass', cat: 'Passing', name: 'Inside-foot pass', level: 'Beginner', steps: [
      ['Plant beside the ball, pointing at the target', 'Place your standing foot beside the ball with toes pointing where you want the pass to go.', 'Your standing foot aims the pass.', 'Plant 10 times and check your aim.'],
      ['Turn your kicking foot out', 'Open your kicking foot so the inside of the foot faces the ball, ankle locked.', 'A locked ankle makes the pass firm and accurate.', 'Hold the position for 5 seconds, 5 times.'],
      ['Strike the middle of the ball', 'Hit through the centre of the ball with the inside of your foot.', 'Hitting high or low makes the pass bounce or float.', 'Pass against a wall from 5 metres, 20 times.'],
      ['Follow through to the target', 'Let your foot continue toward your target after contact.', 'Follow-through equals accuracy.', 'Pass through two cones a step apart, 20 times.'],
      ['Weight it right', 'Pass hard enough to arrive quickly but soft enough to control.', 'Good passes make the receiver\'s job easy.', 'Pass with a friend at 10 metres, 50 passes.']
    ]},
    { id: 'longball', cat: 'Passing', name: 'Driven long ball', level: 'Intermediate', steps: [
      ['Look up and pick your target', 'Check where your teammate is running before you strike.', 'Pass into space in front of them, not to their feet.', 'Practise scanning: look up 3 times before each pass.'],
      ['Approach at an angle', 'Come in from a slight angle like the laces shot.', 'The angle lets your leg swing through freely.', '10 run-ups without kicking.'],
      ['Strike slightly below centre', 'Hit just below the middle of the ball with your laces to get some lift.', 'Too low and it balloons; too high and it skids.', 'Hit 10 balls to a friend 25 metres away.'],
      ['Lean slightly back', 'A small lean back helps the ball rise, but keep it controlled.', 'Much less lean than a lob, much more than a shot.', 'Experiment with lean on 10 passes.'],
      ['Follow through high', 'Finish with your leg swinging up toward the target.', 'The follow-through decides the height.', '20 long balls into a marked zone.'],
      ['Switch the play in games', 'Use it to move the ball to the other side of the pitch quickly.', 'Long balls work best when you play them early.', 'In small games, try 3 switches.']
    ]},
    { id: 'outside', cat: 'Passing', name: 'Outside-foot pass (trivela)', level: 'Advanced', steps: [
      ['Point your toes in and down', 'Turn your kicking foot inward and point the toes down.', 'This shape exposes the outside of your foot.', 'Hold the shape for 5 seconds, 5 times.'],
      ['Approach almost straight', 'Run up nearly straight at the ball.', 'Coming from the side makes it hard to use the outside.', '10 run-ups without the ball.'],
      ['Strike the inner side of the ball', 'Hit the side of the ball closest to your standing leg with the outside of your foot.', 'This makes the ball curve away from you.', 'Pass 10 balls at a wall and watch the curve.'],
      ['Flick across your body', 'Swing your leg slightly across and outward through contact.', 'A small flick adds the spin.', '20 passes, alternating soft and firm.'],
      ['Use it to surprise', 'Great for passing without changing your body shape.', 'Defenders don\'t expect a pass from that foot position.', 'In small games, try 3 outside-foot passes.'],
      ['Practise both directions', 'Get good with your weak foot too.', 'It doubles your options.', '10 with each foot.']
    ]},
    { id: 'cushion', cat: 'First touch', name: 'Cushion control', level: 'Beginner', steps: [
      ['Get in line with the ball', 'Move your body so you are behind the ball as it arrives.', 'Good control starts with good positioning.', 'A friend rolls balls to you; move into line 10 times.'],
      ['Pick your controlling surface', 'Decide early: inside of the foot, thigh, or chest.', 'Deciding late makes the touch messy.', 'Call out the surface before each ball arrives.'],
      ['Relax and give with the ball', 'As the ball touches you, pull that part back slightly to soak up the speed.', 'Think of catching an egg.', 'Control 20 throws so the ball stops dead.'],
      ['Touch it into space', 'Control the ball a step away from pressure, ready for your next move.', 'Your first touch should set up your second.', 'Control 10 balls left, 10 right.'],
      ['Look up after the touch', 'Get your head up as soon as the ball is under control.', 'Scanning early means faster decisions.', 'Have a friend hold up fingers; call the number after each touch.']
    ]},
    { id: 'chest', cat: 'First touch', name: 'Chest control', level: 'Intermediate', steps: [
      ['Watch the ball coming in', 'Track the ball\'s height early and move under it.', 'Late movement = ball off your face or shoulder.', 'Catch 10 high throws to practise reading the flight.'],
      ['Arch back and open your chest', 'Lean back slightly, arms out for balance, chest up toward the ball.', 'Arms out keep you balanced and legal.', 'Practise the shape 10 times.'],
      ['Let the chest absorb it', 'As the ball hits, sink slightly and breathe out to soften the touch.', 'A stiff chest makes the ball bounce away.', 'Chest down 15 throws.'],
      ['Steer it down to your feet', 'Turn your shoulders slightly to direct the ball to your stronger foot.', 'Aim the drop where your next touch will be.', 'Chest the ball to your right foot 10 times, then left.'],
      ['Play your next move fast', 'Pass, shoot, or dribble right after the ball drops.', 'Control is only useful if you do something with it.', 'Chest and pass to a friend, 10 times.']
    ]}
  ];

  // Goal minutes for sample games: [minute, 'H' home / 'A' away]. Scores build up live from these.
  const GOALS = {
    m1: [[12, 'H'], [31, 'A'], [58, 'H']],
    m2: [[23, 'A'], [77, 'H']],
    m3: [[9, 'H'], [44, 'H'], [71, 'H']],
    m4: [[35, 'H'], [88, 'H']],
    m5: [[20, 'A'], [49, 'H']],
    m6: [[15, 'H'], [38, 'A'], [62, 'A'], [84, 'H']],
    m7: [[11, 'H'], [40, 'A'], [66, 'H'], [90, 'H']],
    m8: [[27, 'A'], [55, 'H'], [79, 'A']],
    m9: [],
    m10: [[30, 'H'], [52, 'A'], [86, 'H']],
    f1: [[4, 'H'], [29, 'H'], [51, 'A'], [63, 'H'], [80, 'H']]
  };

  return { TEAMS, TEAM_GROUPS, LEAGUES, TOURNAMENTS, FIXTURES, MATCH_DETAIL, SKILLS, GOALS };
})();
