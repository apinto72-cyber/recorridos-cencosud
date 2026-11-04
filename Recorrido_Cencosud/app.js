(function () {
  "use strict";

  const DICT_CENCOSUD = Object.freeze({
    "A": { categoria: "No Contacto", tipificacion: "Buzón de Voz/Fax", status: "DISPONIBLE", rellamada: "SI" },
    "AA": { categoria: "No Contacto", tipificacion: "Buzón de Voz/Fax", status: "DISPONIBLE", rellamada: "SI" },
    "AB": { categoria: "No Contacto", tipificacion: "Teléfono Ocupado", status: "DISPONIBLE", rellamada: "SI" },
    "ADC": { categoria: "No Contacto", tipificacion: "Teléfono fuera de servicio", status: "NO DISPONIBLE", rellamada: "NO" },
    "CALLBK": { categoria: "Contacto", tipificacion: "Cliente Ocupado, Volver a llamar", status: "DISPONIBLE", rellamada: "SI" },
    "CPDP": { categoria: "Contacto", tipificacion: "Cliente Ocupado, Volver a llamar", status: "DISPONIBLE", rellamada: "SI" },
    "CRTSCR": { categoria: "Contacto", tipificacion: "No está interesado, no quiere hacer encuesta", status: "NO DISPONIBLE", rellamada: "NO" },
    "DNC": { categoria: "Contacto", tipificacion: "Cliente Molesto, No volver a Llamar", status: "NO DISPONIBLE", rellamada: "NO" },
    "EMABAN": { categoria: "No Contacto", tipificacion: "Cortan la Llamada", status: "NO DISPONIBLE", rellamada: "NO" },
    "ENTREV": { categoria: "Contacto", tipificacion: "Encuesta Exitosa", status: "NO DISPONIBLE", rellamada: "NO" },
    "FALLEC": { categoria: "Contacto", tipificacion: "Cliente Fallecido", status: "NO DISPONIBLE", rellamada: "NO" },
    "FONOMA": { categoria: "No Contacto", tipificacion: "Teléfono fuera de servicio", status: "NO DISPONIBLE", rellamada: "NO" },
    "N": { categoria: "No Contacto", tipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" },
    "NAN": { categoria: "No Contacto", tipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" },
    "NCFILT": { categoria: "Contacto", tipificacion: "No Califica (No Cumple Condiciones)", status: "NO DISPONIBLE", rellamada: "NO" },
    "NOVIVE": { categoria: "Contacto", tipificacion: "Cliente no vive ahí /Equivocado/No Existe", status: "NO DISPONIBLE", rellamada: "NO" },
    "NSLPRE": { categoria: "Contacto", tipificacion: "No se encuentra /No Disponible", status: "NO DISPONIBLE", rellamada: "NO" },
    "PCHORA": { categoria: "Contacto", tipificacion: "No se encuentra /No Disponible", status: "NO DISPONIBLE", rellamada: "NO" },
    "TELOCU": { categoria: "No Contacto", tipificacion: "Teléfono Ocupado", status: "DISPONIBLE", rellamada: "SI" },
    "TPDP": { categoria: "Contacto", tipificacion: "Cliente Ocupado, Volver a llamar", status: "DISPONIBLE", rellamada: "SI" },
    "DROP": { categoria: "No Contacto", tipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" },
    "CAIDOC": { categoria: "Contacto", tipificacion: "No Califica (No Cumple Condiciones)", status: "NO DISPONIBLE", rellamada: "NO" },
    "INCALL": { categoria: "No Contacto", tipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" },
    "COTAS": { categoria: "Contacto", tipificacion: "No Califica (No Cumple Condiciones)", status: "NO DISPONIBLE", rellamada: "NO" },
    "VIAJE": { categoria: "Contacto", tipificacion: "No se encuentra /No Disponible", status: "NO DISPONIBLE", rellamada: "NO" },
    "PDROP": { categoria: "No Contacto", tipificacion: "No Contestan", status: "DISPONIBLE", rellamada: "SI" }
  });

  const CAMPAIGN_PREFIX_MAP = Object.freeze({
    "91": "113",
    "107": "113",
    "96": "125",
    "106": "115",
    "108": "110",
    "109": "114"
  });

  const CAMPAIGN_REGISTRY = [
    { ids: ["91", "107"], nombre: "Cencosud EEFF (Campañas 91 + 107)", prefix: "113", pattern: d => `Incidencia_Cencosud_EEFF_TZ_${d}.csv` },
    { ids: ["96"], nombre: "Cencosud APP (Campaña 96)", prefix: "125", pattern: d => `Incidencia_Cencosud_APP_TZ_${d}.csv` },
    { ids: ["109"], nombre: "Cencosud Web (Campaña 109)", prefix: "114", pattern: d => `Incidencia_Cencosud_Web_TZ_${d}.csv` },
    { ids: ["106"], nombre: "Cencosud Totem (Campaña 106)", prefix: "115", pattern: d => `Incidencia_Cencosud_Totem_TZ_${d}.csv` },
    { ids: ["108"], nombre: "Cencosud Call Center (Campaña 108)", prefix: "110", pattern: d => `Incidencia_Cencosud_Callcenter_TZ_${d}.csv` }
  ];

  const OUTPUT_COLUMNS = [
    "ID", "ID_CLIENTE", "CATEGORIA", "TIPIFICACIÓN", "SUB TIPIFICACIÓN",
    "FECHA DE GESTIÓN", "FECHALLAMADA", "INICIOLLAMADA", "FINLLAMADA",
    "DURACION", "TELEFONO", "CODEJECUTIVO", "OLA"
  ];

  const state = {
    rawRows: [],
    availableCampaigns: [], // [{ id, count }]
    dominantDate: "",
    selectedCampaigns: new Set(["91", "107", "96", "106", "108", "109"]),
    manifest: [],
    zipBlob: null,
    zipName: ""
  };

  const el = {
    sourceInput: document.getElementById("source-input"),
    dropzone: document.getElementById("dropzone"),
    dropzoneText: document.getElementById("dropzone-text"),
    fileInfo: document.getElementById("file-info"),
    campaignsSection: document.getElementById("campaigns-section"),
    campaignCheckboxes: document.getElementById("campaign-checkboxes"),
    detectedDateBadge: document.getElementById("detected-date-badge"),
    btnCenco6: document.getElementById("btn-cenco6"),
    btnAll: document.getElementById("btn-all"),
    btnNone: document.getElementById("btn-none"),
    btnProcess: document.getElementById("btn-process"),
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
    dictTableBody: document.getElementById("dict-table-body"),
    kpiCampsRaw: document.getElementById("kpi-camps-raw"),
    kpiCampsActive: document.getElementById("kpi-camps-active"),
    kpiFilesCount: document.getElementById("kpi-files-count"),
    kpiValidRecords: document.getElementById("kpi-valid-records"),
    kpiExclPrefix: document.getElementById("kpi-excl-prefix"),
    kpiExclBlank: document.getElementById("kpi-excl-blank"),
    kpiQuality: document.getElementById("kpi-quality")
  };

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
      // Excel serial date
      const epoch = new Date(Date.UTC(1899, 11, 30));
      return new Date(epoch.getTime() + val * 86400000);
    }
    const s = String(val).trim();
    const d = new Date(s);
    if (!isNaN(d)) return d;
    // Format YYYY-MM-DD or DD-MM-YYYY
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
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function formatDateLlamada(d) {
    if (!d) return "";
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
  }

  function formatTime(d) {
    if (!d) return "";
    return `${d.getHours()}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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

  // Populate Dictionary Table
  function renderDictionaryTable() {
    el.dictTableBody.innerHTML = "";
    Object.keys(DICT_CENCOSUD).sort().forEach(code => {
      const item = DICT_CENCOSUD[code];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><b><code>${code}</code></b></td>
        <td>${item.categoria}</td>
        <td>${item.tipificacion}</td>
        <td><span class="${item.status === 'DISPONIBLE' ? 'tag-green' : 'tag-orange'}">${item.status}</span></td>
        <td>${item.rellamada}</td>
      `;
      el.dictTableBody.appendChild(tr);
    });
  }

  // DRAG & DROP
  el.dropzone.addEventListener("dragover", e => { e.preventDefault(); el.dropzone.classList.add("dragover"); });
  el.dropzone.addEventListener("dragleave", () => el.dropzone.classList.remove("dragover"));
  el.dropzone.addEventListener("drop", e => {
    e.preventDefault();
    el.dropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });
  el.sourceInput.addEventListener("change", e => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });

  function setProgress(title, percent) {
    el.progressPanel.hidden = false;
    el.progressTitle.textContent = title;
    el.progressPercent.textContent = percent + "%";
    el.progressBar.style.width = percent + "%";
  }

  
  function extractRowsFromSheet(sheet) {
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    if (!matrix || matrix.length === 0) return [];
    let headerIdx = 0;
    for (let i = 0; i < Math.min(15, matrix.length); i++) {
      const rowStr = (matrix[i] || []).join(" ").toLowerCase();
      if (rowStr.includes("campaign id") || rowStr.includes("campaign_id") || (rowStr.includes("telefono") && rowStr.includes("lista"))) {
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

function handleFileSelected(file) {
    el.fileInfo.hidden = false;
    el.fileInfo.innerHTML = `📄 <b>Archivo seleccionado:</b> ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
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
    setProgress("Detectando campañas y fecha operacional...", 50);

    // Map column aliases
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

    // Count campaigns
    const campCounts = {};
    const dateCounts = {};

    rows.forEach(r => {
      const c = cleanIntStr(r[colCamp]);
      if (c) campCounts[c] = (campCounts[c] || 0) + 1;

      if (colHInicio && r[colHInicio]) {
        const d = parseDateObj(r[colHInicio]);
        if (d) {
          const ymd = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
          dateCounts[ymd] = (dateCounts[ymd] || 0) + 1;
        }
      }
    });

    state.availableCampaigns = Object.keys(campCounts).map(id => ({ id, count: campCounts[id] })).sort((a,b) => b.count - a.count);

    // Dominant date
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
      domDate = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    }
    state.dominantDate = domDate;

    renderCampaignCheckboxes();
    el.progressPanel.hidden = true;
    el.campaignsSection.hidden = false;
  }

  function renderCampaignCheckboxes() {
    const formattedDate = state.dominantDate.length === 8 ? `${state.dominantDate.slice(6,8)}/${state.dominantDate.slice(4,6)}/${state.dominantDate.slice(0,4)}` : state.dominantDate;
    el.detectedDateBadge.textContent = `📅 Fecha Detectada: ${formattedDate} (${state.dominantDate})`;

    const cenco6 = ["91", "107", "96", "106", "108", "109"];
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
      });
      el.campaignCheckboxes.appendChild(chip);
    });
  }

  // Filter Toolbar Buttons
  el.btnCenco6.addEventListener("click", () => {
    const target = new Set(["91", "107", "96", "106", "108", "109"]);
    state.selectedCampaigns = new Set(state.availableCampaigns.filter(c => target.has(c.id)).map(c => c.id));
    renderCampaignCheckboxes();
    el.btnCenco6.classList.add("active");
    el.btnAll.classList.remove("active");
    el.btnNone.classList.remove("active");
  });

  el.btnAll.addEventListener("click", () => {
    state.selectedCampaigns = new Set(state.availableCampaigns.map(c => c.id));
    renderCampaignCheckboxes();
    el.btnAll.classList.add("active");
    el.btnCenco6.classList.remove("active");
    el.btnNone.classList.remove("active");
  });

  el.btnNone.addEventListener("click", () => {
    state.selectedCampaigns.clear();
    renderCampaignCheckboxes();
    el.btnNone.classList.add("active");
    el.btnCenco6.classList.remove("active");
    el.btnAll.classList.remove("active");
  });

  // MAIN PROCESSOR EXECUTION
  el.btnProcess.addEventListener("click", () => {
    if (state.selectedCampaigns.size === 0) {
      alert("Por favor selecciona al menos una campaña para exportar.");
      return;
    }
    runTransformation();
  });

  function runTransformation() {
    setProgress("Iniciando validación y homologación...", 10);
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

    // Plan export groups
    const selected = Array.from(state.selectedCampaigns);
    const groups = [];

    // Group 91 + 107
    const has91 = selected.includes("91");
    const has107 = selected.includes("107");
    if (has91 && has107) {
      groups.push({ ids: ["91", "107"], nombre: "Cencosud EEFF", filename: `Incidencia_Cencosud_EEFF_TZ_${state.dominantDate}.csv`, expectedPrefix: "113" });
    } else if (has91) {
      groups.push({ ids: ["91"], nombre: "Cencosud EEFF", filename: `Incidencia_Cencosud_EEFF_TZ_${state.dominantDate}.csv`, expectedPrefix: "113" });
    } else if (has107) {
      groups.push({ ids: ["107"], nombre: "Cencosud EEFF", filename: `Incidencia_Cencosud_EEFF_TZ_${state.dominantDate}.csv`, expectedPrefix: "113" });
    }

    selected.filter(c => c !== "91" && c !== "107").forEach(cid => {
      const reg = CAMPAIGN_REGISTRY.find(r => r.ids.includes(cid));
      if (reg) {
        groups.push({ ids: [cid], nombre: reg.nombre, filename: reg.pattern(state.dominantDate), expectedPrefix: reg.prefix });
      } else {
        groups.push({ ids: [cid], nombre: `Campaña ${cid}`, filename: `Incidencia_Cencosud_Campana_${cid}_TZ_${state.dominantDate}.csv`, expectedPrefix: CAMPAIGN_PREFIX_MAP[cid] || "" });
      }
    });

    const manifest = [];

    groups.forEach((g, gIdx) => {
      const gCamps = new Set(g.ids);
      const filteredRows = rows.filter(r => gCamps.has(cleanIntStr(r[colCamp])));

      const validRows = [];
      const exclPrefix = [];
      const exclBlank = [];

      filteredRows.forEach(r => {
        const campId = cleanIntStr(r[colCamp]);
        const rowId = cleanIntStr(colVendor ? r[colVendor] : "");
        const cleanDigits = rowId.replace(/\D/g, "");

        // 1. Prefix Validation
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

        const rawStatus = normalize(colTip ? r[colTip] : "");
        let categoria = "No Contacto";
        let tipificacion = "No Contestan";
        let subTip = "No Contestan";

        if (!rawStatus || ["NAN", "NONE", "DROP", "N"].includes(rawStatus)) {
          categoria = "No Contacto";
          tipificacion = "No Contestan";
          subTip = "No Contestan";
        } else if (DICT_CENCOSUD[rawStatus]) {
          categoria = DICT_CENCOSUD[rawStatus].categoria;
          tipificacion = DICT_CENCOSUD[rawStatus].tipificacion;
          subTip = tipificacion;
        } else {
          categoria = "No Contacto";
          tipificacion = `NO HOMOLOGADO (${rawStatus})`;
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

        // 2. Blank Check Validation
        const blankCols = [];
        OUTPUT_COLUMNS.forEach(col => {
          const v = rowObj[col];
          if (v === 0 || v === "0") return; // valid
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

      // Build CSV String with UTF-8 BOM
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
          exclPrefixCount: exclPrefix.length,
          exclBlankCount: exclBlank.length,
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

    // Totals
    const totalValid = manifest.reduce((acc, m) => acc + m.registros, 0);
    const totalPrefix = manifest.reduce((acc, m) => acc + m.stats.exclPrefixCount, 0);
    const totalBlank = manifest.reduce((acc, m) => acc + m.stats.exclBlankCount, 0);
    const totalEval = totalValid + totalPrefix + totalBlank;
    const quality = totalEval > 0 ? (totalValid / totalEval * 100).toFixed(1) : "100.0";

    el.kpiCampsRaw.textContent = state.availableCampaigns.length;
    el.kpiCampsActive.textContent = state.selectedCampaigns.size;
    el.kpiFilesCount.textContent = manifest.length;
    el.kpiValidRecords.textContent = totalValid.toLocaleString();
    el.kpiExclPrefix.textContent = totalPrefix.toLocaleString();
    el.kpiExclBlank.textContent = totalBlank.toLocaleString();
    el.kpiQuality.textContent = quality + "%";

    el.tabAuditBtn.textContent = `🛡️ Auditoría de Descartes (${totalPrefix + totalBlank})`;

    // Summary Pills
    const formattedDate = state.dominantDate.length === 8 ? `${state.dominantDate.slice(6,8)}/${state.dominantDate.slice(4,6)}/${state.dominantDate.slice(0,4)}` : state.dominantDate;
    el.summaryPills.innerHTML = `
      <span class="info-pill">📅 Fecha Gestión: ${formattedDate} (${state.dominantDate})</span>
      <span class="info-pill">📞 Base Bruta: ${state.rawRows.length.toLocaleString()} filas</span>
      <span class="info-pill">🎯 Campañas: ${state.selectedCampaigns.size} de ${state.availableCampaigns.length}</span>
      <span class="info-pill">📁 Archivos: ${manifest.length}</span>
      <span class="info-pill">✅ Registros Limpios: ${totalValid.toLocaleString()}</span>
    `;

    // Render Files List
    el.filesList.innerHTML = "";
    manifest.forEach((m, idx) => {
      const card = document.createElement("div");
      card.className = "file-card";

      let badges = `<span class="tag-blue">CAMPAÑA ${m.campanas.join(" + ")} · PREFIJO ${m.expectedPrefix || "N/A"}</span> `;
      if (m.stats.exclPrefixCount === 0 && m.stats.exclBlankCount === 0) {
        badges += `<span class="tag-green">✓ 100% LIMPIO</span>`;
      } else {
        if (m.stats.exclPrefixCount > 0) badges += `<span class="tag-orange">⚠️ ${m.stats.exclPrefixCount} FUERA POR PREFIJO</span> `;
        if (m.stats.exclBlankCount > 0) badges += `<span class="tag-red">🚫 ${m.stats.exclBlankCount} FUERA POR BLANCOS</span>`;
      }

      card.innerHTML = `
        <div class="file-card-info">
          <div>${badges}</div>
          <div class="file-card-title">📄 ${m.archivo}</div>
          <div class="file-card-desc">
            <b>Estudio:</b> ${m.nombre} · <b>Válidos:</b> ${m.registros.toLocaleString()} filas · <b>Excluidos:</b> ${m.stats.exclPrefixCount} por prefijo / ${m.stats.exclBlankCount} por blancos.
          </div>
        </div>
        <button class="button primary" id="dl-csv-${idx}">⬇️ Descargar CSV</button>
      `;

      card.querySelector(`#dl-csv-${idx}`).addEventListener("click", () => {
        downloadBlob(new Blob([m.csvString], { type: "text/csv;charset=utf-8;" }), m.archivo);
      });

      el.filesList.appendChild(card);
    });

    // ZIP Download Button
    el.btnZipDownload.onclick = () => {
      const zip = new JSZip();
      manifest.forEach(m => {
        zip.file(m.archivo, m.csvString);
      });
      zip.generateAsync({ type: "blob" }).then(blob => {
        downloadBlob(blob, `Incidencias_Cencosud_Newlead_${state.dominantDate}.zip`);
      });
    };

    // Render Audit Tab
    renderAuditTab(manifest);
  }

  function renderAuditTab(manifest) {
    el.auditContent.innerHTML = "";
    let anyExcluded = false;

    manifest.forEach(m => {
      if (m.stats.exclPrefixCount > 0 || m.stats.exclBlankCount > 0) {
        anyExcluded = true;
        const div = document.createElement("div");
        div.style.marginBottom = "24px";
        div.innerHTML = `
          <h4 style="margin-bottom:8px; color:#092340;">📄 <code>${m.archivo}</code> (${m.nombre})</h4>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div>
              <p style="font-weight:700; margin-bottom:6px;">🛡️ Excluidos por Prefijo (${m.stats.exclPrefixCount})</p>
              <div class="table-container" style="max-height:220px;">
                <table class="data-table">
                  <thead><tr><th>ID</th><th>Campaña</th><th>Prefijo Obtenido</th><th>Esperado</th><th>Teléfono</th></tr></thead>
                  <tbody>
                    ${m.stats.exclPrefixList.length === 0 ? "<tr><td colspan='5'>0 registros excluidos.</td></tr>" :
                      m.stats.exclPrefixList.map(r => `<tr><td><code>${r.id}</code></td><td>${r.campana}</td><td><span class="tag-red">${r.prefijo_obtenido}</span></td><td><code>${r.prefijo_esperado}</code></td><td>${r.telefono}</td></tr>`).join("")}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <p style="font-weight:700; margin-bottom:6px;">🚫 Excluidos por Celdas en Blanco (${m.stats.exclBlankCount})</p>
              <div class="table-container" style="max-height:220px;">
                <table class="data-table">
                  <thead><tr><th>ID</th><th>Campaña</th><th>Columnas en Blanco</th><th>Teléfono</th></tr></thead>
                  <tbody>
                    ${m.stats.exclBlankList.length === 0 ? "<tr><td colspan='4'>0 registros excluidos.</td></tr>" :
                      m.stats.exclBlankList.map(r => `<tr><td><code>${r.id}</code></td><td>${r.campana}</td><td><span class="tag-orange">${r.columnas_en_blanco}</span></td><td>${r.telefono}</td></tr>`).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <hr style="margin-top:16px; border:0; border-top:1px solid #D5E3EE;" />
        `;
        el.auditContent.appendChild(div);
      }
    });

    if (!anyExcluded) {
      el.auditContent.innerHTML = `
        <div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:12px; padding:24px; text-align:center; color:#064E3B;">
          <h3 style="margin-bottom:6px;">🎉 ¡Excelente! 100% de los registros aprobados</h3>
          <p>Ningún registro fue excluido en las campañas seleccionadas. Todos cumplieron su prefijo de 3 dígitos y no tenían celdas en blanco.</p>
        </div>
      `;
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // TABS NAVIGATION
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add("active");
    });
  });

  renderDictionaryTable();
})();