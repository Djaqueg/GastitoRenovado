import { formatCLP, formatDate } from "./format";
import { buildMovementsReport } from "./movements-report";
import type { Movement } from "./types";

export interface DownloadMovementsPdfOptions {
  movements: Movement[];
  periodLabel: string;
  filtersLabel?: string;
}

const PRIMARY: [number, number, number] = [27, 67, 50];
const PRIMARY_LIGHT: [number, number, number] = [45, 106, 79];
const MINT: [number, number, number] = [216, 243, 220];
const AMBER: [number, number, number] = [217, 119, 6];
const AMBER_SOFT: [number, number, number] = [255, 247, 237];
const GREEN: [number, number, number] = [22, 163, 74];
const GREEN_SOFT: [number, number, number] = [240, 253, 244];
const RED: [number, number, number] = [185, 28, 28];
const GRAY: [number, number, number] = [75, 85, 99];
const LINE: [number, number, number] = [229, 231, 235];

function todayLabel(): string {
  const now = new Date();
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return formatDate(iso);
}

function buildFilename(periodLabel: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = periodLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return slug
    ? `gastito-movimientos-${slug}.pdf`
    : `gastito-movimientos-${stamp}.pdf`;
}

export async function downloadMovementsPdf(
  options: DownloadMovementsPdfOptions
): Promise<void> {
  const doc = await createMovementsPdf(options);
  doc.save(buildFilename(options.periodLabel));
}

export async function createMovementsPdf({
  movements,
  periodLabel,
  filtersLabel,
}: DownloadMovementsPdfOptions) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const report = buildMovementsReport(movements, periodLabel, filtersLabel);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("GAStito", margin, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Reporte de movimientos y gastos", margin, 20);

  doc.setFontSize(8);
  doc.text(`Generado: ${todayLabel()}`, pageWidth - margin, 12, {
    align: "right",
  });
  doc.text(report.periodLabel, pageWidth - margin, 20, { align: "right" });

  let y = 36;

  doc.setTextColor(...GRAY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Período: ${report.periodLabel}`, margin, y);
  y += 5;

  if (report.filtersLabel) {
    const filterLines = doc.splitTextToSize(
      `Filtros: ${report.filtersLabel}`,
      contentWidth
    );
    doc.text(filterLines, margin, y);
    y += filterLines.length * 4 + 2;
  }

  const boxWidth = (contentWidth - 8) / 3;
  const boxHeight = 20;
  const boxes = [
    {
      label: "Ingresos",
      value: formatCLP(report.summary.ingresos),
      bg: GREEN_SOFT,
      accent: GREEN,
    },
    {
      label: "Gastos",
      value: formatCLP(report.summary.gastos),
      bg: AMBER_SOFT,
      accent: AMBER,
    },
    {
      label: "Balance",
      value: formatCLP(report.summary.balance),
      bg: report.summary.balance >= 0 ? MINT : [254, 226, 226] as [number, number, number],
      accent: report.summary.balance >= 0 ? PRIMARY : RED,
    },
  ];

  boxes.forEach((box, index) => {
    const x = margin + index * (boxWidth + 4);
    doc.setFillColor(...box.bg);
    doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, "F");
    doc.setDrawColor(...LINE);
    doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, "S");

    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(box.label, x + 4, y + 6);

    doc.setTextColor(...box.accent);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(box.value, x + 4, y + 15);
  });

  y += boxHeight + 10;

  doc.setTextColor(...PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Gastos por categoría", margin, y);
  y += 3;

  if (report.expenses.length === 0) {
    y += 8;
    doc.setTextColor(...GRAY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("No hay gastos en el período o filtros seleccionados.", margin, y);
    y += 8;
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Categoría", "Movs.", "Monto", "Participación"]],
      body: report.expenses.map((item) => [
        item.categoria,
        String(item.count),
        formatCLP(item.total),
        `${item.porcentaje.toFixed(1)}%`,
      ]),
      foot: [
        [
          "Total gastos",
          String(report.expenses.reduce((sum, item) => sum + item.count, 0)),
          formatCLP(report.summary.gastos),
          "100%",
        ],
      ],
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.2,
        textColor: [31, 41, 55],
        lineColor: LINE,
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: PRIMARY,
        textColor: 255,
        fontStyle: "bold",
      },
      footStyles: {
        fillColor: MINT,
        textColor: PRIMARY,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 249] },
      columnStyles: {
        1: { halign: "right", cellWidth: 18 },
        2: { halign: "right", cellWidth: 36 },
        3: { halign: "right", cellWidth: 28 },
      },
      didDrawCell: (data) => {
        if (data.section !== "body" || data.column.index !== 3) return;
        const expense = report.expenses[data.row.index];
        if (!expense) return;

        const barMax = data.cell.width - 16;
        const barWidth = Math.max(0.8, (barMax * expense.porcentaje) / 100);
        const barX = data.cell.x + 2;
        const barY = data.cell.y + data.cell.height - 2.4;

        doc.setFillColor(243, 244, 246);
        doc.rect(barX, barY, barMax, 1.4, "F");
        doc.setFillColor(...AMBER);
        doc.rect(barX, barY, barWidth, 1.4, "F");
      },
    });

    const lastTable = (
      doc as { lastAutoTable?: { finalY: number } }
    ).lastAutoTable;
    y = (lastTable?.finalY ?? y) + 10;
  }

  if (y > pageHeight - 48) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(...PRIMARY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Detalle de movimientos", margin, y);

  autoTable(doc, {
    startY: y + 3,
    margin: { left: margin, right: margin },
    head: [
      [
        "Fecha",
        "Tipo",
        "Categoría",
        "Subcategoría",
        "Monto",
        "Medio de pago",
        "Detalle",
      ],
    ],
    body: movements.map((movement) => [
      formatDate(movement.fecha),
      movement.tipo,
      movement.categoria,
      movement.subcategoria,
      formatCLP(movement.monto),
      movement.medio_pago,
      movement.detalle || "—",
    ]),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [31, 41, 55],
      lineColor: LINE,
      lineWidth: 0.2,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: PRIMARY_LIGHT,
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 250, 249] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 18 },
      4: { halign: "right", cellWidth: 26, fontStyle: "bold" },
      5: { cellWidth: 28 },
    },
    didParseCell: (data) => {
      if (data.section !== "body" || data.column.index !== 1) return;
      const tipo = String(data.cell.raw);
      if (tipo === "Ingreso") {
        data.cell.styles.textColor = GREEN;
        data.cell.styles.fontStyle = "bold";
      } else if (tipo === "Gasto") {
        data.cell.styles.textColor = AMBER;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...LINE);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text("GAStito — Finanzas del Hogar", margin, pageHeight - 7);
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - margin, pageHeight - 7, {
      align: "right",
    });
  }

  return doc;
}
