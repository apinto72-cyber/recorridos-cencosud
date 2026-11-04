# Newlead Contact Center · Sistema Multi-Recorridos

Repositorio organizado para el procesamiento, homologación y extracción de recorridos telefónicos de Newlead Contact Center.

Cada cliente y servicio opera en su propia carpeta independiente y autónoma, con su propia aplicación nativa de escritorio para Windows (100% offline y sin dependencias de servidor).

---

## 📁 Estructura del Proyecto

`	ext
Recorridos/
│
├── 📁 Recorrido_Cencosud/       -> Módulo operacional para recorridos Cencosud
│   ├── Newlead-Cencosud.exe     -> Aplicación ejecutable standalone para Windows
│   ├── index.html, app.js       -> Motor cliente de homologación y reglas de negocio
│   ├── iniciar_cencosud.bat     -> Script de inicio rápido
│   └── compilar_cencosud.bat    -> Compilador nativo C# (csc.exe)
│
├── 📁 Recorrido_Transbank/      -> Módulo operacional para recorridos Transbank
│   ├── Newlead-Transbank.exe    -> Aplicación ejecutable standalone para Windows
│   ├── index.html, app.js       -> Motor cliente de homologación Transbank
│   └── iniciar_transbank.bat    -> Script de inicio rápido
│
├── 📁 Recorrido_Mapfre/         -> Módulo operacional para recorridos Mapfre
│   ├── Recorrido-Mapfre.exe     -> Aplicación ejecutable standalone para Windows
│   ├── index.html, app.js       -> Motor cliente de homologación Mapfre
│   └── iniciar_mapfre.bat       -> Script de inicio rápido
│
└── Iniciar_Recorridos.bat       -> Menú maestro interactivo para seleccionar cualquier recorrido
`

---

## 🚀 Inicio Rápido
- **Menú Central:** Haz doble clic en Iniciar_Recorridos.bat para seleccionar entre Cencosud, Transbank o Mapfre.
- **Acceso Individual:** Entra a la carpeta correspondiente e inicia el archivo ejecutable o script correspondiente.
