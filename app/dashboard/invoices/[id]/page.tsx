import { fetchInvoiceById } from "@/app/lib/data"
import { Metadata } from "next"

export const generateMetadata = async (props: {
  params: Promise<{ id: string }>
}): Promise<Metadata> => {
  const params = await props.params
  const invoiceId = params.id

  const invoice = await fetchInvoiceById(invoiceId)
  if (!invoice) {
    return {
      title: "Not Fount"
    }
  }

  return {
    title: `Invoice with status ${invoice.status}`
  }
}

const InvoiceDetailsPage = async (props: {
  params: Promise<{ id: string }>
}) => {
  const params = await props.params
  const invoiceId = params.id

  return <>Details for id: {invoiceId}</>
}
export default InvoiceDetailsPage
