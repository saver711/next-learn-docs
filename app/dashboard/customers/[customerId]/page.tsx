const CustomerDetailsPage = async (props: {
  params: Promise<{ customerId: string }>
}) => {
  const { customerId } = await props.params
  return <>{customerId}</>
}
export default CustomerDetailsPage
