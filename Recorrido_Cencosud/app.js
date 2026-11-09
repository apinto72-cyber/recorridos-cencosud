(function () {
  "use strict";

  // 1. DICCIONARIO BASE OFICIAL CENCOSUD (26 Códigos Oficiales)
  const DEFAULT_DICT_CENCOSUD = Object.freeze({
    "A": { categoria: "No Contacto", tipificacion: "Buzón de Voz/Fax", subTipificacion: "Buzón de Voz/Fax", status: "DISPONIBLE", rellamada: "SI" },
    "AA": { categoria: "No Contacto", tipificacion: "Buzón de Voz/Fax", subTipificacion: "Buzón de Voz/Fax", status: "DISPONIBLE", rellamada: "SI" },
    "AB": { categoria: "No Contacto", tipificacion: "Teléfono Ocupado", subTipificacion: "Teléfono Ocupado", status: "DISPONIBLE", rellamada: "SI" },
    "ADC": { categoria: "No Contacto", tipificacion: "Teléfono fuera de servicio", subTipificacion: "Teléfono fuera de servicio", status: "NO DISPONIBLE", rellamada: "NO" },
    "CALLBK": { categoria: "Contacto", tipificacion: "Cliente Ocupado, Volver a llamar", subTipificacion: "Cliente Ocupado, Volver a llamar", status: "DISPONIBLE", rellamada: "SI" },
    "CPDP": { categoria: "Contacto", tipificacion: "Cliente Ocupado, Volver a llamar", subTipificacion: "Cliente Ocupado, Volver a llamar", status: "DISPONIBLE", rellamada: "SI" },
    "CRTSCR": { categoria: "Contacto", tipificacion: "No está interesado, no quiere hacer encuesta", subTipificacion: "No está interesado, no quiere hacer encuesta", status: "NO DISPONIBLE", rellamada: "NO" },
    "DNC": { categoria: "Contacto", tipificacion: "Cliente Molesto, No volver a Llamar", subTipificacion: "Cliente Molesto, No volver a Llamar", status: "NO DISPONIBLE", rellamada: "NO" },
    "EMABAN": { categoria: "No Contacto", tipificacion: "Cortan la Llamada", subTipificacion: "Cortan la Llamada", status: "NO DISPONIBLE", rellamada: "NO" },
    "ENTREV": { categoria: "Contacto", tipificacion: "Encuesta Exitosa", subTipificacion: "Encuesta Exitosa", status: "NO DISPONIBLE", rellamada: "NO" },
    "FALLEC": { categoria: "Contacto", tipificacion: "Cliente Fallecido", subTipificacion: "Cliente Fallecido", status: "NO DISPONIBLE", rellamada: "NO" },
    "FONOMA": { categoria: "No Contacto", tipificacion: "Teléfono fuera de servicio", subTipificacion: "Teléfono fuera de servicio", status: "NO DISPONIBLE", rellamada: "NO" },
    "N": { categoria: "No Contacto", tipificacion: "No Contestan", subTipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" },
    "NAN": { categoria: "No Contacto", tipificacion: "No Contestan", subTipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" },
    "NCFILT": { categoria: "Contacto", tipificacion: "No Califica (No Cumple Condiciones)", subTipificacion: "No Califica (No Cumple Condiciones)", status: "NO DISPONIBLE", rellamada: "NO" },
    "NOVIVE": { categoria: "Contacto", tipificacion: "Cliente no vive ahí /Equivocado/No Existe", subTipificacion: "Cliente no vive ahí /Equivocado/No Existe", status: "NO DISPONIBLE", rellamada: "NO" },
    "NSLPRE": { categoria: "Contacto", tipificacion: "No se encuentra /No Disponible", subTipificacion: "No se encuentra /No Disponible", status: "NO DISPONIBLE", rellamada: "NO" },
    "PCHORA": { categoria: "Contacto", tipificacion: "No se encuentra /No Disponible", subTipificacion: "No se encuentra /No Disponible", status: "NO DISPONIBLE", rellamada: "NO" },
    "TELOCU": { categoria: "No Contacto", tipificacion: "Teléfono Ocupado", subTipificacion: "Teléfono Ocupado", status: "DISPONIBLE", rellamada: "SI" },
    "TPDP": { categoria: "Contacto", tipificacion: "Cliente Ocupado, Volver a llamar", subTipificacion: "Cliente Ocupado, Volver a llamar", status: "DISPONIBLE", rellamada: "SI" },
    "DROP": { categoria: "No Contacto", tipificacion: "No Contestan", subTipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" },
    "CAIDOC": { categoria: "Contacto", tipificacion: "No Califica (No Cumple Condiciones)", subTipificacion: "No Califica (No Cumple Condiciones)", status: "NO DISPONIBLE", rellamada: "NO" },
    "INCALL": { categoria: "No Contacto", tipificacion: "No Contestan", subTipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" },
    "COTAS": { categoria: "Contacto", tipificacion: "No Califica (No Cumple Condiciones)", subTipificacion: "No Califica (No Cumple Condiciones)", status: "NO DISPONIBLE", rellamada: "NO" },
    "VIAJE": { categoria: "Contacto", tipificacion: "No se encuentra /No Disponible", subTipificacion: "No se encuentra /No Disponible", status: "NO DISPONIBLE", rellamada: "NO" },
    "PDROP": { categoria: "No Contacto", tipificacion: "No Contestan", subTipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" }
  });

  let currentDict = {};

  function initDictionary() {
    currentDict = JSON.parse(JSON.stringify(DEFAULT_DICT_CENCOSUD));
    try {
      const saved = localStorage.getItem("cencosud_custom_dict");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          Object.assign(currentDict, parsed);
        }
      }
    } catch (e) {
      console.warn("No se pudo leer localStorage:", e);
    }
  }

  function saveDictionaryToStorage() {
    try {
      localStorage.setItem("cencosud_custom_dict", JSON.stringify(currentDict));
    } catch (e) {
      console.warn("No se pudo guardar en localStorage:", e);
    }
  }

  function resetDictionary() {
    if (!confirm("¿Deseas restablecer el diccionario a los 26 códigos base oficiales? Se borrarán las personalizaciones guardadas.")) return;
    try {
      localStorage.removeItem("cencosud_custom_dict");
    } catch (e) {}
    currentDict = JSON.parse(JSON.stringify(DEFAULT_DICT_CENCOSUD));
    renderDictionaryTable();
    updateDictBadge("Oficial base restablecido: 26 códigos Vicidial");
    if (state.rawRows && state.rawRows.length > 0) {
      updateTipificationsForActiveCampaigns();
    }
    showToast("Diccionario restablecido a los 26 códigos oficiales.");
  }

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

  const state = {
    rawRows: [],
    availableCampaigns: [],
    dominantDate: "",
    selectedCampaigns: new Set(["91", "107", "96", "106", "108", "109"]),
    detectedTipifications: [],
    selectedTipifications: new Set(),
    manifest: [],
    zipBlob: null,
    zipName: ""
  };

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
    topDictPill: document.getElementById("top-dict-pill"),
    campaignsSection: document.getElementById("campaigns-section"),
    campaignCheckboxes: document.getElementById("campaign-checkboxes"),
    detectedDateBadge: document.getElementById("detected-date-badge"),
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
    btnDictExport: document.getElementById("btn-dict-export"),
    btnDictReset: document.getElementById("btn-dict-reset"),
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
    modalInputCode: document.getElementById("modal-input-code"),
    modalInputCat: document.getElementById("modal-input-cat"),
    modalInputTip: document.getElementById("modal-input-tip"),
    modalInputSubtip: document.getElementById("modal-input-subtip"),
    modalInputStatus: document.getElementById("modal-input-status"),
    modalInputRellamada: document.getElementById("modal-input-rellamada")
  };

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
    return n < 10 ? "0" + n : String(n);
  }

  function parseDateObj(val) {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val)) return val;
    if (typeof val === "number") {
      const epoch = new Date(Date.UTC(1899, 11, 30));
      return new Date(epoch.getTime() + val * 86400000);
    }
    const s = String(val).trim();
    const d = new Date(s);
    if (!isNaN(d)) return d;
    const parts = s.split(/[\/\-\s:]+/);
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), parseInt(parts[3] || 0), parseInt(parts[4] || 0), parseInt(parts[5] || 0));
      } else if (parts[2].length === 4) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), parseInt(parts[3] || 0), parseInt(parts[4] || 0), parseInt(parts[5] || 0));
      }
    }
    return null;
  }

  function formatDateGestion(d) {
    if (!d) return "";
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function formatDateLlamada(d) {
    if (!d) return "";
    return pad(d.getDate()) + "-" + pad(d.getMonth() + 1) + "-" + d.getFullYear();
  }

  function formatTime(d) {
    if (!d) return "";
    return d.getHours() + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }

  function parseDurationSeconds(val, startD, endD) {
    if (val !== undefined && val !== null && val !== "") {
      if (typeof val === "number") return Math.max(0, Math.floor(val));
      const s = String(val).trim();
      const p = s.split(":");
      if (p.length === 3) return Math.max(0, parseInt(p[0]) * 3600 + parseInt(p[1]) * 60 + parseInt(p[2]));
      if (p.length === 2) return Math.max(0, parseInt(p[0]) * 60 + parseInt(p[1]));
      const n = parseInt(s, 10);
      if (!isNaN(n)) return Math.max(0, n);
    }
    if (startD && endD) {
      const diff = Math.floor((endD.getTime() - startD.getTime()) / 1000);
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

  function updateDictBadge(text) {
    const total = Object.keys(currentDict).length;
    el.dictStatusText.innerHTML = "<b>Homologación activa:</b> " + (text || (total + " códigos configurados"));
    el.dictCountPill.textContent = total + " Códigos Activos";
    el.topDictPill.textContent = "✓ " + total + " Tipificaciones Homologadas";
  }

  function renderDictionaryTable(filterText = "") {
    el.dictTableBody.innerHTML = "";
    const filter = (filterText || "").trim().toUpperCase();
    const codes = Object.keys(currentDict).sort();
    let shownCount = 0;

    codes.forEach(code => {
      const item = currentDict[code];
      const match = !filter ||
        code.includes(filter) ||
        (item.categoria && item.categoria.toUpperCase().includes(filter)) ||
        (item.tipificacion && item.tipificacion.toUpperCase().includes(filter)) ||
        (item.subTipificacion && item.subTipificacion.toUpperCase().includes(filter));

      if (!match) return;
      shownCount++;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><b><code>${code}</code></b></td>
        <td><span class="${item.categoria === 'Contacto' ? 'tag-green' : 'tag-blue'}">${item.categoria || '-'}</span></td>
        <td>${item.tipificacion || '-'}</td>
        <td>${item.subTipificacion || item.tipificacion || '-'}</td>
        <td><span class="${item.status === 'DISPONIBLE' ? 'tag-green' : 'tag-orange'}">${item.status || '-'}</span></td>
        <td>${item.rellamada || '-'}</td>
        <td style="text-align:center;">
          <button class="btn-action-edit" data-code="${code}" type="button">✏️ Editar</button>
          <button class="btn-action-del" data-code="${code}" type="button">🗑️ Borrar</button>
        </td>
      `;

      tr.querySelector(".btn-action-edit").addEventListener("click", () => {
        openModalWithCode(code);
      });
      tr.querySelector(".btn-action-del").addEventListener("click", () => {
        deleteCode(code);
      });

      el.dictTableBody.appendChild(tr);
    });

    el.dictCountPill.textContent = filter ? (shownCount + " de " + codes.length + " Códigos") : (codes.length + " Códigos Activos");
  }

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

        let loadedCount = 0;
        rows.forEach(r => {
          const rawCode = normalize(r[colCod]);
          if (!rawCode) return;

          const cat = colCat ? String(r[colCat] || "").trim() : "";
          const tip = colTip ? String(r[colTip] || "").trim() : "";
          const sub = colSub ? String(r[colSub] || "").trim() : (tip || "");
          const stat = colStat ? normalize(r[colStat]) : "NO DISPONIBLE";
          const rel = colRel ? normalize(r[colRel]) : "NO";

          currentDict[rawCode] = {
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

  // DRAG & DROP HOMOLOGACIÓN
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

  // DRAG & DROP INFORME DE LLAMADAS
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

  function handleSourceFileSelected(file) {
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
        processSourceData(rows);
      } catch (err) {
        alert("Error al leer el archivo Excel: " + err.message);
        el.progressPanel.hidden = true;
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function processSourceData(rows) {
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

    if (!colCamp) {
      alert("No se encontró la columna 'Campaign ID' en el archivo.");
      el.progressPanel.hidden = true;
      return;
    }

    const campCounts = {};
    const dateCounts = {};

    rows.forEach(r => {
      const c = cleanIntStr(r[colCamp]);
      if (c) campCounts[c] = (campCounts[c] || 0) + 1;

      if (colHInicio && r[colHInicio]) {
        const d = parseDateObj(r[colHInicio]);
        if (d) {
          const ymd = "" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
          dateCounts[ymd] = (dateCounts[ymd] || 0) + 1;
        }
      }
    });

    state.availableCampaigns = Object.keys(campCounts).map(id => ({ id, count: campCounts[id] })).sort((a,b) => b.count - a.count);

    let domDate = "";
    let maxDateCount = 0;
    Object.keys(dateCounts).forEach(d => {
      if (dateCounts[d] > maxDateCount) {
        maxDateCount = dateCounts[d];
        domDate = d;
      }
    });
    if (!domDate) {
      const now = new Date();
      domDate = "" + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
    }
    state.dominantDate = domDate;

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
    const formattedDate = state.dominantDate.length === 8 ? (state.dominantDate.slice(6,8) + "/" + state.dominantDate.slice(4,6) + "/" + state.dominantDate.slice(0,4)) : state.dominantDate;
    el.detectedDateBadge.textContent = "📅 Fecha Detectada: " + formattedDate + " (" + state.dominantDate + ")";

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

    rows.forEach(r => {
      const campId = cleanIntStr(r[colCamp]);
      if (!state.selectedCampaigns.has(campId)) return;

      let rawCode = normalize(colTip ? r[colTip] : "");
      if (!rawCode) rawCode = "SIN_CODIGO";
      activeCounts[rawCode] = (activeCounts[rawCode] || 0) + 1;
    });

    const detected = Object.keys(activeCounts).map(code => {
      const mapped = !!currentDict[code];
      const item = currentDict[code] || null;
      return {
        code,
        count: activeCounts[code],
        mapped,
        item
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
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
          ${unmapped.map(u => `<span class="unmapped-code-pill" title="Clic para homologar ${u.code}">➕ Homologar <b>${u.code}</b> (${u.count})</span>`).join("")}
        </div>
      `;
      el.unmappedWarningBox.querySelectorAll(".unmapped-code-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          const codeText = pill.querySelector("b").textContent;
          openModalWithCode(codeText);
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
        desc = item.tipificacion || item.categoria || t.code;
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

  function openModalWithCode(codeToEdit = "") {
    el.tipModal.hidden = false;
    if (codeToEdit && currentDict[codeToEdit]) {
      const item = currentDict[codeToEdit];
      el.tipModalTitle.textContent = "Editar Tipificación: " + codeToEdit;
      el.modalInputCode.value = codeToEdit;
      el.modalInputCode.readOnly = true;
      el.modalInputCat.value = item.categoria || "Contacto";
      el.modalInputTip.value = item.tipificacion || "";
      el.modalInputSubtip.value = item.subTipificacion || item.tipificacion || "";
      el.modalInputStatus.value = item.status || "NO DISPONIBLE";
      el.modalInputRellamada.value = item.rellamada || "NO";
    } else {
      el.tipModalTitle.textContent = "Agregar / Homologar Tipificación";
      el.modalInputCode.value = codeToEdit || "";
      el.modalInputCode.readOnly = false;
      el.modalInputCat.value = "Contacto";
      el.modalInputTip.value = "";
      el.modalInputSubtip.value = "";
      el.modalInputStatus.value = "NO DISPONIBLE";
      el.modalInputRellamada.value = "NO";
    }
    el.modalInputCode.focus();
  }

  function closeModal() {
    el.tipModal.hidden = true;
  }

  function saveModalTipification() {
    const code = normalize(el.modalInputCode.value);
    const cat = el.modalInputCat.value;
    const tip = el.modalInputTip.value.trim();
    const sub = el.modalInputSubtip.value.trim() || tip;
    const stat = el.modalInputStatus.value;
    const rel = el.modalInputRellamada.value;

    if (!code) {
      alert("Por favor ingresa el Código Vicidial.");
      return;
    }
    if (!tip) {
      alert("Por favor ingresa la descripción de Tipificación Cencosud.");
      return;
    }

    currentDict[code] = {
      categoria: cat,
      tipificacion: tip,
      subTipificacion: sub,
      status: stat,
      rellamada: rel
    };

    saveDictionaryToStorage();
    renderDictionaryTable();
    updateDictBadge("Código " + code + " guardado");

    if (state.rawRows && state.rawRows.length > 0) {
      updateTipificationsForActiveCampaigns();
    }

    closeModal();
    showToast("Tipificación " + code + " homologada correctamente.");
  }

  function deleteCode(code) {
    if (!confirm("¿Estás seguro de eliminar el código '" + code + "' del diccionario?")) return;
    delete currentDict[code];
    saveDictionaryToStorage();
    renderDictionaryTable();
    updateDictBadge("Código " + code + " eliminado");
    if (state.rawRows && state.rawRows.length > 0) {
      updateTipificationsForActiveCampaigns();
    }
    showToast("Código " + code + " eliminado.");
  }

  function exportDictionaryToExcel() {
    const codes = Object.keys(currentDict).sort();
    const data = codes.map(c => {
      const item = currentDict[c];
      return {
        "COD_VICIDIAL": c,
        "CATEGORIA_CENCO": item.categoria || "",
        "TIPIFICACION_CENCO": item.tipificacion || "",
        "SUB_TIPIFICACION": item.subTipificacion || item.tipificacion || "",
        "STATUS": item.status || "NO DISPONIBLE",
        "RELLAMADA": item.rellamada || "NO"
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Diccionario_Codigo");
    XLSX.writeFile(wb, "TIPIFICACIONES_CENCOSUD_CONFIG_" + new Date().toISOString().slice(0,10) + ".xlsx");
    showToast("Diccionario exportado a Excel.");
  }

  el.btnModalClose.addEventListener("click", closeModal);
  el.btnModalCancel.addEventListener("click", closeModal);
  el.btnModalSave.addEventListener("click", saveModalTipification);
  el.btnQuickAddTip.addEventListener("click", () => openModalWithCode());
  el.btnAddTipModal.addEventListener("click", () => openModalWithCode());
  el.btnDictAdd.addEventListener("click", () => openModalWithCode());
  el.btnDictExport.addEventListener("click", exportDictionaryToExcel);
  el.btnDictReset.addEventListener("click", resetDictionary);
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
      groups.push({ ids: ["91", "107"], nombre: "Cencosud EEFF", filename: "Incidencia_Cencosud_EEFF_TZ_" + state.dominantDate + ".csv", expectedPrefix: "113" });
    } else if (has91) {
      groups.push({ ids: ["91"], nombre: "Cencosud EEFF", filename: "Incidencia_Cencosud_EEFF_TZ_" + state.dominantDate + ".csv", expectedPrefix: "113" });
    } else if (has107) {
      groups.push({ ids: ["107"], nombre: "Cencosud EEFF", filename: "Incidencia_Cencosud_EEFF_TZ_" + state.dominantDate + ".csv", expectedPrefix: "113" });
    }

    selected.filter(c => c !== "91" && c !== "107").forEach(cid => {
      const reg = CAMPAIGN_REGISTRY.find(r => r.ids.includes(cid));
      if (reg) {
        groups.push({ ids: [cid], nombre: reg.nombre, filename: reg.pattern(state.dominantDate), expectedPrefix: reg.prefix });
      } else {
        groups.push({ ids: [cid], nombre: "Campaña " + cid, filename: "Incidencia_Cencosud_Campana_" + cid + "_TZ_" + state.dominantDate + ".csv", expectedPrefix: CAMPAIGN_PREFIX_MAP[cid] || "" });
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

        const fechaGestion = dInicio ? formatDateGestion(dInicio) : "";
        const fechaLlamada = dInicio ? formatDateLlamada(dInicio) : "";
        const inicioLlamada = dInicio ? formatTime(dInicio) : "";
        let finLlamada = dFin ? formatTime(dFin) : "";
        let duracion = 0;

        if (!finLlamada || !dFin) {
          finLlamada = inicioLlamada;
          duracion = 0;
        } else {
          duracion = parseDurationSeconds(colDur ? r[colDur] : null, dInicio, dFin);
        }

        let categoria = "No Contacto";
        let tipificacion = "No Contestan";
        let subTip = "No Contestan";

        if (currentDict[rawStatus]) {
          const dictItem = currentDict[rawStatus];
          categoria = dictItem.categoria || "No Contacto";
          tipificacion = dictItem.tipificacion || rawStatus;
          subTip = dictItem.subTipificacion || tipificacion;
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
      <span class="pill-blue">📅 Operación: ${state.dominantDate}</span>
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
      state.zipName = "Recorridos_Cencosud_Oficiales_" + state.dominantDate + ".zip";
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

  initDictionary();
  renderDictionaryTable();
  updateDictBadge();
})();
