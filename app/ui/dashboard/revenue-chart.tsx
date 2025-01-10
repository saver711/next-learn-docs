"use client"
import { Revenue } from "@/app/lib/definitions"
import {
  BarElement,
  CategoryScale,
  Chart,
  ChartData,
  LinearScale,
  Tooltip
} from "chart.js"
import { Bar } from "react-chartjs-2"

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip)

export default function RevenueChart({ revenue }: { revenue: Revenue[] }) {
  const labels = revenue.map(item => item.month)
  const data = revenue.map(item => item.revenue)

  const chartData: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Revenue",
        data,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        barThickness: 20
      }
    ]
  }

  return (
    <div className="w-full md:col-span-4">
      <div className="rounded-xl bg-gray-50 p-4 shadow">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            scales: {
              y: {
                ticks: {
                  callback: value => value
                }
              }
            }
          }}
        />
      </div>
    </div>
  )
}
