/**
 * COMPOSTELLE — Spanish (es) proof catalog.
 *
 * A minimal but meaningful Spanish set, using the EXACT same schema as the
 * Italian catalog, to prove the domain is language-agnostic. Not a full
 * catalogue: a few natural, interesting pieces across a handful of categories.
 * `title`/`body` in Spanish; `teaser` in the UI language (English).
 */

import type { ContentItem } from "../domain/content";

export const ES_CATALOG: ContentItem[] = [
  {
    id: "es-alhambra",
    language: "es",
    title: "La Alhambra de Granada",
    category: "history",
    teaser: "A hilltop palace-city where six centuries of history are still legible.",
    estimatedMinutes: 4,
    modality: "read",
    body: "La Alhambra es un conjunto de palacios y fortalezas situado en Granada, en el sur de España. Fue construida sobre todo durante el dominio de la dinastía nazarí, entre los siglos XIII y XIV. Sus salas destacan por los detallados trabajos en yeso, la madera tallada y los patios con agua, como el famoso Patio de los Leones. Tras la conquista cristiana de 1492, el lugar siguió habitándose y transformándose. Hoy es uno de los monumentos más visitados de España, y caminar por sus jardines permite imaginar la vida cortesana de hace más de seis siglos.",
    annotations: [
      { id: "a1", expression: "fortalezas", meaning: "construcciones para defenderse", translation: "fortresses" },
      { id: "a2", expression: "trabajos en yeso", meaning: "decoración fina hecha con yeso", translation: "plasterwork" },
      { id: "a3", expression: "los patios con agua", meaning: "espacios abiertos con fuentes o estanques", translation: "courtyards with water" },
      { id: "a4", expression: "la vida cortesana", meaning: "la vida en la corte, de los reyes y nobles", translation: "court life" },
    ],
    recall: [
      { id: "r1", kind: "meaning", prompt: "¿Qué son «las fortalezas»?", options: ["Construcciones para defenderse", "Jardines pequeños", "Salas de música"], answerIndex: 0, annotationId: "a1" },
      { id: "r2", kind: "gap", prompt: "Las salas destacan por los detallados ______ en yeso.", options: ["trabajos", "árboles", "caminos"], answerIndex: 0, annotationId: "a2" },
      { id: "r3", kind: "comprehension", prompt: "Al caminar por la Alhambra se puede imaginar…", options: ["la vida cortesana de hace siglos", "una fábrica moderna", "un puerto de mar"], answerIndex: 0, annotationId: "a4" },
    ],
    use: {
      prompt: "Escribe una frase con esta expresión.",
      gapSentence: "En el palacio es fácil imaginar ______ de otros tiempos.",
      sampleAnswer: "la vida cortesana",
      keyExpressions: ["la vida cortesana", "vida cortesana"],
    },
  },
  {
    id: "es-camino",
    language: "es",
    title: "El Camino de Santiago",
    category: "travel",
    teaser: "The old pilgrim roads where, many say, the walk matters more than arriving.",
    estimatedMinutes: 4,
    modality: "read",
    body: "El Camino de Santiago es una red de rutas que, desde hace siglos, conduce a peregrinos hasta la ciudad de Santiago de Compostela, en el noroeste de España. Aunque nació como una peregrinación religiosa en la Edad Media, hoy lo recorren personas de todo el mundo por motivos muy distintos: espirituales, deportivos o simplemente por el deseo de caminar y desconectar. Existen muchas rutas, pero la más conocida es el Camino Francés. A lo largo del recorrido, los caminantes comparten albergues, comidas y conversaciones, y muchos dicen que lo importante no es llegar, sino el propio camino.",
    // Spanish verification unit: same adaptive architecture as Pompei.
    annotations: [
      { id: "peregrinos", expression: "peregrinos", difficulty: "A2", meaning: "personas que hacen un viaje a pie hacia un lugar", translation: "pilgrims", translations: { en: "pilgrims", fr: "pèlerins" } },
      { id: "caminantes", expression: "los caminantes", difficulty: "A2", meaning: "las personas que caminan", translation: "the walkers", translations: { en: "the walkers", fr: "les marcheurs" } },
      { id: "red", expression: "una red de rutas", difficulty: "B1", meaning: "un conjunto de caminos conectados", translation: "a network of routes", translations: { en: "a network of routes", fr: "un réseau d'itinéraires" } },
      { id: "albergues", expression: "comparten albergues", difficulty: "B1", meaning: "duermen en los mismos alojamientos sencillos", translation: "share hostels", translations: { en: "share hostels", fr: "partagent des gîtes" } },
      { id: "desconectar", expression: "desconectar", difficulty: "B2", meaning: "descansar de las preocupaciones y la rutina", translation: "to switch off / unwind", translations: { en: "to switch off / unwind", fr: "déconnecter / se ressourcer" } },
      { id: "recorrido", expression: "a lo largo del recorrido", difficulty: "B2", meaning: "durante todo el camino", translation: "along the way", translations: { en: "along the way", fr: "tout au long du parcours" } },
      { id: "llegar", expression: "lo importante no es llegar", difficulty: "C1", meaning: "el destino no es lo esencial", translation: "what matters is not arriving", translations: { en: "what matters is not arriving", fr: "l'important n'est pas d'arriver" } },
      { id: "propio", expression: "el propio camino", difficulty: "C1", meaning: "el viaje en sí mismo", translation: "the journey itself", translations: { en: "the journey itself", fr: "le chemin lui-même" } },
    ],
    recall: [
      {
        id: "r1",
        kind: "meaning",
        prompt: "What does “el propio camino” mean here?",
        promptI18n: { en: "What does “el propio camino” mean here?", fr: "Que signifie « el propio camino » ici ?" },
        options: ["the journey itself", "the fastest route", "the final city"],
        optionsI18n: { fr: ["le chemin lui-même", "la route la plus rapide", "la ville finale"] },
        answerIndex: 0,
        annotationId: "propio",
      },
      {
        id: "r2",
        kind: "gap",
        prompt: "Muchos dicen que lo importante no es ______.",
        options: ["llegar", "caminar", "dormir"],
        answerIndex: 0,
        annotationId: "llegar",
      },
      {
        id: "r3",
        kind: "comprehension",
        prompt: "According to the text, what matters most on the Camino?",
        promptI18n: { en: "According to the text, what matters most on the Camino?", fr: "Selon le texte, qu'est-ce qui compte le plus sur le Camino ?" },
        options: ["the journey itself, not arriving", "arriving as fast as possible", "the price of the trip"],
        optionsI18n: { fr: ["le chemin lui-même, pas l'arrivée", "arriver le plus vite possible", "le prix du voyage"] },
        answerIndex: 0,
      },
    ],
    use: {
      prompt: "Use “el propio camino” in a sentence of your own.",
      promptI18n: {
        en: "Use “el propio camino” in a sentence of your own.",
        fr: "Utilisez « el propio camino » dans une phrase à vous.",
      },
      starter: "Para mí,...",
      sampleAnswer: "Para mí, lo importante es el propio camino, no llegar.",
      keyExpressions: ["el propio camino", "propio camino"],
    },
  },
  {
    id: "es-siesta",
    language: "es",
    title: "La siesta, más que un tópico",
    category: "culture",
    teaser: "The famous Spanish nap — rarer than you think, and not really about sleep.",
    estimatedMinutes: 3,
    modality: "read",
    body: "La siesta es probablemente una de las costumbres españolas más conocidas fuera del país, aunque hoy es menos habitual de lo que muchos imaginan. Tradicionalmente, se trataba de un breve descanso después de la comida del mediodía, cuando el calor apretaba y muchos negocios cerraban unas horas. En las grandes ciudades, con horarios laborales continuos, dormir la siesta a diario se ha vuelto poco frecuente. Sin embargo, la idea que hay detrás —hacer una pausa y no vivir con prisa constante— sigue siendo parte de la cultura. Un descanso corto, dicen algunos estudios, puede ayudar a recuperar energía.",
  },
  {
    id: "es-sobremesa",
    language: "es",
    title: "La sobremesa",
    category: "everyday_life",
    teaser: "In Spain a meal doesn't end with the last plate — the best part comes after.",
    estimatedMinutes: 3,
    modality: "read",
    body: "En España, la comida no termina cuando se acaba el último plato. Empieza entonces la sobremesa: ese rato en que la gente permanece sentada a la mesa, hablando, riendo y alargando el café. Puede durar unos minutos o extenderse durante horas, sobre todo los fines de semana o en las reuniones familiares. No se trata de comer más, sino de estar juntos sin prisa. Para muchos, la sobremesa es uno de los momentos más valiosos del día, un espacio para la conversación tranquila que otras culturas, con horarios más rígidos, apenas conocen.",
    annotations: [
      { id: "a1", expression: "la sobremesa", meaning: "el rato de charla después de comer, aún en la mesa", translation: "the after-meal chat at the table" },
      { id: "a2", expression: "alargando el café", meaning: "tomando el café despacio, sin terminar", translation: "lingering over the coffee" },
      { id: "a3", expression: "sin prisa", meaning: "con calma, sin correr", translation: "without hurrying" },
      { id: "a4", expression: "estar juntos", meaning: "pasar tiempo en compañía", translation: "being together" },
    ],
    recall: [
      { id: "r1", kind: "meaning", prompt: "¿Qué es «la sobremesa»?", options: ["El rato de charla después de comer", "El primer plato", "La cuenta del restaurante"], answerIndex: 0, annotationId: "a1" },
      { id: "r2", kind: "gap", prompt: "No se trata de comer más, sino de estar juntos ______.", options: ["sin prisa", "de pie", "en silencio"], answerIndex: 0, annotationId: "a3" },
      { id: "r3", kind: "comprehension", prompt: "La sobremesa sirve sobre todo para…", options: ["conversar con calma", "pagar rápido", "cocinar"], answerIndex: 0, annotationId: "a1" },
    ],
    use: {
      prompt: "Escribe una frase con esta expresión.",
      gapSentence: "Los domingos comemos y después charlamos ______.",
      sampleAnswer: "sin prisa",
      keyExpressions: ["sin prisa"],
    },
  },
];
