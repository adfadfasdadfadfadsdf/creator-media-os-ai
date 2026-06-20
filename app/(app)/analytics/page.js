"use client"

import { Eye, Clock, ThumbsUp, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Sparkline } from "@/components/ui/charts"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const kpis = [
  { label: "Total Views", value: "1.24M", delta: "12.4%", up: true, icon: Eye, color: "#8b5cf6", spark: [20, 35, 30, 45, 40, 55, 60] },
  { label: "Watch Time", value: "48.2K hrs", delta: "8.1%", up: true, icon: Clock, color: "#3b82f6", spark: [30, 28, 40, 38, 50, 48, 60] },
  { label: "Avg. Engagement", value: "8.6%", delta: "2.3%", up: false, icon: ThumbsUp, color: "#f59e0b", spark: [50, 48, 52, 45, 47, 42, 40] },
  { label: "New Subscribers", value: "12.9K", delta: "15.3%", up: true, icon: Users, color: "#10b981", spark: [18, 25, 30, 35, 42, 50, 58] },
]

const chartData = [
  { label: "Mon", value: 820 },
  { label: "Tue", value: 1140 },
  { label: "Wed", value: 980 },
  { label: "Thu", value: 1420 },
  { label: "Fri", value: 1680 },
  { label: "Sat", value: 1520 },
  { label: "Sun", value: 1890 },
]

const top = [
  { title: "How I Edit 10x Faster", views: "204K", ctr: "6.2%", trend: "up" },
  { title: "5 Hooks That Convert", views: "182K", ctr: "5.4%", trend: "up" },
  { title: "Studio Tour 2026", views: "96K", ctr: "3.1%", trend: "down" },
  { title: "AI Workflow Breakdown", views: "84K", ctr: "4.8%", trend: "up" },
]

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Track performance across all your channels in real time." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, delta, up, icon: Icon, color, spark }) => (
          <Card key={label} className="group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}1f`, color }}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-emerald-500" : "text-red-500"}`}>
                  {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {delta}
                </span>
              </div>
              <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
              <p className="mt-1 font-display text-2xl font-extrabold text-foreground">{value}</p>
              <div className="mt-3">
                <Sparkline data={spark} color={color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Views this week</CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart data={chartData} color="#8b5cf6" yTicks={["2K", "1.5K", "1K", "500", "0"]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top performing</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top.map((t) => (
                  <TableRow key={t.title}>
                    <TableCell>
                      <p className="font-semibold text-foreground">{t.title}</p>
                      <Badge variant={t.trend === "up" ? "success" : "danger"} className="mt-1">
                        CTR {t.ctr}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">{t.views}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
