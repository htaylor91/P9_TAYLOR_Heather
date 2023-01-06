/**
 * [Bug report] - Bills
 */
export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const fullYear = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date)
  const monthLowercase = new Intl.DateTimeFormat('en', { month: 'short' }).format(date)
  const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date)
  const month = monthLowercase.charAt(0).toUpperCase() + monthLowercase.slice(1)
  const year = fullYear.substring(2,4);

  return `${day} ${month} ${year}`
}

export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}