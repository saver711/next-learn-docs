const InvoiceDetailsPage = async (props: {
  params: Promise<{ id: string }>
}) => {
  const params = await props.params
  const invoiceId = params.id

  return <>Details for id: {invoiceId}</>
}
export default InvoiceDetailsPage
