# -*- coding: utf-8 -*-
"""
Aplicación Web/Escritorio para Homologación y Exportación de Recorridos.
"""
import os
import subprocess
import importlib
import streamlit as st
import pandas as pd

# Recargar módulo de procesamiento para evitar problemas de caché en memoria de Streamlit
import processor
importlib.reload(processor)

from processor import (
    load_recorridos_file,
    load_tipificaciones_file,
    get_available_campaigns,
    detect_dominant_date_yyyymmdd,
    resolve_campaign_filename,
    transform_recorridos,
    export_to_csv_bytes,
    plan_campaign_exports,
    export_selected_campaigns_zip,
    CAMPAIGN_REGISTRY,
    CAMPAIGN_PREFIX_MAP
)

st.set_page_config(
    page_title="Procesador de Recorridos e Incidencias",
    page_icon="📞",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
    .main-header {
        font-size: 26px;
        font-weight: 700;
        color: #1E3A8A;
        margin-bottom: 2px;
    }
    .sub-header {
        font-size: 15px;
        color: #4B5563;
        margin-bottom: 20px;
    }
    .card-box {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 10px;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-header">📞 Procesador de Recorridos y Homologación de Incidencias</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Exporta de forma automática archivos independientes por campaña con validación estricta de 3 dígitos de ID y exclusión de registros con celdas en blanco.</div>', unsafe_allow_html=True)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_TIP_FILE = os.path.join(CURRENT_DIR, "TIPIFICACIONES_CENCOSUD_FINAL.xlsx")

# Barra lateral
with st.sidebar:
    st.header("📂 1. Carga de Archivos")

    recorridos_file = st.file_uploader(
        "Subir Archivo de Recorridos (Excel o CSV)",
        type=["xlsx", "xls", "csv"],
        help="Sube el archivo de llamadas exportado de Vicidial."
    )

    st.markdown("---")
    st.subheader("📋 Diccionario de Homologación")

    use_default_tip = False
    if os.path.exists(DEFAULT_TIP_FILE):
        use_default_tip = st.checkbox(
            "Usar diccionario de la carpeta (TIPIFICACIONES_CENCOSUD_FINAL.xlsx)",
            value=True
        )

    tipificaciones_file = None
    if not use_default_tip or not os.path.exists(DEFAULT_TIP_FILE):
        tipificaciones_file = st.file_uploader(
            "Subir Diccionario de Tipificaciones",
            type=["xlsx", "xls", "csv"]
        )
    else:
        st.info("✅ Diccionario predeterminado activo.")

# Área principal
if recorridos_file is None:
    st.info("👆 Por favor sube tu archivo de **Recorridos** en el panel lateral izquierdo.")

    sample_rec = os.path.join(CURRENT_DIR, "INFORME LLAMADAS MANUALES - 2026-10-29T202724.085.xlsx")
    if os.path.exists(sample_rec):
        if st.button("🧪 Cargar archivo de prueba local (INFORME LLAMADAS MANUALES)"):
            with open(sample_rec, "rb") as f:
                st.session_state["demo_rec_bytes"] = f.read()
            st.rerun()

    if "demo_rec_bytes" in st.session_state:
        import io
        recorridos_file = io.BytesIO(st.session_state["demo_rec_bytes"])
        recorridos_file.name = "INFORME_LLAMADAS_MANUALES_DEMO.xlsx"
else:
    if "demo_rec_bytes" in st.session_state:
        del st.session_state["demo_rec_bytes"]

if recorridos_file is not None:
    try:
        with st.spinner("Leyendo archivo de recorridos..."):
            df_recorridos = load_recorridos_file(recorridos_file)

        if use_default_tip and os.path.exists(DEFAULT_TIP_FILE):
            df_tipificaciones = load_tipificaciones_file(DEFAULT_TIP_FILE)
        elif tipificaciones_file is not None:
            df_tipificaciones = load_tipificaciones_file(tipificaciones_file)
        else:
            st.warning("⚠️ Debes seleccionar o subir un archivo de tipificaciones.")
            st.stop()

    except Exception as e:
        st.error(f"❌ Error al cargar los archivos: {str(e)}")
        st.stop()

    available_campaigns = get_available_campaigns(df_recorridos)
    if not available_campaigns:
        st.error("No se detectó la columna de 'Campaign ID' en el archivo cargado.")
        st.stop()

    dominant_date = detect_dominant_date_yyyymmdd(df_recorridos)
    camps_ids_only = [c[0] for c in available_campaigns]

    st.markdown("---")
    st.subheader(f"🎯 2. Selecciona las Campañas a Exportar (Detectadas: {len(available_campaigns)})")

    col_p1, col_p2, col_p3 = st.columns([2, 1, 1])

    cenco_target_ids = ["91", "107", "96", "106", "108", "109"]
    present_cenco_ids = [c for c in cenco_target_ids if c in camps_ids_only]

    def update_selected(new_list):
        st.session_state["selected_camps"] = new_list

    with col_p1:
        if st.button("⭐ Seleccionar las 6 Campañas Cencosud (91, 107, 96, 106, 108, 109)", type="secondary", use_container_width=True):
            update_selected(present_cenco_ids)
            st.rerun()

    with col_p2:
        if st.button("Seleccionar Todas", use_container_width=True):
            update_selected(camps_ids_only)
            st.rerun()

    with col_p3:
        if st.button("Limpiar Selección", use_container_width=True):
            update_selected([])
            st.rerun()

    if "selected_camps" not in st.session_state:
        st.session_state["selected_camps"] = present_cenco_ids if present_cenco_ids else camps_ids_only

    camp_options = {c[0]: f"Campaña {c[0]} ({c[1]} registros)" for c in available_campaigns}
    selected_campaigns = st.multiselect(
        "Campañas seleccionadas:",
        options=list(camp_options.keys()),
        format_func=lambda x: camp_options.get(x, x),
        default=[c for c in st.session_state["selected_camps"] if c in camp_options],
        key="ms_campaigns"
    )

    if not selected_campaigns:
        st.warning("⚠️ Selecciona al menos una campaña para generar los archivos.")
        st.stop()

    plans = plan_campaign_exports(selected_campaigns, dominant_date)

    st.markdown("---")
    st.subheader(f"📁 3. Archivos Independientes Generados ({len(plans)} archivos)")
    st.caption("ℹ️ Validaciones activas: **Prefijo 3 dígitos (91-107: 113, 96: 125, 106: 115, 108: 110, 109: 114)** + **Cero Celdas en Blanco** (cualquier fila con celda vacía queda excluida).")

    # Procesar datos y generar archivos
    with st.spinner("Generando y validando archivos independientes..."):
        zip_bytes, manifest = export_selected_campaigns_zip(
            df_recorridos,
            df_tipificaciones,
            selected_campaigns,
            dominant_date
        )

    # Botones de Acción Masiva
    col_act1, col_act2 = st.columns([1, 1])

    with col_act1:
        zip_filename = f"Incidencias_Cencosud_Seleccionadas_{dominant_date}.zip"
        st.download_button(
            label=f"📦 Descargar Selección en ZIP ({len(manifest)} archivos independientes)",
            data=zip_bytes,
            file_name=zip_filename,
            mime="application/zip",
            type="primary",
            use_container_width=True
        )

    with col_act2:
        out_folder = os.path.join(CURRENT_DIR, f"Incidencias_Exportadas_{dominant_date}")
        if st.button(f"💾 Guardar los {len(manifest)} archivos en carpeta local", use_container_width=True):
            os.makedirs(out_folder, exist_ok=True)
            for m in manifest:
                file_dest = os.path.join(out_folder, m["archivo"])
                with open(file_dest, "wb") as f_out:
                    f_out.write(m["csv_bytes"])
            st.success(f"✅ ¡Se guardaron exitosamente los {len(manifest)} archivos en:\n`{out_folder}`")
            try:
                subprocess.Popen(f'explorer "{out_folder}"')
            except Exception:
                pass

    st.markdown("---")
    st.markdown("#### Detalle y Descarga Individual de cada Archivo:")

    for idx, item in enumerate(manifest):
        camps_label = " + ".join(item["campanas"])
        stats = item.get("stats", {})
        prefijo_info = item.get("expected_prefix", stats.get("prefijo_esperado", "N/A"))
        excluidos_pref = stats.get("registros_excluidos_prefijo", 0)
        excluidos_blanco = stats.get("registros_excluidos_celda_blanco", 0)

        with st.container():
            c1, c2 = st.columns([3, 1])
            with c1:
                st.markdown(f"**📄 `{item['archivo']}`**")
                st.markdown(f"• **Canal:** {item['nombre']}  \n• **Campaña(s) origen:** {camps_label}  \n• **Registros válidos finales:** **{item['registros']:,} filas** (100% completas, sin celdas en blanco)  \n• **Prefijo ID requerido:** `{prefijo_info}`")
                
                # Avisos de exclusión
                if excluidos_pref > 0:
                    st.warning(f"🛡️ **Prefijo:** Se excluyeron **{excluidos_pref} registros** cuyo ID no comenzaba con `{prefijo_info}`.")
                if excluidos_blanco > 0:
                    st.error(f"🚫 **Celdas en blanco:** Se excluyeron **{excluidos_blanco} registros** que tenían al menos una celda vacía.")
                if excluidos_pref == 0 and excluidos_blanco == 0:
                    st.success("✨ Todos los registros cumplieron el prefijo y no contenían celdas en blanco.")

            with c2:
                st.download_button(
                    label=f"⬇️ Descargar este CSV",
                    data=item["csv_bytes"],
                    file_name=item["archivo"],
                    mime="text/csv",
                    key=f"dl_indiv_{idx}",
                    use_container_width=True
                )

            with st.expander(f"Ver vista previa de `{item['archivo']}` ({item['registros']} registros)"):
                st.dataframe(item["df"].head(100), use_container_width=True)

                if excluidos_blanco > 0 and stats.get("detalle_excluidos_blanco"):
                    st.caption("Detalle de registros excluidos por celdas en blanco:")
                    st.dataframe(pd.DataFrame(stats["detalle_excluidos_blanco"]))

                if excluidos_pref > 0 and stats.get("detalle_excluidos_prefijo"):
                    st.caption("Detalle de registros excluidos por prefijo no coincidente:")
                    st.dataframe(pd.DataFrame(stats["detalle_excluidos_prefijo"]))

            st.markdown("<hr style='margin: 8px 0; border: none; border-top: 1px solid #E2E8F0;'/>", unsafe_allow_html=True)
