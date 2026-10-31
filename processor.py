# -*- coding: utf-8 -*-
"""
Módulo de procesamiento y homologación de recorridos telefónicos.
"""
import os
import io
import re
import zipfile
from datetime import datetime
from typing import List, Dict, Tuple, Optional
import pandas as pd


# Tabla oficial de prefijos de 3 dígitos por Campaña indicada por el usuario:
# 91-107 -> 113
# 96     -> 125
# 106    -> 115
# 108    -> 110
# 109    -> 114
CAMPAIGN_PREFIX_MAP = {
    "91": "113",
    "107": "113",
    "96": "125",
    "106": "115",
    "108": "110",
    "109": "114"
}

# Definición oficial de campañas conocidas y sus nombres de salida
CAMPAIGN_REGISTRY = [
    {
        "key": "EEFF",
        "name": "Cencosud EEFF (Campañas 91 + 107)",
        "ids": ["91", "107"],
        "pattern": "Incidencia_Cencosud_EEFF_TZ_{date}.csv",
        "expected_prefix": "113"
    },
    {
        "key": "APP",
        "name": "Cencosud APP (Campaña 96)",
        "ids": ["96"],
        "pattern": "Incidencia_Cencosud_APP_TZ_{date}.csv",
        "expected_prefix": "125"
    },
    {
        "key": "WEB",
        "name": "Cencosud WEB (Campaña 109)",
        "ids": ["109"],
        "pattern": "Incidencia_Cencosud_Web_TZ_{date}.csv",
        "expected_prefix": "114"
    },
    {
        "key": "TOTEM",
        "name": "Cencosud Totem (Campaña 106)",
        "ids": ["106"],
        "pattern": "Incidencia_Cencosud_Totem_TZ_{date}.csv",
        "expected_prefix": "115"
    },
    {
        "key": "CALLCENTER",
        "name": "Cencosud Call Center (Campaña 108)",
        "ids": ["108"],
        "pattern": "Incidencia_Cencosud_Callcenter_TZ_{date}.csv",
        "expected_prefix": "110"
    }
]


def detect_header_row_excel(filepath_or_buffer, max_rows: int = 15) -> int:
    df_preview = pd.read_excel(filepath_or_buffer, header=None, nrows=max_rows)
    for idx, row in df_preview.iterrows():
        row_str = ' '.join([str(val) for val in row.values if pd.notna(val)]).lower()
        if 'campaign id' in row_str or 'lista id' in row_str or 'telefono' in row_str:
            return idx
    return 0


def load_recorridos_file(filepath_or_buffer) -> pd.DataFrame:
    if isinstance(filepath_or_buffer, str):
        ext = os.path.splitext(filepath_or_buffer)[1].lower()
    else:
        name = getattr(filepath_or_buffer, 'name', '')
        ext = os.path.splitext(name)[1].lower()

    if ext in ['.xlsx', '.xls']:
        header_idx = detect_header_row_excel(filepath_or_buffer)
        if hasattr(filepath_or_buffer, 'seek'):
            filepath_or_buffer.seek(0)
        df = pd.read_excel(filepath_or_buffer, header=header_idx)
    else:
        content = filepath_or_buffer
        for enc in ['utf-8-sig', 'utf-8', 'latin1', 'cp1252']:
            try:
                if hasattr(content, 'seek'):
                    content.seek(0)
                df = pd.read_csv(content, sep=None, engine='python', encoding=enc)
                break
            except Exception:
                continue
        else:
            raise ValueError('No se pudo leer el archivo CSV con las codificaciones habituales.')

    df.columns = [str(col).strip() for col in df.columns]
    return df


def load_tipificaciones_file(filepath_or_buffer) -> pd.DataFrame:
    if isinstance(filepath_or_buffer, str):
        ext = os.path.splitext(filepath_or_buffer)[1].lower()
    else:
        name = getattr(filepath_or_buffer, 'name', '')
        ext = os.path.splitext(name)[1].lower()

    if ext in ['.xlsx', '.xls']:
        xl = pd.ExcelFile(filepath_or_buffer)
        target_sheet = xl.sheet_names[0]
        for s in xl.sheet_names:
            if 'diccionario' in s.lower() or 'tipificacion' in s.lower():
                target_sheet = s
                break
        df = xl.parse(target_sheet)
    else:
        df = pd.read_csv(filepath_or_buffer, sep=None, engine='python', encoding='utf-8-sig')

    df.columns = [str(col).strip().upper() for col in df.columns]
    return df


def get_available_campaigns(df_recorridos: pd.DataFrame) -> List[Tuple[str, int]]:
    col_camp = next((c for c in df_recorridos.columns if 'campaign' in c.lower() or 'campaña' in c.lower()), None)
    if not col_camp:
        return []

    counts = df_recorridos[col_camp].value_counts(dropna=False)
    results = []
    for camp_id, count in counts.items():
        if pd.notna(camp_id):
            try:
                camp_f = float(camp_id)
                camp_str = str(int(camp_f)) if camp_f == int(camp_f) else str(camp_id).strip()
            except Exception:
                camp_str = str(camp_id).strip()
            results.append((camp_str, int(count)))
    return results


def resolve_campaign_filename(selected_campaigns: List[str], date_str: str) -> str:
    selected_set = set(str(c).strip() for c in selected_campaigns)

    for reg in CAMPAIGN_REGISTRY:
        reg_set = set(reg["ids"])
        if selected_set == reg_set:
            return reg["pattern"].format(date=date_str)

    if selected_set == {"91"} or selected_set == {"107"}:
        return f"Incidencia_Cencosud_EEFF_TZ_{date_str}.csv"

    if len(selected_campaigns) == 1:
        cid = selected_campaigns[0]
        for reg in CAMPAIGN_REGISTRY:
            if cid in reg["ids"]:
                return reg["pattern"].format(date=date_str)
        return f"Incidencia_Cencosud_Campana_{cid}_TZ_{date_str}.csv"

    joined = "_".join(sorted(list(selected_set)))
    return f"Incidencia_Campanas_{joined}_TZ_{date_str}.csv"


def format_duration_seconds(val) -> int:
    pd_is_na = pd.isna(val) if not isinstance(val, (pd.Series, list, tuple)) else False
    if pd_is_na or val == '':
        return 0
    if isinstance(val, (int, float)):
        return int(val)
    val_str = str(val).strip()
    parts = val_str.split(':')
    if len(parts) == 3:
        try:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        except ValueError:
            return 0
    elif len(parts) == 2:
        try:
            return int(parts[0]) * 60 + int(parts[1])
        except ValueError:
            return 0
    try:
        return int(float(val_str))
    except ValueError:
        return 0


def format_clean_int_str(val) -> str:
    pd_is_na = pd.isna(val) if not isinstance(val, (pd.Series, list, tuple)) else False
    if pd_is_na or val == '':
        return ''
    try:
        f = float(val)
        return str(int(f))
    except (ValueError, TypeError, OverflowError):
        return str(val).strip()


def parse_time_component(val, format_type: str = 'time') -> str:
    pd_is_na = pd.isna(val) if not isinstance(val, (pd.Series, list, tuple)) else False
    if pd_is_na or val == '':
        return ''
    try:
        dt = pd.to_datetime(val)
        if format_type == 'date_gestion':
            return dt.strftime('%Y-%m-%d')
        elif format_type == 'date_llamada':
            return dt.strftime('%d-%m-%Y')
        elif format_type == 'time':
            h = dt.hour
            m = f'{dt.minute:02d}'
            s = f'{dt.second:02d}'
            return f'{h}:{m}:{s}'
    except Exception:
        return str(val).strip()


def build_tipificacion_map(df_tipificaciones: pd.DataFrame) -> Dict[str, Dict[str, str]]:
    mapping = {}
    col_code = None
    col_cat = None
    col_tip = None

    for c in df_tipificaciones.columns:
        cu = c.upper()
        if 'COD' in cu or 'VICIDIAL' in cu:
            col_code = c
        elif 'CATEGORIA' in cu or 'CAT' in cu:
            col_cat = c
        elif 'TIPIFICACION' in cu or 'ESTADO' in cu:
            col_tip = c

    if not col_code or not col_cat or not col_tip:
        raise ValueError('El archivo de tipificaciones debe contener columnas para Código, Categoría y Tipificación.')

    for _, row in df_tipificaciones.iterrows():
        code = str(row[col_code]).strip().upper() if pd.notna(row[col_code]) else ''
        if code:
            mapping[code] = {
                'categoria': str(row[col_cat]).strip() if pd.notna(row[col_cat]) else '',
                'tipificacion': str(row[col_tip]).strip() if pd.notna(row[col_tip]) else ''
            }

    return mapping


def detect_dominant_date_yyyymmdd(df_recorridos: pd.DataFrame) -> str:
    col_hinicio = next((c for c in df_recorridos.columns if 'hora_inicio' in c.lower() or 'inicio' in c.lower()), None)
    if col_hinicio:
        valid_dates = pd.to_datetime(df_recorridos[col_hinicio], errors='coerce').dropna()
        if not valid_dates.empty:
            mode_date = valid_dates.dt.date.mode()
            if not mode_date.empty:
                return mode_date.iloc[0].strftime('%Y%m%d')
    return datetime.now().strftime('%Y%m%d')


def transform_recorridos(
    df_recorridos: pd.DataFrame,
    df_tipificaciones: pd.DataFrame,
    selected_campaigns: List[str]
) -> Tuple[pd.DataFrame, Dict, List[str]]:
    col_camp = next((c for c in df_recorridos.columns if 'campaign' in c.lower() or 'campaña' in c.lower()), None)
    col_user = next((c for c in df_recorridos.columns if 'usuario' in c.lower() or 'user' in c.lower()), None)
    col_tel = next((c for c in df_recorridos.columns if 'telefono' in c.lower() or 'phone' in c.lower()), None)
    col_vendor = next((c for c in df_recorridos.columns if 'vendor' in c.lower() or 'lead' in c.lower()), None)
    col_apellido = next((c for c in df_recorridos.columns if 'apellido' in c.lower() or 'cliente' in c.lower()), None)
    col_prov = next((c for c in df_recorridos.columns if 'provincia' in c.lower() or 'ola' in c.lower()), None)
    col_hinicio = next((c for c in df_recorridos.columns if 'hora_inicio' in c.lower() or 'inicio' in c.lower()), None)
    col_hfin = next((c for c in df_recorridos.columns if 'hora_fin' in c.lower() or 'fin' in c.lower()), None)
    col_dur = next((c for c in df_recorridos.columns if 'duracion' in c.lower() or 'length' in c.lower()), None)
    col_tip = next((c for c in df_recorridos.columns if 'estado tipificacion' in c.lower() or 'tipificacion' in c.lower() or 'status' in c.lower()), None)

    camp_str_series = df_recorridos[col_camp].apply(
        lambda x: str(int(x)) if isinstance(x, (int, float)) and pd.notna(x) and x == int(x) else str(x).strip()
    )
    selected_camps_str = [str(c).strip() for c in selected_campaigns]
    df_filtered = df_recorridos[camp_str_series.isin(selected_camps_str)].copy()

    tip_map = build_tipificacion_map(df_tipificaciones)
    unmapped_codes = set()
    output_rows = []
    excluded_rows_prefix = []
    excluded_rows_blank = []

    for _, row in df_filtered.iterrows():
        # Identificar campaña de la fila
        raw_camp_val = row[col_camp] if col_camp else ''
        row_camp_str = str(int(raw_camp_val)) if isinstance(raw_camp_val, (int, float)) and pd.notna(raw_camp_val) and raw_camp_val == int(raw_camp_val) else str(raw_camp_val).strip()

        raw_vendor = row[col_vendor] if col_vendor else ''
        row_id = format_clean_int_str(raw_vendor)

        # 1. VALIDACIÓN DE 3 DÍGITOS DEL ID:
        # 91-107 -> 113, 96 -> 125, 106 -> 115, 108 -> 110, 109 -> 114
        expected_3_digits = CAMPAIGN_PREFIX_MAP.get(row_camp_str)
        if expected_3_digits:
            clean_digits = re.sub(r'[^0-9]', '', row_id)
            if not clean_digits.startswith(expected_3_digits):
                excluded_rows_prefix.append({
                    "id": row_id,
                    "campana": row_camp_str,
                    "prefijo_obtenido": clean_digits[:3] if len(clean_digits) >= 3 else clean_digits,
                    "prefijo_esperado": expected_3_digits,
                    "telefono": format_clean_int_str(row[col_tel]) if col_tel else ''
                })
                continue

        id_cliente = format_clean_int_str(row[col_apellido]) if col_apellido else ''
        telefono = format_clean_int_str(row[col_tel]) if col_tel else ''

        raw_user = str(row[col_user]).strip() if col_user and pd.notna(row[col_user]) else ''
        if raw_user.upper() == 'VDAD' or raw_user == '' or raw_user == 'NONE':
            cod_ejecutivo = '1'
        else:
            cod_ejecutivo = format_clean_int_str(raw_user)

        ola = str(row[col_prov]).strip() if col_prov and pd.notna(row[col_prov]) else ''

        h_inicio_val = row[col_hinicio] if col_hinicio else None
        h_fin_val = row[col_hfin] if col_hfin else None

        fecha_gestion = parse_time_component(h_inicio_val, 'date_gestion')
        fecha_llamada = parse_time_component(h_inicio_val, 'date_llamada')
        inicio_llamada = parse_time_component(h_inicio_val, 'time')
        fin_llamada = parse_time_component(h_fin_val, 'time')

        # Si fin de llamada está vacía se iguala a inicio y duración en 0
        if not fin_llamada or pd.isna(h_fin_val) or str(h_fin_val).strip() in ['', 'nan', 'NaT', 'None']:
            fin_llamada = inicio_llamada
            duracion_sec = 0
        else:
            duracion_sec = format_duration_seconds(row[col_dur]) if col_dur else 0

        raw_status = str(row[col_tip]).strip().upper() if col_tip and pd.notna(row[col_tip]) else ''

        if not raw_status or raw_status in ['NAN', 'NONE', 'DROP', 'N']:
            categoria = 'No Contacto'
            tipificacion = 'No Contestan'
            sub_tipificacion = 'No Contestan'
        elif raw_status in tip_map:
            categoria = tip_map[raw_status]['categoria']
            tipificacion = tip_map[raw_status]['tipificacion']
            sub_tipificacion = tipificacion
        else:
            unmapped_codes.add(raw_status)
            categoria = 'No Contacto'
            tipificacion = f'NO HOMOLOGADO ({raw_status})'
            sub_tipificacion = tipificacion

        candidate_row = {
            'ID': row_id,
            'ID_CLIENTE': id_cliente,
            'CATEGORIA': categoria,
            'TIPIFICACIÓN': tipificacion,
            'SUB TIPIFICACIÓN': sub_tipificacion,
            'FECHA DE GESTIÓN': fecha_gestion,
            'FECHALLAMADA': fecha_llamada,
            'INICIOLLAMADA': inicio_llamada,
            'FINLLAMADA': fin_llamada,
            'DURACION': duracion_sec,
            'TELEFONO': telefono,
            'CODEJECUTIVO': cod_ejecutivo,
            'OLA': ola
        }

        # 2. VALIDACIÓN DE CELDAS EN BLANCO SOLICITADA POR EL USUARIO:
        # "validar que no quede ninguna celda en blanco, cualquier registro con celda vacía queda fuera"
        blank_columns = []
        for col_name, val in candidate_row.items():
            # El valor 0 o '0' en DURACION es un número válido, no blanco
            if val == 0 or val == '0':
                continue
            if pd.isna(val) or str(val).strip() in ['', 'nan', 'none', 'nat', 'null', 'None', 'NaN', 'NaT']:
                blank_columns.append(col_name)

        if blank_columns:
            excluded_rows_blank.append({
                "id": row_id if row_id else "SIN ID",
                "telefono": telefono if telefono else "SIN TELEFONO",
                "campana": row_camp_str,
                "columnas_en_blanco": ", ".join(blank_columns)
            })
            # Excluir de la salida
            continue

        output_rows.append(candidate_row)

    cols_order = [
        'ID', 'ID_CLIENTE', 'CATEGORIA', 'TIPIFICACIÓN', 'SUB TIPIFICACIÓN',
        'FECHA DE GESTIÓN', 'FECHALLAMADA', 'INICIOLLAMADA', 'FINLLAMADA',
        'DURACION', 'TELEFONO', 'CODEJECUTIVO', 'OLA'
    ]

    df_out = pd.DataFrame(output_rows, columns=cols_order)
    
    expected_prefixes_used = list(set(CAMPAIGN_PREFIX_MAP[c] for c in selected_camps_str if c in CAMPAIGN_PREFIX_MAP))
    prefix_display = "/".join(expected_prefixes_used) if expected_prefixes_used else "N/A"

    stats = {
        'total_registros': len(df_out),
        'campanas_procesadas': selected_camps_str,
        'prefijo_esperado': prefix_display,
        'registros_excluidos_prefijo': len(excluded_rows_prefix),
        'detalle_excluidos_prefijo': excluded_rows_prefix,
        'registros_excluidos_celda_blanco': len(excluded_rows_blank),
        'detalle_excluidos_blanco': excluded_rows_blank,
        'codigos_no_homologados': sorted(list(unmapped_codes))
    }

    return df_out, stats, sorted(list(unmapped_codes))


def export_to_csv_bytes(df: pd.DataFrame) -> bytes:
    csv_str = df.to_csv(sep=';', index=False, encoding='utf-8-sig')
    return csv_str.encode('utf-8-sig')


def plan_campaign_exports(selected_campaign_ids: List[str], date_str: str) -> List[Dict]:
    remaining_ids = set(str(c).strip() for c in selected_campaign_ids)
    plans = []

    # 1. Grupo EEFF (91 y 107 juntos)
    eeff_ids = [cid for cid in ["91", "107"] if cid in remaining_ids]
    if eeff_ids:
        plans.append({
            "name": "Cencosud EEFF",
            "ids": eeff_ids,
            "filename": f"Incidencia_Cencosud_EEFF_TZ_{date_str}.csv",
            "expected_prefix": "113"
        })
        for cid in eeff_ids:
            remaining_ids.remove(cid)

    # 2. Las demás campañas individuales
    for cid in sorted(list(remaining_ids)):
        filename = resolve_campaign_filename([cid], date_str)
        camp_name = f"Campaña {cid}"
        expected_pref = CAMPAIGN_PREFIX_MAP.get(cid, "N/A")
        for reg in CAMPAIGN_REGISTRY:
            if cid in reg["ids"]:
                camp_name = reg["name"]
                expected_pref = reg.get("expected_prefix", expected_pref)
                break

        plans.append({
            "name": camp_name,
            "ids": [cid],
            "filename": filename,
            "expected_prefix": expected_pref
        })

    return plans


def export_selected_campaigns_zip(
    df_recorridos: pd.DataFrame,
    df_tipificaciones: pd.DataFrame,
    selected_campaign_ids: List[str],
    date_str: str
) -> Tuple[bytes, List[Dict]]:
    plans = plan_campaign_exports(selected_campaign_ids, date_str)
    zip_buffer = io.BytesIO()
    manifest = []

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for p in plans:
            df_part, stats, _ = transform_recorridos(df_recorridos, df_tipificaciones, p["ids"])
            if not df_part.empty:
                csv_bytes = export_to_csv_bytes(df_part)
                zip_file.writestr(p["filename"], csv_bytes)
                manifest.append({
                    "nombre": p["name"],
                    "campanas": p["ids"],
                    "archivo": p["filename"],
                    "registros": len(df_part),
                    "csv_bytes": csv_bytes,
                    "df": df_part,
                    "stats": stats,
                    "expected_prefix": p.get("expected_prefix", "N/A")
                })

    zip_buffer.seek(0)
    return zip_buffer.getvalue(), manifest
