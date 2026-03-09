import type { ReactNode } from "react"
import styles from "./Table.module.css"
import StatusBadge from "../StatusBadge"

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
    <div className={styles.wrapper}>

      <div className={styles.scrollContainer}>
        <table className={styles.table}>

          {/* Table Head */}
          <thead className={styles.head}>
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
              <tr className={styles.row}>
                <td
                  colSpan={columns.length}
                  className="text-center py-16 text-gray-400"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className={styles.row}>

                  {columns.map((col) => (
                    <td key={col.accessor} className="px-6 py-4">

                      {col.render
                        ? col.render(row)
                        : col.accessor === "status"
                          ? <StatusBadge status={String(row[col.accessor] ?? "")} />
                          : String(row[col.accessor] ?? "")}

                    </td>
                  ))}

                </tr>
              ))
            )}

          </tbody>

        </table>
      </div>

    </div>
  )
}
