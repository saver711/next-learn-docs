import { fetchRevenue } from "@/app/lib/data"
import { CalendarIcon } from "@heroicons/react/24/outline"
import RevenueChart from "./revenue-chart"

export default async function Revenue() {
  const revenue = await fetchRevenue()

  if (!revenue || revenue.length === 0) {
    return <p className="mt-4 text-gray-400">No data available.</p>
  }

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`font-lusitana mb-4 text-xl md:text-2xl`}>Year Revenue</h2>

      <div className="rounded-xl bg-gray-50 p-4 mb-4">
        <div className="flex items-center pb-2 pt-6">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">First 5 months</h3>
        </div>
      </div>

      <RevenueChart revenue={revenue} />
    </div>
  )
}
