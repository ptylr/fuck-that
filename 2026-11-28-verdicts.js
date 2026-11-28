// Original verdict copy. Each bank retains the established score-band meaning.
// Page-local allocation prevents repetition without changing the weather or score.
const FTGVerdicts = (() => {
  'use strict';
  const copyBanks = [
    {
      max: 1, name: 'Absolutely playing',
      lines: [
        'We’re 100% fucking playing.',
        'Clubs in. Excuses out.',
        'Even the sofa’s telling you to go.',
        'The pub can wait for the nineteenth.',
        'A convincing case for avoiding the housework.',
        'Stop scrolling. Start finding your golf shoes.',
        'Your afternoon has found a better offer.',
        'The group chat can finally agree on something.',
        'A round? Don’t mind if we bloody do.',
        'Your clubs didn’t buy themselves to sit there.',
        'This one’s worth getting off your arse for.',
        'Put the kettle down. Pick the clubs up.',
        'The only excuse left is your swing.',
        'Cancel the dramatic withdrawal speech.',
        'The sofa has lost this argument.',
        'Time to turn enthusiasm into questionable golf.',
        'A strong argument for disappearing to the first tee.',
        'Your golf bag would like a word. Outside.',
        'All in. Even the reluctant bastard.',
        'The domestic jobs have been narrowly outvoted.',
        'Four hours of golf has made a compelling bid.',
        'The answer’s yes. Your handicap remains your problem.',
        'This deserves clubs, not another committee meeting.',
        'Get out there. The washing-up lacks ambition.',
      ],
      starts: ['Clubs at the ready.', 'Golf wins this one.', 'The first tee is calling.', 'A round gets our vote.', 'Strong yes from us.', 'The sofa can sulk.', 'Consider us persuaded.', 'This looks properly tempting.', 'Time for some actual golf.', 'The excuses are looking thin.', 'We’d be reaching for the bag.', 'The shortlist has a front-runner.', 'Enthusiasm has entered the chat.', 'The kettle can wait.', 'A decisive vote for golf.', 'The golf bag has our attention.'],
      ends: ['Let the housework form a queue.', 'Your swing can supply the drama.', 'Save the pub for afterwards.', 'The group chat can stand down.', 'Take the hint, you daft sod.', 'Your shoes deserve an outing.', 'Stop negotiating with the cushions.', 'Go and lower expectations on the first tee.', 'Put the heroic excuses away.', 'The ironing has had a good run.', 'Your handicap can write its own apology.', 'Let the sofa know gently.', 'Leave the long debate for the nineteenth.', 'The spare balls know their duty.', 'Give the lawnmower the bad news.', 'Time to make some deeply average contact.'],
    },
    {
      max: 3, name: 'Get the clubs in',
      lines: [
        'Get the bloody clubs in.',
        'Looks worth a round. Behave yourself.',
        'A yes with very little convincing required.',
        'Less forecast debate. More finding your tees.',
        'Golf is making a better offer than the sofa.',
        'You’ve played for flimsier reasons than this.',
        'A decent shout for some indecent golf.',
        'Put your name down. Moan on the way round.',
        'A round sounds considerably better than chores.',
        'Go on, then. The clubs could use the attention.',
        'The excuses department is running out of stock.',
        'Worth packing the bag and blaming your swing.',
        'The group chat has talked itself into worse.',
        'A little less bollocks. A little more golf.',
        'Give the armchair the afternoon off.',
        'We’d be checking tee times, not television listings.',
        'Looks like golf has won the afternoon.',
        'Tempting enough to abandon a perfectly good cushion.',
        'There’s a round here with your name on it.',
        'The clubs are edging towards the car.',
        'A respectable reason for another lost ball.',
        'Put the waterproofs in. Leave the excuses out.',
        'We’d fancy it. Our swing might disagree.',
        'The sofa can manage without your supervision.',
      ],
      starts: ['Looks worth a go.', 'We’d fancy a round.', 'The clubs get our vote.', 'A pretty convincing yes.', 'Golf has the upper hand.', 'The bag is looking useful.', 'We’re leaning towards the tee.', 'There’s a decent case for it.', 'This one looks tempting.', 'A round is winning the argument.', 'We’d be giving it a go.', 'The afternoon has golf potential.', 'The excuses aren’t convincing us.', 'Worth making the effort.', 'The first tee looks tempting.', 'A yes, with the usual grumbling.'],
      ends: ['Your swing can handle the disappointment.', 'Save the lengthy complaint for the clubhouse.', 'Let the sofa fend for itself.', 'You can complain between shots.', 'Pack a sense of humour with the tees.', 'The group chat has endured enough.', 'No need for a royal commission.', 'The chores will bravely wait.', 'There are worse ways to annoy a golf ball.', 'The pub will still exist afterwards.', 'Try not to make a whole speech about it.', 'Your bag deserves some fresh air.', 'Take the clubs and a modest set of expectations.', 'Someone has to keep the bunkers company.', 'The cushions have had enough of you.', 'The scorecard can provide the swearing.'],
    },
    {
      max: 4.5, name: 'Leaning towards playing',
      lines: [
        'There’s always one packing the clubs.',
        'Could be talked into it. Don’t make a speech.',
        'Golf leads the vote. Recounts are still possible.',
        'The clubs are by the door. We’re still negotiating.',
        'More yes than no. Less enthusiasm than advertised.',
        'A round is edging ahead of a lie-in.',
        'We’d probably go. We’d definitely moan.',
        'The first tee has a narrow lead over the sofa.',
        'Tempting. In a muttering-under-your-breath sort of way.',
        'A yes wearing a slightly reluctant expression.',
        'The keen mate has almost made their case.',
        'You could sell us this round. Keep the pitch short.',
        'The golf bag is winning on points.',
        'A round? Probably. An inspirational speech? Absolutely not.',
        'We’ve not said no. Apparently that counts as progress.',
        'The clubs are interested. The rest of us needs coffee.',
        'A tentative yes from the complaints department.',
        'We’re hovering near the car keys.',
        'Just enough temptation to interrupt a good sit-down.',
        'Likely playing. Likely mentioning the sacrifice.',
        'The group chat might actually pull this off.',
        'A round is looking plausible. Our dignity less so.',
        'Nearly sold. Throw in a good bit of banter.',
        'We’re packing the bag with moderate reluctance.',
      ],
      starts: ['Leaning towards a round.', 'A tentative yes.', 'Golf has a narrow lead.', 'We could be persuaded.', 'Probably worth an outing.', 'The bag is nearly packed.', 'There’s enough temptation here.', 'A cautious vote for golf.', 'The first tee is edging it.', 'We’re almost convinced.', 'A round is in contention.', 'Not quite an enthusiastic yes.', 'The keen mate has a point.', 'We’re giving it serious thought.', 'Golf might win this argument.', 'A grudging yes is forming.'],
      ends: ['Expect a running commentary of complaints.', 'Keep the pep talk mercifully short.', 'No need to alert the national press.', 'The sofa is demanding a recount.', 'Your mates may need a little more coffee.', 'Don’t mistake this for a lifetime commitment.', 'Someone will still call it character-building.', 'We reserve the right to have a moan.', 'The group chat may require gentle bribery.', 'Our enthusiasm comes with small print.', 'The spare jumper is invited too.', 'We’re not writing a motivational poster.', 'Our heroic sacrifice will be mentioned.', 'Keep a little sympathy in reserve.', 'The pub is still on the substitutes’ bench.', 'Let’s not make a bloody ceremony of it.'],
    },
    {
      max: 6, name: 'Could be tempted',
      lines: [
        'Could be tempted. Could be the pub.',
        'The clubs and the bar stool are level on points.',
        'A round or a pint? The committee is divided.',
        'Not a yes. Not quite a fuck that.',
        'The bag’s packed. The excuses are packed too.',
        'Golf has submitted a bid. The sofa is considering it.',
        'One good argument away from either decision.',
        'We’re on the fence. It has a lovely view of the pub.',
        'A coin toss with considerable muttering.',
        'The first tee and the nineteenth are in negotiations.',
        'Could go either way. Much like the opening drive.',
        'Your keen mate and your sensible mate have equal airtime.',
        'The tee time is looking distinctly negotiable.',
        'A round is possible. So is a very long lunch.',
        'Half the group is packing. Half is finding excuses.',
        'The forecast debate has entered extra time.',
        'Our enthusiasm is sitting on the bloody fence.',
        'A maybe with a suspicious eye on the clubhouse.',
        'Nobody’s winning this argument before the second coffee.',
        'The clubs are in the car. We might not be.',
        'There’s golf potential. There’s pub potential too.',
        'We could play. We could make a better lunch decision.',
        'Temptation and common sense are having a proper scrap.',
        'Still deciding. The sofa has excellent legal representation.',
      ],
      starts: ['A genuine toss-up.', 'The jury is still out.', 'We’re firmly on the fence.', 'Could be a round.', 'A pint is also in contention.', 'No decisive vote yet.', 'The clubs are under consideration.', 'A proper maybe.', 'Both options have supporters.', 'The afternoon is undecided.', 'Golf and comfort are neck and neck.', 'The group chat is split.', 'We’re still weighing it up.', 'The tee time is negotiable.', 'Enthusiasm is taking advice.', 'No clear winner here.'],
      ends: ['The pub has made a strong counter-offer.', 'The sofa’s campaign is well funded.', 'Ask again after the coffee.', 'There will be unnecessary committee minutes.', 'The keen mate is still lobbying.', 'A persuasive text could swing this.', 'Keep both sets of excuses handy.', 'A long lunch has entered the debate.', 'The car keys remain on probation.', 'Nobody appoint the enthusiastic one chair.', 'This meeting could have been a pint.', 'Prepare for an entirely circular group chat.', 'The golf bag is awaiting instructions.', 'The armchair has requested equal speaking time.', 'Common sense and golf are refusing to compromise.', 'Neither side has conceded the afternoon.'],
    },
    {
      max: 7.5, name: 'Leaning towards sitting it out',
      lines: [
        'Even your all-weather mate’s checking the fucking radar.',
        'We’d need a bloody convincing reason.',
        'The pub is leading by several persuasive pints.',
        'Golf is losing this argument quite badly.',
        'The bag can stay packed. We’ll stay put.',
        'A reluctant maybe, leaning heavily towards absolutely not.',
        'Our enthusiasm has asked to work from home.',
        'The sofa has produced a very strong manifesto.',
        'You could go. We’d be difficult to recruit.',
        'The keen mate is doing a lot of the heavy lifting.',
        'The first tee needs a much better sales pitch.',
        'A round is fighting a losing battle with comfort.',
        'The excuses are starting to sound like good judgement.',
        'We’re a long way from reaching for the car keys.',
        'Considerable golf reluctance. Minimal pub reluctance.',
        'The group chat is drafting its withdrawal statement.',
        'We’d rather admire the golf bag from a chair.',
        'Not impossible. Just increasingly hard to justify.',
        'A lot of effort to end up discussing the pub anyway.',
        'The cancellation argument has found its feet.',
        'The armchair is making some excellent points.',
        'Our interest is leaving quietly through the side door.',
        'The keen mate might play. We might mute the chat.',
        'The sensible option is looking suspiciously comfortable.',
      ],
      starts: ['We’re leaning towards staying put.', 'Golf is losing the vote.', 'A round looks hard to justify.', 'The sofa is pulling ahead.', 'Our enthusiasm is thinning out.', 'Not much temptation here.', 'We’d take some persuading.', 'The first tee is on the back foot.', 'Comfort has a convincing lead.', 'The bag may be staying home.', 'A reluctant no is forming.', 'The pub is looking more appealing.', 'The keen mate has work to do.', 'We’re struggling to fancy it.', 'Golf has a weak hand.', 'The excuses sound increasingly reasonable.'],
      ends: ['The group chat will survive the disappointment.', 'Someone else can deliver the motivational speech.', 'The sofa has retained excellent counsel.', 'We’re not volunteering to prove a point.', 'A better offer would help considerably.', 'The kettle is a persuasive negotiator.', 'We’ve heard more convincing excuses for a meeting.', 'Our spare jumper has abstained from the vote.', 'The golf bag can have a quiet afternoon.', 'The pub has submitted fewer objections.', 'We’ll let the enthusiastic one make the case.', 'Our car keys have gone conspicuously quiet.', 'The armchair is not short of supporters.', 'A heroic speech won’t improve the score.', 'We reserve the right to be entirely unimpressed.', 'The first tee may have to cope without us.'],
    },
    {
      max: 9, name: 'Strongly prefer not playing',
      lines: [
        'Fuck that. Pub?',
        'The clubs can sit this one out.',
        'We’re voting for the nineteenth without the first eighteen.',
        'The sofa wins. No recount required.',
        'A round? We’ve got a better idea involving chairs.',
        'The golf bag has been granted compassionate leave.',
        'Our enthusiasm has left the building.',
        'That’s a no from the complaints committee.',
        'The first tee can leave a voicemail.',
        'We’ll be pursuing other sitting-down opportunities.',
        'The car keys have voted against it.',
        'Some rounds are worth the effort. We’d pass on this one.',
        'The pub argument has won by a landslide.',
        'We’re declining with considerable fucking enthusiasm.',
        'A great day to give the golf bag some space.',
        'The armchair has secured a clear majority.',
        'We’ve inspected the numbers. We prefer lunch.',
        'The keen mate can write the trip report.',
        'We’ll save the questionable decisions for another day.',
        'The clubs have been politely asked to stand down.',
        'Our official position is elsewhere.',
        'The round has failed to secure our support.',
        'Put the bag down. This debate is over.',
        'The clubhouse looks better without the preceding golf.',
      ],
      starts: ['We’d give this a miss.', 'A firm vote for sitting it out.', 'Golf loses this round.', 'The first tee gets a no.', 'We’re not persuaded.', 'Comfort wins comfortably.', 'The bag can stay home.', 'We’d pass on this one.', 'No round on our recommendation.', 'The sofa has a clear majority.', 'That’s a fairly decisive no.', 'We’re choosing another afternoon plan.', 'The pub has won the argument.', 'The clubs can take the day off.', 'Our enthusiasm has clocked out.', 'We’re withdrawing from the committee.'],
      ends: ['The cushions deserve their moment.', 'The keen mate can cope with a difference of opinion.', 'A proper lunch sounds considerably better.', 'The car keys are relieved.', 'No need for a tragic farewell speech.', 'The group chat can find another argument.', 'We’ll make peace with the unused tees.', 'The kettle has our full support.', 'Our golf shoes will manage the disappointment.', 'The armchair has earned this victory.', 'There are other ways to avoid the housework.', 'The nineteenth can operate independently.', 'The spare balls can breathe again.', 'No recount from the golf bag, please.', 'We’ll resume bad golf at a later date.', 'The scorecard can have a quiet day.'],
    },
    {
      max: Infinity, name: 'Absolutely not playing',
      lines: [
        'Absolutely not fucking playing.',
        'A hard no. The clubs can stand down.',
        'Not even the keen mate needs to prove this point.',
        'The tee time can wait. We’re sitting this out.',
        'That’s a no with the volume turned up.',
        'Our golf ambition has officially clocked off.',
        'The bag stays put. End of fucking meeting.',
        'We’re giving the round a very wide berth.',
        'The first tee gets our sincere lack of interest.',
        'No medals are being awarded for stubbornness.',
        'The group chat can cancel the heroic speeches.',
        'We’re not turning this into a character test.',
        'Absolutely no appetite for this round.',
        'The clubs are enjoying an unscheduled day off.',
        'The cancellation case has no serious opposition.',
        'The sensible vote is a resounding fuck that.',
        'Leave the clubs alone. They’ve suffered enough.',
        'This one can happen another day.',
        'Our answer is no. The extended answer is fuck no.',
        'The round can survive without our participation.',
        'We’re choosing a different use of the afternoon.',
        'The golf bag has been formally stood down.',
        'Not a round we’d be volunteering for.',
        'A decisive withdrawal from the first-tee debate.',
      ],
      starts: ['Absolutely not for us.', 'We’re firmly sitting this out.', 'A hard no to this round.', 'The tee time can wait.', 'The clubs are standing down.', 'No appetite for this one.', 'We’re giving this a miss.', 'A resounding vote against playing.', 'The golf bag stays put.', 'This round gets a decisive no.', 'No heroic effort required.', 'We’re not volunteering.', 'The first tee will have to wait.', 'The decision is a firm no.', 'Not our idea of a round.', 'Our enthusiasm has formally withdrawn.'],
      ends: ['Stubbornness is not a golfing qualification.', 'No need to audition for the all-weather role.', 'The group chat can spare us the bravery contest.', 'We can be daft another day.', 'The clubs will cope with the disappointment.', 'Let someone else chair the cancellation meeting.', 'There’s no trophy for ignoring your better judgement.', 'The scorecard is not worth a hero narrative.', 'The round can be reconsidered another day.', 'We’re declining the motivational speech as well.', 'The golf shoes can stand easy.', 'The keen mate is allowed a day off too.', 'A later round can supply the swearing.', 'No one needs to prove their commitment to a golf ball.', 'Our ambition has found something else to do.', 'The bag doesn’t need an inspirational quote.'],
    },
  ];
  function combine(max,inclusive,name,indexes){
    return {max,inclusive,name,lines:indexes.flatMap(i=>copyBanks[i].lines),starts:[...new Set(indexes.flatMap(i=>copyBanks[i].starts))],ends:[...new Set(indexes.flatMap(i=>copyBanks[i].ends))]};
  }
  const banks=[combine(4,true,'Great',[0,1]),combine(9,false,'Questionable',[2,3,4]),combine(10,true,'Fuck that',[5,6])];
  const extras = [
    'Check again before making plans.', 'Keep an eye on the forecast.', 'The numbers can change.', 'Check the detail before deciding.',
    'Leave the final call to the group.', 'That’s our steer for the round.', 'Keep the score in perspective.', 'The detail is worth a look.',
    'It’s a steer, not a booking.', 'The group can have the last word.', 'Check again nearer tee time.', 'Other opinions are available.',
    'The group chat may disagree.', 'You know your own appetite for golf.', 'Nobody appointed us captain.', 'That’s the verdict for now.',
  ];
  const highExtras = [
    'Check official warnings.', 'Check the club before travelling.', 'Official advice comes first.', 'Check warnings before making plans.',
    'No score overrides a warning.', 'The club can confirm playing arrangements.', 'Don’t treat this score as a safety clearance.', 'Check the forecast detail too.',
    'Club-open status needs its own check.', 'Follow official advice.', 'No score replaces a warning.', 'The forecast detail still matters.',
    'Check current local advice.', 'The course can wait.', 'Conditions need a fresh check.', 'Leave the heroics out of it.',
  ];
  const pools = banks.map(b => [...b.lines, ...b.starts.flatMap(start => b.ends.map(end => `${start} ${end}`))]);
  const hash = value => {
    let n = 2166136261;
    for (const c of String(value)) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
    return n >>> 0;
  };
  const band = value => {
    if (!Number.isFinite(value) || value < 0 || value > 10) throw new RangeError('Verdict needs a score from zero to ten');
    return banks.findIndex(b => b.inclusive ? value <= b.max : value < b.max);
  };
  function createPageAllocator(seed = `${Date.now()}|${Math.random()}`) {
    const assigned = new Map(), used = new Set();
    function label(value, key) {
      const index = band(value), previous = assigned.get(key);
      if (previous?.band === index) return previous.text;
      if (previous) used.delete(previous.text);
      const pool = pools[index], start = hash(`${seed}|${key}|${index}`) % pool.length;
      let text;
      for (let offset = 0; offset < pool.length; offset++) {
        const candidate = pool[(start + offset) % pool.length];
        if (!used.has(candidate)) { text = candidate; break; }
      }
      // A very large same-band list gets further natural, band-safe variations.
      // Never wrap back to a repeated verdict when the short bank is exhausted.
      if (!text) {
        const tails = index === banks.length - 1 ? highExtras : extras;
        outer: for (const base of pool) for (const tail of tails) {
          const candidate = `${base} ${tail}`;
          if (!used.has(candidate)) { text = candidate; break outer; }
        }
      }
      if (!text) throw new RangeError('Page verdict capacity exceeded; extend the copy bank rather than repeat a message');
      assigned.set(key, { band:index, text }); used.add(text);
      return text;
    }
    return { label };
  }
  return { banks, pools, band, createPageAllocator };
})();
if (typeof module !== 'undefined') module.exports = FTGVerdicts;
