# -*- coding: utf-8 -*-
"""
Módulo de Autenticación, Control de Acceso y Gestión de Usuarios - Newlead Contact Center.
Permite al Administrador crear usuarios, revocar/bloquear accesos en tiempo real y gestionar claves.
"""
import os
import json
import hashlib
import secrets
from datetime import datetime
from typing import Dict, Any, Tuple, List, Optional

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
USERS_DB_PATH = os.path.join(CURRENT_DIR, "users_db.json")

DEFAULT_ADMIN_USER = "admin"
DEFAULT_ADMIN_PASS = "Newlead2026*"


def _hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Genera hash seguro PBKDF2-HMAC-SHA256 con sal aleatoria."""
    if not salt:
        salt = secrets.token_hex(16)
    pwd_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        120000
    ).hex()
    return pwd_hash, salt


def _verify_password(password: str, stored_hash: str, salt: str) -> bool:
    calc_hash, _ = _hash_password(password, salt)
    return secrets.compare_digest(calc_hash, stored_hash)


def load_users_db() -> Dict[str, Dict[str, Any]]:
    """Carga la base de usuarios o la inicializa con el Administrador por defecto."""
    if os.path.exists(USERS_DB_PATH):
        try:
            with open(USERS_DB_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict) and DEFAULT_ADMIN_USER in data:
                    return data
        except Exception:
            pass

    pwd_hash, salt = _hash_password(DEFAULT_ADMIN_PASS)
    default_db = {
        DEFAULT_ADMIN_USER: {
            "username": DEFAULT_ADMIN_USER,
            "nombre": "Administrador General",
            "rol": "admin",
            "activo": True,
            "password_hash": pwd_hash,
            "salt": salt,
            "token_version": 1,
            "creado_en": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "ultimo_acceso": "Nunca"
        }
    }
    save_users_db(default_db)
    return default_db


def save_users_db(db: Dict[str, Dict[str, Any]]) -> None:
    """Guarda la base de usuarios en disco."""
    with open(USERS_DB_PATH, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)


def authenticate_user(username: str, password: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Valida credenciales de usuario.
    Retorna (exito, mensaje, datos_usuario_sin_hash).
    """
    clean_user = (username or "").strip().lower()
    if not clean_user or not password:
        return False, "Por favor ingresa tu usuario y contraseña.", None

    db = load_users_db()
    user_rec = db.get(clean_user)
    if not user_rec:
        return False, "Usuario o contraseña incorrectos.", None

    if not user_rec.get("activo", True):
        return False, "🚫 Acceso bloqueado: Tu cuenta ha sido desactivada por el Administrador.", None

    if not _verify_password(password, user_rec["password_hash"], user_rec["salt"]):
        return False, "Usuario o contraseña incorrectos.", None

    user_rec["ultimo_acceso"] = datetime.now().strftime("%d/%m/%Y %H:%M")
    db[clean_user] = user_rec
    save_users_db(db)

    safe_info = {
        "username": user_rec["username"],
        "nombre": user_rec.get("nombre", clean_user),
        "rol": user_rec.get("rol", "operador"),
        "activo": user_rec.get("activo", True),
        "token_version": user_rec.get("token_version", 1),
        "ultimo_acceso": user_rec["ultimo_acceso"]
    }
    return True, "Ingreso exitoso.", safe_info


def is_session_valid(username: str, token_version: int) -> bool:
    """
    Verifica en cada acción si el usuario sigue activo y su clave/permiso no fue revocado.
    Si el Administrador bloquea al usuario o le cambia la clave, invalida la sesión al instante.
    """
    clean_user = (username or "").strip().lower()
    db = load_users_db()
    user_rec = db.get(clean_user)
    if not user_rec:
        return False
    if not user_rec.get("activo", True):
        return False
    if user_rec.get("token_version", 1) != token_version:
        return False
    return True


def list_all_users() -> List[Dict[str, Any]]:
    """Devuelve la lista de usuarios sin exponer hashes de contraseña."""
    db = load_users_db()
    result = []
    for uname, rec in db.items():
        result.append({
            "username": uname,
            "nombre": rec.get("nombre", uname),
            "rol": rec.get("rol", "operador"),
            "activo": rec.get("activo", True),
            "creado_en": rec.get("creado_en", "-"),
            "ultimo_acceso": rec.get("ultimo_acceso", "Nunca"),
            "token_version": rec.get("token_version", 1)
        })
    return result


def create_new_user(username: str, nombre: str, password: str, rol: str = "operador") -> Tuple[bool, str]:
    """Crea un nuevo usuario autorizado."""
    clean_user = (username or "").strip().lower()
    clean_name = (nombre or "").strip()

    if not clean_user or len(clean_user) < 3:
        return False, "El nombre de usuario debe tener al menos 3 caracteres."
    if " " in clean_user:
        return False, "El nombre de usuario no debe contener espacios."
    if not clean_name:
        return False, "Debes indicar el nombre completo o cargo de la persona."
    if not password or len(password) < 6:
        return False, "La contraseña debe tener al menos 6 caracteres."
    if rol not in ("admin", "operador"):
        rol = "operador"

    db = load_users_db()
    if clean_user in db:
        return False, f"El usuario '{clean_user}' ya existe."

    pwd_hash, salt = _hash_password(password)
    db[clean_user] = {
        "username": clean_user,
        "nombre": clean_name,
        "rol": rol,
        "activo": True,
        "password_hash": pwd_hash,
        "salt": salt,
        "token_version": 1,
        "creado_en": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "ultimo_acceso": "Nunca"
    }
    save_users_db(db)
    return True, f"Usuario '{clean_user}' ({clean_name}) creado exitosamente."


def set_user_active_status(username: str, activo: bool) -> Tuple[bool, str]:
    """Activa o bloquea el acceso de un usuario inmediatamente."""
    clean_user = (username or "").strip().lower()
    if clean_user == DEFAULT_ADMIN_USER and not activo:
        return False, "No se puede bloquear al Administrador General principal."

    db = load_users_db()
    if clean_user not in db:
        return False, "El usuario no existe."

    db[clean_user]["activo"] = bool(activo)
    db[clean_user]["token_version"] = int(db[clean_user].get("token_version", 1)) + 1
    save_users_db(db)

    estado_txt = "REACTIVADO" if activo else "BLOQUEADO"
    return True, f"El acceso del usuario '{clean_user}' ha sido {estado_txt} inmediatamente."


def change_user_password(username: str, new_password: str) -> Tuple[bool, str, int]:
    """Cambia la contraseña de un usuario e invalida sesiones anteriores."""
    clean_user = (username or "").strip().lower()
    if not new_password or len(new_password) < 6:
        return False, "La nueva contraseña debe tener al menos 6 caracteres.", 0

    db = load_users_db()
    if clean_user not in db:
        return False, "El usuario no existe.", 0

    pwd_hash, salt = _hash_password(new_password)
    new_version = int(db[clean_user].get("token_version", 1)) + 1
    db[clean_user]["password_hash"] = pwd_hash
    db[clean_user]["salt"] = salt
    db[clean_user]["token_version"] = new_version
    save_users_db(db)

    return True, f"Contraseña de '{clean_user}' actualizada correctamente.", new_version


def delete_user_account(username: str, current_admin: str) -> Tuple[bool, str]:
    """Elimina permanentemente a un usuario."""
    clean_user = (username or "").strip().lower()
    if clean_user == DEFAULT_ADMIN_USER:
        return False, "No se puede eliminar la cuenta del Administrador General principal."
    if clean_user == (current_admin or "").strip().lower():
        return False, "No puedes eliminar tu propia cuenta en uso."

    db = load_users_db()
    if clean_user not in db:
        return False, "El usuario no existe."

    nombre = db[clean_user].get("nombre", clean_user)
    del db[clean_user]
    save_users_db(db)
    return True, f"El usuario '{clean_user}' ({nombre}) fue eliminado permanentemente."