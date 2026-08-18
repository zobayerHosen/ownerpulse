import React from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AttendanceChart = ({ counts = { present: 0, late: 0, callout: 0 } }) => {
  const chartData = [
    { name: "Present", value: counts.present || 0, color: "#059669" },
    { name: "Late", value: counts.late || 0, color: "#D97706" },
    { name: "Call-out", value: counts.callout || 0, color: "#DC2626" },
  ];

  return (
    <Card className="bg-white border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Clock size={16} /> Today's Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-45">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11 }} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} width={80} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;
