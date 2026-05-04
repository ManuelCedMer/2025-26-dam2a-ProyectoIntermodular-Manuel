/**
 * Datos iniciales de recetas.
 * Este archivo contiene la información base utilizada para cargar recetas
 * de ejemplo en la base de datos de Firebase.
 */
export const recipesSeed = [
  {
    title: "Avena con fruta y yogur",
    mealType: "desayuno",
    estimatedCalories: 350,
    ingredients: [
      "avena",
      "yogur natural",
      "plátano",
      "fresas",
      "miel",
    ],
    steps:
      "Poner el yogur en un bol.\nAñadir la avena y mezclar.\nCortar el plátano y las fresas y colocarlas por encima.\nTerminar con un poco de miel al gusto.",
    tags: ["desayuno", "rápido", "equilibrado", "vegetariano"],
  },
  {
    title: "Tostadas integrales con aguacate y huevo",
    mealType: "desayuno",
    estimatedCalories: 420,
    ingredients: [
      "pan integral",
      "aguacate",
      "huevo",
      "sal",
      "pimienta",
      "aceite de oliva",
    ],
    steps:
      "Tostar el pan integral.\nAplastar el aguacate con un tenedor y salpimentar.\nCocer o freír el huevo al gusto.\nUntar el aguacate sobre el pan y colocar el huevo encima.\nAñadir un chorrito de aceite de oliva.",
    tags: ["desayuno", "proteico", "equilibrado"],
  },
  {
    title: "Tortilla francesa con ensalada",
    mealType: "desayuno",
    estimatedCalories: 300,
    ingredients: [
      "huevos",
      "mezcla de lechugas",
      "tomate",
      "aceite de oliva",
      "sal",
      "vinagre",
    ],
    steps:
      "Batir los huevos con una pizca de sal.\nCocinar la tortilla en una sartén con un poco de aceite.\nPreparar la ensalada con lechuga y tomate.\nAliñar la ensalada con aceite, sal y vinagre.\nServir la tortilla acompañada de la ensalada.",
    tags: ["desayuno", "rápido", "proteico"],
  },
  {
    title: "Overnight oats de chocolate y plátano",
    mealType: "desayuno",
    estimatedCalories: 380,
    ingredients: [
      "avena",
      "leche o bebida vegetal",
      "cacao puro en polvo",
      "plátano",
      "semillas de chía",
    ],
    steps:
      "Mezclar en un tarro la avena, la leche, el cacao y las semillas de chía.\nRemover bien y cerrar el tarro.\nDejar reposar en la nevera toda la noche.\nAntes de servir, añadir rodajas de plátano por encima.",
    tags: ["desayuno", "rápido", "pre_entreno", "vegetariano"],
  },
  {
    title: "Yogur con frutos secos y miel",
    mealType: "snack",
    estimatedCalories: 250,
    ingredients: [
      "yogur natural",
      "nueces",
      "almendras",
      "miel",
      "canela (opcional)",
    ],
    steps:
      "Poner el yogur en un bol.\nPicar ligeramente las nueces y las almendras.\nAñadir los frutos secos por encima del yogur.\nTerminar con un poco de miel y, si se desea, canela.",
    tags: ["snack", "rápido", "alto_en_fibra", "vegetariano"],
  },
  {
    title: "Ensalada de garbanzos vegana",
    mealType: "comida",
    estimatedCalories: 450,
    ingredients: [
      "garbanzos cocidos",
      "tomate",
      "pepino",
      "cebolla morada",
      "aceite de oliva",
      "limón",
      "sal",
      "perejil",
    ],
    steps:
      "Lavar y escurrir los garbanzos si son de bote.\nPicar el tomate, el pepino y la cebolla.\nMezclar todo en un bol grande.\nAliñar con aceite de oliva, zumo de limón y sal.\nAñadir perejil picado al gusto.",
    tags: ["comida", "vegano", "alto_en_fibra", "ensalada", "rápido"],
  },
  {
    title: "Pechuga de pollo a la plancha con arroz integral",
    mealType: "comida",
    estimatedCalories: 600,
    ingredients: [
      "pechuga de pollo",
      "arroz integral",
      "aceite de oliva",
      "sal",
      "pimienta",
      "ajo en polvo",
    ],
    steps:
      "Cocer el arroz integral siguiendo las instrucciones del paquete.\nSalpimentar la pechuga de pollo y añadir ajo en polvo.\nCocinar la pechuga a la plancha con un poco de aceite.\nServir el pollo acompañado del arroz integral.",
    tags: ["comida", "proteico", "equilibrado"],
  },
  {
    title: "Salmón al horno con verduras",
    mealType: "cena",
    estimatedCalories: 550,
    ingredients: [
      "lomo de salmón",
      "calabacín",
      "pimiento",
      "cebolla",
      "aceite de oliva",
      "sal",
      "pimienta",
      "limón",
    ],
    steps:
      "Precalentar el horno a 180 grados.\nCortar las verduras en tiras o trozos.\nColocar las verduras en una bandeja y aliñar con aceite, sal y pimienta.\nPoner el salmón encima, añadir sal y un poco de limón.\nHornear unos 15-20 minutos hasta que el salmón esté hecho.",
    tags: ["cena", "proteico", "bajo_en_grasas"],
  },
  {
    title: "Bowl de quinoa con verduras y tofu",
    mealType: "comida",
    estimatedCalories: 520,
    ingredients: [
      "quinoa",
      "tofu firme",
      "brócoli",
      "zanahoria",
      "aceite de oliva",
      "salsa de soja baja en sal",
      "sal",
      "pimienta",
    ],
    steps:
      "Lavar la quinoa y cocerla según las instrucciones del paquete.\nCortar el tofu en dados y dorarlo en una sartén con un poco de aceite.\nCocinar el brócoli y la zanahoria al vapor o salteados.\nColocar la quinoa en un bol, añadir las verduras y el tofu.\nAliñar con un poco de salsa de soja.",
    tags: ["comida", "vegano", "bowl", "equilibrado"],
  },
  {
    title: "Sandwich integral de pavo y queso",
    mealType: "snack",
    estimatedCalories: 320,
    ingredients: [
      "pan integral",
      "pechuga de pavo",
      "queso bajo en grasa",
      "lechuga",
      "tomate",
    ],
    steps:
      "Tostar ligeramente el pan si se desea.\nColocar las lonchas de pavo y queso entre las rebanadas.\nAñadir lechuga y tomate.\nCerrar el sandwich y cortar por la mitad.",
    tags: ["snack", "rápido", "proteico"],
  },
  {
    title: "Crema de calabaza",
    mealType: "cena",
    estimatedCalories: 300,
    ingredients: [
      "calabaza",
      "patata",
      "zanahoria",
      "cebolla",
      "aceite de oliva",
      "sal",
      "caldo de verduras o agua",
    ],
    steps:
      "Pelar y trocear la calabaza, la patata, la zanahoria y la cebolla.\nRehogar la cebolla en una olla con un poco de aceite.\nAñadir el resto de verduras y cubrir con caldo o agua.\nCocer hasta que las verduras estén tiernas.\nTriturar hasta obtener una crema fina y ajustar de sal.",
    tags: ["cena", "sopa", "vegetariano"],
  },
  {
    title: "Pasta integral con tomate y atún",
    mealType: "comida",
    estimatedCalories: 650,
    ingredients: [
      "pasta integral",
      "atún en conserva al natural",
      "tomate triturado",
      "aceite de oliva",
      "ajo",
      "sal",
      "orégano",
    ],
    steps:
      "Cocer la pasta integral en abundante agua con sal.\nEn una sartén, rehogar ajo picado en aceite.\nAñadir el tomate triturado y cocinar unos minutos.\nIncorporar el atún escurrido y mezclar.\nJuntar la salsa con la pasta y espolvorear orégano.",
    tags: ["comida", "pasta", "proteico"],
  },
  {
    title: "Hamburguesa casera de ternera con ensalada",
    mealType: "cena",
    estimatedCalories: 700,
    ingredients: [
      "carne picada de ternera",
      "pan de hamburguesa integral",
      "lechuga",
      "tomate",
      "cebolla",
      "sal",
      "pimienta",
      "aceite de oliva",
    ],
    steps:
      "Formar la hamburguesa con la carne picada y salpimentar.\nCocinarla a la plancha con un poco de aceite.\nTostar ligeramente el pan.\nMontar la hamburguesa con lechuga, tomate y cebolla.\nServir acompañada de una ensalada si se desea.",
    tags: ["cena", "plato_unico", "proteico"],
  },
  {
    title: "Tostada de hummus y tomate",
    mealType: "snack",
    estimatedCalories: 230,
    ingredients: [
      "pan integral",
      "hummus",
      "tomate",
      "aceite de oliva",
      "orégano",
    ],
    steps:
      "Tostar el pan integral.\nUntar una capa generosa de hummus.\nColocar rodajas de tomate por encima.\nAñadir un chorrito de aceite y espolvorear orégano.",
    tags: ["snack", "vegano", "rápido"],
  },
  {
    title: "Revuelto de claras con espinacas",
    mealType: "cena",
    estimatedCalories: 220,
    ingredients: [
      "claras de huevo",
      "espinacas frescas",
      "aceite de oliva",
      "sal",
      "pimienta",
    ],
    steps:
      "Saltear las espinacas en una sartén con un poco de aceite.\nBatir las claras con sal y pimienta.\nAñadir las claras a la sartén y remover hasta que cuajen.\nServir inmediatamente.",
    tags: ["cena", "proteico", "bajo_en_grasas"],
  },
  {
    title: "Bowl de yogur, avena y frutos rojos",
    mealType: "desayuno",
    estimatedCalories: 330,
    ingredients: [
      "yogur natural",
      "avena",
      "frutos rojos",
      "semillas de chía",
    ],
    steps:
      "Colocar el yogur en un bol.\nAñadir la avena y mezclar ligeramente.\nIncorporar los frutos rojos por encima.\nTerminar con semillas de chía.",
    tags: ["desayuno", "rápido", "equilibrado"],
  },
  {
    title: "Arroz integral con verduras salteadas",
    mealType: "comida",
    estimatedCalories: 500,
    ingredients: [
      "arroz integral",
      "pimiento",
      "calabacín",
      "zanahoria",
      "cebolla",
      "aceite de oliva",
      "sal",
      "salsa de soja (opcional)",
    ],
    steps:
      "Cocer el arroz integral según las instrucciones del paquete.\nCortar las verduras en tiras o dados.\nSaltear las verduras en una sartén con aceite.\nMezclar el arroz con las verduras.\nAjustar de sal y añadir un poco de salsa de soja si se desea.",
    tags: ["comida", "bowl", "alto_en_fibra", "vegetariano"],
  },
  {
    title: "Ensalada de pollo y manzana",
    mealType: "comida",
    estimatedCalories: 480,
    ingredients: [
      "pechuga de pollo",
      "mezcla de lechugas",
      "manzana",
      "nueces",
      "aceite de oliva",
      "vinagre",
      "sal",
    ],
    steps:
      "Cocinar la pechuga de pollo a la plancha y cortarla en tiras.\nLavar la lechuga y colocarla en un bol.\nCortar la manzana en dados.\nAñadir el pollo, la manzana y las nueces.\nAliñar con aceite, vinagre y sal al gusto.",
    tags: ["comida", "proteico", "ensalada"],
  },
  {
    title: "Sopa de verduras ligera",
    mealType: "cena",
    estimatedCalories: 220,
    ingredients: [
      "zanahoria",
      "puerro",
      "apio",
      "patata",
      "caldo de verduras",
      "sal",
      "aceite de oliva",
    ],
    steps:
      "Picar todas las verduras en trozos pequeños.\nRehogar ligeramente en una olla con un poco de aceite.\nCubrir con caldo de verduras.\nCocer hasta que las verduras estén tiernas.\nAjustar de sal y servir caliente.",
    tags: ["cena", "sopa", "bajo_en_grasas", "vegetariano"],
  },
  {
    title: "Tacos de pollo con verduras",
    mealType: "cena",
    estimatedCalories: 600,
    ingredients: [
      "tortillas de trigo o maíz",
      "pechuga de pollo",
      "pimiento",
      "cebolla",
      "aceite de oliva",
      "sal",
      "pimienta",
      "especias al gusto (pimentón, comino, etc.)",
    ],
    steps:
      "Cortar el pollo en tiras y salpimentar.\nSaltear el pollo en una sartén con aceite y especias.\nCortar el pimiento y la cebolla en tiras y saltearlas.\nCalentar las tortillas en una sartén.\nRellenar las tortillas con el pollo y las verduras.",
    tags: ["cena", "plato_unico", "elaborado"],
  },
];
