type PrimitiveValue = string | number | boolean | null | undefined

const csvEscape = (value: PrimitiveValue): string => {
  const text = value === null || value === undefined ? "" : String(value)

  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replace(/"/g, "\"\"")}"`
  }

  return text
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: PrimitiveValue[][]
): void {
  const csvContent = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => row.map(csvEscape).join(","))
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

type PdfExportOptions = {
  title: string
  headers: string[]
  rows: PrimitiveValue[][]
}

const htmlEscape = (value: PrimitiveValue): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")

export function printTableAsPdf(options: PdfExportOptions): void {
  // Avoid noopener/noreferrer here because some browsers return null even when popup opens.
  const reportWindow = window.open("", "_blank", "width=1100,height=800")
  if (!reportWindow || reportWindow.closed) {
    throw new Error("Popup blocked by browser. Please allow popups to export PDF.")
  }
  reportWindow.opener = null

  const { title, headers, rows } = options
  const generatedAt = new Date().toLocaleString()

  const tableHeaderHtml = headers
    .map((header) => `<th>${htmlEscape(header)}</th>`)
    .join("")
  const tableRowsHtml = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${htmlEscape(cell)}</td>`).join("")}</tr>`)
    .join("")

  reportWindow.document.open()
  reportWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${htmlEscape(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
          h1 { margin: 0 0 6px; font-size: 22px; }
          p.meta { margin: 0 0 16px; color: #475569; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; }
          th { background: #e2e8f0; }
          tr:nth-child(even) td { background: #f8fafc; }
        </style>
      </head>
      <body>
        <h1>${htmlEscape(title)}</h1>
        <p class="meta">Generated at: ${htmlEscape(generatedAt)}</p>
        <table>
          <thead>
            <tr>${tableHeaderHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
    </html>
  `)
  reportWindow.document.close()
  reportWindow.focus()
}
