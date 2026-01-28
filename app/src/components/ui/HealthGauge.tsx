"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface HealthGaugeProps {
    value: number; // Health factor (e.g., 1.5)
    max?: number;
}

export function HealthGauge({ value, max = 3 }: HealthGaugeProps) {
    // Cap value for visual purposes
    const cappedValue = Math.min(value, max);
    // Calculate percentage (1.0 is danger zone start)
    const normalized = (cappedValue / max) * 100;

    const data = [
        { name: "Health", value: normalized },
        { name: "Empty", value: 100 - normalized },
    ];

    const getColor = (val: number) => {
        if (val < 1.1) return "#ef4444"; // Red
        if (val < 1.5) return "#f59e0b"; // Orange
        return "#22c55e"; // Green
    };

    const color = getColor(value);

    return (
        <div className="relative w-full h-[120px] flex items-end justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                    >
                        <Cell key="health" fill={color} stroke="none" />
                        <Cell key="empty" fill="#22222e" stroke="none" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-0 text-center pb-2">
                <p className="text-3xl font-bold stat-value" style={{ color }}>
                    {value === Infinity ? "∞" : value.toFixed(2)}
                </p>
                <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider">
                    Health Factor
                </p>
            </div>
        </div>
    );
}
