import { InvoiceStatus, Revenue } from "./definitions"
import { supabase } from "./supabase"
import { formatCurrency } from "./utils"

const ITEMS_PER_PAGE = 6

// Fetch revenue
export async function fetchRevenue(): Promise<Revenue[]> {
  try {
    await new Promise(resolve => setTimeout(resolve, 9000))
    const { data } = await supabase.from("revenue").select("*")

    return data as Revenue[]
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch revenue data.")
  }
}

// Fetch latest invoices
export async function fetchLatestInvoices(): Promise<
  {
    id: string
    name: string
    image_url: string
    email: string
    amount: string
  }[]
> {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        id,
        customer_id,
        amount,
        date,
        status
        `
      )
      .order("date", { ascending: false })
      .limit(5)

    if (error) throw error

    const latestInvoices = await Promise.all(
      data.map(async invoice => {
        // Fetch the corresponding customer for each invoice from the database
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("name, image_url, email")
          .eq("id", invoice.customer_id)
          .single()

        if (customerError || !customerData) {
          throw new Error(
            `Customer not found for customer_id: ${invoice.customer_id}`
          )
        }

        return {
          id: invoice.customer_id, // Using customer_id as the ID
          name: customerData.name,
          image_url: customerData.image_url,
          email: customerData.email,
          amount: formatCurrency(invoice.amount) // Format the amount
        }
      })
    )

    return latestInvoices
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch the latest invoices.")
  }
}
// Fetch card data
export async function fetchCardData() {
  try {
    const [invoiceCount, customerCount, { data, error }] = await Promise.all([
      supabase.from("invoices").select("id", { count: "exact" }),
      supabase.from("customers").select("id", { count: "exact" }),
      supabase.from("invoices").select("status, amount")
    ])

    if (error) {
      console.error("Error fetching data:", error)
      throw new Error("Failed to fetch invoice status.")
    }

    // Perform aggregation in JavaScript
    const invoiceStatus = data.reduce(
      (acc, invoice) => {
        if (invoice.status === InvoiceStatus.paid) {
          acc.paid += invoice.amount
        } else if (invoice.status === InvoiceStatus.pending) {
          acc.pending += invoice.amount
        }
        return acc
      },
      { paid: 0, pending: 0 }
    )

    return {
      numberOfCustomers: customerCount.count || 0,
      numberOfInvoices: invoiceCount.count || 0,
      totalPaidInvoices: formatCurrency(invoiceStatus.paid || 0),
      totalPendingInvoices: formatCurrency(invoiceStatus.pending || 0)
    }
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch card data.")
  }
}

export async function fetchFilteredInvoices(
  query: string = "",
  currentPage: number
): Promise<
  {
    id: string
    name: string
    image_url: string
    email: string
    amount: number
    date: string
    status: InvoiceStatus
  }[]
> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  try {
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select(
        `
        id,
        customer_id,
        amount,
        date,
        status
      `
      )
      .ilike("status", `%${query}%`)
      .order("date", { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    if (error) throw error

    const filteredInvoices = await Promise.all(
      invoices.map(async invoice => {
        // Fetch the corresponding customer for each invoice from the database
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("name, image_url, email")
          .eq("id", invoice.customer_id)
          .single()

        if (customerError || !customerData) {
          throw new Error(
            `Customer not found for customer_id: ${invoice.customer_id}`
          )
        }

        return {
          id: invoice.id,
          status: invoice.status,
          date: invoice.date,
          name: customerData.name,
          image_url: customerData.image_url,
          email: customerData.email,
          amount: invoice.amount // Directly using the amount from the invoice
        }
      })
    )

    return filteredInvoices
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch filtered invoices.")
  }
}

// Fetch invoices pages
export async function fetchInvoicesPages(query: string) {
  try {
    const { count, error } = await supabase
      .from("invoices")
      .select("id", { count: "exact" })
      .ilike("status", `%${query}%`)

    if (error) throw error

    return Math.ceil((count || 0) / ITEMS_PER_PAGE)
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch total number of invoices.")
  }
}

// // Fetch invoice by ID
export async function fetchInvoiceById(id: string) {
  try {
    const { data } = await supabase
      .from("invoices")
      .select("id, customer_id, amount, status")
      .eq("id", id)

    return data?.[0] || null
  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Failed to fetch invoice.")
  }
}

// // Fetch customers
export async function fetchCustomers() {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name")
      .order("name", { ascending: true })

    if (error) throw error

    return data || []
  } catch (err) {
    console.error("Database Error:", err)
    throw new Error("Failed to fetch all customers.")
  }
}

// // Fetch filtered customers
// export async function fetchFilteredCustomers(query: string) {
//   try {
//     const { data, error } = await supabase
//       .from("customers")
//       .select(
//         `
//         id,
//         name,
//         email,
//         image_url,
//         total_invoices:count(invoices.id),
//         total_pending:sum(case when invoices.status = 'pending' then invoices.amount else 0 end),
//         total_paid:sum(case when invoices.status = 'paid' then invoices.amount else 0 end)
//         `
//       )
//       .ilike("name", `%${query}%`)
//       .or(`email.ilike.%${query}%`)
//       .group("id, name, email, image_url")
//       .order("name", { ascending: true })

//     if (error) throw error

//     return (
//       data?.map(customer => ({
//         ...customer,
//         total_pending: formatCurrency(customer.total_pending || 0),
//         total_paid: formatCurrency(customer.total_paid || 0)
//       })) || []
//     )
//   } catch (err) {
//     console.error("Database Error:", err)
//     throw new Error("Failed to fetch customer table.")
//   }
