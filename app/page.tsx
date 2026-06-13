"use client";

import { useMemo } from "react";
import { Package, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { StockChart } from "@/components/dashboard/stock-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import { LowStockAlert } from "@/components/dashboard/low-stock-alert";
import { useDashboard, formatCurrency } from "@/lib/api";

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  const metrics = useMemo(() => {
    if (!data) {
      return {
        totalProducts: 0,
        lowStockCount: 0,
        lowStockProducts: [],
        totalStock: 0,
        todayRevenue: 0,
        totalRevenue: 0,
      };
    }

    return {
      totalProducts: data.summary.total_products,
      lowStockCount: data.summary.low_stock_count,
      lowStockProducts: data.low_stock_products || [],
      totalStock: data.summary.stock_in - data.summary.stock_out,
      todayRevenue: data.summary.today_revenue,
      totalRevenue: data.summary.total_revenue,
    };
  }, [data]);

  // Generate chart data for sales
  const salesChartData = useMemo(() => {
    if (!data?.sales_data) return [];
    return data.sales_data.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: parseFloat(item.revenue) || 0,
    }));
  }, [data?.sales_data]);

  // Generate chart data for stock movements
  const stockChartData = useMemo(() => {
    if (!data?.stock_data) return [];
    return data.stock_data.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      type: item.type,
      quantity: item.quantity,
    }));
  }, [data?.stock_data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your inventory and sales</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex gap-2">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{metrics.totalProducts}</div>
                <p className="text-xs text-muted-foreground">{metrics.totalStock} units in stock</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex gap-2">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
              </div>
            ) : (
              <>
                <div className={`text-2xl font-bold ${metrics.lowStockCount > 0 ? "text-destructive" : "text-foreground"}`}>
                  {metrics.lowStockCount}
                </div>
                <p className="text-xs text-muted-foreground">Products need restocking</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex gap-2">
                <div className="h-8 w-16 animate-pulse rounded-lg bg-muted" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.todayRevenue)}</div>
                <p className="text-xs text-muted-foreground">From sales today</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex gap-2">
                <div className="h-8 w-16 animate-pulse rounded-lg bg-muted" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart salesData={salesChartData} isLoading={isLoading} />
        <StockChart stockData={stockChartData} isLoading={isLoading} />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentSales sales={data?.recent_sales || []} isLoading={isLoading} />
        <LowStockAlert products={metrics.lowStockProducts} isLoading={isLoading} />
      </div>
    </div>
  );
}
