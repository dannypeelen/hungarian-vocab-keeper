import { VocabCard, Tag } from './types';
import { v4 as uuidv4 } from 'uuid';

function card(hungarian: string, english: string, tags: Tag[], example?: string, exampleTranslation?: string, notes?: string): VocabCard {
  return {
    id: uuidv4(),
    hungarian,
    english,
    tags,
    example,
    exampleTranslation,
    notes,
    createdAt: new Date().toISOString(),
    reviewCount: 0,
    correctCount: 0,
    streak: 0,
    mastery: 0,
  };
}

export const SEED_CARDS: VocabCard[] = [
  // ═══════════════════════════════════════════════
  // VONZATOK — Verb + case government phrases
  // ═══════════════════════════════════════════════
  card('meghatároz vmire', 'to determine/define for something', ['vonzat', 'verb'], 'Ez az élmény meghatározta az egész életére.', 'This experience defined him for his entire life.'),
  card('tudomást venni vmiről', 'to take notice of something', ['vonzat', 'phrase'], 'Nem hajlandó tudomást venni a problémáról.', 'He refuses to take notice of the problem.'),
  card('rászánja magát vmire', 'to bring oneself to do something', ['vonzat', 'verb'], 'Végre rászánta magát a költözésre.', 'He finally brought himself to move.'),
  card('számot vetni vmivel', 'to reckon with something', ['vonzat', 'phrase'], 'Számot kell vetnünk a következményekkel.', 'We must reckon with the consequences.'),
  card('igényt tartani vmire', 'to lay claim to something', ['vonzat', 'phrase'], 'Igényt tart az örökségre.', 'She lays claim to the inheritance.'),
  card('szert tenni vmire', 'to acquire/obtain something', ['vonzat', 'phrase'], 'Nagy tapasztalatra tett szert külföldön.', 'He acquired great experience abroad.'),
  card('eleget tenni vminek', 'to comply with / fulfill something', ['vonzat', 'phrase'], 'Eleget tett a követelményeknek.', 'He fulfilled the requirements.'),
  card('rávenni vkit vmire', 'to persuade someone to do something', ['vonzat', 'verb'], 'Rávette a barátját a közös vállalkozásra.', 'He persuaded his friend to start a joint venture.'),
  card('hivatkozni vmire', 'to refer/appeal to something', ['vonzat', 'verb'], 'A bíróság az alkotmányra hivatkozott.', 'The court referred to the constitution.'),
  card('beleegyezni vmibe', 'to consent to something', ['vonzat', 'verb'], 'Végül beleegyezett a feltételekbe.', 'He finally consented to the conditions.'),
  card('számolni vmivel', 'to count on / reckon with something', ['vonzat', 'verb'], 'Számolnunk kell a legrosszabb forgatókönyvvel is.', 'We must also reckon with the worst-case scenario.'),
  card('vonatkozni vmire/vkire', 'to pertain/apply to something/someone', ['vonzat', 'verb'], 'Ez a szabály mindenkire vonatkozik.', 'This rule applies to everyone.'),
  card('ragaszkodni vmihez', 'to insist on / cling to something', ['vonzat', 'verb'], 'Ragaszkodik az eredeti tervhez.', 'She insists on the original plan.'),
  card('visszaélni vmivel', 'to abuse/misuse something', ['vonzat', 'verb'], 'Visszaélt a hatalmával.', 'He abused his power.'),
  card('kitenni magát vminek', 'to expose oneself to something', ['vonzat', 'phrase'], 'Ne tedd ki magad felesleges kockázatnak.', "Don't expose yourself to unnecessary risk."),
  card('hozzájárulni vmihez', 'to contribute to something', ['vonzat', 'verb'], 'Mindenki hozzájárult a sikerhez.', 'Everyone contributed to the success.'),
  card('elszámolni vmivel', 'to account for something', ['vonzat', 'verb'], 'El kell számolnod a költségekkel.', 'You need to account for the expenses.'),
  card('beavatkozni vmibe', 'to intervene in something', ['vonzat', 'verb'], 'Az állam beavatkozott a gazdaságba.', 'The state intervened in the economy.'),
  card('törekedni vmire', 'to strive for something', ['vonzat', 'verb'], 'A tökéletességre törekszik.', 'She strives for perfection.'),
  card('rendelkezni vmivel', 'to have at one\'s disposal', ['vonzat', 'verb'], 'Jelentős erőforrásokkal rendelkezik.', 'He has significant resources at his disposal.'),
  card('következni vmiből', 'to follow/result from something', ['vonzat', 'verb'], 'Ez abból következik, amit korábban mondtam.', 'This follows from what I said earlier.'),
  card('kötődni vmihez/vkihez', 'to be attached to something/someone', ['vonzat', 'verb'], 'Erősen kötődik a szülőföldjéhez.', 'He is strongly attached to his homeland.'),
  card('tartózkodni vmitől', 'to refrain from something', ['vonzat', 'verb'], 'Tartózkodj a szavazástól, ha nem vagy biztos.', 'Abstain from voting if you are unsure.'),
  card('felróni vkinek vmit', 'to reproach someone for something', ['vonzat', 'verb'], 'Nem lehet felróni neki, hogy óvatos.', 'You can\'t reproach him for being cautious.'),
  card('szembesülni vmivel', 'to be confronted with something', ['vonzat', 'verb'], 'Szembe kell nézned a valósággal.', 'You must face reality.'),

  // ═══════════════════════════════════════════════
  // PHRASES — Idiomatic expressions & set phrases
  // ═══════════════════════════════════════════════
  card('tiszta vizet önteni a pohárba', 'to come clean / clarify things', ['phrase', 'idiom'], 'Ideje tiszta vizet önteni a pohárba.', 'It\'s time to come clean.', 'Lit: to pour clear water into the glass'),
  card('több lábon áll', 'to have multiple income sources / skills', ['phrase', 'idiom'], 'Okos döntés volt, mert így több lábon áll.', 'It was a smart decision, because now he has multiple streams.', 'Lit: stands on more legs'),
  card('zsebre tenni vkit', 'to easily outdo someone', ['phrase', 'idiom'], 'A versenyen mindenkit zsebre tett.', 'He easily outdid everyone at the competition.', 'Lit: to put someone in your pocket'),
  card('szélmalomharcot vívni', 'to fight a losing/futile battle', ['phrase', 'idiom'], 'Sokan gondolták, hogy szélmalomharcot vív.', 'Many thought he was fighting a losing battle.', 'Allusion to Don Quixote'),
  card('elvágja a zsírt', 'to speak bluntly / cut to the chase', ['phrase', 'idiom'], 'A főnök mindig elvágja a zsírt.', 'The boss always cuts to the chase.', 'Lit: cuts the fat'),
  card('az ördög nem alszik', 'the devil never sleeps / stay vigilant', ['phrase', 'idiom'], 'Vigyázz, az ördög nem alszik!', 'Be careful, the devil never sleeps!'),
  card('fülig ér a szája', 'to grin from ear to ear', ['phrase', 'idiom'], 'Annyira boldog volt, hogy fülig ért a szája.', 'He was so happy he was grinning from ear to ear.'),
  card('gőzöm sincs', 'I have no idea', ['phrase'], 'Hol van a kulcsom? Gőzöm sincs.', 'Where is my key? I have no idea.', 'Lit: I don\'t even have steam'),
  card('nekem nyolc', 'I couldn\'t care less', ['phrase'], 'Moziba vagy színházba? Nekem nyolc.', 'Cinema or theatre? I couldn\'t care less.', 'Very colloquial'),
  card('itatja az egereket', 'to cry a lot (usually said of children)', ['phrase', 'idiom'], 'Ez a kisfiú állandóan itatja az egereket.', 'This little boy keeps crying all the time.', 'Lit: watering the mice'),
  card('bedobták a mélyvízbe', 'thrown in at the deep end', ['phrase', 'idiom'], 'Az első munkanapomon bedobtak a mélyvízbe.', 'On my first working day I was thrown in at the deep end.'),
  card('teszi a fejét', 'to act/pretend/put on airs', ['phrase', 'idiom'], 'Ne vedd komolyan, csak teszi a fejét!', 'Don\'t take him seriously, he\'s just pretending!'),
  card('kéz kezet mos', 'you scratch my back, I scratch yours', ['phrase', 'idiom'], 'A politikában kéz kezet mos.', 'In politics, one hand washes the other.'),
  card('fát lehet vágni a hátán', 'extremely patient and enduring', ['phrase', 'idiom'], 'Fát lehet vágni a hátán, soha nem panaszkodik.', 'You could chop wood on his back — he never complains.', 'Lit: you can chop wood on his/her back'),
  card('madarat lehet vele fogatni', 'extremely happy / in high spirits', ['phrase', 'idiom'], 'Madarat lehetett vele fogatni, miután megtudta.', 'She was over the moon when she found out.', 'Lit: you could catch birds with him/her'),
  card('kutyából nem lesz szalonna', 'a leopard can\'t change its spots', ['phrase', 'idiom'], 'Hiába próbálkozik, kutyából nem lesz szalonna.', 'No matter how hard he tries, a leopard can\'t change its spots.', 'Lit: a dog won\'t turn into bacon'),
  card('nem esik messze az alma a fájától', 'the apple doesn\'t fall far from the tree', ['phrase', 'idiom'], 'Ő is orvos lett — nem esik messze az alma a fájától.', 'She also became a doctor — the apple doesn\'t fall far from the tree.'),
  card('száz szónak is egy a vége', 'the bottom line is / long story short', ['phrase', 'idiom'], 'Száz szónak is egy a vége: el kell költöznünk.', 'The bottom line is: we have to move.', 'Lit: a hundred words also have one ending'),
  card('más kárán tanul az okos', 'a wise person learns from others\' mistakes', ['phrase', 'idiom'], 'Más kárán tanul az okos — figyeld meg, mi történt velük.', 'The wise learn from others\' mistakes — look what happened to them.'),
  card('a cél szentesíti az eszközt', 'the ends justify the means', ['phrase', 'idiom'], 'Szerinte a cél szentesíti az eszközt, de én nem értek egyet.', 'He thinks the ends justify the means, but I disagree.'),
  card('ne igyál előre a medve bőrére', 'don\'t count your chickens before they hatch', ['phrase', 'idiom'], 'Ne igyál előre a medve bőrére, még nem kaptad meg az állást.', 'Don\'t count your chickens, you haven\'t got the job yet.', 'Lit: don\'t drink on the bear\'s skin in advance'),
  card('sokat sejtető mosoly', 'an enigmatic / knowing smile', ['phrase'], 'Egy sokat sejtető mosollyal elhagyta a szobát.', 'She left the room with an enigmatic smile.'),
  card('lóvá tenni vkit', 'to trick/fool someone', ['phrase', 'idiom'], 'Lóvá tettek a piacon.', 'They fooled me at the market.', 'Lit: to make someone into a horse'),
  card('feldobja a talpát', 'to kick the bucket (die — vulgar)', ['phrase', 'idiom'], 'Az öreg néni majdnem feldobta a talpát.', 'The old lady nearly kicked the bucket.', 'Very colloquial / dark humor'),
  card('a húrok pengetése', 'pulling strings / stirring things up', ['phrase'], 'Ő a háttérből pengeti a húrokat.', 'He pulls the strings from behind the scenes.'),
  card('szemet hunyni vmi felett', 'to turn a blind eye to something', ['phrase', 'vonzat'], 'A hatóságok szemet hunytak a szabálytalanságok felett.', 'The authorities turned a blind eye to the irregularities.'),
  card('fején találni a szöget', 'to hit the nail on the head', ['phrase', 'idiom'], 'Ezzel fején találtad a szöget.', 'You hit the nail on the head with that.'),

  // ═══════════════════════════════════════════════
  // VERBS — Advanced / literary register
  // ═══════════════════════════════════════════════
  card('mérlegelni', 'to weigh up / consider carefully', ['verb'], 'Alaposan mérlegeld a döntésedet.', 'Weigh your decision carefully.'),
  card('mellőzni', 'to disregard / omit / sideline', ['verb'], 'Mellőzték a pályázatát.', 'His application was disregarded.'),
  card('meghiúsítani', 'to thwart / foil', ['verb'], 'Sikerült meghiúsítani a tervet.', 'They managed to thwart the plan.'),
  card('kibontakozni', 'to unfold / develop / emerge', ['verb'], 'A konfliktus lassan kibontakozik.', 'The conflict is slowly unfolding.'),
  card('helytállni', 'to stand one\'s ground / hold up', ['verb'], 'Nehéz helyzetben is helytállt.', 'He stood his ground even in a difficult situation.'),
  card('fenntartani', 'to maintain / sustain / uphold', ['verb'], 'Fenn kell tartanunk a rendet.', 'We must maintain order.'),
  card('eltökélni magát', 'to resolve / make up one\'s mind firmly', ['verb'], 'Eltökélte magát, hogy változtat az életén.', 'She resolved to change her life.'),
  card('megtéveszteni', 'to mislead / deceive', ['verb'], 'Ne tévesszen meg a látszat.', 'Don\'t be deceived by appearances.'),
  card('érvényesülni', 'to assert oneself / succeed / prevail', ['verb'], 'Nehéz érvényesülni ebben a szakmában.', 'It\'s hard to succeed in this profession.'),
  card('elhanyagolni', 'to neglect', ['verb'], 'Ne hanyagold el a kötelességeidet.', 'Don\'t neglect your duties.'),
  card('elszánni magát vmire', 'to resolve oneself to something', ['verb', 'vonzat'], 'Elszánta magát a végsőkig való küzdelemre.', 'He resolved himself to fight to the end.'),
  card('megbirkózni vmivel', 'to cope with / wrestle with something', ['verb', 'vonzat'], 'Megbirkózott az akadályokkal.', 'She coped with the obstacles.'),
  card('felülkerekedni vmin', 'to overcome / prevail over something', ['verb', 'vonzat'], 'Felülkerekedett a nehézségeken.', 'He prevailed over the difficulties.'),
  card('szorgalmazni', 'to advocate / push for', ['verb'], 'A miniszter reformokat szorgalmazott.', 'The minister advocated for reforms.'),
  card('felvállalni', 'to take on / undertake openly', ['verb'], 'Felvállalta a véleményét.', 'She openly stood by her opinion.'),
  card('összefüggni vmivel', 'to be connected/related to something', ['verb', 'vonzat'], 'Ez szorosan összefügg a gazdasági helyzettel.', 'This is closely connected to the economic situation.'),
  card('meginogni', 'to waver / become unsteady', ['verb'], 'A bizalma meginogott.', 'His confidence wavered.'),
  card('felháborodni vmin', 'to be outraged at something', ['verb', 'vonzat'], 'Felháborodott az igazságtalanságon.', 'She was outraged at the injustice.'),
  card('megkérdőjelezni', 'to question / challenge', ['verb'], 'Megkérdőjelezte a vezetés döntéseit.', 'He questioned the leadership\'s decisions.'),
  card('érvényre juttatni', 'to enforce / assert (rights, views)', ['verb', 'phrase'], 'Érvényre kell juttatni az alkotmányos jogokat.', 'Constitutional rights must be enforced.'),
  card('beágyazódni vmibe', 'to become embedded in something', ['verb', 'vonzat'], 'A szokás mélyen beágyazódott a kultúrába.', 'The custom is deeply embedded in the culture.'),
  card('megnyilvánulni', 'to manifest / express itself', ['verb'], 'A feszültség különféle módokon nyilvánult meg.', 'The tension manifested in various ways.'),
  card('összeegyeztetni', 'to reconcile / make compatible', ['verb'], 'Nehéz összeegyeztetni a munkát és a családot.', 'It\'s hard to reconcile work and family.'),
  card('átlátni vmit', 'to see through / understand fully', ['verb', 'vonzat'], 'Átlátta a helyzet összetettségét.', 'She fully grasped the complexity of the situation.'),
  card('szembeszegülni', 'to defy / resist', ['verb'], 'Szembeszegült a felettesével.', 'He defied his superior.'),

  // ═══════════════════════════════════════════════
  // ADJECTIVES — Formal / elevated register
  // ═══════════════════════════════════════════════
  card('megkerülhetetlen', 'unavoidable / indispensable', ['adjective'], 'Ez egy megkerülhetetlen kérdés.', 'This is an unavoidable question.'),
  card('elévülhetetlen', 'inalienable / imprescriptible', ['adjective'], 'Elévülhetetlen jogok.', 'Inalienable rights.', 'Legal/formal register'),
  card('megingathatatlan', 'unshakeable / steadfast', ['adjective'], 'Megingathatatlan a hite.', 'His faith is unshakeable.'),
  card('felfoghatatlan', 'incomprehensible / inconceivable', ['adjective'], 'Felfoghatatlan, ami történt.', 'What happened is inconceivable.'),
  card('megengedhetetlen', 'impermissible / unacceptable', ['adjective'], 'Ez megengedhetetlen viselkedés.', 'This is unacceptable behavior.'),
  card('szívszorító', 'heart-wrenching', ['adjective'], 'Szívszorító volt a búcsú.', 'The farewell was heart-wrenching.'),
  card('megdöbbentő', 'shocking / staggering', ['adjective'], 'Megdöbbentő eredményeket mutatott a felmérés.', 'The survey showed shocking results.'),
  card('kifogástalan', 'impeccable / flawless', ['adjective'], 'Kifogástalan munkát végzett.', 'She did impeccable work.'),
  card('elgondolkodtató', 'thought-provoking', ['adjective'], 'Elgondolkodtató beszédet mondott.', 'He gave a thought-provoking speech.'),
  card('megalapozatlan', 'unfounded / groundless', ['adjective'], 'Megalapozatlan vádak.', 'Unfounded accusations.'),
  card('megfontolandó', 'worth considering', ['adjective'], 'Ez egy megfontolandó javaslat.', 'This is a proposal worth considering.'),
  card('visszafordíthatatlan', 'irreversible', ['adjective'], 'Visszafordíthatatlan károkat okozott.', 'He caused irreversible damage.'),
  card('közismert', 'well-known / widely recognized', ['adjective'], 'Közismert tény, hogy...', 'It is a well-known fact that...'),
  card('következetes', 'consistent / consequent', ['adjective'], 'Következetes magatartást tanúsított.', 'She displayed consistent behavior.'),
  card('megbízható', 'reliable / trustworthy', ['adjective'], 'Megbízható forrásból származó információ.', 'Information from a reliable source.'),
  card('elhivatott', 'dedicated / devoted (professionally)', ['adjective'], 'Elhivatott orvos.', 'A dedicated doctor.'),
  card('találékony', 'resourceful / inventive', ['adjective'], 'Találékony megoldást talált.', 'He found a resourceful solution.'),
  card('magabiztos', 'self-confident / assured', ['adjective'], 'Magabiztos fellépés.', 'A confident demeanor.'),
  card('szószátyár', 'gossipy / blabbermouth', ['adjective', 'noun'], 'Ne légy olyan szószátyár!', 'Don\'t be such a blabbermouth!'),
  card('körmönfont', 'cunning / crafty / convoluted', ['adjective'], 'Körmönfont érvelés.', 'A convoluted argument.', 'Can be positive (clever) or negative (devious)'),
  card('nyakatekert', 'convoluted / tortuous', ['adjective'], 'Nyakatekert magyarázat.', 'A convoluted explanation.', 'Lit: with a twisted neck'),
  card('kérlelhetetlen', 'relentless / implacable', ['adjective'], 'Kérlelhetetlen kritikusa volt a rendszernek.', 'He was a relentless critic of the system.'),
  card('elkerülhetetlen', 'inevitable / unavoidable', ['adjective'], 'Az összecsapás elkerülhetetlen volt.', 'The clash was inevitable.'),
  card('páratlan', 'unparalleled / matchless', ['adjective'], 'Páratlan tehetség.', 'An unparalleled talent.'),
  card('talpraesett', 'quick-witted / resourceful', ['adjective'], 'Talpraesett válasz.', 'A quick-witted answer.', 'Lit: falling on one\'s feet'),

  // ═══════════════════════════════════════════════
  // NOUNS — High-level / formal / native fluency
  // ═══════════════════════════════════════════════
  card('közhely', 'cliché / platitude', ['noun'], 'Kerüld a közhelyeket az esszében.', 'Avoid clichés in your essay.'),
  card('előzmény', 'precedent / antecedent / background', ['noun'], 'Az ügynek komoly előzményei vannak.', 'The case has serious precedents.'),
  card('következmény', 'consequence / repercussion', ['noun'], 'Vállalnod kell a következményeket.', 'You must bear the consequences.'),
  card('hozzáállás', 'attitude / approach', ['noun'], 'A hozzáállásod mindent meghatároz.', 'Your attitude determines everything.'),
  card('közvélemény', 'public opinion', ['noun'], 'A közvélemény megoszlik ebben a kérdésben.', 'Public opinion is divided on this issue.'),
  card('szóvivő', 'spokesperson', ['noun'], 'A kormány szóvivője nyilatkozott.', 'The government spokesperson made a statement.'),
  card('visszajelzés', 'feedback', ['noun'], 'Fontos a visszajelzés a fejlődéshez.', 'Feedback is important for development.'),
  card('kiindulópont', 'starting point / premise', ['noun'], 'Ez egy jó kiindulópont.', 'This is a good starting point.'),
  card('felháborodás', 'outrage / indignation', ['noun'], 'Nagy felháborodást keltett a döntés.', 'The decision caused great outrage.'),
  card('ellentmondás', 'contradiction', ['noun'], 'Ellentmondást fedeztem fel az érvelésben.', 'I found a contradiction in the argument.'),
  card('meggyőződés', 'conviction / belief', ['noun'], 'Az a meggyőződésem, hogy igazam van.', 'It is my conviction that I am right.'),
  card('kötelezettség', 'obligation / liability', ['noun'], 'Jogi kötelezettséget vállalt.', 'He took on a legal obligation.'),
  card('felülvizsgálat', 'review / reassessment', ['noun'], 'Szükség van a törvény felülvizsgálatára.', 'A review of the law is needed.'),
  card('befolyás', 'influence', ['noun'], 'Nagy befolyása van a döntéshozatalra.', 'He has great influence on decision-making.'),
  card('nyomaték', 'emphasis / torque', ['noun'], 'Különös nyomatékot adott a szavainak.', 'He gave special emphasis to his words.'),
  card('jóvátétel', 'reparation / restitution', ['noun'], 'Jóvátételt követelt a sértetteknek.', 'She demanded reparation for the victims.'),
  card('szeszély', 'whim / caprice', ['noun'], 'A sors szeszélye úgy hozta.', 'The whim of fate brought it about.'),
  card('mérföldkő', 'milestone', ['noun'], 'Ez egy mérföldkő a tudományban.', 'This is a milestone in science.'),
  card('tárgyilagosság', 'objectivity / impartiality', ['noun'], 'A tárgyilagosság alapvető a bíráskodásban.', 'Objectivity is fundamental in adjudication.'),
  card('gyanakvás', 'suspicion / distrust', ['noun'], 'Gyanakvással fogadta a javaslatot.', 'He received the proposal with suspicion.'),
  card('összhang', 'harmony / accord', ['noun'], 'Összhangba kell hozni az elméleteket.', 'The theories must be brought into accord.'),
  card('teendő', 'task / thing to do', ['noun'], 'Sok teendő vár ránk.', 'Many tasks await us.'),
  card('utóhatás', 'aftereffect / aftermath', ['noun'], 'A háború utóhatásai még érezhetők.', 'The aftereffects of the war are still felt.'),
  card('visszásság', 'irregularity / anomaly / abuse', ['noun'], 'Visszásságokat tártak fel a szervezetben.', 'Irregularities were uncovered in the organization.'),
  card('megbízás', 'commission / mandate / assignment', ['noun'], 'Fontos megbízást kapott a minisztertől.', 'He received an important mandate from the minister.'),

  // ═══════════════════════════════════════════════
  // ADVERBS — Formal / literary
  // ═══════════════════════════════════════════════
  card('ellenben', 'however / on the other hand', ['adverb', 'conjunction'], 'Ő ellenben egészen mást gondolt.', 'She, however, thought something entirely different.'),
  card('mindazonáltal', 'nevertheless / nonetheless', ['adverb', 'conjunction'], 'Mindazonáltal kitartott az álláspontja mellett.', 'Nevertheless, he stood by his position.', 'Very formal / literary'),
  card('következésképpen', 'consequently / therefore', ['adverb', 'conjunction'], 'Következésképpen le kell mondania.', 'Consequently, he must resign.'),
  card('lényegében', 'essentially / in essence', ['adverb'], 'Lényegében igaza van.', 'Essentially, he is right.'),
  card('mértékadó', 'authoritative / standard-setting', ['adjective', 'adverb'], 'Mértékadó forrás szerint...', 'According to an authoritative source...'),
  card('egyértelműen', 'unambiguously / clearly', ['adverb'], 'Egyértelműen ő a felelős.', 'He is clearly responsible.'),
  card('állítólag', 'allegedly / supposedly', ['adverb'], 'Állítólag külföldre távozott.', 'He allegedly went abroad.'),
  card('meglehetősen', 'rather / quite / fairly', ['adverb'], 'Meglehetősen bonyolult a helyzet.', 'The situation is rather complicated.'),
  card('nyilvánvalóan', 'obviously / evidently', ['adverb'], 'Nyilvánvalóan tévedett.', 'He was obviously wrong.'),
  card('lépten-nyomon', 'at every turn / constantly', ['adverb', 'phrase'], 'Lépten-nyomon akadályokba ütközött.', 'He ran into obstacles at every turn.'),

  // ═══════════════════════════════════════════════
  // MORE VONZATOK & PHRASES
  // ═══════════════════════════════════════════════
  card('véget vetni vminek', 'to put an end to something', ['vonzat', 'phrase'], 'Véget kell vetni ennek a bizonytalanságnak.', 'An end must be put to this uncertainty.'),
  card('észrevételt tenni vmire', 'to make an observation about something', ['vonzat', 'phrase'], 'Szeretnék észrevételt tenni az előadásra.', 'I would like to make an observation about the presentation.'),
  card('hatással lenni vmire', 'to have an effect on something', ['vonzat', 'phrase'], 'Az időjárás hatással van a hangulatra.', 'The weather has an effect on mood.'),
  card('hajlamos vmire', 'prone to / inclined towards something', ['vonzat', 'adjective'], 'Hajlamos a túlzásokra.', 'He is prone to exaggeration.'),
  card('adódni vmiből', 'to arise from something', ['vonzat', 'verb'], 'A probléma a félreértésből adódott.', 'The problem arose from a misunderstanding.'),
  card('ráhagyatkozni vkire', 'to rely on / entrust oneself to someone', ['vonzat', 'verb'], 'Teljesen ráhagyatkozott az orvosára.', 'She completely entrusted herself to her doctor.'),
  card('kilátásba helyezni vmit', 'to hold out the prospect of something', ['vonzat', 'phrase'], 'Bérememelést helyeztek kilátásba.', 'They held out the prospect of a pay raise.'),
  card('szóba jönni', 'to come into question / be a possibility', ['phrase', 'vonzat'], 'Ez a megoldás nem jöhet szóba.', 'This solution is out of the question.'),
  card('napirendre kerülni', 'to be put on the agenda', ['phrase'], 'A kérdés napirendre került.', 'The question was put on the agenda.'),
  card('kézzel fogható', 'tangible / palpable', ['phrase', 'adjective'], 'Kézzel fogható eredményeket ért el.', 'She achieved tangible results.', 'Lit: graspable by hand'),
  card('állást foglalni vmi mellett/ellen', 'to take a position for/against something', ['vonzat', 'phrase'], 'Nyíltan állást foglalt az ügyben.', 'He openly took a position on the matter.'),
  card('felszínre kerülni', 'to come to the surface / to light', ['phrase', 'verb'], 'Új bizonyítékok kerültek felszínre.', 'New evidence came to light.'),
  card('nyomást gyakorolni vkire', 'to exert pressure on someone', ['vonzat', 'phrase'], 'Nyomást gyakoroltak a kormányra.', 'They exerted pressure on the government.'),
  card('tudomásul venni vmit', 'to acknowledge / take note of something', ['vonzat', 'phrase'], 'Tudomásul veszem a döntésedet.', 'I acknowledge your decision.', 'More formal than "tudomást venni"'),
  card('válságba sodródni', 'to drift into crisis', ['phrase', 'verb'], 'Az ország válságba sodródott.', 'The country drifted into crisis.'),
  card('nagy port kavart', 'caused a big stir', ['phrase', 'idiom'], 'A nyilatkozata nagy port kavart.', 'His statement caused a big stir.', 'Lit: stirred up a lot of dust'),
  card('zsákutcába jutni', 'to reach a dead end', ['phrase'], 'A tárgyalások zsákutcába jutottak.', 'The negotiations reached a dead end.'),
  card('nyélbe ütni vmit', 'to clinch/seal something (a deal)', ['phrase', 'vonzat'], 'Sikerült nyélbe ütni az üzletet.', 'They managed to clinch the deal.'),
  card('pálcát törni vki felett', 'to pass judgment on someone', ['phrase', 'vonzat'], 'Nem szabad pálcát törni felette, mielőtt megismernénk a tényeket.', 'We shouldn\'t pass judgment on him before knowing the facts.'),
  card('helytelen megvilágításba helyezni', 'to put in a false light / misrepresent', ['phrase'], 'Helytelen megvilágításba helyezték a nyilatkozatait.', 'His statements were put in a false light.'),

  // ═══════════════════════════════════════════════
  // MORE NOUNS — Native-speaker level
  // ═══════════════════════════════════════════════
  card('felelősségre vonás', 'holding accountable / prosecution', ['noun', 'phrase'], 'Felelősségre vonást követeltek.', 'They demanded accountability.'),
  card('híresztelés', 'rumor / hearsay', ['noun'], 'Puszta híresztelés, ne hidd el!', 'It\'s mere hearsay, don\'t believe it!'),
  card('ármány', 'intrigue / treachery', ['noun'], 'Ármány és cselszövés jellemezte a kort.', 'The era was characterized by intrigue and plotting.'),
  card('fennhatóság', 'jurisdiction / sovereignty', ['noun'], 'A bíróság fennhatósága alá tartozik.', 'It falls under the court\'s jurisdiction.'),
  card('rendelkezés', 'regulation / provision / directive', ['noun'], 'A rendelkezés értelmében...', 'In accordance with the regulation...'),
  card('közvetítő', 'mediator / intermediary', ['noun'], 'Közvetítőt kértek a vitába.', 'They requested a mediator for the dispute.'),
  card('utánanézés', 'looking into / research (informal)', ['noun'], 'Kicsit utánanézés után rájöttem.', 'After a bit of research, I figured it out.'),
  card('bűnbak', 'scapegoat', ['noun'], 'Őt tették meg bűnbaknak.', 'They made him the scapegoat.'),
  card('áldozatvállalás', 'making sacrifices / self-sacrifice', ['noun'], 'Nagy áldozatvállalás volt a részéről.', 'It was a great sacrifice on his part.'),
  card('kapaszkodó', 'handhold / foothold / something to hold onto', ['noun'], 'Nincs kapaszkodóm ebben a helyzetben.', 'I have nothing to hold onto in this situation.', 'Also used metaphorically'),

  // ═══════════════════════════════════════════════
  // MORE VERBS & VERB PHRASES
  // ═══════════════════════════════════════════════
  card('megkötni a kezét vkinek', 'to tie someone\'s hands', ['phrase', 'vonzat'], 'A szabályzat megkötötte a kezét.', 'The regulations tied his hands.'),
  card('félreértelmezni', 'to misinterpret', ['verb'], 'Félreértelmezte a szavaimat.', 'She misinterpreted my words.'),
  card('összehangolni', 'to coordinate / harmonize', ['verb'], 'Össze kell hangolnunk az erőfeszítéseinket.', 'We need to coordinate our efforts.'),
  card('hitelesíteni', 'to authenticate / certify', ['verb'], 'Hitelesíttetni kell a dokumentumot.', 'The document needs to be authenticated.'),
  card('kézbesíteni', 'to deliver (formally)', ['verb'], 'Kézbesítették az idézést.', 'The summons was delivered.'),
  card('behatárolni', 'to delimit / narrow down', ['verb'], 'Behatárolta a keresés területét.', 'He narrowed down the search area.'),
  card('közbenjárni', 'to intercede / intervene on behalf of', ['verb'], 'Közbenjárt az érdekében.', 'She interceded on his behalf.'),
  card('eltussolni', 'to hush up / cover up', ['verb'], 'Megpróbálták eltussolni az ügyet.', 'They tried to hush up the affair.'),
  card('kieszközölni', 'to procure / obtain (through effort)', ['verb'], 'Sikerült kieszközölnie a vízumot.', 'He managed to procure the visa.'),
  card('felszámolni', 'to liquidate / dismantle / eliminate', ['verb'], 'Felszámolták a vállalatot.', 'The company was liquidated.'),

  // ═══════════════════════════════════════════════
  // MORE ADJECTIVES
  // ═══════════════════════════════════════════════
  card('aggályos', 'scrupulous / having reservations', ['adjective'], 'Aggályos a tervet illetően.', 'He has reservations about the plan.'),
  card('mérvadó', 'authoritative / decisive / benchmark', ['adjective'], 'Mérvadó szakértők szerint...', 'According to authoritative experts...'),
  card('jóvátehetetlen', 'irreparable', ['adjective'], 'Jóvátehetetlen kárt okozott.', 'He caused irreparable damage.'),
  card('hosszú távú', 'long-term', ['adjective'], 'Hosszú távú befektetés.', 'A long-term investment.'),
  card('hátrányos helyzetű', 'disadvantaged', ['adjective', 'phrase'], 'Hátrányos helyzetű fiatalokat segítenek.', 'They help disadvantaged young people.'),
  card('meglepetésszerű', 'sudden / surprise (attributive)', ['adjective'], 'Meglepetésszerű ellenőrzés volt.', 'It was a surprise inspection.'),
  card('egyoldalú', 'one-sided / unilateral', ['adjective'], 'Egyoldalú döntés.', 'A unilateral decision.'),
  card('halaszthatatlan', 'urgent / cannot be postponed', ['adjective'], 'Halaszthatatlan teendők.', 'Urgent tasks that cannot be postponed.'),

  // ═══════════════════════════════════════════════
  // CONJUNCTIONS & CONNECTORS — Formal writing
  // ═══════════════════════════════════════════════
  card('ugyanakkor', 'at the same time / however', ['conjunction', 'adverb'], 'Ugyanakkor figyelembe kell venni a kockázatokat.', 'At the same time, the risks must be taken into account.'),
  card('ennélfogva', 'therefore / hence', ['conjunction'], 'Ennélfogva a szerződés érvénytelen.', 'Hence, the contract is invalid.', 'Formal/legal register'),
  card('amennyiben', 'insofar as / provided that', ['conjunction'], 'Amennyiben elfogadja a feltételeket, aláírhatjuk.', 'Provided that you accept the conditions, we can sign.'),
  card('annak ellenére, hogy', 'despite the fact that', ['conjunction', 'phrase'], 'Annak ellenére, hogy fáradt volt, folytatta.', 'Despite the fact that he was tired, he continued.'),
  card('jóllehet', 'although / albeit', ['conjunction'], 'Jóllehet fiatal, nagy tapasztalata van.', 'Although young, she has great experience.', 'Formal/literary register'),
  card('holott', 'whereas / even though', ['conjunction'], 'Elment, holott megkértem, hogy maradjon.', 'He left, even though I asked him to stay.'),
];
