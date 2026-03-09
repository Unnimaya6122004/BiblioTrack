export function formatDate(dateValue?: string | null): string {
  if (!dateValue) {
    return "-"
  }

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return dateValue
  }

  return date.toLocaleDateString()
}

export function formatCurrency(amount: number | string): string {
  const numericAmount = typeof amount === "number" ? amount : Number(amount)

  if (Number.isNaN(numericAmount)) {
    return String(amount)
  }

  return numericAmount.toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2
  })
}
