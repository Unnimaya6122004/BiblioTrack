import type { ReactNode } from "react"

type Column = {
  header: string
  accessor: string
  render?: (row: unknown) => ReactNode
}

type TableRow = Record<string, unknown>

type TableProps = {
  columns: Column[]
  data: TableRow[]
}

export default function Table({ columns, data }: TableProps) {
  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

      <table className="w-full">

        {/* Table Head */}
        <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
          <tr>
            {columns.map((col) => (
              <th key={col.accessor} className="text-left px-6 py-4">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>

          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-16 text-gray-400"
              >
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">

                {columns.map((col) => (
                  <td key={col.accessor} className="px-6 py-4">

                    {col.render
                      ? col.render(row)
                      : String(row[col.accessor] ?? "")}

                  </td>
                ))}

              </tr>
            ))
          )}

        </tbody>

      </table>

    </div>
  )
}