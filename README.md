**NutriFit**
NutriFit es una aplicación web responsive orientada a la gestión básica de la salud y el bienestar personal. Permite al usuario registrar y consultar rutinas de ejercicio, planes de alimentación, recetas favoritas y datos de progreso como calorías, peso y notas diarias.
El proyecto ha sido desarrollado como Proyecto Intermodular de 2º DAM, utilizando React, Vite y Firebase.

**Funcionalidades principales**
Registro, inicio de sesión, cierre de sesión y recuperación de contraseña.
Edición del perfil de usuario, incluyendo objetivo personal, metas calóricas, tema visual y foto de perfil.
Gestión de rutinas de ejercicio y ejercicios asociados.
Uso de plantillas de rutinas predefinidas.
Gestión de planes de alimentación y comidas asociadas.
Búsqueda de recetas por ingrediente y tipo de comida.
Sistema de recetas favoritas.
Registro diario de calorías consumidas, calorías gastadas, peso y notas.
Visualización del progreso mediante gráficos interactivos.
Modo claro/oscuro.
Diseño responsive adaptado a escritorio y móvil.

**Tecnologías utilizadas**
React
Vite
JavaScript
React Router
Context API
Firebase Authentication
Cloud Firestore
Firebase Storage
Firebase Hosting
Recharts
CSS propio con componentes reutilizables
Git y GitHub

**Estructura del proyecto**
src/
├── components/ → Componentes reutilizables y de interfaz
├── context/ → Contexto global de autenticación
├── layouts/ → Layout principal de la aplicación
├── pages/ → Pantallas principales
├── services/ → Comunicación con Firebase
├── utils/ → Funciones auxiliares
├── App.jsx → Configuración de rutas
└── App.css → Estilos globales

**Instalación y ejecución local**
Instalar dependencias:
npm install
Ejecutar en entorno de desarrollo:
npm run dev
Generar versión de producción:
npm run build

**Despliegue**
La aplicación ha sido desplegada mediante Firebase Hosting.
Para ello, se genera la carpeta dist mediante Vite y posteriormente se publica como una SPA en Firebase Hosting, permitiendo la navegación entre rutas sin recargas completas.

**Estado del proyecto**
El proyecto se encuentra en una versión funcional de Producto Mínimo Viable.
Incluye las funcionalidades principales planteadas en la memoria y queda preparado para posibles ampliaciones futuras, como gamificación, comunidad entre usuarios, notificaciones o ampliación del catálogo visual.

**Autor**
Manuel Cedrón Merayo
Proyecto Intermodular — 2º DAM

**Notas**
Este repositorio recoge la evolución del desarrollo del proyecto mediante commits asociados a funcionalidades, correcciones, pruebas y mejoras visuales.
