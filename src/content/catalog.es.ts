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
  },
];
