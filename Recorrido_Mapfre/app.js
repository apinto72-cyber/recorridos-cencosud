(function () {
  "use strict";

  const DEFAULT_CATALOG = Object.freeze({
    ENTREV: ["CONTACTADO", "ENCUESTA EFECTIVA", "ENCUESTA EFECTIVA"],
    PNDCEN: ["CONTACTADO", "RECHAZO", "PEB NO DESEA CONTESTAR ENCUESTA"],
    PRESEM: ["CONTACTADO", "RECHAZO", "PEB RESPONDE ENCUESTAS SOLO POR EMAIL"],
    PEJNCO: ["CONTACTADO", "RECHAZO", "PEB MI EJECUTIVO SEÑALA QUE NO CONTESTE ENCUESTAS"],
    PNLELM: ["CONTACTADO", "RECHAZO", "PEB NO LLAMAR MÁS ELIMINAR MI NÚMERO"],
    "3RPNDR": ["CONTACTADO", "RECHAZO", "3RO INDICA QUE PEB NO DESEA RESPONDER ENCUESTA"],
    "3RPREM": ["CONTACTADO", "RECHAZO", "3RO INDICA QUE PEB RESPONDE SOLO POR EMAIL"],
    "3RNLEM": ["CONTACTADO", "RECHAZO", "3RO INDICA QUE NO LLAMAR MÁS ELIMINAR MI NÚMERO"],
    CORSCP: ["CONTACTADO", "RECHAZO", "CORTA EN SCRIPT"],
    NOHBES: ["CONTACTADO", "RECHAZO", "NO HABLA ESPAÑOL"],
    INUHFE: ["CONTACTADO", "CLIENTE INUBICABLE", "INUBICABLE EN HORARIO O FECHAS DEL ESTUDIO"],
    FALLEC: ["CONTACTADO", "CLIENTE INUBICABLE", "FALLECIDO"],
    TELNCR: ["CONTACTADO", "TELÉFONO EQUIVOCADO", "TELÉFONO NO CORRESPONDE A PEB"],
    EQVNLM: ["CONTACTADO", "TELÉFONO EQUIVOCADO", "EQUIVOCADO, NO LLAMAR NUNCA MÁS"],
    TELEMP: ["CONTACTADO", "TELÉFONO EQUIVOCADO", "TELÉFONO EMPRESA/PARTICULAR"],
    PEFHLL: ["CONTACTADO", "VOLVER A LLAMAR", "PEB ENTREGA FECHA Y HORA A LLAMAR"],
    PELLOM: ["CONTACTADO", "VOLVER A LLAMAR", "PEB INDICA QUE LO LLAMEN EN OTRO MOMENTO"],
    "3RFHLL": ["CONTACTADO", "VOLVER A LLAMAR", "3RO ENTREGA FECHA Y HORA A LLAMAR"],
    "3RLLOM": ["CONTACTADO", "VOLVER A LLAMAR", "3RO INDICA QUE LO LLAMEN EN OTRO MOMENTO"],
    ENCUIC: ["CONTACTADO", "ENCUESTA INCOMPLETA", "ENCUESTA INCOMPLETA"],
    ENCURP: ["CONTACTADO", "ENCUESTA INCOMPLETA", "ENCUESTA INCOMPLETA (REPROGRAMA)"],
    REGSOB: ["CONTACTADO", "REGISTRO SOBRECUOTA", "REGISTRO SOBRECUOTA"],
    NOCUFI: ["CONTACTADO", "NO CUMPLE FILTRO", "NO CUMPLE FILTRO"],
    NOMCTA: ["CONTACTADO", "NO CUMPLE FILTRO", "NO MANEJA SU CUENTA"],
    NORINS: ["CONTACTADO", "NO CUMPLE FILTRO", "NO RECOMIENDA O SE INHIBE"],
    DERCTO: ["CONTACTADO", "DERIVACIÓN CONTACTO", "DERIVACIÓN CONTACTO"],
    ENCYRE: ["CONTACTADO", "ENCUESTA YA REALIZADA", "ENCUESTA YA REALIZADA"],
    TELFDS: ["NO CONTACTADO", "TELÉFONO FUERA DE SERVICIO", "TELÉFONO FUERA DE SERVICIO"],
    NUMVAC: ["NO CONTACTADO", "TELÉFONO FUERA DE SERVICIO", "NÚMERO VACANTE - NO EXISTE"],
    TELSTN: ["NO CONTACTADO", "TELÉFONO FUERA DE SERVICIO", "TELÉFONO SIN TONO"],
    GRABUZ: ["NO CONTACTADO", "GRABADORA O BUZÓN", "GRABADORA O BUZÓN"],
    TELNCO: ["NO CONTACTADO", "TELÉFONO NO CONTESTA", "TELÉFONO NO CONTESTA"],
    TELOCU: ["NO CONTACTADO", "TELÉFONO OCUPADO", "TELÉFONO OCUPADO"],
    TELCNG: ["NO CONTACTADO", "TELÉFONO CONGESTIONADO", "TELÉFONO CONGESTIONADO"],
    INCALL: ["RESOLUCIONES DE SISTEMA", "TELÉFONO NO CONTESTA", "TELÉFONO NO CONTESTA"],
    NA: ["RESOLUCIONES DE SISTEMA", "TELÉFONO NO CONTESTA", "TELÉFONO NO CONTESTA"],
    AB: ["RESOLUCIONES DE SISTEMA", "TELÉFONO OCUPADO", "TELÉFONO OCUPADO"],
    ADC: ["RESOLUCIONES DE SISTEMA", "TELÉFONO FUERA DE SERVICIO", "TELÉFONO FUERA DE SERVICIO"],
    AA: ["RESOLUCIONES DE SISTEMA", "GRABADORA O BUZÓN", "GRABADORA O BUZÓN"],
    QUEUE: ["RESOLUCIONES DE SISTEMA", "TELÉFONO NO CONTESTA", "TELÉFONO NO CONTESTA"],
    ALTNUM: ["RESOLUCIONES DE SISTEMA", "TELÉFONO NO CONTESTA", "TELÉFONO NO CONTESTA"],
    DROP: ["RESOLUCIONES DE SISTEMA", "ABANDONO DISCADOR", "ABANDONO DISCADOR"],
    PDROP: ["RESOLUCIONES DE SISTEMA", "ABANDONO DISCADOR", "ABANDONO DISCADOR"],
    DISPO: ["RESOLUCIONES DE SISTEMA", "LLAMADA NO CONECTADA", "LLAMADA NO CONECTADA"]
  });

  const TARGET_HEADERS = ["ID", "CATEGORIA_IPSOS", "TIPIFICACION_IPSOS", "SUB_TIPIFICACION_IPSOS", "N° LLAMADAS", "FECHA DE GESTION", "INICIOLLAMADA", "FECHALLAMADA", "FINLLAMADA", "USUARIO"];
  const SOURCE_HEADERS = ["Usuario", "ID", "Hora_inicio", "Hora_fin", "Estado Tipificacion"];
  let currentCatalog = { ...DEFAULT_CATALOG };
  try {
    const saved = localStorage.getItem("mapfre_custom_catalog");
    if (saved) Object.assign(currentCatalog, JSON.parse(saved));
  } catch (e) {}

  const state = {
    sourceFile: null,
    sourceBuffer: null,
    sourceReadVersion: 0,
    targetFiles: [],
    targetBuffers: new Map(),
    targetsReadVersion: 0,
    zipBlob: null,
    zipName: "bases_procesadas.zip",
    outputs: [],
    rawSourceWorkbook: null,
    detectedTipifications: [],
    selectedTipifications: new Set()
  };

  const el = {
    sourceInput: document.getElementById("source-input"),
    targetsInput: document.getElementById("targets-input"),
    sourceFile: document.getElementById("source-file"),
    targetFiles: document.getElementById("targets-files"),
    sourceZone: document.getElementById("source-zone"),
    targetsZone: document.getElementById("targets-zone"),
    process: document.getElementById("process-button"),
    reset: document.getElementById("reset-button"),
    progressPanel: document.getElementById("progress-panel"),
    progressTitle: document.getElementById("progress-title"),
    progressPercent: document.getElementById("progress-percent"),
    progressBar: document.getElementById("progress-bar"),
    progressDetail: document.getElementById("progress-detail"),
    resultsPanel: document.getElementById("results-panel"),
    resultsBody: document.getElementById("results-body"),
    summaryCards: document.getElementById("summary-cards"),
    warnings: document.getElementById("warnings-box"),
    download: document.getElementById("download-button"),
    catalogInput: document.getElementById("catalog-input"),
    catalogZone: document.getElementById("catalog-zone"),
    catalogFile: document.getElementById("catalog-file"),
    catalogPillText: document.getElementById("catalog-pill-text"),
    tipFilterSection: document.getElementById("tip-filter-section"),
    tipCheckboxesGrid: document.getElementById("tip-checkboxes-grid"),
    tipTotalCount: document.getElementById("tip-total-count"),
    unmappedWarningBox: document.getElementById("unmapped-warning-box"),
    btnTipAll: document.getElementById("btn-tip-all"),
    btnTipContacted: document.getElementById("btn-tip-contacted"),
    btnTipNone: document.getElementById("btn-tip-none"),
    btnAddTipModal: document.getElementById("btn-add-tip-modal"),
    tipModal: document.getElementById("tip-modal"),
    tipModalTitle: document.getElementById("tip-modal-title"),
    btnModalClose: document.getElementById("btn-modal-close"),
    btnModalCancel: document.getElementById("btn-modal-cancel"),
    btnModalSave: document.getElementById("btn-modal-save"),
    modalInputCode: document.getElementById("modal-input-code"),
    modalInputCat: document.getElementById("modal-input-cat"),
    modalInputTip: document.getElementById("modal-input-tip"),
    modalInputSubtip: document.getElementById("modal-input-subtip")
  };

  function normalizeHeader(value) {
    return String(value ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[_\s]+/g, " ").toUpperCase();
  }

  function normalizeId(value) {
    if (value === null || value === undefined) return "";
    if (typeof value === "number" && Number.isFinite(value)) return Number.isInteger(value) ? String(value) : String(value).replace(/\.0+$/, "");
    return String(value).trim().replace(/\.0+$/, "");
  }

  function normalizeCode(value) { return String(value ?? "").trim().toUpperCase(); }

  function parseDateTime(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return new Date(value.getFullYear(), value.getMonth(), value.getDate(), value.getHours(), value.getMinutes(), value.getSeconds());
    if (typeof value === "number" && window.XLSX?.SSF) {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d, parsed.H, parsed.M, Math.floor(parsed.S));
    }
    const text = String(value ?? "").trim();
    if (!text) return null;
    const match = text.match(/^(\d{1,4})[-\/.](\d{1,2})[-\/.](\d{1,4})(?:[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if (!match) return null;
    let year, month, day;
    if (match[1].length === 4) { year = +match[1]; month = +match[2]; day = +match[3]; }
    else { day = +match[1]; month = +match[2]; year = +match[3]; }
    const date = new Date(year, month - 1, day, +(match[4] || 0), +(match[5] || 0), +(match[6] || 0));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function excelSerial(date) {
    return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()) - Date.UTC(1899, 11, 30)) / 86400000;
  }

  function readFileImmediately(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error("El navegador no pudo leer el archivo seleccionado."));
      reader.onabort = () => reject(new Error("La lectura del archivo fue cancelada."));
      reader.readAsArrayBuffer(file);
    });
  }

  function readWorkbook(buffer) {
    if (!(buffer instanceof ArrayBuffer)) throw new Error("El archivo no está disponible en memoria. Vuelve a seleccionarlo.");
    return XLSX.read(buffer.slice(0), { type: "array", cellDates: true, cellStyles: true, bookFiles: true });
  }

  function headerMap(row) {
    const map = new Map();
    row.forEach((value, index) => map.set(normalizeHeader(value), index));
    return map;
  }

  function findSheetWithHeaders(workbook, requiredHeaders) {
    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null, range: 0, blankrows: false });
      if (!rows.length) continue;
      const map = headerMap(rows[0]);
      if (requiredHeaders.every(header => map.has(normalizeHeader(header)))) return { name, sheet, rows, map };
    }
    return null;
  }

  function compareRecords(a, b) {
    const aEnd = a.end?.getTime() ?? a.start?.getTime() ?? -Infinity;
    const bEnd = b.end?.getTime() ?? b.start?.getTime() ?? -Infinity;
    if (aEnd !== bEnd) return aEnd - bEnd;
    const aStart = a.start?.getTime() ?? -Infinity;
    const bStart = b.start?.getTime() ?? -Infinity;
    if (aStart !== bStart) return aStart - bStart;
    return a.rowIndex - b.rowIndex;
  }

  function buildSourceIndex(workbook) {
    const located = findSheetWithHeaders(workbook, SOURCE_HEADERS);
    if (!located) throw new Error("El informe no contiene los encabezados requeridos: Usuario, ID, Hora_inicio, Hora_fin y Estado Tipificacion.");
    const h = located.map;
    const index = new Map();
    const invalid = { missingId: 0, invalidStart: 0, missingEnd: 0, unmappedCodes: new Set(), sourceRows: 0, entrevIds: 0, priorityChanges: 0 };
    for (let rowIndex = 1; rowIndex < located.rows.length; rowIndex++) {
      const row = located.rows[rowIndex];
      if (!row || row.every(value => value === null || value === "")) continue;
      invalid.sourceRows++;
      const id = normalizeId(row[h.get(normalizeHeader("ID"))]);
      if (!id) { invalid.missingId++; continue; }
      const record = {
        id,
        user: String(row[h.get(normalizeHeader("Usuario"))] ?? "").trim(),
        start: parseDateTime(row[h.get(normalizeHeader("Hora_inicio"))]),
        end: parseDateTime(row[h.get(normalizeHeader("Hora_fin"))]),
        status: normalizeCode(row[h.get(normalizeHeader("Estado Tipificacion"))]),
        rowIndex
      };
      if (!record.start) invalid.invalidStart++;
      if (!record.end) invalid.missingEnd++;
      if (record.status && !currentCatalog[record.status]) invalid.unmappedCodes.add(record.status);
      if (!index.has(id)) index.set(id, []);
      index.get(id).push(record);
    }
    const resolved = new Map();
    for (const [id, records] of index) {
      const validRecords = state.selectedTipifications.size > 0 
        ? records.filter(record => state.selectedTipifications.has(record.status))
        : records;
      if (!validRecords.length) continue;

      const latestGeneral = validRecords.reduce((best, record) => compareRecords(record, best) > 0 ? record : best, validRecords[0]);
      const entrev = validRecords.filter(record => record.status === "ENTREV");
      const selected = entrev.length ? entrev.reduce((best, record) => compareRecords(record, best) > 0 ? record : best, entrev[0]) : latestGeneral;
      if (entrev.length) invalid.entrevIds++;
      if (selected.rowIndex !== latestGeneral.rowIndex) invalid.priorityChanges++;
      resolved.set(id, { selected, count: validRecords.length, hasEntrev: entrev.length > 0 });
    }
    return { records: resolved, stats: invalid };
  }

  function validateTargetHeaders(rows) {
    if (!rows.length) return false;
    return TARGET_HEADERS.every((expected, index) => normalizeHeader(rows[0][index]) === normalizeHeader(expected));
  }

  function setCell(sheet, address, value, type, format) {
    const previous = sheet[address] || {};
    const cell = { ...previous, t: type, v: value };
    delete cell.w;
    if (format) cell.z = format;
    sheet[address] = cell;
  }

  function clearCell(sheet, address) {
    const previous = sheet[address];
    if (previous?.s) sheet[address] = { t: "z", s: previous.s };
    else delete sheet[address];
  }

  function writeDateParts(sheet, rowNumber, record) {
    if (record.start) {
      const startSerial = excelSerial(record.start);
      setCell(sheet, `F${rowNumber}`, Math.floor(startSerial), "n", "dd-mm-yyyy");
      setCell(sheet, `G${rowNumber}`, startSerial - Math.floor(startSerial), "n", "hh:mm:ss");
    } else {
      clearCell(sheet, `F${rowNumber}`); clearCell(sheet, `G${rowNumber}`);
    }
    if (record.end) {
      const endSerial = excelSerial(record.end);
      setCell(sheet, `H${rowNumber}`, Math.floor(endSerial), "n", "dd-mm-yyyy");
      setCell(sheet, `I${rowNumber}`, endSerial - Math.floor(endSerial), "n", "hh:mm:ss");
    } else {
      clearCell(sheet, `H${rowNumber}`); clearCell(sheet, `I${rowNumber}`);
    }
  }

  function processTarget(workbook, sourceIndex, fileName) {
    let selectedSheet = null;
    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null, blankrows: false });
      if (validateTargetHeaders(rows)) { selectedSheet = { name, sheet, rows }; break; }
    }
    if (!selectedSheet) throw new Error("No se encontró una hoja con los encabezados A:J de BD1.");
    const summary = { fileName, rows: 0, matched: 0, entrev: 0, unmatched: 0, unmapped: 0, status: "Procesada" };
    const sheet = selectedSheet.sheet;
    for (let rowIndex = 1; rowIndex < selectedSheet.rows.length; rowIndex++) {
      const row = selectedSheet.rows[rowIndex];
      if (!row || row.every(value => value === null || value === "")) continue;
      summary.rows++;
      const excelRow = rowIndex + 1;
      const id = normalizeId(row[0]);
      const match = id ? sourceIndex.records.get(id) : null;
      if (!match) {
        summary.unmatched++;
        for (let column = 1; column <= 9; column++) clearCell(sheet, `${XLSX.utils.encode_col(column)}${excelRow}`);
        continue;
      }
      summary.matched++;
      if (match.hasEntrev) summary.entrev++;
      const mapped = currentCatalog[match.selected.status];
      if (mapped) {
        setCell(sheet, `B${excelRow}`, mapped[0], "s");
        setCell(sheet, `C${excelRow}`, mapped[1], "s");
        setCell(sheet, `D${excelRow}`, mapped[2], "s");
      } else {
        summary.unmapped++;
        clearCell(sheet, `B${excelRow}`); clearCell(sheet, `C${excelRow}`); clearCell(sheet, `D${excelRow}`);
      }
      setCell(sheet, `E${excelRow}`, match.count, "n", "0");
      writeDateParts(sheet, excelRow, match.selected);
      setCell(sheet, `J${excelRow}`, match.selected.user, "s");
    }
    const outputName = fileName.replace(/\.(xlsx|xls)$/i, "") + "_PROCESADO.xlsx";
    const data = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true, compression: true });
    return { summary, outputName, data };
  }

  function makeSummaryCsv(results, sourceStats) {
    const lines = [
      ["RESUMEN DEL PROCESO"],
      ["Registros informe origen", sourceStats.sourceRows],
      ["Filas sin ID en origen", sourceStats.missingId],
      ["ID con ENTREV", sourceStats.entrevIds],
      ["ID donde ENTREV cambió la última gestión", sourceStats.priorityChanges],
      ["Códigos sin mapeo", [...sourceStats.unmappedCodes].join(" | ") || "Ninguno"],
      [],
      ["Archivo", "Registros", "Encontrados", "ENTREV", "Sin gestión", "Sin tipificación", "Estado"],
      ...results.map(item => [item.summary.fileName, item.summary.rows, item.summary.matched, item.summary.entrev, item.summary.unmatched, item.summary.unmapped, item.summary.status])
    ];
    return "\uFEFF" + lines.map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
  }

  function updateProgress(percent, title, detail) {
    el.progressPanel.hidden = false;
    el.progressPercent.textContent = `${Math.round(percent)}%`;
    el.progressBar.style.width = `${percent}%`;
    el.progressTitle.textContent = title;
    el.progressDetail.textContent = detail;
  }

  function filesReady() {
    return Boolean(state.sourceFile && state.sourceBuffer && state.targetFiles.length && state.targetFiles.every(file => state.targetBuffers.has(file)));
  }

  function refreshSelections(
    sourceStatus = state.sourceBuffer ? "listo" : "",
    targetsStatus = state.targetFiles.length && state.targetFiles.every(file => state.targetBuffers.has(file)) ? "listo" : ""
  ) {
    el.sourceFile.innerHTML = state.sourceFile ? `<div class="file-pill"><span>${escapeHtml(state.sourceFile.name)}${sourceStatus ? ` · ${escapeHtml(sourceStatus)}` : ""}</span></div>` : "";
    el.targetFiles.innerHTML = state.targetFiles.map(file => `<div class="file-pill"><span>${escapeHtml(file.name)}${targetsStatus ? ` · ${escapeHtml(targetsStatus)}` : ""}</span></div>`).join("");
    el.process.disabled = !filesReady();
    state.zipBlob = null;
    el.download.disabled = true;
  }

  function showSelectionError(scope, error) {
    const message = error?.message || "El navegador no pudo leer el archivo.";
    updateProgress(100, `No fue posible leer ${scope}`, `${message} Vuelve a seleccionarlo para copiarlo nuevamente a memoria.`);
    el.progressBar.style.background = "#b42318";
  }

  async function selectSourceFile(file) {
    const version = ++state.sourceReadVersion;
    state.sourceFile = file || null;
    state.sourceBuffer = null;
    el.progressBar.style.background = "";
    refreshSelections(file ? "leyendo…" : "");
    if (!file) return;
    try {
      const buffer = await readFileImmediately(file);
      if (version !== state.sourceReadVersion || state.sourceFile !== file) return;
      state.sourceBuffer = buffer;
      refreshSelections("listo");
      scanSourceTipifications(buffer);
    } catch (error) {
      if (version !== state.sourceReadVersion) return;
      state.sourceBuffer = null;
      refreshSelections("error");
      showSelectionError("el informe de llamadas", error);
    }
  }

  async function selectTargetFiles(files) {
    const version = ++state.targetsReadVersion;
    state.targetFiles = Array.from(files || []).filter(file => /\.(xlsx|xls)$/i.test(file.name));
    state.targetBuffers = new Map();
    el.progressBar.style.background = "";
    refreshSelections(undefined, state.targetFiles.length ? "leyendo…" : "");
    if (!state.targetFiles.length) return;
    const reads = state.targetFiles.map(async file => [file, await readFileImmediately(file)]);
    try {
      const loaded = await Promise.all(reads);
      if (version !== state.targetsReadVersion) return;
      state.targetBuffers = new Map(loaded);
      refreshSelections(undefined, "listo");
    } catch (error) {
      if (version !== state.targetsReadVersion) return;
      state.targetBuffers = new Map();
      refreshSelections(undefined, "error");
      showSelectionError("una o más bases cliente", error);
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function renderResults(results, sourceStats, errors) {
    const totals = results.reduce((acc, item) => {
      acc.rows += item.summary.rows; acc.matched += item.summary.matched; acc.entrev += item.summary.entrev; acc.unmatched += item.summary.unmatched; return acc;
    }, { rows: 0, matched: 0, entrev: 0, unmatched: 0 });
    el.summaryCards.innerHTML = [
      [results.length, "Bases generadas", "green"],
      [totals.rows.toLocaleString("es-CL"), "Registros procesados", ""],
      [totals.entrev.toLocaleString("es-CL"), "Registros con ENTREV", "orange"],
      [totals.unmatched.toLocaleString("es-CL"), "ID sin gestión", totals.unmatched ? "red" : "green"]
    ].map(([value, label, className]) => `<div class="summary-card ${className}"><strong>${value}</strong><span>${label}</span></div>`).join("");
    el.resultsBody.innerHTML = results.map(item => `<tr><td>${escapeHtml(item.summary.fileName)}</td><td>${item.summary.rows.toLocaleString("es-CL")}</td><td>${item.summary.matched.toLocaleString("es-CL")}</td><td>${item.summary.entrev.toLocaleString("es-CL")}</td><td>${item.summary.unmatched.toLocaleString("es-CL")}</td><td><span class="status">Procesada</span></td></tr>`).join("") + errors.map(item => `<tr><td>${escapeHtml(item.fileName)}</td><td>—</td><td>—</td><td>—</td><td>—</td><td><span class="status error">Error</span></td></tr>`).join("");
    const warnings = [];
    if (sourceStats.missingId) warnings.push(`${sourceStats.missingId.toLocaleString("es-CL")} filas del informe origen no tienen ID y fueron excluidas.`);
    if (sourceStats.invalidStart) warnings.push(`${sourceStats.invalidStart.toLocaleString("es-CL")} filas tienen fecha de inicio inválida.`);
    if (sourceStats.missingEnd) warnings.push(`${sourceStats.missingEnd.toLocaleString("es-CL")} filas no tienen fecha de término; se utilizó la fecha de inicio.`);
    if (sourceStats.unmappedCodes.size) warnings.push(`Códigos sin catálogo: ${[...sourceStats.unmappedCodes].sort().join(", ")}.`);
    errors.forEach(error => warnings.push(`${error.fileName}: ${error.message}`));
    el.warnings.hidden = !warnings.length;
    el.warnings.innerHTML = warnings.length ? `<strong>Observaciones</strong><ul>${warnings.map(message => `<li>${escapeHtml(message)}</li>`).join("")}</ul>` : "";
    el.resultsPanel.hidden = false;
  }

  async function processAll() {
    if (!window.XLSX || !window.JSZip) {
      alert("No fue posible cargar los componentes para leer Excel. Revisa tu conexión y vuelve a abrir la herramienta.");
      return;
    }
    el.process.disabled = true;
    el.resultsPanel.hidden = true;
    state.zipBlob = null;
    try {
      updateProgress(5, "Leyendo informe de llamadas", "Validando encabezados y preparando el índice por ID.");
      if (!filesReady()) throw new Error("Los archivos todavía no están listos. Vuelve a seleccionarlos y espera a que indiquen “listo”.");
      const sourceWorkbook = readWorkbook(state.sourceBuffer);
      const sourceIndex = buildSourceIndex(sourceWorkbook);
      updateProgress(22, "Informe preparado", `${sourceIndex.records.size.toLocaleString("es-CL")} ID únicos encontrados.`);
      const results = [];
      const errors = [];
      const zip = new JSZip();
      for (let index = 0; index < state.targetFiles.length; index++) {
        const file = state.targetFiles[index];
        const startPercent = 22 + (index / state.targetFiles.length) * 66;
        updateProgress(startPercent, `Procesando base ${index + 1} de ${state.targetFiles.length}`, file.name);
        try {
          const workbook = readWorkbook(state.targetBuffers.get(file));
          const output = processTarget(workbook, sourceIndex, file.name);
          results.push(output);
          zip.file(output.outputName, output.data);
        } catch (error) {
          errors.push({ fileName: file.name, message: error.message || "No fue posible procesar el archivo." });
        }
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      if (!results.length) throw new Error("Ninguna base pudo procesarse. Revisa los encabezados A:J.");
      zip.file("RESUMEN_PROCESO.csv", makeSummaryCsv(results, sourceIndex.stats));
      updateProgress(92, "Empaquetando resultados", "Preparando la descarga conjunta.");
      state.zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }, metadata => updateProgress(92 + metadata.percent * .08, "Empaquetando resultados", `${Math.round(metadata.percent)}% del ZIP generado.`));
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      state.zipName = `BASES_MAPFRE_PROCESADAS_${stamp}.zip`;
      state.outputs = results;
      renderResults(results, sourceIndex.stats, errors);
      el.download.disabled = false;
      updateProgress(100, "Proceso finalizado", `${results.length} base${results.length === 1 ? "" : "s"} lista${results.length === 1 ? "" : "s"} para descargar.`);
      el.resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      updateProgress(100, "No fue posible completar el proceso", error.message || "Revisa los archivos seleccionados.");
      el.progressBar.style.background = "#b42318";
    } finally {
      el.process.disabled = !filesReady();
    }
  }

  function downloadZip() {
    if (!state.zipBlob) return;
    const url = URL.createObjectURL(state.zipBlob);
    const link = document.createElement("a");
    link.href = url; link.download = state.zipName; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function reset() {
    state.sourceReadVersion++; state.targetsReadVersion++;
    state.sourceFile = null; state.sourceBuffer = null;
    state.targetFiles = []; state.targetBuffers = new Map();
    state.zipBlob = null; state.outputs = [];
    el.sourceInput.value = ""; el.targetsInput.value = "";
    refreshSelections();
    el.progressPanel.hidden = true; el.resultsPanel.hidden = true;
    el.progressBar.style.width = "0"; el.progressBar.style.background = "";
  }

  function configureDropZone(zone, multiple, callback) {
    ["dragenter", "dragover"].forEach(eventName => zone.addEventListener(eventName, event => { event.preventDefault(); zone.classList.add("dragging"); }));
    ["dragleave", "drop"].forEach(eventName => zone.addEventListener(eventName, event => { event.preventDefault(); zone.classList.remove("dragging"); }));
    zone.addEventListener("drop", event => {
      const files = Array.from(event.dataTransfer.files).filter(file => /\.(xlsx|xls)$/i.test(file.name));
      callback(multiple ? files : files[0] || null);
    });
  }

  el.sourceInput.addEventListener("change", event => { void selectSourceFile(event.target.files[0] || null); });
  el.targetsInput.addEventListener("change", event => { void selectTargetFiles(event.target.files); });
  el.process.addEventListener("click", processAll);
  el.reset.addEventListener("click", reset);
  el.download.addEventListener("click", downloadZip);
  configureDropZone(el.sourceZone, false, file => { void selectSourceFile(file); });
  configureDropZone(el.targetsZone, true, files => { void selectTargetFiles(files); });


  function scanSourceTipifications(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: "array" });
      const located = findSheetWithHeaders(workbook, SOURCE_HEADERS);
      if (!located) return;
      const h = located.map;
      const counts = {};

      for (let rowIndex = 1; rowIndex < located.rows.length; rowIndex++) {
        const row = located.rows[rowIndex];
        if (!row || row.every(v => v === null || v === "")) continue;
        const status = normalizeCode(row[h.get(normalizeHeader("Estado Tipificacion"))]) || "SIN_CODIGO";
        counts[status] = (counts[status] || 0) + 1;
      }

      const detected = Object.keys(counts).map(code => {
        const mapped = !!currentCatalog[code];
        const item = currentCatalog[code] || null;
        return { code, count: counts[code], mapped, item };
      }).sort((a,b) => b.count - a.count);

      state.detectedTipifications = detected;
      state.selectedTipifications = new Set(detected.map(d => d.code));

      renderTipCheckboxes();
      if (el.tipFilterSection) el.tipFilterSection.hidden = false;
    } catch (e) {
      console.warn("Error escaneando tipificaciones:", e);
    }
  }

  function renderTipCheckboxes() {
    if (!el.tipCheckboxesGrid) return;
    el.tipCheckboxesGrid.innerHTML = "";
    if (el.tipTotalCount) el.tipTotalCount.textContent = state.detectedTipifications.length;

    const unmapped = state.detectedTipifications.filter(d => !d.mapped);
    if (unmapped.length > 0 && el.unmappedWarningBox) {
      el.unmappedWarningBox.hidden = false;
      el.unmappedWarningBox.innerHTML = `
        <span>⚠️ <b>Atención:</b> Se detectaron <b>${unmapped.length}</b> códigos sin homologar en el informe:</span>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:4px;">
          ${unmapped.map(u => `<span class="unmapped-code-pill" title="Clic para homologar ${u.code}">➕ Homologar <b>${u.code}</b> (${u.count})</span>`).join("")}
        </div>
      `;
      el.unmappedWarningBox.querySelectorAll(".unmapped-code-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          const codeText = pill.querySelector("b").textContent;
          openTipModal(codeText);
        });
      });
    } else if (el.unmappedWarningBox) {
      el.unmappedWarningBox.hidden = true;
    }

    state.detectedTipifications.forEach(t => {
      const chip = document.createElement("label");
      const isChecked = state.selectedTipifications.has(t.code);
      const isMapped = t.mapped;
      const item = t.item;

      let badgeClass = "badge-unmapped";
      let badgeLabel = "Sin Homologar";
      let desc = "Código no registrado en catálogo Mapfre";

      if (isMapped && item) {
        if (item[0] === "CONTACTADO") {
          badgeClass = "badge-contacto";
          badgeLabel = "Contacto";
        } else {
          badgeClass = "badge-nocontacto";
          badgeLabel = "No Contacto";
        }
        desc = item[1] || t.code;
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

  if (el.btnTipAll) {
    el.btnTipAll.addEventListener("click", () => {
      state.selectedTipifications = new Set(state.detectedTipifications.map(t => t.code));
      renderTipCheckboxes();
      el.btnTipAll.classList.add("active");
      el.btnTipContacted.classList.remove("active");
      el.btnTipNone.classList.remove("active");
    });
  }
  if (el.btnTipContacted) {
    el.btnTipContacted.addEventListener("click", () => {
      const contactCodes = state.detectedTipifications
        .filter(t => t.item && t.item[0] === "CONTACTADO")
        .map(t => t.code);
      state.selectedTipifications = new Set(contactCodes);
      renderTipCheckboxes();
      el.btnTipContacted.classList.add("active");
      el.btnTipAll.classList.remove("active");
      el.btnTipNone.classList.remove("active");
    });
  }
  if (el.btnTipNone) {
    el.btnTipNone.addEventListener("click", () => {
      state.selectedTipifications.clear();
      renderTipCheckboxes();
      el.btnTipNone.classList.add("active");
      el.btnTipAll.classList.remove("active");
      el.btnTipContacted.classList.remove("active");
    });
  }
  if (el.btnAddTipModal) {
    el.btnAddTipModal.addEventListener("click", () => openTipModal());
  }

  function handleCatalogFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        if (!rows.length) return;

        let hIdx = 0;
        for (let i = 0; i < Math.min(10, rows.length); i++) {
          const line = (rows[i] || []).join(" ").toLowerCase();
          if (line.includes("codigo") || line.includes("cod") || line.includes("tipificacion")) {
            hIdx = i; break;
          }
        }
        const headers = rows[hIdx].map(c => String(c).trim().toLowerCase());
        const findIdx = (...keys) => headers.findIndex(h => keys.some(k => h.replace(/[\s_]+/g, "") === k.replace(/[\s_]+/g, "")));

        const cCod = findIdx("codigooficial", "codvicidial", "codigo", "cod", "code", "status");
        const cCat = findIdx("categoria", "category");
        const cTip = findIdx("tipificacion", "tipificación");
        const cSub = findIdx("subtipificacion", "subtipificación", "sub tipificacion");

        if (cCod === -1) {
          alert("No se encontró columna para el código (CODIGO_OFICIAL, COD_VICIDIAL o CODIGO).");
          return;
        }

        let added = 0;
        for (let r = hIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          const code = String(row[cCod] || "").trim().toUpperCase();
          if (!code) continue;
          const cat = cCat !== -1 ? String(row[cCat] || "").trim().toUpperCase() : "CONTACTADO";
          const tip = cTip !== -1 ? String(row[cTip] || "").trim().toUpperCase() : code;
          const sub = cSub !== -1 ? String(row[cSub] || "").trim().toUpperCase() : tip;
          currentCatalog[code] = [cat || "CONTACTADO", tip || code, sub || tip || code];
          added++;
        }

        localStorage.setItem("mapfre_custom_catalog", JSON.stringify(currentCatalog));
        const total = Object.keys(currentCatalog).length;
        if (el.catalogPillText) el.catalogPillText.textContent = `✓ Catálogo activo: ${total} códigos (${file.name})`;
        if (state.sourceBuffer) scanSourceTipifications(state.sourceBuffer);
        alert(`Homologación Mapfre cargada: ${added} códigos importados desde ${file.name}.`);
      } catch (err) {
        alert("Error al leer el archivo de homologación: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  if (el.catalogInput) {
    el.catalogInput.addEventListener("change", e => handleCatalogFile(e.target.files[0]));
  }
  if (el.catalogZone) {
    configureDropZone(el.catalogZone, false, file => handleCatalogFile(file));
  }

  function openTipModal(codeToEdit = "") {
    if (!el.tipModal) return;
    el.tipModal.hidden = false;
    if (codeToEdit && currentCatalog[codeToEdit]) {
      const item = currentCatalog[codeToEdit];
      el.tipModalTitle.textContent = `Editar Tipificación: ${codeToEdit}`;
      el.modalInputCode.value = codeToEdit;
      el.modalInputCode.readOnly = true;
      el.modalInputCat.value = item[0] || "CONTACTADO";
      el.modalInputTip.value = item[1] || "";
      el.modalInputSubtip.value = item[2] || item[1] || "";
    } else {
      el.tipModalTitle.textContent = "Agregar / Homologar Tipificación";
      el.modalInputCode.value = codeToEdit || "";
      el.modalInputCode.readOnly = false;
      el.modalInputCat.value = "CONTACTADO";
      el.modalInputTip.value = "";
      el.modalInputSubtip.value = "";
    }
    el.modalInputCode.focus();
  }

  function closeTipModal() {
    if (el.tipModal) el.tipModal.hidden = true;
  }

  function saveTipModal() {
    const code = normalizeCode(el.modalInputCode.value);
    const cat = el.modalInputCat.value.trim().toUpperCase();
    const tip = el.modalInputTip.value.trim().toUpperCase();
    const sub = el.modalInputSubtip.value.trim().toUpperCase() || tip;

    if (!code) { alert("Por favor ingresa el código."); return; }
    if (!tip) { alert("Por favor ingresa la tipificación."); return; }

    currentCatalog[code] = [cat, tip, sub];
    localStorage.setItem("mapfre_custom_catalog", JSON.stringify(currentCatalog));

    const total = Object.keys(currentCatalog).length;
    if (el.catalogPillText) el.catalogPillText.textContent = `✓ Catálogo activo: ${total} códigos`;
    if (state.sourceBuffer) scanSourceTipifications(state.sourceBuffer);

    closeTipModal();
  }

  if (el.btnModalClose) el.btnModalClose.addEventListener("click", closeTipModal);
  if (el.btnModalCancel) el.btnModalCancel.addEventListener("click", closeTipModal);
  if (el.btnModalSave) el.btnModalSave.addEventListener("click", saveTipModal);

  window.MapfreProcessor = Object.freeze({ CATALOG, buildSourceIndex, processTarget, normalizeId, parseDateTime });

  const modelContext = document.modelContext;
  if (modelContext?.registerTool) {
    const register = tool => Promise.resolve(modelContext.registerTool(tool)).catch(() => {});
    register({
      name: "get_processing_state",
      title: "Consultar archivos seleccionados",
      description: "Devuelve el informe origen, las bases cliente seleccionadas y si ya existe una descarga preparada.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute() {
        return {
          sourceFile: state.sourceFile?.name || null,
          targetFiles: state.targetFiles.map(file => file.name),
          filesReady: filesReady(),
          downloadReady: Boolean(state.zipBlob)
        };
      }
    });
    register({
      name: "process_selected_files",
      title: "Procesar archivos seleccionados",
      description: "Ejecuta el mismo cruce visible de la interfaz usando el informe y las bases que ya seleccionó la persona.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      async execute() {
        if (!filesReady()) throw new Error("Primero se debe seleccionar el informe y al menos una base cliente, y esperar a que indiquen “listo”.");
        await processAll();
        return { processedFiles: state.outputs.length, downloadReady: Boolean(state.zipBlob) };
      }
    });
  }
})();

