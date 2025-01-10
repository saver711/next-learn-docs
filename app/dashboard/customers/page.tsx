import { auth } from "@/auth"

const CustomersPage = async () => {
  const session = await auth()
  return <>customers</>
}
export default CustomersPage
