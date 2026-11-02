# -*- coding: utf-8 -*-
"""
Aplicación Web/Escritorio para Homologación y Exportación de Recorridos - Newlead Contact Center.
Incluye Control de Acceso por Roles (Administrador / Operador) y Revocación Instantánea de Permisos.
"""
import os
import io
import base64
import subprocess
import importlib
import streamlit as st
import pandas as pd

import processor
import auth
importlib.reload(processor)
importlib.reload(auth)

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
from auth import (
    authenticate_user,
    is_session_valid,
    list_all_users,
    create_new_user,
    set_user_active_status,
    change_user_password,
    delete_user_account
)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_TIP_FILE = os.path.join(CURRENT_DIR, "TIPIFICACIONES_CENCOSUD_FINAL.xlsx")
LOGO_PATH = os.path.join(CURRENT_DIR, "logo_newlead.png")

st.set_page_config(
    page_title="Newlead · Procesador Operacional de Recorridos",
    page_icon=LOGO_PATH if os.path.exists(LOGO_PATH) else "📞",
    layout="wide",
    initial_sidebar_state="collapsed"
)


def get_base64_logo(path: str) -> str:
    if os.path.exists(path):
        with open(path, "rb") as img_f:
            return base64.b64encode(img_f.read()).decode("utf-8")
    return ""


logo_b64 = get_base64_logo(LOGO_PATH)
logo_html = (
    f'<div class="nl-logo-box"><img src="data:image/png;base64,{logo_b64}" alt="Newlead Contact Center" /></div>'
    if logo_b64
    else '<div class="nl-logo-box"><span style="color:#0A3D62;font-weight:800;font-size:18px;">Newlead</span></div>'
)

st.markdown("""
<style>
    .stApp { background-color: #EAF2F8 !important; }
    .block-container { padding-top: 1.4rem !important; padding-bottom: 2.5rem !important; max-width: 96% !important; }
    header[data-testid="stHeader"] { background: transparent !important; }
    .nl-hero {
        background: linear-gradient(100deg, #092340 0%, #0B4368 52%, #0E7489 100%);
        border-radius: 18px; padding: 20px 28px; color: #FFFFFF;
        display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 16px; box-shadow: 0 8px 24px rgba(9, 35, 64, 0.16); margin-bottom: 12px;
    }
    .nl-hero-left { display: flex; align-items: center; gap: 20px; }
    .nl-logo-box {
        background: #FFFFFF; border-radius: 14px; padding: 8px 16px;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
    .nl-logo-box img { height: 48px; width: auto; object-fit: contain; }
    .nl-hero-title { font-size: 26px; font-weight: 800; letter-spacing: -0.3px; margin: 0 0 4px 0; color: #FFFFFF; line-height: 1.15; }
    .nl-hero-sub { font-size: 13.5px; color: #D2E9F6; margin: 0; font-weight: 400; }
    .nl-hero-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .nl-badge-green {
        background: rgba(16, 185, 129, 0.22); border: 1px solid rgba(52, 211, 153, 0.55);
        color: #A7F3D0; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.3px;
    }
    .nl-badge-glass {
        background: rgba(255, 255, 255, 0.13); border: 1px solid rgba(255, 255, 255, 0.25);
        color: #F0F9FF; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600;
    }
    .nl-login-card {
        background: #FFFFFF; border-radius: 20px; border: 1px solid #D5E3EE;
        box-shadow: 0 14px 36px rgba(9, 35, 64, 0.12); overflow: hidden; margin-top: 24px;
    }
    .nl-login-banner {
        background: linear-gradient(100deg, #092340 0%, #0B4368 55%, #0E7489 100%);
        padding: 26px 28px; text-align: center; color: #FFFFFF;
    }
    .nl-status-bar {
        background: linear-gradient(90deg, #ECFDF5 0%, #F4FBF8 100%);
        border: 1px solid #B7EBD3; border-left: 6px solid #00B862; border-radius: 12px;
        padding: 11px 18px; display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 10px; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(11, 37, 69, 0.04);
    }
    .nl-status-left { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #064E3B; font-weight: 600; }
    .nl-dot-green { width: 10px; height: 10px; background-color: #00B862; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 3px rgba(0, 184, 98, 0.2); }
    .nl-status-pill { background: #FFFFFF; border: 1px solid #A7F3D0; color: #047857; font-size: 11.5px; font-weight: 700; padding: 4px 12px; border-radius: 999px; }
    .nl-pills-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
    .nl-info-pill {
        background: #FFFFFF; border: 1px solid #D5E3EE; border-radius: 999px;
        padding: 6px 15px; font-size: 12.5px; font-weight: 700; color: #0B2545; box-shadow: 0 2px 5px rgba(11, 37, 69, 0.03);
    }
    .nl-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(165px, 1fr)); gap: 12px; margin-bottom: 18px; }
    .nl-kpi-card {
        background: #FFFFFF; border-radius: 14px; padding: 14px 16px; border: 1px solid #DCE7F1;
        box-shadow: 0 4px 12px rgba(11, 37, 69, 0.04); position: relative; overflow: hidden;
    }
    .nl-kpi-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--accent-color, #0077C2); }
    .nl-kpi-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.4px; margin-bottom: 6px; }
    .nl-kpi-value { font-size: 27px; font-weight: 800; color: #092340; line-height: 1.1; margin-bottom: 4px; }
    .nl-kpi-sub { font-size: 11.5px; color: #64748B; font-weight: 500; }
    .nl-panel { background: #FFFFFF; border-radius: 16px; border: 1px solid #DCE7F1; padding: 18px 22px; box-shadow: 0 4px 16px rgba(11, 37, 69, 0.05); margin-bottom: 18px; }
    .nl-panel-header { display: flex; align-items: center; gap: 10px; font-size: 15.5px; font-weight: 800; color: #092340; margin-bottom: 14px; border-left: 4px solid #0077C2; padding-left: 10px; }
    .nl-subcard { background: #F8FBFE; border: 1px solid #DCE7F1; border-radius: 12px; padding: 14px 16px; margin-bottom: 10px; }
    .nl-tag-blue { display: inline-block; background: #E0F2FE; color: #0369A1; font-size: 10.5px; font-weight: 800; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px; }
    .nl-tag-green { display: inline-block; background: #DCFCE7; color: #15803D; font-size: 10.5px; font-weight: 800; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; margin-bottom: 6px; }
    .nl-tag-orange { display: inline-block; background: #FEF3C7; color: #B45309; font-size: 10.5px; font-weight: 800; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; margin-bottom: 6px; }
    .nl-tag-red { display: inline-block; background: #FEE2E2; color: #B91C1C; font-size: 10.5px; font-weight: 800; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; margin-bottom: 6px; }
    .nl-subcard-title { font-size: 15px; font-weight: 800; color: #092340; margin-bottom: 4px; }
    .nl-subcard-desc { font-size: 12.5px; color: #475569; }
    div.stDownloadButton > button[kind="primary"], div.stButton > button[kind="primary"] {
        background: linear-gradient(90deg, #0077C2 0%, #00A8CC 100%) !important; border: none !important;
        color: #FFFFFF !important; font-weight: 700 !important; border-radius: 10px !important;
        padding: 0.55rem 1.1rem !important; box-shadow: 0 4px 12px rgba(0, 119, 194, 0.25) !important;
    }
    div.stDownloadButton > button[kind="primary"]:hover, div.stButton > button[kind="primary"]:hover {
        background: linear-gradient(90deg, #092340 0%, #0077C2 100%) !important;
    }
    div[data-testid="stTabs"] button[data-baseweb="tab"] {
        background-color: #FFFFFF; border-radius: 10px; margin-right: 8px; padding: 8px 18px;
        font-weight: 700; color: #334155; border: 1px solid #DCE7F1;
    }
    div[data-testid="stTabs"] button[data-baseweb="tab"][aria-selected="true"] {
        background: #0B4368 !important; color: #FFFFFF !important; border-color: #0B4368 !important;
    }
</style>
""", unsafe_allow_html=True)
# ==============================================================================
# CONTROL DE SESIÓN Y AUTENTICACIÓN CORPORATIVA
# ==============================================================================
if "auth_user" not in st.session_state:
    st.session_state["auth_user"] = None
if "show_users_panel" not in st.session_state:
    st.session_state["show_users_panel"] = False
if "show_pwd_panel" not in st.session_state:
    st.session_state["show_pwd_panel"] = False

if st.session_state["auth_user"] is not None:
    u_info = st.session_state["auth_user"]
    if not is_session_valid(u_info["username"], u_info.get("token_version", 1)):
        st.session_state["auth_user"] = None
        st.session_state["revoked_msg"] = "⚠️ Tu sesión ha sido cerrada porque tus permisos o contraseña fueron actualizados por el Administrador."

if st.session_state["auth_user"] is None:
    _, col_login, _ = st.columns([1.1, 1.4, 1.1])
    with col_login:
        st.markdown(f"""
        <div class="nl-login-card">
            <div class="nl-login-banner">
                <div style="display:flex; justify-content:center; margin-bottom:14px;">
                    {logo_html}
                </div>
                <div style="font-size:22px; font-weight:800; letter-spacing:-0.3px;">Acceso Corporativo · Newlead</div>
                <div style="font-size:13px; color:#D2E9F6; margin-top:4px;">Procesador Operacional de Recorridos Cencosud</div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        if st.session_state.get("revoked_msg"):
            st.error(st.session_state["revoked_msg"])
            st.session_state["revoked_msg"] = None

        with st.form("login_form", clear_on_submit=False):
            st.markdown("##### 🔐 Ingresa tus credenciales autorizadas")
            in_user = st.text_input("Usuario", placeholder="Ej: admin")
            in_pass = st.text_input("Contraseña", type="password", placeholder="••••••••••••")
            btn_submit = st.form_submit_button("Ingresar al Sistema", type="primary", use_container_width=True)

            if btn_submit:
                ok, msg, user_data = authenticate_user(in_user, in_pass)
                if ok and user_data:
                    st.session_state["auth_user"] = user_data
                    st.session_state["show_users_panel"] = False
                    st.session_state["show_pwd_panel"] = False
                    st.rerun()
                else:
                    st.error(msg)

        st.markdown("""
        <div style="text-align:center; font-size:12px; color:#64748B; margin-top:10px;">
            🔒 Acceso restringido exclusivamente a personal autorizado de <b>Newlead Contact Center</b>.<br/>
            Si necesitas acceso o restablecer tu clave, contacta al Administrador General.
        </div>
        """, unsafe_allow_html=True)
    st.stop()

current_user = st.session_state["auth_user"]
is_admin = current_user.get("rol") == "admin"
rol_badge_html = (
    '<span class="nl-badge-green">👑 ADMINISTRADOR - ACCESO TOTAL</span>'
    if is_admin
    else '<span class="nl-badge-glass">👤 OPERADOR AUTORIZADO</span>'
)

# 1. HERO HEADER BANNER
st.markdown(f"""
<div class="nl-hero">
    <div class="nl-hero-left">
        {logo_html}
        <div>
            <div class="nl-hero-title">Procesador Operacional de Recorridos</div>
            <div class="nl-hero-sub">Homologación de tipificaciones · Validación estricta de IDs y celdas · Exportación oficial por campaña</div>
        </div>
    </div>
    <div class="nl-hero-right">
        {rol_badge_html}
        <span class="nl-badge-glass">👤 {current_user['nombre']} ({current_user['username']})</span>
        <span class="nl-badge-glass">🔒 CERO CELDAS EN BLANCO</span>
    </div>
</div>
""", unsafe_allow_html=True)

if is_admin:
    tb_col1, tb_col2, tb_col3, tb_col4 = st.columns([4.8, 1.3, 1.3, 1.0])
    with tb_col2:
        lbl_usr = "✖ Cerrar Usuarios" if st.session_state["show_users_panel"] else "⚙️ Usuarios y Permisos"
        if st.button(lbl_usr, use_container_width=True):
            st.session_state["show_users_panel"] = not st.session_state["show_users_panel"]
            st.session_state["show_pwd_panel"] = False
            st.rerun()
    with tb_col3:
        lbl_pwd = "✖ Cerrar Clave" if st.session_state["show_pwd_panel"] else "🔑 Cambiar Clave"
        if st.button(lbl_pwd, use_container_width=True):
            st.session_state["show_pwd_panel"] = not st.session_state["show_pwd_panel"]
            st.session_state["show_users_panel"] = False
            st.rerun()
    with tb_col4:
        if st.button("🚪 Salir", use_container_width=True):
            st.session_state["auth_user"] = None
            st.rerun()
else:
    tb_col1, tb_col2, tb_col3 = st.columns([6.1, 1.3, 1.0])
    with tb_col2:
        lbl_pwd = "✖ Cerrar Clave" if st.session_state["show_pwd_panel"] else "🔑 Cambiar Clave"
        if st.button(lbl_pwd, use_container_width=True):
            st.session_state["show_pwd_panel"] = not st.session_state["show_pwd_panel"]
            st.rerun()
    with tb_col3:
        if st.button("🚪 Salir", use_container_width=True):
            st.session_state["auth_user"] = None
            st.rerun()

if st.session_state["show_pwd_panel"]:
    with st.container():
        st.markdown('<div class="nl-panel-header">🔑 Cambiar Mi Contraseña de Acceso</div>', unsafe_allow_html=True)
        with st.form("change_own_pwd_form"):
            cp1, cp2, cp3 = st.columns([2, 2, 1.2])
            with cp1:
                new_p1 = st.text_input("Nueva Contraseña (mínimo 6 caracteres)", type="password")
            with cp2:
                new_p2 = st.text_input("Confirmar Nueva Contraseña", type="password")
            with cp3:
                st.write("")
                sub_pwd = st.form_submit_button("Guardar Nueva Clave", type="primary", use_container_width=True)

            if sub_pwd:
                if new_p1 != new_p2:
                    st.error("Las contraseñas no coinciden.")
                else:
                    ok_p, msg_p, new_ver = change_user_password(current_user["username"], new_p1)
                    if ok_p:
                        st.session_state["auth_user"]["token_version"] = new_ver
                        st.success(msg_p)
                    else:
                        st.error(msg_p)
        st.markdown("---")

if is_admin and st.session_state["show_users_panel"]:
    with st.container():
        st.markdown('<div class="nl-panel-header">⚙️ Administración de Usuarios y Control de Acceso (Ex-trabajadores / Permisos)</div>', unsafe_allow_html=True)
        st.info("💡 **¿Alguien se fue de la empresa?** Haz clic en **🚫 Bloquear Acceso** o **🗑️ Eliminar** junto a su usuario. Su sesión se cerrará en el acto y no podrá volver a entrar aunque tenga el enlace web.")

        u_col_list, u_col_new = st.columns([2.1, 1.3])

        with u_col_list:
            st.markdown("##### 👥 Usuarios Registrados")
            users_list = list_all_users()
            for u in users_list:
                u_name = u["username"]
                is_active = u["activo"]
                rol_txt = "👑 ADMIN" if u["rol"] == "admin" else "👤 OPERADOR"
                status_badge = (
                    '<span class="nl-tag-green">🟢 ACTIVO</span>'
                    if is_active
                    else '<span class="nl-tag-red">🚫 ACCESO BLOQUEADO</span>'
                )

                c_info, c_act1, c_act2 = st.columns([2.6, 1.2, 1.0])
                with c_info:
                    st.markdown(f"""
                    <div class="nl-subcard" style="padding:10px 14px; margin-bottom:8px;">
                        <div><span class="nl-tag-blue">{rol_txt}</span> {status_badge}</div>
                        <div style="font-size:14px; font-weight:800; color:#092340;">{u['nombre']} (<code>{u_name}</code>)</div>
                        <div style="font-size:11.5px; color:#64748B;">Último ingreso: {u['ultimo_acceso']}</div>
                    </div>
                    """, unsafe_allow_html=True)

                with c_act1:
                    st.write("")
                    if u_name != "admin":
                        if is_active:
                            if st.button("🚫 Bloquear Acceso", key=f"blk_{u_name}", use_container_width=True):
                                ok_b, msg_b = set_user_active_status(u_name, False)
                                if ok_b:
                                    st.warning(msg_b)
                                    st.rerun()
                                else:
                                    st.error(msg_b)
                        else:
                            if st.button("✅ Reactivar", key=f"unblk_{u_name}", use_container_width=True):
                                ok_b, msg_b = set_user_active_status(u_name, True)
                                if ok_b:
                                    st.success(msg_b)
                                    st.rerun()
                                else:
                                    st.error(msg_b)
                    else:
                        st.caption("🔒 Cuenta Principal")

                with c_act2:
                    st.write("")
                    if u_name != "admin" and u_name != current_user["username"]:
                        if st.button("🗑️ Eliminar", key=f"del_{u_name}", use_container_width=True):
                            ok_d, msg_d = delete_user_account(u_name, current_user["username"])
                            if ok_d:
                                st.success(msg_d)
                                st.rerun()
                            else:
                                st.error(msg_d)

        with u_col_new:
            st.markdown("##### ➕ Crear Nuevo Usuario Autorizado")
            with st.form("create_user_form", clear_on_submit=True):
                nu_user = st.text_input("Usuario de ingreso (sin espacios)", placeholder="Ej: jperez")
                nu_name = st.text_input("Nombre y Apellido / Cargo", placeholder="Ej: Juan Pérez - Analista")
                nu_pass = st.text_input("Contraseña asignada (mín. 6 caracteres)", type="password")
                nu_rol = st.selectbox(
                    "Nivel de Permiso",
                    options=["operador", "admin"],
                    format_func=lambda r: "👤 Operador (Solo procesar y descargar)" if r == "operador" else "👑 Administrador (Control total y usuarios)"
                )
                btn_create = st.form_submit_button("➕ Crear Usuario", type="primary", use_container_width=True)
                if btn_create:
                    ok_c, msg_c = create_new_user(nu_user, nu_name, nu_pass, nu_rol)
                    if ok_c:
                        st.success(msg_c)
                        st.rerun()
                    else:
                        st.error(msg_c)

            st.markdown("##### 🔄 Restablecer Clave de un Usuario")
            with st.form("reset_other_pwd_form", clear_on_submit=True):
                user_options = [u["username"] for u in users_list]
                target_u = st.selectbox("Seleccionar usuario", options=user_options)
                reset_p = st.text_input("Nueva contraseña", type="password")
                btn_reset = st.form_submit_button("Actualizar Contraseña", use_container_width=True)
                if btn_reset:
                    ok_r, msg_r, new_v = change_user_password(target_u, reset_p)
                    if ok_r:
                        if target_u == current_user["username"]:
                            st.session_state["auth_user"]["token_version"] = new_v
                        st.success(msg_r)
                    else:
                        st.error(msg_r)
        st.markdown("---")
# 2. BARRA DE ESTADO OPERACIONAL
st.markdown("""
<div class="nl-status-bar">
    <div class="nl-status-left">
        <span class="nl-dot-green"></span>
        <span><b>Reglas Operacionales Activas:</b> Validación por prefijo de 3 dígitos (91-107: 113 · 96: 125 · 106: 115 · 108: 110 · 109: 114) + Exclusión automática de celdas en blanco.</span>
    </div>
    <span class="nl-status-pill">✓ Formato Fecha Gestión: YYYY-MM-DD · Separador ";"</span>
</div>
""", unsafe_allow_html=True)

# 3. PANEL DE CARGA DE ARCHIVOS
with st.container():
    st.markdown('<div class="nl-panel-header">Control de Carga de Archivos (Vicidial & Diccionario)</div>', unsafe_allow_html=True)
    c_up1, c_up2 = st.columns([2.2, 1.8])

    with c_up1:
        recorridos_file = st.file_uploader(
            "📥 1. Subir Informe de Llamadas / Recorridos (.xlsx, .xls, .csv)",
            type=["xlsx", "xls", "csv"],
            help="Arrastra aquí el reporte consolidado de llamadas exportado de Vicidial."
        )

    with c_up2:
        use_default_tip = True
        if os.path.exists(DEFAULT_TIP_FILE):
            use_default_tip = st.checkbox(
                "Usar diccionario oficial integrado (TIPIFICACIONES_CENCOSUD_FINAL.xlsx)",
                value=True
            )
        else:
            use_default_tip = False

        tipificaciones_file = None
        if not use_default_tip:
            tipificaciones_file = st.file_uploader(
                "📋 2. Subir Diccionario de Tipificaciones (.xlsx, .csv)",
                type=["xlsx", "xls", "csv"]
            )
        else:
            st.success("✓ Diccionario oficial Cencosud sincronizado y activo.")

if recorridos_file is None:
    st.markdown("""
    <div class="nl-panel" style="text-align:center; padding: 36px 20px;">
        <div class="nl-tag-blue">ESPERANDO ARCHIVO DE ORIGEN</div>
        <div style="font-size:18px; font-weight:800; color:#092340; margin-top:6px;">Sube el archivo de Recorridos en el panel superior para iniciar el procesamiento</div>
        <div style="font-size:13.5px; color:#64748B; margin-top:6px;">El sistema detectará automáticamente las campañas, validará los prefijos de 3 dígitos y descartará cualquier fila con celdas en blanco.</div>
    </div>
    """, unsafe_allow_html=True)
    st.stop()

try:
    with st.spinner("Sincronizando y leyendo base de recorridos..."):
        df_recorridos = load_recorridos_file(recorridos_file)

    if use_default_tip and os.path.exists(DEFAULT_TIP_FILE):
        df_tipificaciones = load_tipificaciones_file(DEFAULT_TIP_FILE)
    elif tipificaciones_file is not None:
        df_tipificaciones = load_tipificaciones_file(tipificaciones_file)
    else:
        st.warning("⚠️ Debes activar o subir el diccionario de tipificaciones para continuar.")
        st.stop()
except Exception as e:
    st.error(f"❌ Error al leer los archivos: {str(e)}")
    st.stop()

available_campaigns = get_available_campaigns(df_recorridos)
if not available_campaigns:
    st.error("No se encontró la columna 'Campaign ID' en el archivo subido.")
    st.stop()

dominant_date = detect_dominant_date_yyyymmdd(df_recorridos)
formatted_date_view = f"{dominant_date[6:8]}/{dominant_date[4:6]}/{dominant_date[0:4]}" if len(dominant_date) == 8 else dominant_date
camps_ids_only = [c[0] for c in available_campaigns]

# 4. FILTROS Y SELECCIÓN DE CAMPAÑAS
st.markdown('<div class="nl-panel-header">Selección Operacional de Campañas a Exportar</div>', unsafe_allow_html=True)

cenco_target_ids = ["91", "107", "96", "106", "108", "109"]
present_cenco_ids = [c for c in cenco_target_ids if c in camps_ids_only]

if "selected_camps" not in st.session_state:
    st.session_state["selected_camps"] = present_cenco_ids if present_cenco_ids else camps_ids_only

f_col1, f_col2, f_col3, f_col4 = st.columns([3.2, 1.3, 1.0, 1.0])

with f_col2:
    st.write("")
    if st.button("⭐ 6 Campañas Cencosud", use_container_width=True, help="Selecciona automáticamente 91, 107, 96, 106, 108 y 109"):
        st.session_state["selected_camps"] = present_cenco_ids
        st.rerun()

with f_col3:
    st.write("")
    if st.button("Seleccionar Todas", use_container_width=True):
        st.session_state["selected_camps"] = camps_ids_only
        st.rerun()

with f_col4:
    st.write("")
    if st.button("Limpiar Filtro", use_container_width=True):
        st.session_state["selected_camps"] = []
        st.rerun()

with f_col1:
    camp_options = {c[0]: f"Campaña {c[0]} ({c[1]:,} gestiones)" for c in available_campaigns}
    selected_campaigns = st.multiselect(
        "CAMPAÑAS ACTIVAS PARA GENERACIÓN DE ARCHIVOS INDEPENDIENTES:",
        options=list(camp_options.keys()),
        format_func=lambda x: camp_options.get(x, x),
        default=[c for c in st.session_state["selected_camps"] if c in camp_options],
        key="ms_campaigns"
    )

if not selected_campaigns:
    st.warning("⚠️ Selecciona al menos una campaña en el filtro superior para generar los archivos.")
    st.stop()

with st.spinner("Ejecutando homologación y validaciones de calidad..."):
    zip_bytes, manifest = export_selected_campaigns_zip(
        df_recorridos,
        df_tipificaciones,
        selected_campaigns,
        dominant_date
    )

total_raw_file = len(df_recorridos)
total_valid_exported = sum(m["registros"] for m in manifest)
total_excl_prefix = sum(m.get("stats", {}).get("registros_excluidos_prefijo", 0) for m in manifest)
total_excl_blank = sum(m.get("stats", {}).get("registros_excluidos_celda_blanco", 0) for m in manifest)
total_evaluated = total_valid_exported + total_excl_prefix + total_excl_blank
pct_calidad = (total_valid_exported / total_evaluated * 100.0) if total_evaluated > 0 else 100.0

# 5. TIRA DE PÍLDORAS DE RESUMEN
st.markdown(f"""
<div class="nl-pills-row">
    <span class="nl-info-pill">📅 Fecha Gestión: {formatted_date_view} ({dominant_date})</span>
    <span class="nl-info-pill">📞 Base Bruta: {total_raw_file:,} filas</span>
    <span class="nl-info-pill">🎯 Campañas Seleccionadas: {len(selected_campaigns)} de {len(available_campaigns)}</span>
    <span class="nl-info-pill">📁 Archivos Independientes: {len(manifest)}</span>
    <span class="nl-info-pill">✅ Registros Limpios: {total_valid_exported:,}</span>
</div>
""", unsafe_allow_html=True)

# 6. FILA DE TARJETAS KPI
st.markdown(f"""
<div class="nl-kpi-grid">
    <div class="nl-kpi-card" style="--accent-color: #0077C2;">
        <div class="nl-kpi-label">CAMPAÑAS DETECTADAS</div>
        <div class="nl-kpi-value">{len(available_campaigns)}</div>
        <div class="nl-kpi-sub">En archivo origen</div>
    </div>
    <div class="nl-kpi-card" style="--accent-color: #00A8CC;">
        <div class="nl-kpi-label">CAMPAÑAS ACTIVAS</div>
        <div class="nl-kpi-value">{len(selected_campaigns)}</div>
        <div class="nl-kpi-sub">Seleccionadas para exportar</div>
    </div>
    <div class="nl-kpi-card" style="--accent-color: #00B862;">
        <div class="nl-kpi-label">ARCHIVOS OFICIALES</div>
        <div class="nl-kpi-value">{len(manifest)}</div>
        <div class="nl-kpi-sub">91+107 unidas · Resto indep.</div>
    </div>
    <div class="nl-kpi-card" style="--accent-color: #10B981;">
        <div class="nl-kpi-label">REGISTROS VÁLIDOS</div>
        <div class="nl-kpi-value">{total_valid_exported:,}</div>
        <div class="nl-kpi-sub">Listos para entrega</div>
    </div>
    <div class="nl-kpi-card" style="--accent-color: #F59E0B;">
        <div class="nl-kpi-label">FUERA POR PREFIJO ID</div>
        <div class="nl-kpi-value">{total_excl_prefix:,}</div>
        <div class="nl-kpi-sub">No cumplen 3 dígitos</div>
    </div>
    <div class="nl-kpi-card" style="--accent-color: #EF4444;">
        <div class="nl-kpi-label">FUERA CELDAS BLANCO</div>
        <div class="nl-kpi-value">{total_excl_blank:,}</div>
        <div class="nl-kpi-sub">Registros incompletos</div>
    </div>
    <div class="nl-kpi-card" style="--accent-color: #6366F1;">
        <div class="nl-kpi-label">ÍNDICE DE CALIDAD</div>
        <div class="nl-kpi-value">{pct_calidad:.1f}%</div>
        <div class="nl-kpi-sub">Registros aprobados</div>
    </div>
</div>
""", unsafe_allow_html=True)

# 7. PESTAÑAS DE NAVEGACIÓN
tab_export, tab_audit, tab_dict = st.tabs([
    "📦 Exportación y Descarga por Campaña",
    f"🛡️ Auditoría de Descartes ({total_excl_prefix + total_excl_blank})",
    "📋 Diccionario de Homologación"
])

with tab_export:
    col_left, col_right = st.columns([1.85, 1.15])

    with col_left:
        st.markdown('<div class="nl-panel-header">Archivos Independientes Generados · Listos para Descarga</div>', unsafe_allow_html=True)

        for idx, item in enumerate(manifest):
            camps_label = " + ".join(item["campanas"])
            stats = item.get("stats", {})
            prefijo_info = item.get("expected_prefix", stats.get("prefijo_esperado", "N/A"))
            excl_p = stats.get("registros_excluidos_prefijo", 0)
            excl_b = stats.get("registros_excluidos_celda_blanco", 0)

            badges_html = f'<span class="nl-tag-blue">CAMPAÑA {camps_label} · PREFIJO {prefijo_info}</span> '
            if excl_p == 0 and excl_b == 0:
                badges_html += '<span class="nl-tag-green">✓ 100% LIMPIO</span>'
            else:
                if excl_p > 0:
                    badges_html += f'<span class="nl-tag-orange">⚠️ {excl_p} FUERA POR PREFIJO</span> '
                if excl_b > 0:
                    badges_html += f'<span class="nl-tag-red">🚫 {excl_b} FUERA POR BLANCOS</span>'

            c_card, c_btn = st.columns([3.2, 1.1])
            with c_card:
                st.markdown(f"""
                <div class="nl-subcard">
                    <div>{badges_html}</div>
                    <div class="nl-subcard-title">📄 {item['archivo']}</div>
                    <div class="nl-subcard-desc">
                        <b>Estudio:</b> {item['nombre']} · <b>Válidos a exportar:</b> {item['registros']:,} registros · <b>Excluidos:</b> {excl_p} por prefijo / {excl_b} por celdas vacías.
                    </div>
                </div>
                """, unsafe_allow_html=True)
            with c_btn:
                st.write("")
                st.download_button(
                    label="⬇️ Descargar CSV",
                    data=item["csv_bytes"],
                    file_name=item["archivo"],
                    mime="text/csv",
                    key=f"dl_indiv_{idx}",
                    use_container_width=True
                )

            with st.expander(f"🔎 Previsualizar tabla de {item['archivo']} ({item['registros']:,} filas)"):
                st.dataframe(item["df"].head(100), use_container_width=True, height=240)

    with col_right:
        st.markdown('<div class="nl-panel-header">Centro de Descarga Masiva (1 Clic)</div>', unsafe_allow_html=True)

        st.markdown("""
        <div class="nl-subcard" style="background:#F0F9FF; border-color:#BAE6FD;">
            <span class="nl-tag-blue">DESCARGA CONSOLIDADA EN ZIP</span>
            <div class="nl-subcard-title">Paquete Oficial de Campañas Seleccionadas</div>
            <div class="nl-subcard-desc" style="margin-bottom:10px;">
                Descarga en un único archivo <b>.ZIP</b> todos los archivos CSV independientes ya renombrados con su fecha de gestión.
            </div>
        </div>
        """, unsafe_allow_html=True)

        zip_filename = f"Incidencias_Cencosud_Newlead_{dominant_date}.zip"
        st.download_button(
            label=f"📦 Descargar Selección en ZIP ({len(manifest)} archivos)",
            data=zip_bytes,
            file_name=zip_filename,
            mime="application/zip",
            type="primary",
            use_container_width=True
        )


        st.markdown("<br/>", unsafe_allow_html=True)
        st.markdown('<div class="nl-panel-header">Control de Validación por Prefijo (3 Dígitos)</div>', unsafe_allow_html=True)

        st.markdown("""
        <div class="nl-subcard">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:12.5px;">
                <div><b>• Campañas 91 + 107 (EEFF):</b></div><div>Prefijo obligatorio <code>113</code></div>
                <div><b>• Campaña 96 (APP):</b></div><div>Prefijo obligatorio <code>125</code></div>
                <div><b>• Campaña 106 (Totem):</b></div><div>Prefijo obligatorio <code>115</code></div>
                <div><b>• Campaña 108 (Call Center):</b></div><div>Prefijo obligatorio <code>110</code></div>
                <div><b>• Campaña 109 (WEB):</b></div><div>Prefijo obligatorio <code>114</code></div>
            </div>
        </div>
        """, unsafe_allow_html=True)

with tab_audit:
    st.markdown('<div class="nl-panel-header">Detalle de Registros que Quedaron Fuera por Validación</div>', unsafe_allow_html=True)

    any_excluded = False
    for item in manifest:
        stats = item.get("stats", {})
        excl_p_list = stats.get("detalle_excluidos_prefijo", [])
        excl_b_list = stats.get("detalle_excluidos_blanco", [])

        if excl_p_list or excl_b_list:
            any_excluded = True
            st.markdown(f"#### 📄 `{item['archivo']}` ({item['nombre']})")
            col_a1, col_a2 = st.columns(2)
            with col_a1:
                st.markdown(f"**🛡️ Fuera por Prefijo de 3 dígitos ({len(excl_p_list)} registros):**")
                if excl_p_list:
                    st.dataframe(pd.DataFrame(excl_p_list), use_container_width=True)
                else:
                    st.info("0 registros excluidos por prefijo.")
            with col_a2:
                st.markdown(f"**🚫 Fuera por Celdas en Blanco ({len(excl_b_list)} registros):**")
                if excl_b_list:
                    st.dataframe(pd.DataFrame(excl_b_list), use_container_width=True)
                else:
                    st.info("0 registros excluidos por celdas en blanco.")
            st.markdown("---")

    if not any_excluded:
        st.success("🎉 ¡Excelente! Ningún registro fue excluido en las campañas seleccionadas. Todos cumplieron su prefijo de 3 dígitos y no tenían celdas en blanco.")

with tab_dict:
    st.markdown('<div class="nl-panel-header">Diccionario de Homologación Cencosud Activo</div>', unsafe_allow_html=True)
    st.dataframe(df_tipificaciones, use_container_width=True, height=420)