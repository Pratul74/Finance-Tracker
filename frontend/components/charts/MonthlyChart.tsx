"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function MonthlyChart() {
  const { data = [] } = useQuery({
    queryKey: ["monthly"],
    queryFn: async () => {
      const res = await api.get("/records/monthly/");
      return res.data;
    },
  });

  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="income" />
      <Line type="monotone" dataKey="expense" />
    </LineChart>
  );
}