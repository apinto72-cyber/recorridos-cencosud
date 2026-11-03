# -*- coding: utf-8 -*-
"""
Punto de entrada compatible para Streamlit Community Cloud y ejecución directa.
Redirige la ejecución a la aplicación de Recorrido Cencosud.
"""
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CENCO_DIR = os.path.join(CURRENT_DIR, "Recorrido_Cencosud")

if CENCO_DIR not in sys.path:
    sys.path.insert(0, CENCO_DIR)

os.chdir(CENCO_DIR)

cenco_app_path = os.path.join(CENCO_DIR, "app.py")
with open(cenco_app_path, "r", encoding="utf-8") as f:
    code = compile(f.read(), cenco_app_path, "exec")
    exec(code, {"__file__": cenco_app_path, "__name__": "__main__"})