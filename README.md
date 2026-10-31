# Procesador de Recorridos y Homologador de Incidencias

Aplicación de escritorio / web local para procesar informes de recorridos telefónicos (Vicidial) y generar archivos CSV de incidencias homologadas por campaña.

## 🚀 Inicio Rápido
1. Haz doble clic en el archivo **`iniciar_aplicacion.bat`**.
2. Se abrirá automáticamente la aplicación en tu navegador web (`http://localhost:8501`).

## 📁 Archivos Soportados
* **Archivo de Recorridos:** Excel (`.xlsx`, `.xls`) o CSV con el reporte de llamadas.
* **Diccionario de Homologación:** `TIPIFICACIONES_CENCOSUD_FINAL.xlsx` (se detecta automáticamente de la carpeta).

## ⚙️ Reglas de Negocio Implementadas
* **Selección de Campañas:** Permite seleccionar uno o varios IDs de campaña (ejemplo: campañas `91` y `107` combinadas).
* **Renombrado Automático de Archivos:** Genera el nombre con la fecha de gestión detectada (ej. `Incidencia_Cencosud_EEFF_TZ_20261029.csv`), permitiendo editarlo antes de descargar.
* **Formato de Fechas:**
  * `FECHA DE GESTIÓN`: formato **`YYYY-MM-DD`**.
  * `FECHALLAMADA`: formato **`DD-MM-YYYY`**.
* **Llamadas con fin vacío:** Si la hora de fin de llamada está vacía, se iguala automáticamente a la hora de inicio y la duración se fija en `0`.
* **Mapeo de Usuarios:** Marcador automático (`VDAD`) se homologa como ejecutivo `1`.
* **Exportación CSV:** Delimitado por punto y coma (`;`), codificado en UTF-8 con BOM (`utf-8-sig`) con las 13 columnas requeridas.
