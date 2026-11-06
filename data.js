/* Matchday — sample data.
   Everything here is demo content until a live data feed is connected.
   Swap the functions in DataSource (app.js) to load real data later. */

window.MD_DATA = (function () {
  const TEAMS = {
    ARS: { name: 'Arsenal', color: '#DB0007', league: 'Premier League' },
    CHE: { name: 'Chelsea', color: '#034694', league: 'Premier League' },
    LIV: { name: 'Liverpool', color: '#C8102E', league: 'Premier League' },
    MCI: { name: 'Man City', color: '#6CABDD', league: 'Premier League' },
    SUN: { name: 'Sunderland', color: '#EB172B', league: 'Premier League' },
    TOT: { name: 'Tottenham', color: '#132257', league: 'Premier League' },
    BAR: { name: 'Barcelona', color: '#A50044', league: 'La Liga' },
    SEV: { name: 'Sevilla', color: '#D7191C', league: 'La Liga' },
    RMA: { name: 'Real Madrid', color: '#FEBE10', league: 'La Liga' },
    VAL: { name: 'Valencia', color: '#EE3524', league: 'La Liga' },
    CEL: { name: 'Celta Vigo', color: '#8AC3EE', league: 'La Liga' },
    ATH: { name: 'Athletic Club', color: '#EE2523', league: 'La Liga' },
    ELC: { name: 'Elche', color: '#05642C', league: 'La Liga' },
    ALA: { name: 'Alavés', color: '#0761AF', league: 'La Liga' },
    INT: { name: 'Inter', color: '#0068A8', league: 'Serie A' },
    JUV: { name: 'Juventus', color: '#BBBBBB', league: 'Serie A' },
    BAY: { name: 'Bayern Munich', color: '#DC052D', league: 'Bundesliga' },
    BVB: { name: 'Dortmund', color: '#FDE100', league: 'Bundesliga' },
    MIA: { name: 'Inter Miami', color: '#F7B5CD', league: 'MLS' },
    LAG: { name: 'LA Galaxy', color: '#00245D', league: 'MLS' },
    NSH: { name: 'Nashville', color: '#ECE83A', league: 'MLS' },
    ORL: { name: 'Orlando City', color: '#633492', league: 'MLS' },
    BRU: { name: 'Club Brugge', color: '#0067CE', league: 'Champions League' },
    AME: { name: 'América', color: '#FFD700', league: 'Liga MX' },
    CHV: { name: 'Chivas', color: '#CD1F2D', league: 'Liga MX' },
    PAL: { name: 'Palmeiras', color: '#006437', league: 'Brasileirão' },
    FLA: { name: 'Flamengo', color: '#C52613', league: 'Brasileirão' }
  };

  const LEAGUES = [
    { id: 'PL', name: 'Premier League', country: 'England' },
    { id: 'LL', name: 'La Liga', country: 'Spain' },
    { id: 'SA', name: 'Serie A', country: 'Italy' },
    { id: 'BL', name: 'Bundesliga', country: 'Germany' },
    { id: 'MLS', name: 'MLS', country: 'USA' },
    { id: 'UCL', name: 'Champions League', country: 'Europe' },
    { id: 'MX', name: 'Liga MX', country: 'Mexico' },
    { id: 'BR', name: 'Brasileirão', country: 'Brazil' }
  ];

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

  return { TEAMS, LEAGUES, FIXTURES, MATCH_DETAIL, SKILLS, GOALS };
})();
