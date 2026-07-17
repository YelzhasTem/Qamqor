"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ProjectStatusChart({ data }: { data: { name: string; value: number }[] }) {
  return <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8e3" /><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} /><Tooltip cursor={{ fill: "#f0fdf4" }} contentStyle={{ borderRadius: 12, borderColor: "#dcfce7", fontSize: 12 }} /><Bar dataKey="value" name="Проекты" fill="#16A34A" radius={[8, 8, 0, 0]} maxBarSize={52} /></BarChart></ResponsiveContainer></div>;
}
