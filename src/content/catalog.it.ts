/**
 * COMPOSTELLE — US-02 local content catalog.
 *
 * Small, hand-written catalog of content worth discovering in Italian. Editorial
 * rules (US-02): interesting regardless of pedagogy; narrative pieces are
 * original; historical/cultural pieces stay factual and prudent; no real-time
 * news dependency. `title`/`body` are in the target language (Italian), `teaser`
 * is in the UI language (English) to entice from the feed.
 *
 * This is DATA. The types live in `../domain/content.ts`, the selection logic in
 * `../domain/discovery.ts`.
 */

import type { ContentItem } from "../domain/content";

export const IT_CATALOG: ContentItem[] = [
  // --- thriller (original fiction) ---------------------------------------
  {
    id: "tram-14",
    language: "it",
    title: "L'ultima corsa del tram 14",
    category: "thriller",
    teaser: "A late-night tram, empty except for one passenger who never got on.",
    estimatedMinutes: 3,
    modality: "read",
    body: "Il tram numero 14 faceva l'ultima corsa a mezzanotte e dieci. Elena saliva sempre a quell'ora, quando le carrozze erano vuote e i finestrini restituivano solo il suo riflesso. Quella notte, però, in fondo alla vettura c'era un uomo con un cappotto grigio. Non lo aveva visto salire. A ogni fermata le porte si aprivano, nessuno scendeva, nessuno saliva, e l'uomo restava immobile. Quando Elena si voltò all'ultima fermata, il sedile era vuoto. Sul vetro appannato, però, qualcuno aveva scritto una sola parola: «Domani».",
    annotations: [
      { id: "a1", expression: "l'ultima corsa", meaning: "l'ultimo viaggio della giornata", translation: "the last run (of the day)" },
      { id: "a2", expression: "in fondo alla vettura", meaning: "nella parte posteriore del tram", translation: "at the back of the car" },
      { id: "a3", expression: "restava immobile", meaning: "non si muoveva affatto", translation: "stayed completely still" },
      { id: "a4", expression: "vetro appannato", meaning: "il vetro coperto di vapore", translation: "the fogged-up glass" },
      { id: "a5", expression: "cappotto grigio", meaning: "un soprabito di colore grigio", translation: "grey overcoat" },
      { id: "a6", expression: "a ogni fermata", meaning: "a ciascuna sosta del tram", translation: "at every stop" },
      { id: "a7", expression: "una sola parola", meaning: "un'unica parola, nient'altro", translation: "a single word" },
      { id: "a8", expression: "le carrozze", meaning: "i vagoni del tram", translation: "the tram cars" },
      { id: "a9", expression: "i finestrini", meaning: "i vetri laterali del tram", translation: "the windows" },
      { id: "a10", expression: "il suo riflesso", meaning: "la sua immagine sul vetro", translation: "her reflection" },
      { id: "a11", expression: "il sedile", meaning: "il posto dove ci si siede", translation: "the seat" },
    ],
    recall: [
      { id: "r1", kind: "meaning", prompt: "Che cosa significa «l'ultima corsa»?", options: ["L'ultimo viaggio della giornata", "Una gara di velocità", "Il primo tram del mattino"], answerIndex: 0, annotationId: "a1" },
      { id: "r2", kind: "gap", prompt: "L'uomo non si muoveva: restava ______.", options: ["immobile", "in piedi", "vicino"], answerIndex: 0, annotationId: "a3" },
      { id: "r3", kind: "comprehension", prompt: "Che cosa era scritto sul vetro appannato?", options: ["«Domani»", "«Fermati»", "«Elena»"], answerIndex: 0, annotationId: "a4" },
    ],
    use: {
      prompt: "Usa l'espressione in una frase.",
      gapSentence: "Ogni notte prendo ______ del tram per tornare a casa.",
      sampleAnswer: "l'ultima corsa",
      keyExpressions: ["l'ultima corsa", "ultima corsa"],
    },
  },
  {
    id: "portone-verde",
    language: "it",
    title: "Il portone chiuso",
    category: "thriller",
    teaser: "The same locked door every night — until the night it stood open.",
    estimatedMinutes: 3,
    modality: "read",
    body: "Ogni sera, tornando a casa, Marco passava davanti al portone verde del numero 7. Era sempre chiuso, con la vernice scrostata e una serratura arrugginita che sembrava non aprirsi da anni. Una notte di novembre, invece, il portone era socchiuso. Dall'interno usciva una luce calda e il profumo di pane appena sfornato. Marco si fermò, la mano a pochi centimetri dal legno. Sapeva che al numero 7 non abitava nessuno da quando era bambino. Eppure qualcuno, là dentro, sembrava aspettarlo.",
  },

  // --- history (factual, prudent) ---------------------------------------
  {
    id: "pompei",
    language: "it",
    title: "Pompei, la città sospesa",
    category: "history",
    teaser: "How a single day in 79 AD froze an entire Roman town in time.",
    estimatedMinutes: 4,
    modality: "read",
    body: "Nell'anno 79 d.C. il Vesuvio eruttò e in poche ore seppellì Pompei sotto uno spesso strato di cenere e lapilli. La città romana, vivace e popolosa, scomparve dalla superficie. Paradossalmente, proprio la cenere che la distrusse la conservò: case, botteghe, affreschi e oggetti quotidiani rimasero protetti per secoli. Gli scavi sistematici iniziarono nel Settecento e continuano ancora oggi. Camminare tra le sue strade significa vedere come vivevano davvero i Romani: le insegne dei negozi, i graffiti sui muri, le stanze dipinte. Pompei non è un monumento isolato, ma un'intera città fermata nel tempo.",
    // Canonical Learning Unit: rich annotation pool spanning difficulties, so
    // UNDERSTAND density adapts to the learner (A2 sees many, C1 sees the few
    // richest). Translations carry en + fr (interface language).
    annotations: [
      { id: "oggetti", expression: "oggetti quotidiani", difficulty: "A2", meaning: "cose di tutti i giorni", translation: "everyday objects", translations: { en: "everyday objects", fr: "objets du quotidien" } },
      { id: "botteghe", expression: "botteghe", difficulty: "A2", meaning: "piccoli negozi o laboratori", translation: "workshops / small shops", translations: { en: "workshops / small shops", fr: "échoppes / ateliers" } },
      { id: "erutto", expression: "eruttò", difficulty: "B1", meaning: "esplose gettando lava e cenere", translation: "erupted", translations: { en: "erupted", fr: "est entré en éruption" } },
      { id: "seppelli", expression: "seppellì", difficulty: "B1", meaning: "coprì completamente, nascose sotto terra", translation: "buried", translations: { en: "buried", fr: "a enseveli" } },
      { id: "cenere", expression: "cenere e lapilli", difficulty: "B2", meaning: "materiali espulsi dal vulcano", translation: "ash and volcanic stones", translations: { en: "ash and volcanic stones", fr: "cendres et lapilli" } },
      { id: "scomparve", expression: "scomparve dalla superficie", difficulty: "B2", meaning: "sparì dalla vista, non fu più visibile", translation: "vanished from the surface", translations: { en: "vanished from the surface", fr: "a disparu de la surface" } },
      { id: "insegne", expression: "le insegne dei negozi", difficulty: "B2", meaning: "i cartelli che indicano i negozi", translation: "the shop signs", translations: { en: "the shop signs", fr: "les enseignes des boutiques" } },
      { id: "vivace", expression: "vivace e popolosa", difficulty: "C1", meaning: "piena di vita e di abitanti", translation: "lively and populous", translations: { en: "lively and populous", fr: "vivante et peuplée" } },
      { id: "protetti", expression: "rimasero protetti per secoli", difficulty: "C1", meaning: "restarono al sicuro per centinaia di anni", translation: "stayed protected for centuries", translations: { en: "stayed protected for centuries", fr: "sont restés protégés pendant des siècles" } },
      { id: "fermata", expression: "fermata nel tempo", difficulty: "C1", meaning: "rimasta uguale, come bloccata", translation: "frozen in time", translations: { en: "frozen in time", fr: "figée dans le temps" }, example: "Un piccolo borgo può sembrare fermato nel tempo." },
      { id: "citta-romana", expression: "la città romana", difficulty: "A2", meaning: "la città degli antichi Romani", translation: "the Roman city", translations: { en: "the Roman city", fr: "la cité romaine" } },
      { id: "strato", expression: "uno spesso strato", difficulty: "B1", meaning: "un livello alto e denso di materiale", translation: "a thick layer", translations: { en: "a thick layer", fr: "une épaisse couche" } },
      { id: "scavi", expression: "gli scavi", difficulty: "B2", meaning: "i lavori per riportare alla luce la città", translation: "the excavations", translations: { en: "the excavations", fr: "les fouilles" } },
    ],
    // Recall tests the richest expressions (C1 → selected at every level) plus a
    // comprehension target. Instructions/options are interface-language; the gap
    // material stays in the target language.
    recall: [
      {
        id: "r1",
        kind: "meaning",
        prompt: "What does “fermata nel tempo” mean here?",
        promptI18n: { en: "What does “fermata nel tempo” mean here?", fr: "Que signifie « fermata nel tempo » ici ?" },
        options: ["frozen in time", "rebuilt recently", "never inhabited"],
        optionsI18n: { fr: ["figée dans le temps", "reconstruite récemment", "jamais habitée"] },
        answerIndex: 0,
        annotationId: "fermata",
      },
      {
        id: "r2",
        kind: "gap",
        prompt: "Grazie alla cenere, gli oggetti ______ protetti per secoli.",
        options: ["rimasero", "tornarono", "partirono"],
        answerIndex: 0,
        annotationId: "protetti",
      },
      {
        id: "r3",
        kind: "comprehension",
        prompt: "Why is Pompeii described as a city “frozen in time”?",
        promptI18n: { en: "Why is Pompeii described as a city “frozen in time”?", fr: "Pourquoi Pompéi est-elle décrite comme une ville « figée dans le temps » ?" },
        options: [
          "The ash that destroyed it also preserved it",
          "It was rebuilt to look old",
          "It was never a real city",
        ],
        optionsI18n: {
          fr: [
            "La cendre qui l'a détruite l'a aussi conservée",
            "Elle a été reconstruite pour paraître ancienne",
            "Elle n'a jamais été une vraie ville",
          ],
        },
        answerIndex: 0,
      },
    ],
    use: {
      prompt: "Use “fermata nel tempo” in a sentence of your own.",
      promptI18n: {
        en: "Use “fermata nel tempo” in a sentence of your own.",
        fr: "Utilisez « fermata nel tempo » dans une phrase à vous.",
      },
      starter: "Mi sembra che...",
      sampleAnswer: "Il piccolo borgo di montagna sembra fermato nel tempo.",
      keyExpressions: ["fermata nel tempo", "fermato nel tempo"],
    },
  },
  {
    id: "biblioteca-alessandria",
    language: "it",
    title: "La biblioteca di Alessandria",
    category: "history",
    teaser: "The ancient world's greatest library — and what we really know about its end.",
    estimatedMinutes: 4,
    modality: "read",
    body: "La Biblioteca di Alessandria d'Egitto, fondata intorno al III secolo a.C., fu uno dei più grandi centri del sapere del mondo antico. Vi si raccoglievano rotoli di papiro provenienti da tutto il Mediterraneo, e vi lavoravano studiosi di matematica, astronomia e medicina. Sulla sua fine circolano molte leggende. In realtà gli storici non attribuiscono la sua scomparsa a un unico incendio o a un solo evento: la biblioteca conobbe probabilmente un lungo declino, dovuto a guerre, tagli di risorse e al mutare dei tempi. Resta il simbolo di un'idea ancora attuale: riunire in un solo luogo tutta la conoscenza umana.",
  },

  // --- travel ------------------------------------------------------------
  {
    id: "cinque-terre",
    language: "it",
    title: "A piedi nelle Cinque Terre",
    category: "travel",
    teaser: "Five villages, one cliff path, and the sea always just below you.",
    estimatedMinutes: 3,
    modality: "read",
    body: "Le Cinque Terre sono cinque piccoli borghi affacciati sul mare della Liguria: Monterosso, Vernazza, Corniglia, Manarola e Riomaggiore. Per secoli sono stati collegati soprattutto da sentieri scavati nella roccia e da terrazzamenti coltivati a vite. Il percorso a piedi che unisce i paesi regala un panorama continuo sul Mar Ligure, tra muretti a secco, limoni e case colorate. Camminare da un borgo all'altro richiede tempo e gambe allenate, ma permette di vedere ciò che dal treno resta invisibile: il lavoro paziente con cui gli abitanti hanno strappato alla montagna ogni fazzoletto di terra.",
  },
  {
    id: "napoli-caffe",
    language: "it",
    title: "Un caffè a Napoli",
    category: "travel",
    teaser: "In Naples, a coffee can be a ritual — and sometimes a gift to a stranger.",
    estimatedMinutes: 3,
    modality: "read",
    body: "A Napoli il caffè non è soltanto una bevanda: è un gesto, un momento, a volte un dono. In molti bar sopravvive l'usanza del «caffè sospeso»: un cliente ne paga due ma ne beve uno solo, lasciando l'altro già pagato per chi verrà dopo e non potrà permetterselo. Nato come piccola forma di generosità anonima, il caffè sospeso è diventato un simbolo della città. Lo si beve in piedi al bancone, spesso in pochi secondi. Ma dietro quella tazzina c'è un'idea precisa: prendersi cura, senza clamore, di uno sconosciuto.",
  },

  // --- culture -----------------------------------------------------------
  {
    id: "gesti",
    language: "it",
    title: "Le mani che parlano",
    category: "culture",
    teaser: "Why an Italian conversation happens as much in the hands as in the words.",
    estimatedMinutes: 3,
    modality: "read",
    body: "Si dice spesso che gli italiani parlino con le mani, e in parte è vero. Molti gesti hanno un significato preciso e condiviso: le dita unite che si muovono verso l'alto, la mano che ruota per dire «più o meno», il dito che tira la palpebra per invitare alla prudenza. Questi segni non sostituiscono le parole, ma le accompagnano, aggiungendo ritmo ed emozione al discorso. Alcuni studiosi ne hanno catalogati centinaia. Osservare le mani di chi parla, in Italia, è quasi come leggere una seconda lingua che scorre insieme alla prima.",
  },
  {
    id: "scala",
    language: "it",
    title: "Una sera alla Scala",
    category: "culture",
    teaser: "Inside Milan's opera house, where every season opens on the same December night.",
    estimatedMinutes: 4,
    modality: "read",
    body: "Il Teatro alla Scala di Milano è uno dei più celebri teatri d'opera del mondo. Fu inaugurato nel 1778 e da allora ha ospitato alcune delle voci e dei direttori più importanti della storia della musica. Ogni anno la stagione si apre il 7 dicembre, giorno di Sant'Ambrogio, patrono della città: è un evento atteso, seguito ben oltre le mura del teatro. Dietro il sipario lavorano centinaia di persone, dai musicisti ai sarti, dagli scenografi ai tecnici. Assistere a una «prima» alla Scala significa entrare in un rito che unisce musica, storia e identità cittadina.",
  },

  // --- news / contemporary (evergreen, no real-time dependency) ---------
  {
    id: "borghi",
    language: "it",
    title: "Il ritorno dei borghi",
    category: "news",
    teaser: "Italy's small villages are being rediscovered, one empty house at a time.",
    estimatedMinutes: 4,
    modality: "read",
    body: "Per decenni molti piccoli borghi italiani si sono lentamente svuotati: i giovani partivano verso le città in cerca di lavoro, e le case restavano chiuse. Negli ultimi anni, però, qualcosa sta cambiando. Alcuni comuni hanno messo in vendita abitazioni abbandonate a prezzi simbolici, a patto di ristrutturarle; altri puntano sul lavoro a distanza per attirare nuovi abitanti. Non è una soluzione valida ovunque, e i risultati variano molto da luogo a luogo. Ma l'idea di tornare a vivere in un paese piccolo, più lento e più legato alla comunità, attira oggi anche chi era cresciuto pensando solo alla città.",
  },
  {
    id: "citta-ztl",
    language: "it",
    title: "Le città senza auto",
    category: "news",
    teaser: "Limited-traffic zones are quietly reshaping how Italians move through their cities.",
    estimatedMinutes: 3,
    modality: "read",
    body: "In molte città italiane il centro storico è protetto da una «zona a traffico limitato», la ZTL. Solo alcuni veicoli autorizzati possono entrare in certe ore, mentre gli altri rischiano una multa registrata dalle telecamere. L'obiettivo è duplice: ridurre l'inquinamento e restituire le strade antiche ai pedoni. Non tutti sono d'accordo. Commercianti e residenti discutono spesso di come conciliare la tutela dei centri con le esigenze di chi ci lavora e ci abita. La ZTL è così diventata molto più di una regola stradale: è un modo di ripensare a chi appartiene la città.",
  },

  // --- sport -------------------------------------------------------------
  {
    id: "maglia-rosa",
    language: "it",
    title: "La maglia rosa",
    category: "sport",
    teaser: "Why the leader of Italy's greatest cycling race wears pink.",
    estimatedMinutes: 3,
    modality: "read",
    body: "Il Giro d'Italia è la più importante corsa a tappe di ciclismo del Paese. Ogni anno attraversa regioni diverse, tra montagne, colline e coste, per circa tre settimane. Chi è in testa alla classifica generale indossa la «maglia rosa». Il colore non è casuale: richiama le pagine rosa della Gazzetta dello Sport, il giornale che ideò la corsa nel 1909. Vincere il Giro, o anche solo una singola tappa, resta il sogno di molti corridori. E lungo le strade, ad aspettarli, ci sono sempre folle di tifosi.",
  },
  {
    id: "calcio-vicoli",
    language: "it",
    title: "Il calcio nei vicoli",
    category: "sport",
    teaser: "Long before the stadiums, the game belongs to the narrow streets.",
    estimatedMinutes: 3,
    modality: "read",
    body: "Prima degli stadi e delle telecamere, il calcio in Italia nasce spesso in strada. Nei vicoli dei centri storici, in piazze strette o nei cortili, bastano una palla e due maglioni per terra a segnare le porte. Le regole si adattano allo spazio: niente rimesse laterali, muri che rimandano il pallone, finestre da evitare con cura. È un gioco veloce, fatto di dribbling corti e di grida. Molti campioni raccontano di aver imparato proprio così, tra i sampietrini, molto prima di calcare un campo vero. Il calcio dei vicoli non ha pubblico, ma ha una sua precisa poesia.",
  },

  // --- everyday life -----------------------------------------------------
  {
    id: "aperitivo",
    language: "it",
    title: "L'ora dell'aperitivo",
    category: "everyday_life",
    teaser: "The unhurried hour between work and dinner that Italians turned into an art.",
    estimatedMinutes: 3,
    modality: "read",
    body: "L'aperitivo è il momento che separa la fine del lavoro dalla cena. Nel tardo pomeriggio ci si siede al bar, si ordina qualcosa da bere e, spesso, arrivano piccoli stuzzichini: olive, patatine, tramezzini. Più che il cibo, conta il tempo: quello lento della conversazione, senza fretta. In alcune città l'aperitivo è diventato quasi un piccolo pasto, con buffet ricchi; in altre resta essenziale, poche cose ben fatte. In tutti i casi è un rito sociale prima che gastronomico: un modo per ritrovarsi, chiacchierare e lasciare che la giornata rallenti prima di sera.",
    annotations: [
      { id: "a1", expression: "piccoli stuzzichini", meaning: "piccole cose da mangiare", translation: "little snacks / nibbles" },
      { id: "a2", expression: "senza fretta", meaning: "con calma, senza correre", translation: "without hurrying" },
      { id: "a3", expression: "un rito sociale", meaning: "un'abitudine condivisa che unisce le persone", translation: "a social ritual" },
      { id: "a4", expression: "ritrovarsi", meaning: "incontrarsi di nuovo, stare insieme", translation: "to get together" },
      { id: "a5", expression: "tardo pomeriggio", meaning: "la parte finale del pomeriggio, verso sera", translation: "late afternoon" },
      { id: "a6", expression: "qualcosa da bere", meaning: "una bevanda, di solito un drink", translation: "something to drink" },
      { id: "a7", expression: "un piccolo pasto", meaning: "un pasto leggero, non abbondante", translation: "a small meal" },
      { id: "a8", expression: "chiacchierare", meaning: "parlare in modo informale e rilassato", translation: "to chat" },
      { id: "a9", expression: "conversazione", meaning: "lo scambio di parole tra persone", translation: "conversation" },
      { id: "a10", expression: "la fine del lavoro", meaning: "il momento in cui si smette di lavorare", translation: "the end of work" },
      { id: "a11", expression: "buffet ricchi", meaning: "tavoli con molto cibo da servirsi", translation: "lavish buffets" },
      { id: "a12", expression: "poche cose ben fatte", meaning: "pochi elementi ma di buona qualità", translation: "a few well-made things" },
      { id: "a13", expression: "il cibo", meaning: "le cose da mangiare", translation: "the food" },
    ],
    recall: [
      { id: "r1", kind: "meaning", prompt: "Che cosa sono «gli stuzzichini»?", options: ["Piccole cose da mangiare", "Bevande calde", "Grandi piatti"], answerIndex: 0, annotationId: "a1" },
      { id: "r2", kind: "gap", prompt: "Durante l'aperitivo si conversa con calma, ______.", options: ["senza fretta", "di corsa", "in silenzio"], answerIndex: 0, annotationId: "a2" },
      { id: "r3", kind: "comprehension", prompt: "L'aperitivo è soprattutto…", options: ["un rito sociale", "un pasto obbligatorio", "una gara"], answerIndex: 0, annotationId: "a3" },
    ],
    use: {
      prompt: "Scrivi una frase con questa espressione.",
      gapSentence: "Il sabato mi piace bere qualcosa con gli amici, ______.",
      sampleAnswer: "senza fretta",
      keyExpressions: ["senza fretta"],
    },
  },
  {
    id: "mercato",
    language: "it",
    title: "La spesa al mercato",
    category: "everyday_life",
    teaser: "At the market, buying tomatoes is also catching up on the whole neighborhood.",
    estimatedMinutes: 3,
    modality: "read",
    body: "Fare la spesa al mercato rionale è un'esperienza diversa dal supermercato. Le bancarelle espongono frutta e verdura di stagione, e i venditori conoscono spesso i clienti per nome. Comprare due pomodori può diventare l'occasione per un consiglio su come cucinarli o per uno scambio di notizie sul quartiere. I prezzi si leggono a voce alta, le cassette si riempiono in fretta, e l'aria profuma di erbe fresche e di pane. Il mercato non è solo un luogo dove si compra: è un punto d'incontro, uno dei pochi spazi in cui la città si ferma a parlare con se stessa.",
  },
];
