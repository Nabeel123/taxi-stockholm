"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import type { DailySeriesPoint } from "@/services/analytics";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function TripsBarChart({ data, height = 220 }: { data: readonly DailySeriesPoint[]; height?: number }) {
  const { options, series } = useMemo(() => {
    const opts: ApexOptions = {
      chart: { type: "bar", fontFamily: "Outfit, sans-serif", toolbar: { show: false } },
      colors: ["#a855f7"],
      plotOptions: { bar: { borderRadius: 3, columnWidth: "50%", borderRadiusApplication: "end" } },
      dataLabels: { enabled: false },
      grid: { borderColor: "rgba(148,163,184,0.15)", strokeDashArray: 4, xaxis: { lines: { show: false } } },
      xaxis: {
        type: "datetime",
        categories: data.map((d) => d.date),
        labels: { style: { colors: "#94a3b8" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { labels: { style: { colors: "#94a3b8" }, formatter: (v: number) => String(Math.round(v)) } },
      tooltip: { x: { format: "dd MMM yyyy" }, y: { formatter: (v: number) => `${v} trips` } },
    };
    return {
      options: opts,
      series: [{ name: "Trips", data: data.map((d) => d.trips) }],
    };
  }, [data]);
  return <Chart options={options} series={series} type="bar" height={height} />;
}
