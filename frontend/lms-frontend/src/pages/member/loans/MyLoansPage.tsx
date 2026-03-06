import MemberLayout from "../../../components/layout/MemberLayout"
import Table from "../../../components/ui/Table/Table"

type Loan = {
  id: number
  book: string
  barcode: string
  issued: string
  due: string
  returned: string
  status: string
}

export default function MyLoansPage() {

  const loans: Loan[] = []

  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Book", accessor: "book" },
    { header: "Barcode", accessor: "barcode" },
    { header: "Issued", accessor: "issued" },
    { header: "Due", accessor: "due" },
    { header: "Returned", accessor: "returned" },
    { header: "Status", accessor: "status" },
  ]

  return (
    <MemberLayout>

      <div className="mb-8">
        <h1 className="text-2xl font-serif font-semibold">
          My Loans
        </h1>

        <p className="text-gray-500">
          View books you have borrowed
        </p>
      </div>

      <Table columns={columns} data={loans} />

    </MemberLayout>
  )
}