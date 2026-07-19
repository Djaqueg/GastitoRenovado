/**
 * GAStito — Google Apps Script API
 *
 * Configuración:
 * 1. Reemplaza SHEET_ID con el ID de tu Google Sheet
 * 2. Asegúrate de que la pestaña "Movimientos" exista con los encabezados correctos
 * 3. Despliega como Web App con acceso "Anyone"
 */

const SHEET_ID = "TU_SHEET_ID_AQUI";
const SHEET_NAME = "Movimientos";
const BUDGET_SHEET_NAME = "Presupuestos";

const HEADERS = [
  "id",
  "fecha",
  "tipo",
  "categoria",
  "subcategoria",
  "monto",
  "medio_pago",
  "detalle",
  "fecha_registro",
];

const BUDGET_HEADERS = ["categoria", "presupuesto_maximo"];

function doGet(e) {
  try {
    const action = e.parameter.action;

    switch (action) {
      case "list":
        return jsonResponse(success(listMovements(e.parameter)));
      case "summary":
        return jsonResponse(success(getSummary(e.parameter)));
      case "get":
        return jsonResponse(success(getMovement(e.parameter.id)));
      case "budget_list":
        return jsonResponse(success(listBudgets()));
      case "budget_status":
        return jsonResponse(success(getBudgetStatus(e.parameter)));
      default:
        return jsonResponse(error("Acción no válida"));
    }
  } catch (err) {
    return jsonResponse(error(err.message));
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    switch (action) {
      case "create":
        return jsonResponse(success(createMovement(body)));
      case "update":
        return jsonResponse(success(updateMovement(body)));
      case "delete":
        return jsonResponse(success(deleteMovement(body.id)));
      case "budget_upsert":
        return jsonResponse(success(upsertBudget(body)));
      default:
        return jsonResponse(error("Acción no válida"));
    }
  } catch (err) {
    return jsonResponse(error(err.message));
  }
}

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }

  return sheet;
}

function getAllRows() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  return data.slice(1).map(function (row) {
    return rowToMovement(row);
  });
}

function rowToMovement(row) {
  return {
    id: String(row[0]),
    fecha: formatDateValue(row[1]),
    tipo: String(row[2]),
    categoria: String(row[3]),
    subcategoria: String(row[4]),
    monto: Number(row[5]),
    medio_pago: String(row[6]),
    detalle: String(row[7] || ""),
    fecha_registro: String(row[8] || ""),
  };
}

function formatDateValue(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(value);
}

function padNumber(value) {
  return value < 10 ? "0" + value : String(value);
}

function getPeriodDateRange(month, year, periodMode) {
  if (!periodMode || periodMode === "calendar") {
    var lastDay = new Date(year, month, 0).getDate();
    return {
      from: year + "-" + padNumber(month) + "-01",
      to: year + "-" + padNumber(month) + "-" + padNumber(lastDay),
    };
  }

  var startMonth = month - 1;
  var startYear = year;
  if (startMonth < 1) {
    startMonth = 12;
    startYear = year - 1;
  }

  return {
    from: startYear + "-" + padNumber(startMonth) + "-25",
    to: year + "-" + padNumber(month) + "-24",
  };
}

function movementBelongsToPeriod(fecha, month, year, periodMode) {
  var range = getPeriodDateRange(month, year, periodMode);
  return fecha >= range.from && fecha <= range.to;
}

function listMovements(params) {
  const limit = parseInt(params.limit) || 15;
  const month = params.month ? parseInt(params.month) : null;
  const year = params.year ? parseInt(params.year) : null;
  const periodMode = params.period_mode || "calendar";

  let movements = getAllRows();

  if (month && year) {
    movements = movements.filter(function (m) {
      return movementBelongsToPeriod(m.fecha, month, year, periodMode);
    });
  }

  movements.sort(function (a, b) {
    const dateCompare = b.fecha.localeCompare(a.fecha);
    if (dateCompare !== 0) return dateCompare;
    return b.fecha_registro.localeCompare(a.fecha_registro);
  });

  return movements.slice(0, limit);
}

function getSummary(params) {
  const month = parseInt(params.month);
  const year = parseInt(params.year);
  const periodMode = params.period_mode || "calendar";

  if (!month || !year) {
    throw new Error("Mes y año son requeridos para el resumen");
  }

  const movements = getAllRows().filter(function (m) {
    return movementBelongsToPeriod(m.fecha, month, year, periodMode);
  });

  let ingresos = 0;
  let gastos = 0;

  movements.forEach(function (m) {
    if (m.tipo === "Ingreso") {
      ingresos += m.monto;
    } else if (m.tipo === "Gasto") {
      gastos += m.monto;
    }
  });

  return {
    ingresos: ingresos,
    gastos: gastos,
    balance: ingresos - gastos,
  };
}

function getMovement(id) {
  if (!id) throw new Error("ID es requerido");

  const movements = getAllRows();
  const found = movements.find(function (m) {
    return m.id === id;
  });

  if (!found) throw new Error("Movimiento no encontrado");
  return found;
}

function validateMovementInput(data) {
  if (!data.fecha) throw new Error("La fecha es requerida");
  if (!data.tipo || (data.tipo !== "Ingreso" && data.tipo !== "Gasto")) {
    throw new Error("El tipo debe ser Ingreso o Gasto");
  }
  if (!data.categoria) throw new Error("La categoría es requerida");
  if (!data.subcategoria) throw new Error("La subcategoría es requerida");
  if (!data.monto || Number(data.monto) <= 0) {
    throw new Error("El monto debe ser mayor a 0");
  }
  if (!data.medio_pago) throw new Error("El medio de pago es requerido");
}

function createMovement(data) {
  validateMovementInput(data);

  const sheet = getSheet();
  const id = Utilities.getUuid();
  const now = new Date().toISOString();

  const row = [
    id,
    data.fecha,
    data.tipo,
    data.categoria,
    data.subcategoria,
    Number(data.monto),
    data.medio_pago,
    data.detalle || "",
    now,
  ];

  sheet.appendRow(row);
  return rowToMovement(row);
}

function updateMovement(data) {
  if (!data.id) throw new Error("ID es requerido para actualizar");
  validateMovementInput(data);

  const sheet = getSheet();
  const allData = sheet.getDataRange().getValues();

  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === data.id) {
      const now = new Date().toISOString();
      const row = [
        data.id,
        data.fecha,
        data.tipo,
        data.categoria,
        data.subcategoria,
        Number(data.monto),
        data.medio_pago,
        data.detalle || "",
        now,
      ];
      sheet.getRange(i + 1, 1, 1, HEADERS.length).setValues([row]);
      return rowToMovement(row);
    }
  }

  throw new Error("Movimiento no encontrado");
}

function deleteMovement(id) {
  if (!id) throw new Error("ID es requerido para eliminar");

  const sheet = getSheet();
  const allData = sheet.getDataRange().getValues();

  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === id) {
      sheet.deleteRow(i + 1);
      return null;
    }
  }

  throw new Error("Movimiento no encontrado");
}

function getBudgetSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(BUDGET_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(BUDGET_SHEET_NAME);
    sheet.getRange(1, 1, 1, BUDGET_HEADERS.length).setValues([BUDGET_HEADERS]);
    sheet.getRange(1, 1, 1, BUDGET_HEADERS.length).setFontWeight("bold");
  }

  return sheet;
}

function listBudgets() {
  const sheet = getBudgetSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  return data.slice(1).map(function (row) {
    return {
      categoria: String(row[0]),
      presupuesto_maximo: Number(row[1]) || 0,
    };
  });
}

function upsertBudget(data) {
  if (!data.categoria) throw new Error("La categoría es requerida");
  if (data.presupuesto_maximo === undefined || data.presupuesto_maximo === null) {
    throw new Error("El presupuesto máximo es requerido");
  }

  const presupuesto = Number(data.presupuesto_maximo);
  if (presupuesto < 0) throw new Error("El presupuesto no puede ser negativo");

  const sheet = getBudgetSheet();
  const allData = sheet.getDataRange().getValues();

  for (let i = 1; i < allData.length; i++) {
    if (String(allData[i][0]) === data.categoria) {
      sheet.getRange(i + 1, 2).setValue(presupuesto);
      return { categoria: data.categoria, presupuesto_maximo: presupuesto };
    }
  }

  sheet.appendRow([data.categoria, presupuesto]);
  return { categoria: data.categoria, presupuesto_maximo: presupuesto };
}

function getBudgetStatus(params) {
  const month = parseInt(params.month);
  const year = parseInt(params.year);
  const periodMode = params.period_mode || "calendar";

  if (!month || !year) {
    throw new Error("Mes y año son requeridos para el estado del presupuesto");
  }

  const budgets = listBudgets();
  const movements = getAllRows().filter(function (m) {
    return (
      movementBelongsToPeriod(m.fecha, month, year, periodMode) &&
      m.tipo === "Gasto"
    );
  });

  const gastosPorCategoria = {};

  movements.forEach(function (m) {
    if (!gastosPorCategoria[m.categoria]) {
      gastosPorCategoria[m.categoria] = 0;
    }
    gastosPorCategoria[m.categoria] += m.monto;
  });

  return budgets.map(function (b) {
    const gastado = gastosPorCategoria[b.categoria] || 0;
    const restante = b.presupuesto_maximo - gastado;
    const porcentaje =
      b.presupuesto_maximo > 0
        ? Math.round((gastado / b.presupuesto_maximo) * 100)
        : gastado > 0
          ? 100
          : 0;

    return {
      categoria: b.categoria,
      presupuesto_maximo: b.presupuesto_maximo,
      gastado: gastado,
      restante: restante,
      porcentaje: porcentaje,
      excedido: gastado > b.presupuesto_maximo,
    };
  });
}

function success(data) {
  return { success: true, data: data };
}

function error(message) {
  return { success: false, error: message };
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
