(function () {
  "use strict";

  // =========================================================================
  // 1. DICCIONARIO BASE OFICIAL CENCOSUD (26 Codigos Oficiales Base)
  // =========================================================================
  const DEFAULT_CODES = [
    { campana: "TODAS", codigo: "A", categoria: "No Contacto", tipificacion: "Buzón de Voz/Fax", subTipificacion: "Buzón de Voz/Fax", status: "DISPONIBLE", rellamada: "SI" },
    { campana: "TODAS", codigo: "AA", categoria: "No Contacto", tipificacion: "Buzón de Voz/Fax", subTipificacion: "Buzón de Voz/Fax", status: "DISPONIBLE", rellamada: "SI" },
    { campana: "TODAS", codigo: "AB", categoria: "No Contacto", tipificacion: "Teléfono Ocupado", subTipificacion: "Teléfono Ocupado", status: "DISPONIBLE", rellamada: "SI" },
    { campana: "TODAS", codigo: "ADC", categoria: "No Contacto", tipificacion: "Teléfono fuera de servicio", subTipificacion: "Teléfono fuera de servicio", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "CALLBK", categoria: "Contacto", tipificacion: "Cliente Ocupado, Volver a llamar", subTipificacion: "Cliente Ocupado, Volver a llamar", status: "DISPONIBLE", rellamada: "SI" },
    { campana: "TODAS", codigo: "CPDP", categoria: "Contacto", tipificacion: "Cliente Ocupado, Volver a llamar", subTipificacion: "Cliente Ocupado, Volver a llamar", status: "DISPONIBLE", rellamada: "SI" },
    { campana: "TODAS", codigo: "CRTSCR", categoria: "Contacto", tipificacion: "No está interesado, no quiere hacer encuesta", subTipificacion: "No está interesado, no quiere hacer encuesta", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "DNC", categoria: "Contacto", tipificacion: "Cliente Molesto, No volver a Llamar", subTipificacion: "Cliente Molesto, No volver a Llamar", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "EMABAN", categoria: "No Contacto", tipificacion: "Cortan la Llamada", subTipificacion: "Cortan la Llamada", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "ENTREV", categoria: "Contacto", tipificacion: "Encuesta Exitosa", subTipificacion: "Encuesta Exitosa", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "FALLEC", categoria: "Contacto", tipificacion: "Cliente Fallecido", subTipificacion: "Cliente Fallecido", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "FONOMA", categoria: "No Contacto", tipificacion: "Teléfono fuera de servicio", subTipificacion: "Teléfono fuera de servicio", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "N", categoria: "No Contacto", tipificacion: "No Contestan", subTipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" },
    { campana: "TODAS", codigo: "NAN", categoria: "No Contacto", tipificacion: "No Contestan", subTipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" },
    { campana: "TODAS", codigo: "NCFILT", categoria: "Contacto", tipificacion: "No Califica (No Cumple Condiciones)", subTipificacion: "No Califica (No Cumple Condiciones)", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "NOVIVE", categoria: "Contacto", tipificacion: "Cliente no vive ahí /Equivocado/No Existe", subTipificacion: "Cliente no vive ahí /Equivocado/No Existe", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "NSLPRE", categoria: "Contacto", tipificacion: "No se encuentra /No Disponible", subTipificacion: "No se encuentra /No Disponible", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "PCHORA", categoria: "Contacto", tipificacion: "No se encuentra /No Disponible", subTipificacion: "No se encuentra /No Disponible", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "TELOCU", categoria: "No Contacto", tipificacion: "Teléfono Ocupado", subTipificacion: "Teléfono Ocupado", status: "DISPONIBLE", rellamada: "SI" },
    { campana: "TODAS", codigo: "TPDP", categoria: "Contacto", tipificacion: "Cliente Ocupado, Volver a llamar", subTipificacion: "Cliente Ocupado, Volver a llamar", status: "DISPONIBLE", rellamada: "SI" },
    { campana: "TODAS", codigo: "DROP", categoria: "No Contacto", tipificacion: "No Contestan", subTipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" },
    { campana: "TODAS", codigo: "CAIDOC", categoria: "Contacto", tipificacion: "No Califica (No Cumple Condiciones)", subTipificacion: "No Califica (No Cumple Condiciones)", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "INCALL", categoria: "No Contacto", tipificacion: "No Contestan", subTipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" },
    { campana: "TODAS", codigo: "COTAS", categoria: "Contacto", tipificacion: "No Califica (No Cumple Condiciones)", subTipificacion: "No Califica (No Cumple Condiciones)", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "VIAJE", categoria: "Contacto", tipificacion: "No se encuentra /No Disponible", subTipificacion: "No se encuentra /No Disponible", status: "NO DISPONIBLE", rellamada: "NO" },
    { campana: "TODAS", codigo: "PDROP", categoria: "No Contacto", tipificacion: "No Contestan", subTipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" }
  ];

  let currentDict = {};

  function makeKey(campana, codigo) {
    const camp = (campana === undefined || campana === null || String(campana).trim() === "" || String(campana).trim().toUpperCase() === "TODAS")
      ? "TODAS"
      : String(campana).trim().toUpperCase();
    const cod = String(codigo ?? "").trim().toUpperCase();
    return camp + ":" + cod;
  }

  function resolveTipification(campId, rawCode) {
    if (!rawCode) return null;
    const normCode = String(rawCode).trim().toUpperCase();
    const normCamp = String(campId ?? "").trim().toUpperCase();

    if (normCamp && currentDict[normCamp + ":" + normCode]) {
      return currentDict[normCamp + ":" + normCode];
    }
    if (currentDict["TODAS:" + normCode]) {
      return currentDict["TODAS:" + normCode];
    }
    if (currentDict[normCode]) {
      return currentDict[normCode];
    }
    return null;
  }

  function initDictionary() {
    currentDict = {};
    try {
      const saved = localStorage.getItem("cencosud_custom_dict_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          currentDict = parsed;
          return;
        }
      }
      const legacySaved = localStorage.getItem("cencosud_custom_dict");
      if (legacySaved) {
        const parsedLegacy = JSON.parse(legacySaved);
        if (parsedLegacy && typeof parsedLegacy === "object") {
          Object.keys(parsedLegacy).forEach(cod => {
            const item = parsedLegacy[cod];
            const k = makeKey(item.campana || "TODAS", cod);
            currentDict[k] = {
              campana: item.campana || "TODAS",
              codigo: cod.toUpperCase(),
              categoria: item.categoria || "Contacto",
              tipificacion: item.tipificacion || cod,
              subTipificacion: item.subTipificacion || item.tipificacion || cod,
              status: item.status || "NO DISPONIBLE",
              rellamada: item.rellamada || "NO"
            };
          });
          return;
        }
      }
    } catch (e) {
      console.warn("No se pudo leer localStorage:", e);
    }
    DEFAULT_CODES.forEach(item => {
      const k = makeKey(item.campana, item.codigo);
      currentDict[k] = Object.assign({}, item);
    });
  }

  function saveDictionaryToStorage() {
    try {
      localStorage.setItem("cencosud_custom_dict_v2", JSON.stringify(currentDict));
    } catch (e) {
      console.warn("No se pudo guardar en localStorage:", e);
    }
  }

  function clearAllTipifications() {
    const total = Object.keys(currentDict).length;
    if (total === 0) {
      showToast("El diccionario ya está completamente vacío.");
      return;
    }
    const msg = "¿Deseas ELIMINAR TODAS las tipificaciones (" + total + " códigos)?\n\nEl diccionario quedará en blanco para que puedas agregar o importar únicamente las que necesitas para este recorrido.";
    if (!confirm(msg)) return;

    currentDict = {};
    try {
      localStorage.removeItem("cencosud_custom_dict_v2");
      localStorage.removeItem("cencosud_custom_dict");
    } catch (e) {}

    renderDictionaryTable();
    updateDictBadge("Diccionario vaciado (0 códigos)");
    if (state.rawRows && state.rawRows.length > 0) {
      updateTipificationsForActiveCampaigns();
    }
    showToast("Se eliminaron todas las tipificaciones. Diccionario limpio.");
  }

  function loadDefaultTipifications() {
    const msg = "¿Deseas cargar los 26 códigos base oficiales de Cencosud?";
    if (!confirm(msg)) return;

    DEFAULT_CODES.forEach(item => {
      const k = makeKey(item.campana, item.codigo);
      currentDict[k] = Object.assign({}, item);
    });
    saveDictionaryToStorage();
    renderDictionaryTable();
    updateDictBadge();
    if (state.rawRows && state.rawRows.length > 0) {
      updateTipificationsForActiveCampaigns();
    }
    showToast("26 códigos oficiales base cargados.");
  }

  // =========================================================================
  // 2. CONFIGURACION DE CAMPANAS CENCOSUD
  // =========================================================================
  const CAMPAIGN_PREFIX_MAP = Object.freeze({
    "91": "113",
    "107": "113",
    "96": "125",
    "106": "115",
    "108": "110",
    "109": "114"
  });

  const CAMPAIGN_REGISTRY = [
    { ids: ["91", "107"], nombre: "Cencosud EEFF (Campañas 91 + 107)", prefix: "113", pattern: d => "Incidencia_Cencosud_EEFF_TZ_" + d + ".csv" },
    { ids: ["96"], nombre: "Cencosud APP (Campaña 96)", prefix: "125", pattern: d => "Incidencia_Cencosud_APP_TZ_" + d + ".csv" },
    { ids: ["109"], nombre: "Cencosud Web (Campaña 109)", prefix: "114", pattern: d => "Incidencia_Cencosud_Web_TZ_" + d + ".csv" },
    { ids: ["106"], nombre: "Cencosud Totem (Campaña 106)", prefix: "115", pattern: d => "Incidencia_Cencosud_Totem_TZ_" + d + ".csv" },
    { ids: ["108"], nombre: "Cencosud Call Center (Campaña 108)", prefix: "110", pattern: d => "Incidencia_Cencosud_Callcenter_TZ_" + d + ".csv" }
  ];

  const OUTPUT_COLUMNS = [
    "ID", "ID_CLIENTE", "CATEGORIA", "TIPIFICACIÓN", "SUB TIPIFICACIÓN",
    "FECHA DE GESTIÓN", "FECHALLAMADA", "INICIOLLAMADA", "FINLLAMADA",
    "DURACION", "TELEFONO", "CODEJECUTIVO", "OLA"
  ];

  // =========================================================================
  // 3. ESTADO GLOBAL
  // =========================================================================
  const state = {
    rawRows: [],
    sourceFileName: "",
    availableCampaigns: [],
    dominantDateIso: "",
    dominantDateYmd: "",
    dominantDateDmy: "",
    selectedCampaigns: new Set(["91", "107", "96", "106", "108", "109"]),
    detectedTipifications: [],
    selectedTipifications: new Set(),
    manifest: [],
    zipBlob: null,
    zipName: "",
    editingKey: null
  };

  // =========================================================================
  // 4. ELEMENTOS DEL DOM
  // =========================================================================
  const el = {
    sourceInput: document.getElementById("source-input"),
    dropzone: document.getElementById("dropzone"),
    dropzoneText: document.getElementById("dropzone-text"),
    fileInfo: document.getElementById("file-info"),

    dictInput: document.getElementById("dict-input"),
    dictDropzone: document.getElementById("dict-dropzone"),
    dictDropzoneText: document.getElementById("dict-dropzone-text"),
    dictFileInfo: document.getElementById("dict-file-info"),
    dictStatusText: document.getElementById("dict-status-text"),
    btnQuickAddTip: document.getElementById("btn-quick-add-tip"),
    btnQuickClearDict: document.getElementById("btn-quick-clear-dict"),
    btnQuickDefaultDict: document.getElementById("btn-quick-default-dict"),
    topDictPill: document.getElementById("top-dict-pill"),

    campaignsSection: document.getElementById("campaigns-section"),
    campaignCheckboxes: document.getElementById("campaign-checkboxes"),
    opDateInput: document.getElementById("op-date-input"),
    dateSourceHint: document.getElementById("date-source-hint"),
    btnCenco6: document.getElementById("btn-cenco6"),
    btnAll: document.getElementById("btn-all"),
    btnNone: document.getElementById("btn-none"),
    btnProcess: document.getElementById("btn-process"),

    tipDeliveryCard: document.getElementById("tip-delivery-card"),
    tipCheckboxesGrid: document.getElementById("tip-checkboxes-grid"),
    tipTotalCount: document.getElementById("tip-total-count"),
    unmappedWarningBox: document.getElementById("unmapped-warning-box"),
    btnTipAll: document.getElementById("btn-tip-all"),
    btnTipContacted: document.getElementById("btn-tip-contacted"),
    btnTipNone: document.getElementById("btn-tip-none"),
    btnAddTipModal: document.getElementById("btn-add-tip-modal"),

    progressPanel: document.getElementById("progress-panel"),
    progressTitle: document.getElementById("progress-title"),
    progressPercent: document.getElementById("progress-percent"),
    progressBar: document.getElementById("progress-bar"),

    resultsSection: document.getElementById("results-section"),
    summaryPills: document.getElementById("summary-pills"),
    filesList: document.getElementById("files-list"),
    btnZipDownload: document.getElementById("btn-zip-download"),
    auditContent: document.getElementById("audit-content"),

    tabAuditBtn: document.getElementById("tab-audit-btn"),
    tabDictBtn: document.getElementById("tab-dict-btn"),
    dictTableBody: document.getElementById("dict-table-body"),
    dictCountPill: document.getElementById("dict-count-pill"),
    dictSearchInput: document.getElementById("dict-search-input"),
    btnDictAdd: document.getElementById("btn-dict-add"),
    btnDictClearAll: document.getElementById("btn-dict-clear-all"),
    btnDictDefault: document.getElementById("btn-dict-default"),
    btnDictExport: document.getElementById("btn-dict-export"),

    kpiCampsRaw: document.getElementById("kpi-camps-raw"),
    kpiCampsActive: document.getElementById("kpi-camps-active"),
    kpiFilesCount: document.getElementById("kpi-files-count"),
    kpiValidRecords: document.getElementById("kpi-valid-records"),
    kpiExclTip: document.getElementById("kpi-excl-tip"),
    kpiExclPrefix: document.getElementById("kpi-excl-prefix"),
    kpiExclBlank: document.getElementById("kpi-excl-blank"),
    kpiQuality: document.getElementById("kpi-quality"),

    tipModal: document.getElementById("tip-modal"),
    tipModalTitle: document.getElementById("tip-modal-title"),
    btnModalClose: document.getElementById("btn-modal-close"),
    btnModalCancel: document.getElementById("btn-modal-cancel"),
    btnModalSave: document.getElementById("btn-modal-save"),
    modalInputCamp: document.getElementById("modal-input-camp"),
    modalInputCampCustom: document.getElementById("modal-input-camp-custom"),
    modalInputCode: document.getElementById("modal-input-code"),
    modalInputCat: document.getElementById("modal-input-cat"),
    modalInputTip: document.getElementById("modal-input-tip"),
    modalInputSubtip: document.getElementById("modal-input-subtip"),
    modalInputStatus: document.getElementById("modal-input-status"),
    modalInputRellamada: document.getElementById("modal-input-rellamada")
  };

  // =========================================================================
  // 5. UTILIDADES GENERALES
  // =========================================================================
  function showToast(message) {
    const existing = document.querySelector(".toast-notice");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "toast-notice";
    toast.innerHTML = "<span>✓</span><span>" + message + "</span>";
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function normalize(val) {
    return String(val ?? "").trim().toUpperCase();
  }

  function cleanIntStr(val) {
    if (val === null || val === undefined || val === "") return "";
    if (typeof val === "number" && !isNaN(val)) return String(Math.floor(val));
    const s = String(val).trim();
    if (/^\d+(\.0+)?$/.test(s)) return s.split(".")[0];
    return s;
  }

  function pad(n) {
    const num = Math.floor(Math.abs(Number(n) || 0));
    return num < 10 ? "0" + num : String(num);
  }

  // =========================================================================
  // 6. MOTOR DE FECHAS (Elimina 1899 al 100% y soporta selector interactivo)
  // =========================================================================
  function parseDateObj(val) {
    if (val === null || val === undefined || val === "") return null;

    let d = null;

    if (val instanceof Date) {
      if (!isNaN(val.getTime())) d = val;
    } else if (typeof val === "number") {
      const epoch = new Date(Date.UTC(1899, 11, 30));
      d = new Date(epoch.getTime() + val * 86400000);
    } else {
      const s = String(val).trim();
      const parsed = new Date(s);
      if (!isNaN(parsed.getTime())) {
        d = parsed;
      } else {
        const parts = s.split(/[/\-\s:]+/);
        if (parts.length >= 3) {
          if (parts[0].length === 4) {
            d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), parseInt(parts[3] || 0, 10), parseInt(parts[4] || 0, 10), parseInt(parts[5] || 0, 10));
          } else if (parts[2].length === 4) {
            d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), parseInt(parts[3] || 0, 10), parseInt(parts[4] || 0, 10), parseInt(parts[5] || 0, 10));
          }
        }
      }
    }

    if (!d || isNaN(d.getTime())) return null;

    const fullYear = d.getFullYear();
    const hasValidDate = fullYear >= 2000 && fullYear <= 2099;
    const h = d.getHours();
    const m = d.getMinutes();
    const s = d.getSeconds();
    const timeStr = pad(h) + ":" + pad(m) + ":" + pad(s);

    let dateGestion = null;
    let dateLlamada = null;
    let ymd = null;

    if (hasValidDate) {
      const year = fullYear;
      const month = d.getMonth() + 1;
      const day = d.getDate();
      dateGestion = year + "-" + pad(month) + "-" + pad(day);
      dateLlamada = pad(day) + "-" + pad(month) + "-" + year;
      ymd = "" + year + pad(month) + pad(day);
    }

    return {
      rawDate: d,
      hasValidDate,
      year: hasValidDate ? fullYear : null,
      month: hasValidDate ? d.getMonth() + 1 : null,
      day: hasValidDate ? d.getDate() : null,
      h, m, s,
      timeStr,
      dateGestion,
      dateLlamada,
      ymd
    };
  }

  function setOperationalDate(isoString, sourceLabel = "Personalizada", isManual = false) {
    if (!isoString || !/^\d{4}-\d{2}-\d{2}$/.test(isoString)) return;
    const parts = isoString.split("-");
    const y = parts[0];
    const m = parts[1];
    const d = parts[2];

    state.dominantDateIso = isoString;
    state.dominantDateYmd = y + m + d;
    state.dominantDateDmy = d + "-" + m + "-" + y;

    if (el.opDateInput) el.opDateInput.value = isoString;
    if (el.dateSourceHint) {
      el.dateSourceHint.textContent = sourceLabel;
      if (isManual) el.dateSourceHint.classList.add("manual");
      else el.dateSourceHint.classList.remove("manual");
    }

    if (state.manifest && state.manifest.length > 0) {
      state.manifest.forEach(m => {
        m.archivo = m.archivo.replace(/_TZ_\d{8}\.csv$/, "_TZ_" + state.dominantDateYmd + ".csv");
      });
    }
  }

  function parseDurationSeconds(val, startObj, endObj) {
    if (val !== undefined && val !== null && val !== "") {
      if (typeof val === "number") return Math.max(0, Math.floor(val));
      const s = String(val).trim();
      const p = s.split(":");
      if (p.length === 3) return Math.max(0, parseInt(p[0], 10) * 3600 + parseInt(p[1], 10) * 60 + parseInt(p[2], 10));
      if (p.length === 2) return Math.max(0, parseInt(p[0], 10) * 60 + parseInt(p[1], 10));
      const n = parseInt(s, 10);
      if (!isNaN(n)) return Math.max(0, n);
    }
    if (startObj && endObj && startObj.rawDate && endObj.rawDate) {
      const diff = Math.floor((endObj.rawDate.getTime() - startObj.rawDate.getTime()) / 1000);
      return Math.max(0, diff);
    }
    return 0;
  }

  function setProgress(title, percent) {
    el.progressPanel.hidden = false;
    el.progressTitle.textContent = title;
    el.progressPercent.textContent = percent + "%";
    el.progressBar.style.width = percent + "%";
  }

  function updateDictBadge(customText) {
    const total = Object.keys(currentDict).length;
    if (customText) {
      el.dictStatusText.innerHTML = "<b>Homologación activa:</b> " + customText;
    } else {
      el.dictStatusText.innerHTML = "<b>Homologación activa:</b> " + total + " códigos Vicidial configurados";
    }
    if (el.dictCountPill) el.dictCountPill.textContent = total + " Códigos Activos";
    if (el.topDictPill) el.topDictPill.textContent = "✓ " + total + " Tipificaciones Homologadas";
  }

  // =========================================================================
  // 7. RENDERIZADO DE TABLA DE DICCIONARIO
  // =========================================================================
  function renderDictionaryTable(filterText = "") {
    el.dictTableBody.innerHTML = "";
    const filter = (filterText || "").trim().toUpperCase();
    const keys = Object.keys(currentDict).sort();

    if (keys.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td colspan="7" class="dict-empty-state">
          <h4>📭 Diccionario Vacío</h4>
          <p>No hay tipificaciones registradas actualmente. Puedes agregar códigos manualmente con <b>➕ Agregar Código</b>, cargar los <b>↺ 26 Base Oficiales</b> o subir un archivo Excel de Homologación.</p>
        </td>
      `;
      el.dictTableBody.appendChild(tr);
      el.dictCountPill.textContent = "0 Códigos";
      return;
    }

    let shownCount = 0;

    keys.forEach(k => {
      const item = currentDict[k] || {};
      const camp = item.campana || "TODAS";
      const code = item.codigo || (k.includes(":") ? k.split(":")[1] : k);
      const cat = item.categoria || "No Contacto";
      const tip = item.tipificacion || code;
      const sub = item.subTipificacion || tip;
      const stat = item.status || "NO DISPONIBLE";
      const rel = item.rellamada || "NO";

      const match = !filter ||
        k.toUpperCase().includes(filter) ||
        camp.toUpperCase().includes(filter) ||
        code.toUpperCase().includes(filter) ||
        cat.toUpperCase().includes(filter) ||
        tip.toUpperCase().includes(filter) ||
        sub.toUpperCase().includes(filter);

      if (!match) return;
      shownCount++;

      const isTodas = camp === "TODAS";
      const campBadge = isTodas
        ? `<span class="tag-camp tag-camp-todas">⭐ TODAS</span>`
        : `<span class="tag-camp tag-camp-spec">Campaña ${camp}</span>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="text-align:center;">${campBadge}</td>
        <td><b><code>${code}</code></b></td>
        <td><span class="${cat === 'Contacto' ? 'tag-green' : 'tag-blue'}">${cat}</span></td>
        <td>${tip}</td>
        <td>${sub}</td>
        <td><span class="${stat === 'DISPONIBLE' ? 'tag-green' : 'tag-orange'}">${stat}</span></td>
        <td style="text-align:center;">
          <button class="btn-action-edit" data-key="${k}" type="button">✏️ Editar</button>
          <button class="btn-action-del" data-key="${k}" type="button">🗑️ Borrar</button>
        </td>
      `;

      tr.querySelector(".btn-action-edit").addEventListener("click", () => {
        openModalWithKey(k);
      });
      tr.querySelector(".btn-action-del").addEventListener("click", () => {
        deleteCodeByKey(k);
      });

      el.dictTableBody.appendChild(tr);
    });

    el.dictCountPill.textContent = filter ? (shownCount + " de " + keys.length + " Códigos") : (keys.length + " Códigos Activos");
  }

  // =========================================================================
  // 8. EXTRACCION Y LECTURA DE ARCHIVOS EXCEL
  // =========================================================================
  function extractRowsFromSheet(sheet) {
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (!matrix || matrix.length === 0) return [];
    let headerIdx = 0;
    for (let i = 0; i < Math.min(25, matrix.length); i++) {
      const rowStr = (matrix[i] || []).join(" ").toLowerCase();
      if (
        rowStr.includes("campaign id") ||
        rowStr.includes("campaign_id") ||
        rowStr.includes("cod_vicidial") ||
        rowStr.includes("cod vicidial") ||
        rowStr.includes("tipificacion") ||
        (rowStr.includes("telefono") && rowStr.includes("lista"))
      ) {
        headerIdx = i;
        break;
      }
    }
    const headerRow = matrix[headerIdx].map(c => String(c).trim());
    const dataRows = [];
    for (let r = headerIdx + 1; r < matrix.length; r++) {
      const rawRow = matrix[r];
      if (!rawRow || rawRow.length === 0) continue;
      const hasData = rawRow.some(val => val !== "" && val !== null && val !== undefined);
      if (!hasData) continue;
      const rowObj = {};
      headerRow.forEach((colName, cIdx) => {
        if (colName) rowObj[colName] = rawRow[cIdx] !== undefined ? rawRow[cIdx] : "";
      });
      dataRows.push(rowObj);
    }
    return dataRows;
  }

  // =========================================================================
  // 9. IMPORTACION DEL ARCHIVO DE HOMOLOGACION
  // =========================================================================
  function handleDictFileSelected(file) {
    setProgress("Cargando y procesando archivo de homologación...", 30);
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = extractRowsFromSheet(sheet);

        if (!rows || rows.length === 0) {
          alert("El archivo de homologación está vacío o no contiene registros válidos.");
          el.progressPanel.hidden = true;
          return;
        }

        const sample = rows[0] || {};
        const colKeys = Object.keys(sample);
        const findCol = (...aliases) => {
          for (const alias of aliases) {
            const match = colKeys.find(k => k.toLowerCase().replace(/[\s_]+/g, "") === alias.toLowerCase().replace(/[\s_]+/g, ""));
            if (match) return match;
          }
          return null;
        };

        const colCamp = findCol("campana", "campaña", "campaign", "campaignid", "idcampana");
        const colCod = findCol("codvicidial", "codigo", "cod", "code", "codoficial", "status", "estado");
        const colCat = findCol("categoriacenco", "categoria", "category");
        const colTip = findCol("tipificacioncenco", "tipificacion", "tipificación");
        const colSub = findCol("subtipificacion", "subtipificación", "sub tipificacion", "sub tipificación");
        const colStat = findCol("status", "estadogestion", "estado");
        const colRel = findCol("rellamada", "recall");

        if (!colCod) {
          alert("No se encontró columna para el Código Vicidial (ej: COD_VICIDIAL, CODIGO, STATUS) en el archivo de homologación.");
          el.progressPanel.hidden = true;
          return;
        }

        const replaceAll = confirm(
          "Archivo de homologación detectado con " + rows.length + " filas.\n\n" +
          "¿Deseas REEMPLAZAR todo el diccionario anterior con este archivo?\n\n" +
          "• Presiona [Aceptar] para REEMPLAZAR (empezar limpio solo con este archivo)\n" +
          "• Presiona [Cancelar] para COMBINAR (agregar/actualizar sin borrar los demás)"
        );

        if (replaceAll) {
          currentDict = {};
        }

        let loadedCount = 0;
        rows.forEach(r => {
          const rawCode = normalize(r[colCod]);
          if (!rawCode) return;

          let rawCamp = "TODAS";
          if (colCamp && r[colCamp]) {
            const cStr = cleanIntStr(r[colCamp]);
            if (cStr) rawCamp = cStr;
            else if (String(r[colCamp]).trim().toUpperCase() !== "TODAS") rawCamp = String(r[colCamp]).trim().toUpperCase();
          }

          const cat = colCat ? String(r[colCat] || "").trim() : "";
          const tip = colTip ? String(r[colTip] || "").trim() : "";
          const sub = colSub ? String(r[colSub] || "").trim() : (tip || "");
          const stat = colStat ? normalize(r[colStat]) : "NO DISPONIBLE";
          const rel = colRel ? normalize(r[colRel]) : "NO";

          const k = makeKey(rawCamp, rawCode);
          currentDict[k] = {
            campana: rawCamp,
            codigo: rawCode,
            categoria: cat || (tip.toLowerCase().includes("encuesta") ? "Contacto" : "No Contacto"),
            tipificacion: tip || rawCode,
            subTipificacion: sub || tip || rawCode,
            status: stat.includes("DISP") && !stat.includes("NO") ? "DISPONIBLE" : "NO DISPONIBLE",
            rellamada: rel.startsWith("S") ? "SI" : "NO"
          };
          loadedCount++;
        });

        saveDictionaryToStorage();
        updateDictBadge(loadedCount + " códigos cargados desde " + file.name);
        renderDictionaryTable();

        if (state.rawRows && state.rawRows.length > 0) {
          updateTipificationsForActiveCampaigns();
        }

        el.progressPanel.hidden = true;
        showToast("Homologación actualizada: " + loadedCount + " códigos importados de " + file.name);
      } catch (err) {
        alert("Error al leer el archivo de homologación: " + err.message);
        el.progressPanel.hidden = true;
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // =========================================================================
  // 10. LECTURA Y PROCESAMIENTO DEL ARCHIVO FUENTE DE LLAMADAS
  // =========================================================================
  function handleSourceFileSelected(file) {
    state.sourceFileName = file.name;
    el.fileInfo.hidden = false;
    el.fileInfo.innerHTML = "📄 <b>Archivo seleccionado:</b> " + file.name + " (" + (file.size / 1024 / 1024).toFixed(2) + " MB)";
    setProgress("Leyendo y analizando archivo...", 20);

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = extractRowsFromSheet(sheet);

        if (!rows || rows.length === 0) {
          alert("El archivo está vacío o no contiene filas con datos.");
          el.progressPanel.hidden = true;
          return;
        }

        state.rawRows = rows;
        processSourceData(rows, file.name);
      } catch (err) {
        alert("Error al leer el archivo Excel: " + err.message);
        el.progressPanel.hidden = true;
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function processSourceData(rows, fileName = "") {
    setProgress("Detectando campañas, tipificaciones y fecha operacional...", 50);

    const sample = rows[0] || {};
    const colKeys = Object.keys(sample);
    const findCol = (...aliases) => {
      for (const alias of aliases) {
        const match = colKeys.find(k => k.toLowerCase().replace(/[\s_]+/g, "") === alias.toLowerCase().replace(/[\s_]+/g, ""));
        if (match) return match;
      }
      return null;
    };

    const colCamp = findCol("campaignid", "campaign", "campana", "campanaid", "campaign_id");
    const colHInicio = findCol("horainicio", "call_date", "calldate", "fechainicio");
    const colFechaAlt = findCol("fecha", "fechallamada", "fecha_llamada", "call_date");

    if (!colCamp) {
      alert("No se encontró la columna 'Campaign ID' en el archivo.");
      el.progressPanel.hidden = true;
      return;
    }

    const campCounts = {};
    const validDateCounts = {};

    rows.forEach(r => {
      const c = cleanIntStr(r[colCamp]);
      if (c) campCounts[c] = (campCounts[c] || 0) + 1;

      const candidateCols = [colHInicio, colFechaAlt].filter(Boolean);
      for (const col of candidateCols) {
        if (r[col]) {
          const parsed = parseDateObj(r[col]);
          if (parsed && parsed.hasValidDate && parsed.dateGestion) {
            validDateCounts[parsed.dateGestion] = (validDateCounts[parsed.dateGestion] || 0) + 1;
            break;
          }
        }
      }
    });

    state.availableCampaigns = Object.keys(campCounts).map(id => ({ id, count: campCounts[id] })).sort((a,b) => b.count - a.count);

    let detectedIso = "";
    let detectedLabel = "";

    let maxCount = 0;
    Object.keys(validDateCounts).forEach(iso => {
      if (validDateCounts[iso] > maxCount) {
        maxCount = validDateCounts[iso];
        detectedIso = iso;
        detectedLabel = "Detectada en Filas (" + maxCount + " llamadas)";
      }
    });

    if (!detectedIso && fileName) {
      const fnMatch = fileName.match(/\b(20\d{2})[-_]?(\d{2})[-_]?(\d{2})\b/);
      if (fnMatch) {
        detectedIso = fnMatch[1] + "-" + fnMatch[2] + "-" + fnMatch[3];
        detectedLabel = "Detectada del Archivo";
      }
    }

    if (!detectedIso) {
      const now = new Date();
      detectedIso = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
      detectedLabel = "Fecha de Hoy";
    }

    setOperationalDate(detectedIso, detectedLabel, false);

    const cenco6 = ["91", "107", "96", "106", "108", "109"];
    const foundCenco = state.availableCampaigns.filter(c => cenco6.includes(c.id)).map(c => c.id);
    if (foundCenco.length > 0) {
      state.selectedCampaigns = new Set(foundCenco);
    } else {
      state.selectedCampaigns = new Set(state.availableCampaigns.map(c => c.id));
    }

    renderCampaignCheckboxes();
    updateTipificationsForActiveCampaigns(true);

    el.progressPanel.hidden = true;
    el.campaignsSection.hidden = false;
  }

  function renderCampaignCheckboxes() {
    el.campaignCheckboxes.innerHTML = "";

    state.availableCampaigns.forEach(c => {
      const chip = document.createElement("label");
      chip.className = "camp-chip";
      const isChecked = state.selectedCampaigns.has(c.id);
      chip.innerHTML = `
        <input type="checkbox" value="${c.id}" ${isChecked ? "checked" : ""} />
        <span class="camp-chip-label">Campaña ${c.id}</span>
        <span class="camp-chip-count">${c.count.toLocaleString()} registros</span>
      `;
      const chk = chip.querySelector("input");
      chk.addEventListener("change", e => {
        if (e.target.checked) state.selectedCampaigns.add(c.id);
        else state.selectedCampaigns.delete(c.id);
        updateTipificationsForActiveCampaigns();
      });
      el.campaignCheckboxes.appendChild(chip);
    });
  }

  // =========================================================================
  // 11. MATRIZ DE TIPIFICACIONES POR CAMPAÑA ACTIVA
  // =========================================================================
  function updateTipificationsForActiveCampaigns(selectAllByDefault = false) {
    const rows = state.rawRows;
    if (!rows || rows.length === 0) return;

    const sample = rows[0] || {};
    const colKeys = Object.keys(sample);
    const findCol = (...aliases) => {
      for (const alias of aliases) {
        const match = colKeys.find(k => k.toLowerCase().replace(/[\s_]+/g, "") === alias.toLowerCase().replace(/[\s_]+/g, ""));
        if (match) return match;
      }
      return null;
    };

    const colCamp = findCol("campaignid", "campaign", "campana");
    const colTip = findCol("estadotipificacion", "tipificacion", "tipificación", "status", "estado");

    const activeCounts = {};
    const codeCampaigns = {};

    rows.forEach(r => {
      const campId = cleanIntStr(r[colCamp]);
      if (!state.selectedCampaigns.has(campId)) return;

      let rawCode = normalize(colTip ? r[colTip] : "");
      if (!rawCode) rawCode = "SIN_CODIGO";

      activeCounts[rawCode] = (activeCounts[rawCode] || 0) + 1;
      if (!codeCampaigns[rawCode]) codeCampaigns[rawCode] = new Set();
      codeCampaigns[rawCode].add(campId);
    });

    const detected = Object.keys(activeCounts).map(code => {
      const camps = Array.from(codeCampaigns[code] || []);
      let resolvedItem = null;
      for (const cid of camps) {
        const found = resolveTipification(cid, code);
        if (found) {
          resolvedItem = found;
          break;
        }
      }
      if (!resolvedItem) {
        resolvedItem = resolveTipification("TODAS", code);
      }

      return {
        code,
        count: activeCounts[code],
        campaigns: camps,
        mapped: !!resolvedItem,
        item: resolvedItem
      };
    }).sort((a,b) => b.count - a.count);

    state.detectedTipifications = detected;

    if (selectAllByDefault || state.selectedTipifications.size === 0) {
      state.selectedTipifications = new Set(detected.map(d => d.code));
    }

    renderTipCheckboxes();
  }

  function renderTipCheckboxes() {
    el.tipCheckboxesGrid.innerHTML = "";
    el.tipTotalCount.textContent = state.detectedTipifications.length;

    const unmapped = state.detectedTipifications.filter(d => !d.mapped);
    if (unmapped.length > 0) {
      el.unmappedWarningBox.hidden = false;
      el.unmappedWarningBox.innerHTML = `
        <span>⚠️ <b>Atención:</b> Se detectaron <b>${unmapped.length}</b> códigos sin homologar en las campañas seleccionadas:</span>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
          ${unmapped.map(u => `
            <span class="unmapped-code-pill" data-code="${u.code}" data-camps="${u.campaigns.join(',')}" title="Clic para homologar ${u.code}">
              ➕ Homologar <b>${u.code}</b> (${u.count.toLocaleString()})
            </span>
          `).join("")}
        </div>
      `;
      el.unmappedWarningBox.querySelectorAll(".unmapped-code-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          const codeText = pill.dataset.code;
          const campList = (pill.dataset.camps || "").split(",").filter(Boolean);
          const prefCamp = campList.length === 1 ? campList[0] : "TODAS";
          openModalWithKey(null, codeText, prefCamp);
        });
      });
    } else {
      el.unmappedWarningBox.hidden = true;
      el.unmappedWarningBox.innerHTML = "";
    }

    state.detectedTipifications.forEach(t => {
      const chip = document.createElement("label");
      const isChecked = state.selectedTipifications.has(t.code);
      const isMapped = t.mapped;
      const item = t.item;

      let badgeClass = "badge-unmapped";
      let badgeLabel = "Sin Homologar";
      let desc = "Código no registrado en diccionario";

      if (isMapped && item) {
        if (item.categoria === "Contacto") {
          badgeClass = "badge-contacto";
          badgeLabel = "Contacto";
        } else {
          badgeClass = "badge-nocontacto";
          badgeLabel = "No Contacto";
        }
        const campLabel = item.campana && item.campana !== "TODAS" ? " [Camp " + item.campana + "]" : "";
        desc = (item.tipificacion || item.categoria || t.code) + campLabel;
      }

      chip.className = "tip-chip " + (isChecked ? "checked" : "") + " " + (!isMapped ? "unmapped" : "");
      chip.innerHTML = `
        <input type="checkbox" value="${t.code}" ${isChecked ? "checked" : ""} />
        <div class="tip-chip-content">
          <div class="tip-chip-top">
            <span class="tip-chip-code">${t.code}</span>
            <span class="tip-chip-badge ${badgeClass}">${badgeLabel}</span>
          </div>
          <div class="tip-chip-desc" title="${desc}">${desc}</div>
        </div>
        <span class="tip-chip-count">${t.count.toLocaleString()}</span>
      `;

      const chk = chip.querySelector("input");
      chk.addEventListener("change", e => {
        if (e.target.checked) {
          state.selectedTipifications.add(t.code);
          chip.classList.add("checked");
        } else {
          state.selectedTipifications.delete(t.code);
          chip.classList.remove("checked");
        }
      });

      el.tipCheckboxesGrid.appendChild(chip);
    });
  }

  // =========================================================================
  // 12. MODAL PARA AGREGAR / EDITAR TIPIFICACION AISLADA POR CAMPANA
  // =========================================================================
  function openModalWithKey(keyToEdit = null, prefillCode = "", prefillCamp = "TODAS") {
    if (!el.tipModal) return;
    state.editingKey = keyToEdit;

    el.tipModal.removeAttribute("hidden");
    el.tipModal.hidden = false;
    el.tipModal.classList.add("active");
    el.tipModal.style.display = "flex";

    if (keyToEdit && currentDict[keyToEdit]) {
      const item = currentDict[keyToEdit];
      const camp = item.campana || "TODAS";
      const code = item.codigo || (keyToEdit.includes(":") ? keyToEdit.split(":")[1] : keyToEdit);

      el.tipModalTitle.textContent = "Editar Tipificación: " + code + (camp !== "TODAS" ? " (Campaña " + camp + ")" : " (Universal)");

      const standardCamps = ["TODAS", "91", "107", "96", "106", "108", "109"];
      if (standardCamps.includes(camp)) {
        el.modalInputCamp.value = camp;
        el.modalInputCampCustom.style.display = "none";
      } else {
        el.modalInputCamp.value = "CUSTOM";
        el.modalInputCampCustom.value = camp;
        el.modalInputCampCustom.style.display = "block";
      }

      el.modalInputCode.value = code;
      el.modalInputCode.readOnly = false;
      el.modalInputCat.value = item.categoria || "Contacto";
      el.modalInputTip.value = item.tipificacion || "";
      el.modalInputSubtip.value = item.subTipificacion || item.tipificacion || "";
      el.modalInputStatus.value = item.status || "NO DISPONIBLE";
      el.modalInputRellamada.value = item.rellamada || "NO";
    } else {
      el.tipModalTitle.textContent = "Agregar / Homologar Tipificación";

      const standardCamps = ["TODAS", "91", "107", "96", "106", "108", "109"];
      if (standardCamps.includes(prefillCamp)) {
        el.modalInputCamp.value = prefillCamp;
        el.modalInputCampCustom.style.display = "none";
      } else {
        el.modalInputCamp.value = "CUSTOM";
        el.modalInputCampCustom.value = prefillCamp;
        el.modalInputCampCustom.style.display = "block";
      }

      el.modalInputCode.value = prefillCode || "";
      el.modalInputCode.readOnly = false;
      el.modalInputCat.value = "Contacto";
      el.modalInputTip.value = "";
      el.modalInputSubtip.value = "";
      el.modalInputStatus.value = "NO DISPONIBLE";
      el.modalInputRellamada.value = "NO";
    }

    setTimeout(() => {
      if (!el.modalInputCode.value) el.modalInputCode.focus();
      else el.modalInputTip.focus();
    }, 100);
  }

  function closeModal() {
    if (!el.tipModal) return;
    el.tipModal.setAttribute("hidden", "");
    el.tipModal.hidden = true;
    el.tipModal.classList.remove("active");
    el.tipModal.style.display = "none";
    state.editingKey = null;
  }
  window.closeTipModal = closeModal;

  function saveModalTipification() {
    let campVal = el.modalInputCamp.value;
    if (campVal === "CUSTOM") {
      const customVal = cleanIntStr(el.modalInputCampCustom.value);
      if (!customVal) {
        alert("Por favor especifica el ID numérico de la campaña personalizada (ej: 23, 136).");
        el.modalInputCampCustom.focus();
        return;
      }
      campVal = customVal;
    }

    const code = normalize(el.modalInputCode.value);
    const cat = el.modalInputCat.value;
    const tip = el.modalInputTip.value.trim();
    const sub = el.modalInputSubtip.value.trim() || tip;
    const stat = el.modalInputStatus.value;
    const rel = el.modalInputRellamada.value;

    if (!code) {
      alert("Por favor ingresa el Código Vicidial.");
      el.modalInputCode.focus();
      return;
    }
    if (!tip) {
      alert("Por favor ingresa la descripción de Tipificación Cencosud.");
      el.modalInputTip.focus();
      return;
    }

    const newKey = makeKey(campVal, code);

    if (state.editingKey && state.editingKey !== newKey) {
      delete currentDict[state.editingKey];
    }

    currentDict[newKey] = {
      campana: campVal,
      codigo: code,
      categoria: cat,
      tipificacion: tip,
      subTipificacion: sub,
      status: stat,
      rellamada: rel
    };

    saveDictionaryToStorage();
    renderDictionaryTable();
    updateDictBadge("Código " + code + " guardado para Campaña " + campVal);

    if (state.rawRows && state.rawRows.length > 0) {
      updateTipificationsForActiveCampaigns();
    }

    closeModal();
    showToast("Tipificación " + code + " (" + campVal + ") guardada correctamente.");
  }

  function deleteCodeByKey(key) {
    const item = currentDict[key];
    const label = item ? ("'" + item.codigo + "' de Campaña " + item.campana) : ("'" + key + "'");
    if (!confirm("¿Estás seguro de eliminar la tipificación " + label + " del diccionario?")) return;

    delete currentDict[key];
    saveDictionaryToStorage();
    renderDictionaryTable();
    updateDictBadge();
    if (state.rawRows && state.rawRows.length > 0) {
      updateTipificationsForActiveCampaigns();
    }
    showToast("Tipificación eliminada.");
  }

  function exportDictionaryToExcel() {
    const keys = Object.keys(currentDict).sort();
    if (keys.length === 0) {
      alert("El diccionario está vacío. Agrega o importa tipificaciones antes de exportar.");
      return;
    }

    const data = keys.map(k => {
      const item = currentDict[k] || {};
      return {
        "CAMPAÑA": item.campana || "TODAS",
        "COD_VICIDIAL": item.codigo || (k.includes(":") ? k.split(":")[1] : k),
        "CATEGORIA_CENCO": item.categoria || "",
        "TIPIFICACION_CENCO": item.tipificacion || "",
        "SUB_TIPIFICACION": item.subTipificacion || item.tipificacion || "",
        "STATUS": item.status || "NO DISPONIBLE",
        "RELLAMADA": item.rellamada || "NO"
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Diccionario_Oficial");
    XLSX.writeFile(wb, "TIPIFICACIONES_CENCOSUD_CONFIG_" + state.dominantDateYmd + ".xlsx");
    showToast("Diccionario exportado a Excel.");
  }

  // =========================================================================
  // 13. TRANSFORMACION Y GENERACION DE RECORRIDOS (100% FECHA CORREGIDA)
  // =========================================================================
  function runTransformation() {
    setProgress("Iniciando validación y homologación con filtro de entrega...", 10);
    const rows = state.rawRows;
    const sample = rows[0] || {};
    const colKeys = Object.keys(sample);

    const findCol = (...aliases) => {
      for (const alias of aliases) {
        const match = colKeys.find(k => k.toLowerCase().replace(/[\s_]+/g, "") === alias.toLowerCase().replace(/[\s_]+/g, ""));
        if (match) return match;
      }
      return null;
    };

    const colCamp = findCol("campaignid", "campaign", "campana");
    const colUser = findCol("usuario", "user");
    const colTel = findCol("telefono", "teléfono", "phone", "phonenumber", "fono");
    const colVendor = findCol("vendorlead", "vendorleadcode", "vendor_lead", "id", "vendor");
    const colApellido = findCol("apellido", "idcliente", "cliente");
    const colProv = findCol("provincia", "ola");
    const colHInicio = findCol("horainicio", "call_date", "calldate", "fechainicio");
    const colHFin = findCol("horafin", "fechafin");
    const colDur = findCol("duracion", "duración", "length", "duration", "tiemposegundos", "segundos");
    const colTip = findCol("estadotipificacion", "tipificacion", "tipificación", "status", "estado");

    const selected = Array.from(state.selectedCampaigns);
    const groups = [];

    const has91 = selected.includes("91");
    const has107 = selected.includes("107");
    if (has91 && has107) {
      groups.push({ ids: ["91", "107"], nombre: "Cencosud EEFF", filename: "Incidencia_Cencosud_EEFF_TZ_" + state.dominantDateYmd + ".csv", expectedPrefix: "113" });
    } else if (has91) {
      groups.push({ ids: ["91"], nombre: "Cencosud EEFF", filename: "Incidencia_Cencosud_EEFF_TZ_" + state.dominantDateYmd + ".csv", expectedPrefix: "113" });
    } else if (has107) {
      groups.push({ ids: ["107"], nombre: "Cencosud EEFF", filename: "Incidencia_Cencosud_EEFF_TZ_" + state.dominantDateYmd + ".csv", expectedPrefix: "113" });
    }

    selected.filter(c => c !== "91" && c !== "107").forEach(cid => {
      const reg = CAMPAIGN_REGISTRY.find(r => r.ids.includes(cid));
      if (reg) {
        groups.push({ ids: [cid], nombre: reg.nombre, filename: reg.pattern(state.dominantDateYmd), expectedPrefix: reg.prefix });
      } else {
        groups.push({ ids: [cid], nombre: "Campaña " + cid, filename: "Incidencia_Cencosud_Campana_" + cid + "_TZ_" + state.dominantDateYmd + ".csv", expectedPrefix: CAMPAIGN_PREFIX_MAP[cid] || "" });
      }
    });

    const manifest = [];

    groups.forEach(g => {
      const gCamps = new Set(g.ids);
      const filteredRows = rows.filter(r => gCamps.has(cleanIntStr(r[colCamp])));

      const validRows = [];
      const exclPrefix = [];
      const exclBlank = [];
      const exclTip = [];

      filteredRows.forEach(r => {
        const campId = cleanIntStr(r[colCamp]);
        const rowId = cleanIntStr(colVendor ? r[colVendor] : "");
        const cleanDigits = rowId.replace(/\D/g, "");

        let rawStatus = normalize(colTip ? r[colTip] : "");
        if (!rawStatus) rawStatus = "SIN_CODIGO";

        if (!state.selectedTipifications.has(rawStatus)) {
          exclTip.push({
            id: rowId || "-",
            campana: campId,
            codigo: rawStatus,
            telefono: cleanIntStr(colTel ? r[colTel] : "")
          });
          return;
        }

        const expPrefix = CAMPAIGN_PREFIX_MAP[campId];
        if (expPrefix && !cleanDigits.startsWith(expPrefix)) {
          exclPrefix.push({
            id: rowId,
            campana: campId,
            prefijo_obtenido: cleanDigits.slice(0, 3) || "-",
            prefijo_esperado: expPrefix,
            telefono: cleanIntStr(colTel ? r[colTel] : "")
          });
          return;
        }

        const idCliente = cleanIntStr(colApellido ? r[colApellido] : "");
        const telefono = cleanIntStr(colTel ? r[colTel] : "");

        const rawUser = String(colUser ? r[colUser] : "").trim();
        const codEjecutivo = (!rawUser || rawUser.toUpperCase() === "VDAD" || rawUser.toUpperCase() === "NONE") ? "1" : cleanIntStr(rawUser);

        const ola = String(colProv ? r[colProv] : "").trim();

        const dInicio = parseDateObj(colHInicio ? r[colHInicio] : null);
        const dFin = parseDateObj(colHFin ? r[colHFin] : null);

        let fechaGestion = "";
        let fechaLlamada = "";
        let inicioLlamada = "";
        let finLlamada = "";
        let duracion = 0;

        if (dInicio && dInicio.hasValidDate) {
          fechaGestion = dInicio.dateGestion;
          fechaLlamada = dInicio.dateLlamada;
        } else {
          fechaGestion = state.dominantDateIso;
          fechaLlamada = state.dominantDateDmy;
        }

        inicioLlamada = dInicio ? dInicio.timeStr : "00:00:00";

        if (dFin) {
          finLlamada = dFin.timeStr;
          duracion = parseDurationSeconds(colDur ? r[colDur] : null, dInicio, dFin);
        } else {
          finLlamada = inicioLlamada;
          duracion = 0;
        }

        const resolved = resolveTipification(campId, rawStatus);

        let categoria = "No Contacto";
        let tipificacion = "No Contestan";
        let subTip = "No Contestan";

        if (resolved) {
          categoria = resolved.categoria || "No Contacto";
          tipificacion = resolved.tipificacion || rawStatus;
          subTip = resolved.subTipificacion || tipificacion;
        } else if (["NAN", "NONE", "DROP", "N", "SIN_CODIGO"].includes(rawStatus)) {
          categoria = "No Contacto";
          tipificacion = "No Contestan";
          subTip = "No Contestan";
        } else {
          categoria = "No Contacto";
          tipificacion = "NO HOMOLOGADO (" + rawStatus + ")";
          subTip = tipificacion;
        }

        const rowObj = {
          "ID": rowId,
          "ID_CLIENTE": idCliente,
          "CATEGORIA": categoria,
          "TIPIFICACIÓN": tipificacion,
          "SUB TIPIFICACIÓN": subTip,
          "FECHA DE GESTIÓN": fechaGestion,
          "FECHALLAMADA": fechaLlamada,
          "INICIOLLAMADA": inicioLlamada,
          "FINLLAMADA": finLlamada,
          "DURACION": duracion,
          "TELEFONO": telefono,
          "CODEJECUTIVO": codEjecutivo,
          "OLA": ola
        };

        const blankCols = [];
        OUTPUT_COLUMNS.forEach(col => {
          const v = rowObj[col];
          if (v === 0 || v === "0") return;
          if (v === null || v === undefined || String(v).trim() === "") {
            blankCols.push(col);
          }
        });

        if (blankCols.length > 0) {
          exclBlank.push({
            id: rowId || "SIN ID",
            telefono: telefono || "SIN TELEFONO",
            campana: campId,
            columnas_en_blanco: blankCols.join(", ")
          });
          return;
        }

        validRows.push(rowObj);
      });

      let csvContent = "\uFEFF" + OUTPUT_COLUMNS.join(";") + "\r\n";
      validRows.forEach(row => {
        const line = OUTPUT_COLUMNS.map(col => String(row[col] ?? "")).join(";");
        csvContent += line + "\r\n";
      });

      manifest.push({
        archivo: g.filename,
        nombre: g.nombre,
        campanas: g.ids,
        expectedPrefix: g.expectedPrefix,
        registros: validRows.length,
        csvString: csvContent,
        stats: {
          exclTipCount: exclTip.length,
          exclPrefixCount: exclPrefix.length,
          exclBlankCount: exclBlank.length,
          exclTipList: exclTip,
          exclPrefixList: exclPrefix,
          exclBlankList: exclBlank
        }
      });
    });

    state.manifest = manifest;
    renderResults(manifest);
    el.progressPanel.hidden = true;
  }

  // =========================================================================
  // 14. PRESENTACION DE RESULTADOS Y AUDITORIA
  // =========================================================================
  function renderResults(manifest) {
    el.resultsSection.hidden = false;

    const totalValid = manifest.reduce((acc, m) => acc + m.registros, 0);
    const totalExclTip = manifest.reduce((acc, m) => acc + m.stats.exclTipCount, 0);
    const totalExclPrefix = manifest.reduce((acc, m) => acc + m.stats.exclPrefixCount, 0);
    const totalExclBlank = manifest.reduce((acc, m) => acc + m.stats.exclBlankCount, 0);
    const totalDiscards = totalExclTip + totalExclPrefix + totalExclBlank;
    const totalEvaluated = totalValid + totalDiscards;
    const qualityRate = totalEvaluated > 0 ? ((totalValid / totalEvaluated) * 100).toFixed(1) + "%" : "100%";

    el.kpiCampsRaw.textContent = state.availableCampaigns.length;
    el.kpiCampsActive.textContent = state.selectedCampaigns.size;
    el.kpiFilesCount.textContent = manifest.length;
    el.kpiValidRecords.textContent = totalValid.toLocaleString();
    el.kpiExclTip.textContent = totalExclTip.toLocaleString();
    el.kpiExclPrefix.textContent = totalExclPrefix.toLocaleString();
    el.kpiExclBlank.textContent = totalExclBlank.toLocaleString();
    el.kpiQuality.textContent = qualityRate;

    el.tabAuditBtn.textContent = "🛡️ Auditoría de Descartes (" + totalDiscards.toLocaleString() + ")";

    el.summaryPills.innerHTML = `
      <span class="pill-blue">📅 Operación: ${state.dominantDateIso}</span>
      <span class="pill-green">✓ ${totalValid.toLocaleString()} Registros Oficiales Válidos</span>
      ${totalExclTip > 0 ? `<span class="pill-purple">✂️ ${totalExclTip.toLocaleString()} Excluidos por Filtro Tipificación</span>` : ""}
      ${totalExclPrefix > 0 ? `<span class="pill-orange">⚠️ ${totalExclPrefix.toLocaleString()} Fuera por Prefijo ID</span>` : ""}
      ${totalExclBlank > 0 ? `<span class="pill-red">⚠️ ${totalExclBlank.toLocaleString()} Fuera por Celdas Vacías</span>` : ""}
      <span class="pill-green">🎯 ${state.selectedTipifications.size} Tipificaciones Incluidas</span>
    `;

    el.filesList.innerHTML = "";
    manifest.forEach(m => {
      const card = document.createElement("div");
      card.className = "file-card";
      card.innerHTML = `
        <div class="file-card-info">
          <div class="file-card-title">${m.nombre}</div>
          <div class="file-card-desc">
            <code>${m.archivo}</code> · <b>${m.registros.toLocaleString()}</b> registros válidos
            ${m.expectedPrefix ? `· Prefijo <code>${m.expectedPrefix}</code>` : ""}
          </div>
        </div>
        <button class="button small primary btn-download-single" type="button">⬇️ Descargar CSV</button>
      `;

      card.querySelector(".btn-download-single").addEventListener("click", () => {
        downloadBlob(m.csvString, m.archivo, "text/csv;charset=utf-8;");
      });
      el.filesList.appendChild(card);
    });

    const zip = new JSZip();
    manifest.forEach(m => {
      zip.file(m.archivo, m.csvString);
    });
    zip.generateAsync({ type: "blob" }).then(blob => {
      state.zipBlob = blob;
      state.zipName = "Recorridos_Cencosud_Oficiales_" + state.dominantDateYmd + ".zip";
    });

    el.btnZipDownload.onclick = () => {
      if (!state.zipBlob) {
        alert("El archivo ZIP se está preparando, espera un instante...");
        return;
      }
      downloadBlob(state.zipBlob, state.zipName, "application/zip");
    };

    let auditHtml = "";

    const allExclTip = [];
    manifest.forEach(m => m.stats.exclTipList.forEach(item => allExclTip.push(item)));
    if (allExclTip.length > 0) {
      auditHtml += `
        <div class="audit-block">
          <h4 style="color:#6D28D9;">✂️ Registros Excluidos por Filtro de Tipificaciones (${allExclTip.length.toLocaleString()})</h4>
          <p style="font-size:13px; color:#475569; margin-bottom:10px;">
            Estos registros pertenecen a tipificaciones que no fueron seleccionadas para entrega en este recorrido.
          </p>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>ID</th><th>Campaña</th><th>Código Vicidial</th><th>Teléfono</th><th>Motivo</th></tr></thead>
              <tbody>
                ${allExclTip.slice(0, 100).map(x => `
                  <tr>
                    <td><b>${x.id}</b></td>
                    <td>${x.campana}</td>
                    <td><code>${x.codigo}</code></td>
                    <td>${x.telefono}</td>
                    <td><span class="tag-orange">No Seleccionada para Entrega</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          ${allExclTip.length > 100 ? `<small style="color:#64748B;">Mostrando los primeros 100 de ${allExclTip.length} descartes.</small>` : ""}
        </div>
      `;
    }

    const allExclPrefix = [];
    manifest.forEach(m => m.stats.exclPrefixList.forEach(item => allExclPrefix.push(item)));
    if (allExclPrefix.length > 0) {
      auditHtml += `
        <div class="audit-block" style="margin-top:20px;">
          <h4 style="color:#D97706;">⚠️ Registros Excluidos por Prefijo ID no válido (${allExclPrefix.length.toLocaleString()})</h4>
          <p style="font-size:13px; color:#475569; margin-bottom:10px;">
            El ID no inicia con los 3 dígitos oficiales correspondientes a la campaña.
          </p>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>ID Obtenido</th><th>Campaña</th><th>Prefijo Obtenido</th><th>Prefijo Obligatorio</th><th>Teléfono</th></tr></thead>
              <tbody>
                ${allExclPrefix.slice(0, 100).map(x => `
                  <tr>
                    <td><b>${x.id}</b></td>
                    <td>${x.campana}</td>
                    <td><code>${x.prefijo_obtenido}</code></td>
                    <td><b>${x.prefijo_esperado}</b></td>
                    <td>${x.telefono}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          ${allExclPrefix.length > 100 ? `<small style="color:#64748B;">Mostrando los primeros 100 de ${allExclPrefix.length} descartes.</small>` : ""}
        </div>
      `;
    }

    const allExclBlank = [];
    manifest.forEach(m => m.stats.exclBlankList.forEach(item => allExclBlank.push(item)));
    if (allExclBlank.length > 0) {
      auditHtml += `
        <div class="audit-block" style="margin-top:20px;">
          <h4 style="color:#DC2626;">🛑 Registros Excluidos por Celdas en Blanco (${allExclBlank.length.toLocaleString()})</h4>
          <p style="font-size:13px; color:#475569; margin-bottom:10px;">
            Registros descartados bajo la regla estricta de <b>cero celdas vacías</b>.
          </p>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>ID</th><th>Campaña</th><th>Teléfono</th><th>Columnas Faltantes</th></tr></thead>
              <tbody>
                ${allExclBlank.slice(0, 100).map(x => `
                  <tr>
                    <td><b>${x.id}</b></td>
                    <td>${x.campana}</td>
                    <td>${x.telefono}</td>
                    <td><span class="tag-red">${x.columnas_en_blanco}</span></td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          ${allExclBlank.length > 100 ? `<small style="color:#64748B;">Mostrando los primeros 100 de ${allExclBlank.length} descartes.</small>` : ""}
        </div>
      `;
    }

    if (totalDiscards === 0) {
      auditHtml = `
        <div style="background:#ECFDF5; border:1px solid #A7F3D0; padding:24px; border-radius:12px; text-align:center;">
          <h4 style="color:#065F46; font-size:16px;">✓ Cero Descartes Registrados</h4>
          <p style="color:#047857; font-size:13.5px; margin-top:4px;">El 100% de los registros analizados cumplieron los criterios de prefijo de 3 dígitos, tipificaciones seleccionadas y cero celdas vacías.</p>
        </div>
      `;
    }

    el.auditContent.innerHTML = auditHtml;
    el.resultsSection.scrollIntoView({ behavior: "smooth" });
  }

  function downloadBlob(content, filename, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // =========================================================================
  // 15. LISTENERS Y EVENTOS DEL DOM
  // =========================================================================
  el.dictDropzone.addEventListener("dragover", e => { e.preventDefault(); el.dictDropzone.classList.add("dragover"); });
  el.dictDropzone.addEventListener("dragleave", () => el.dictDropzone.classList.remove("dragover"));
  el.dictDropzone.addEventListener("drop", e => {
    e.preventDefault();
    el.dictDropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleDictFileSelected(e.dataTransfer.files[0]);
    }
  });
  el.dictInput.addEventListener("change", e => {
    if (e.target.files && e.target.files.length > 0) {
      handleDictFileSelected(e.target.files[0]);
    }
  });

  el.dropzone.addEventListener("dragover", e => { e.preventDefault(); el.dropzone.classList.add("dragover"); });
  el.dropzone.addEventListener("dragleave", () => el.dropzone.classList.remove("dragover"));
  el.dropzone.addEventListener("drop", e => {
    e.preventDefault();
    el.dropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSourceFileSelected(e.dataTransfer.files[0]);
    }
  });
  el.sourceInput.addEventListener("change", e => {
    if (e.target.files && e.target.files.length > 0) {
      handleSourceFileSelected(e.target.files[0]);
    }
  });

  if (el.opDateInput) {
    el.opDateInput.addEventListener("change", e => {
      const val = e.target.value;
      if (val) {
        setOperationalDate(val, "Personalizada", true);
        showToast("Fecha de llamadas actualizada a: " + val);
      }
    });
  }

  el.btnTipAll.addEventListener("click", () => {
    state.selectedTipifications = new Set(state.detectedTipifications.map(t => t.code));
    renderTipCheckboxes();
    el.btnTipAll.classList.add("active");
    el.btnTipContacted.classList.remove("active");
    el.btnTipNone.classList.remove("active");
  });

  el.btnTipContacted.addEventListener("click", () => {
    const contactCodes = state.detectedTipifications
      .filter(t => t.item && t.item.categoria === "Contacto")
      .map(t => t.code);
    state.selectedTipifications = new Set(contactCodes);
    renderTipCheckboxes();
    el.btnTipContacted.classList.add("active");
    el.btnTipAll.classList.remove("active");
    el.btnTipNone.classList.remove("active");
  });

  el.btnTipNone.addEventListener("click", () => {
    state.selectedTipifications.clear();
    renderTipCheckboxes();
    el.btnTipNone.classList.add("active");
    el.btnTipAll.classList.remove("active");
    el.btnTipContacted.classList.remove("active");
  });

  el.btnCenco6.addEventListener("click", () => {
    const target = new Set(["91", "107", "96", "106", "108", "109"]);
    state.selectedCampaigns = new Set(state.availableCampaigns.filter(c => target.has(c.id)).map(c => c.id));
    renderCampaignCheckboxes();
    updateTipificationsForActiveCampaigns();
    el.btnCenco6.classList.add("active");
    el.btnAll.classList.remove("active");
    el.btnNone.classList.remove("active");
  });

  el.btnAll.addEventListener("click", () => {
    state.selectedCampaigns = new Set(state.availableCampaigns.map(c => c.id));
    renderCampaignCheckboxes();
    updateTipificationsForActiveCampaigns();
    el.btnAll.classList.add("active");
    el.btnCenco6.classList.remove("active");
    el.btnNone.classList.remove("active");
  });

  el.btnNone.addEventListener("click", () => {
    state.selectedCampaigns.clear();
    renderCampaignCheckboxes();
    updateTipificationsForActiveCampaigns();
    el.btnNone.classList.add("active");
    el.btnCenco6.classList.remove("active");
    el.btnAll.classList.remove("active");
  });

  el.btnModalClose.addEventListener("click", closeModal);
  el.btnModalCancel.addEventListener("click", closeModal);
  el.btnModalSave.addEventListener("click", saveModalTipification);

  if (el.modalInputCamp) {
    el.modalInputCamp.addEventListener("change", e => {
      if (e.target.value === "CUSTOM") {
        el.modalInputCampCustom.style.display = "block";
        el.modalInputCampCustom.focus();
      } else {
        el.modalInputCampCustom.style.display = "none";
      }
    });
  }

  if (el.tipModal) {
    el.tipModal.addEventListener("click", e => {
      if (e.target === el.tipModal) closeModal();
    });
  }

  document.addEventListener("keydown", e => {
    if ((e.key === "Escape" || e.keyCode === 27) && el.tipModal && !el.tipModal.hidden && el.tipModal.style.display !== "none") {
      closeModal();
    }
  });

  el.btnQuickAddTip.addEventListener("click", () => openModalWithKey());
  if (el.btnQuickClearDict) el.btnQuickClearDict.addEventListener("click", clearAllTipifications);
  if (el.btnQuickDefaultDict) el.btnQuickDefaultDict.addEventListener("click", loadDefaultTipifications);
  el.btnAddTipModal.addEventListener("click", () => openModalWithKey());

  el.btnDictAdd.addEventListener("click", () => openModalWithKey());
  if (el.btnDictClearAll) el.btnDictClearAll.addEventListener("click", clearAllTipifications);
  if (el.btnDictDefault) el.btnDictDefault.addEventListener("click", loadDefaultTipifications);
  el.btnDictExport.addEventListener("click", exportDictionaryToExcel);
  el.dictSearchInput.addEventListener("input", e => renderDictionaryTable(e.target.value));

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const targetPane = document.getElementById(btn.dataset.tab);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  el.btnProcess.addEventListener("click", () => {
    if (state.selectedCampaigns.size === 0) {
      alert("Por favor selecciona al menos una campaña para exportar.");
      return;
    }
    if (state.selectedTipifications.size === 0) {
      alert("Por favor selecciona al menos una tipificación para entregar.");
      return;
    }
    runTransformation();
  });

  initDictionary();
  renderDictionaryTable();
  updateDictBadge();
})();
