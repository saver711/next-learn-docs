"use server"

import { parseFormData } from "@k1eu/typed-formdata"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { supabase } from "./supabase"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export type State = {
  errors?: {
    customerId?: string[]
    amount?: string[]
    status?: string[]
  }
  message?: string | null
}

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer."
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    invalid_type_error: "Please select an invoice status."
  }),
  date: z.string()
})

const CreateInvoice = FormSchema.omit({ id: true, date: true })

type InvoicePayload = {
  customerId: string
  amount: string
  status: string
}

export async function createInvoice(_prevState: State, formData: FormData) {
  const typedFormData = parseFormData<InvoicePayload>(formData)
  const rawFormData = Object.fromEntries(
    typedFormData.entries()
  ) as InvoicePayload

  const validatedFields = CreateInvoice.safeParse({
    customerId: rawFormData.customerId,
    amount: rawFormData.amount,
    status: rawFormData.status
  })
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to Create Invoice."
    }
  }

  const { customerId, amount, status } = validatedFields.data
  const amountInCents = amount * 100
  const date = new Date().toISOString().split("T")[0]
  try {
    const { error } = await supabase.from("invoices").insert([
      {
        customer_id: customerId,
        amount: amountInCents,
        status: status,
        date: date
      }
    ])

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    throw new Error(error as string)
    // return {
    //   message: 'Database Error: Failed to Create Invoice.',
    // };
  }
  revalidatePath("/dashboard/invoices")

  redirect("/dashboard/invoices")
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true })

export async function updateInvoice(
  id: string,
  _prevState: State,
  formData: FormData
) {
  const typedFormData = parseFormData<InvoicePayload>(formData)
  const rawFormData = Object.fromEntries(
    typedFormData.entries()
  ) as InvoicePayload

  const validatedFields = UpdateInvoice.safeParse({
    customerId: rawFormData.customerId,
    amount: rawFormData.amount,
    status: rawFormData.status
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Failed to Create Invoice."
    }
  }

  const { customerId, amount, status } = validatedFields.data
  const amountInCents = amount * 100

  const { error } = await supabase
    .from("invoices")
    .update({
      customer_id: customerId,
      amount: amountInCents,
      status: status
    })
    .eq("id", id)
  if (error) {
    console.error("Error inserting invoice:", error)
    throw new Error("Failed to insert invoice.")
  }

  revalidatePath("/dashboard/invoices")

  redirect("/dashboard/invoices")
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase.from("invoices").delete().eq("id", id)

  if (error) {
    console.error("Error deleting invoice:", error)
    throw new Error("Failed to delete invoice.")
  }

  revalidatePath("/dashboard/invoices")
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData)
  } catch (error) {
    // https://authjs.dev/reference/core/errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials."
        default:
          return "Something went wrong."
      }
    }
    throw error
  }
}
