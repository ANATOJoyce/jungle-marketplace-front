import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";
import { useState, useMemo } from "react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  AreaChart, Area, ComposedChart, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ZAxis
} from "recharts";
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Calendar, Activity } from "lucide-react";

// ---------------------------
// Typage
// ---------------------------
interface CustomerStat {
  name: string;
  totalSpent: number;
  totalOrders: number;
  lastOrderDate?: string;
}

interface OrderStat {
  display_id: number;
  customer_id?: { name: string };
  total: number;
  createdAt: string;
  status: string;
}

interface ProductStat {
  title: string;
  price: number;
  totalStock: number;
  createdAt: string;
  store: { name: string };
}

interface LoaderData {
  customers: {
    totalCustomers: number;
    totalSpent: number;
    avgSpent: number;
    customers: CustomerStat[];
  };
  orders: OrderStat[];
  products: ProductStat[];
  error?: string;
}

// ---------------------------
// Loader
// ---------------------------
export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = params.storeId;

  if (!token) return redirect("/login");
  if (!storeId) throw new Response("Boutique introuvable", { status: 404 });

  try {
    const headers = { Authorization: `Bearer ${token}` };

    const [customersRes, ordersRes, productsRes] = await Promise.all([
      fetch(`${process.env.NEST_API_URL}/stats/customers/${storeId}`, { headers }),
      fetch(`${process.env.NEST_API_URL}/stats/orders/${storeId}`, { headers }),
      fetch(`${process.env.NEST_API_URL}/stats/products/${storeId}`, { headers }),
    ]);

    const customersData = customersRes.ok ? await customersRes.json() : null;
    const ordersData = ordersRes.ok ? await ordersRes.json() : null;
    const productsData = productsRes.ok ? await productsRes.json() : null;

    return json({
      customers: customersData?.data || { totalCustomers: 0, totalSpent: 0, avgSpent: 0, customers: [] },
      orders: ordersData?.data || [],
      products: productsData?.data || [],
    });
  } catch (err) {
    return json({
      customers: { totalCustomers: 0, totalSpent: 0, avgSpent: 0, customers: [] },
      orders: [],
      products: [],
      error: "Erreur de connexion au serveur.",
    });
  }
}

// ---------------------------
// Composant
// ---------------------------
export default function DashboardPage() {
  const { customers, orders, products, error } = useLoaderData<LoaderData>();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [activeTab, setActiveTab] = useState<"overview" | "customers" | "orders">("overview");

  if (error) return <div className="p-6 text-orange-600">{error}</div>;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleDateString("fr-FR") : "-";

  // Filtrer les commandes par période
  const filteredOrders = useMemo(() => {
    if (timeRange === "all") return orders;
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return orders.filter(o => new Date(o.createdAt) >= cutoff);
  }, [orders, timeRange]);

  // Calculs des revenus et métriques
  const totalRevenue = useMemo(() => 
    filteredOrders.reduce((sum, o) => sum + o.total, 0), 
    [filteredOrders]
  );

  const avgOrderValue = useMemo(() => 
    filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
    [totalRevenue, filteredOrders]
  );

  // Évolution temporelle des commandes
  const timeSeriesData = useMemo(() => {
    const grouped = filteredOrders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.revenue += order.total;
        existing.orders += 1;
        existing.avgOrder = existing.revenue / existing.orders;
      } else {
        acc.push({ date, revenue: order.total, orders: 1, avgOrder: order.total });
      }
      return acc;
    }, [] as { date: string; revenue: number; orders: number; avgOrder: number }[]);
    
    return grouped.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredOrders]);

  // Analyse des statuts de commande
  const orderStatusData = useMemo(() => {
    const statusCount = filteredOrders.reduce((acc, order) => {
      if (!acc[order.status]) {
        acc[order.status] = { name: order.status, value: 0, revenue: 0 };
      }
      acc[order.status].value += 1;
      acc[order.status].revenue += order.total;
      return acc;
    }, {} as Record<string, { name: string; value: number; revenue: number }>);
    
    return Object.values(statusCount);
  }, [filteredOrders]);

  // Segmentation clients par valeur
  const customerSegments = useMemo(() => {
    const segments = [
      { name: "VIP (>100k)", min: 100000, max: Infinity, count: 0, revenue: 0 },
      { name: "Premium (50-100k)", min: 50000, max: 100000, count: 0, revenue: 0 },
      { name: "Standard (20-50k)", min: 20000, max: 50000, count: 0, revenue: 0 },
      { name: "Nouveau (<20k)", min: 0, max: 20000, count: 0, revenue: 0 },
    ];
    
    customers.customers.forEach(c => {
      const segment = segments.find(s => c.totalSpent >= s.min && c.totalSpent < s.max);
      if (segment) {
        segment.count++;
        segment.revenue += c.totalSpent;
      }
    });
    
    return segments.filter(s => s.count > 0);
  }, [customers.customers]);

  // Top 15 clients
  const topCustomers = useMemo(() => {
    return [...customers.customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 15)
      .map(c => ({
        name: c.name.length > 20 ? c.name.substring(0, 20) + "..." : c.name,
        spent: c.totalSpent,
        orders: c.totalOrders,
        avgPerOrder: c.totalOrders > 0 ? c.totalSpent / c.totalOrders : 0,
      }));
  }, [customers.customers]);

  // Distribution de la fréquence d'achat
  const orderFrequencyData = useMemo(() => {
    const freq = [
      { range: "1 cmd", min: 1, max: 1, count: 0 },
      { range: "2-3 cmd", min: 2, max: 3, count: 0 },
      { range: "4-5 cmd", min: 4, max: 5, count: 0 },
      { range: "6-10 cmd", min: 6, max: 10, count: 0 },
      { range: ">10 cmd", min: 11, max: Infinity, count: 0 },
    ];
    
    customers.customers.forEach(c => {
      const range = freq.find(f => c.totalOrders >= f.min && c.totalOrders <= f.max);
      if (range) range.count++;
    });
    
    return freq.filter(f => f.count > 0);
  }, [customers.customers]);

  // Analyse des produits par boutique
  const storeProductData = useMemo(() => {
    const storeStats = products.reduce((acc, p) => {
      const storeName = p.store.name;
      if (!acc[storeName]) {
        acc[storeName] = { name: storeName, products: 0, totalStock: 0, totalValue: 0 };
      }
      acc[storeName].products++;
      acc[storeName].totalStock += p.totalStock;
      acc[storeName].totalValue += p.price * p.totalStock;
      return acc;
    }, {} as Record<string, { name: string; products: number; totalStock: number; totalValue: number }>);
    
    return Object.values(storeStats).sort((a, b) => b.totalValue - a.totalValue);
  }, [products]);

  // Distribution des prix produits
  const priceDistribution = useMemo(() => {
    const ranges = [
      { name: "<10k", min: 0, max: 10000, count: 0, value: 0 },
      { name: "10-25k", min: 10000, max: 25000, count: 0, value: 0 },
      { name: "25-50k", min: 25000, max: 50000, count: 0, value: 0 },
      { name: "50-100k", min: 50000, max: 100000, count: 0, value: 0 },
      { name: ">100k", min: 100000, max: Infinity, count: 0, value: 0 },
    ];
    
    products.forEach(p => {
      const range = ranges.find(r => p.price >= r.min && p.price < r.max);
      if (range) {
        range.count++;
        range.value += p.price * p.totalStock;
      }
    });
    
    return ranges.filter(r => r.count > 0);
  }, [products]);

  // Corrélation clients : dépenses vs commandes
  const customerCorrelation = useMemo(() => {
    return customers.customers.slice(0, 30).map(c => ({
      name: c.name.substring(0, 8),
      orders: c.totalOrders,
      spent: Math.round(c.totalSpent / 1000),
      avgOrder: c.totalOrders > 0 ? Math.round(c.totalSpent / c.totalOrders / 1000) : 0,
    }));
  }, [customers.customers]);

  // Radar des métriques principales
  const radarMetrics = useMemo(() => {
    const maxRevenue = Math.max(...timeSeriesData.map(d => d.revenue), 1);
    const maxOrders = Math.max(...timeSeriesData.map(d => d.orders), 1);
    
    return [
      { metric: "Revenus", value: (totalRevenue / maxRevenue) * 100 },
      { metric: "Commandes", value: (filteredOrders.length / maxOrders) * 100 },
      { metric: "Clients", value: (customers.totalCustomers / Math.max(customers.totalCustomers, 1)) * 100 },
      { metric: "Panier moyen", value: (avgOrderValue / (maxRevenue / maxOrders || 1)) * 100 },
      { metric: "Taux conversion", value: filteredOrders.length > 0 ? (filteredOrders.length / customers.totalCustomers) * 100 : 0 },
    ];
  }, [timeSeriesData, totalRevenue, filteredOrders, customers, avgOrderValue]);

  // Tendances hebdomadaires
  const weeklyTrend = useMemo(() => {
    if (timeSeriesData.length < 14) return { revenue: 0, orders: 0 };
    const recent = timeSeriesData.slice(-7);
    const previous = timeSeriesData.slice(-14, -7);
    
    const recentRevenue = recent.reduce((sum, d) => sum + d.revenue, 0);
    const previousRevenue = previous.reduce((sum, d) => sum + d.revenue, 0);
    const recentOrders = recent.reduce((sum, d) => sum + d.orders, 0);
    const previousOrders = previous.reduce((sum, d) => sum + d.orders, 0);
    
    return {
      revenue: previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
      orders: previousOrders > 0 ? ((recentOrders - previousOrders) / previousOrders) * 100 : 0,
    };
  }, [timeSeriesData]);

  // Activité récente (dernières commandes)
  const recentActivity = useMemo(() => {
    return [...filteredOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [filteredOrders]);

  const COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5", "#6b7280", "#9ca3af", "#d1d5db"];

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble multi-boutiques</p>
        </div>
        <div className="flex gap-2 bg-white rounded-xl shadow-sm p-1 border border-gray-200">
          {(["7d", "30d", "90d", "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === range 
                  ? "bg-orange-500 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {range === "all" ? "Tout" : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-100 font-medium">Revenus</p>
            <DollarSign className="w-8 h-8 text-orange-200" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          <div className="flex items-center mt-2 text-sm">
            {weeklyTrend.revenue >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span>{Math.abs(weeklyTrend.revenue).toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-100 font-medium">Commandes</p>
            <ShoppingCart className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-2xl font-bold">{filteredOrders.length}</p>
          <div className="flex items-center mt-2 text-sm">
            {weeklyTrend.orders >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            <span>{Math.abs(weeklyTrend.orders).toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-100 font-medium">Clients</p>
            <Users className="w-8 h-8 text-orange-200" />
          </div>
          <p className="text-2xl font-bold">{customers.totalCustomers}</p>
          <p className="text-sm text-orange-100 mt-2">Total: {formatCurrency(customers.totalSpent)}</p>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-100 font-medium">Panier moyen</p>
            <Activity className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</p>
          <p className="text-sm text-gray-100 mt-2">Moy: {formatCurrency(customers.avgSpent)}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-100 font-medium">Dernière activité</p>
            <Calendar className="w-8 h-8 text-orange-200" />
          </div>
          <p className="text-xl font-bold">
            {recentActivity.length > 0 ? formatDate(recentActivity[0].createdAt) : "Aucune"}
          </p>
          <p className="text-sm text-orange-100 mt-2">{recentActivity.length} cmd récentes</p>
        </div>
      </div>

      {/* Navigation des vues */}
      <div className="flex gap-2 bg-white rounded-xl shadow-sm p-1 border border-gray-200">
        {(["overview", "customers", "orders"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab 
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab === "overview" ? "Vue d'ensemble" : tab === "customers" ? "Clients" : "Commandes"}
          </button>
        ))}
      </div>

      {/* Vue d'ensemble */}
      {activeTab === "overview" && (
        <>
          {/* Graphique principal : évolution temporelle */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Évolution des performances</h2>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#f97316" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: any, name: string) => {
                    if (name === "Revenus" || name === "Panier moyen") return formatCurrency(Number(value));
                    return value;
                  }}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="revenue" fill="url(#colorRevenue)" stroke="#f97316" strokeWidth={3} name="Revenus" />
                <Bar yAxisId="right" dataKey="orders" fill="#6b7280" name="Commandes" radius={[8, 8, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="avgOrder" stroke="#fb923c" strokeWidth={2} dot={{ r: 4 }} name="Panier moyen" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Grille 3 colonnes : analyses clés */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Statuts des commandes */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Statuts des commandes</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {orderStatusData.map((stat, i) => (
                  <div key={i} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span className="font-medium text-gray-700">{stat.name}</span>
                    <span className="text-gray-600">{formatCurrency(stat.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribution des prix */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Prix des produits</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={priceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip formatter={(value: any) => value + " produits"} />
                  <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} name="Produits" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-gray-600">
                <p>Valeur totale du stock: {formatCurrency(products.reduce((sum, p) => sum + (p.price * p.totalStock), 0))}</p>
              </div>
            </div>

            {/* Radar des métriques */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Performance globale</h2>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarMetrics}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="metric" fontSize={11} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Score" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top clients et corrélation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 15 clients */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Top 15 Clients</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {topCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-orange-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.orders} commandes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{formatCurrency(customer.spent)}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(customer.avgPerOrder)}/cmd</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corrélation dépenses vs commandes */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Dépenses vs Commandes</h2>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={customerCorrelation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="orders" 
                    name="Commandes" 
                    label={{ value: 'Nombre de commandes', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis 
                    dataKey="spent" 
                    name="Dépenses (k)" 
                    label={{ value: 'Dépenses (k XOF)', angle: -90, position: 'insideLeft' }} 
                  />
                  <ZAxis dataKey="avgOrder" range={[50, 500]} name="Moyenne/commande" />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === "spent") return `${value}k XOF`;
                      if (name === "avgOrder") return `${value}k XOF`;
                      return value;
                    }}
                  />
                  <Scatter name="Clients" data={customerCorrelation} fill="#f97316">
                    {customerCorrelation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Taille des bulles = panier moyen (plus gros = panier moyen plus élevé)
              </p>
            </div>
          </div>

          {/* Produits par boutique */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Analyse par boutique</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storeProductData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value: any, name: string) => {
                  if (name === "Valeur stock") return formatCurrency(Number(value));
                  return value;
                }} />
                <Legend />
                <Bar dataKey="products" fill="#f97316" name="Produits" />
                <Bar dataKey="totalStock" fill="#fb923c" name="Stock total" />
                <Bar dataKey="totalValue" fill="#6b7280" name="Valeur stock" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Vue Clients */}
      {activeTab === "customers" && (
        <>
          {/* Segmentation et fréquence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Segments clients */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Segmentation par valeur</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerSegments} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" fill="#f97316" radius={[0, 8, 8, 0]} name="Revenus">
                    {customerSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {customerSegments.map((seg, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700">{seg.name}</p>
                    <p className="text-xs text-gray-500">{seg.count} clients • {formatCurrency(seg.revenue / seg.count)}/client</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fréquence d'achat */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Fréquence d'achat</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderFrequencyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, percent }) => `${range} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {orderFrequencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-sm text-gray-600">
                <p>Clients fidèles (≥5 cmd): {orderFrequencyData.filter(f => f.min >= 4).reduce((sum, f) => sum + f.count, 0)}</p>
                <p>Nouveaux clients (1 cmd): {orderFrequencyData.find(f => f.range === "1 cmd")?.count || 0}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Vue Commandes */}
      {activeTab === "orders" && (
        <>
          {/* Statistiques détaillées des commandes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Évolution du panier moyen */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Évolution du panier moyen</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgOrder" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2 }}
                    name="Panier moyen"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Répartition temporelle */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Répartition par jour</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === "Revenus") return formatCurrency(Number(value));
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#f97316" name="Revenus" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="orders" fill="#6b7280" name="Commandes" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Détails des commandes récentes et analyse avancée */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commandes récentes */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Commandes récentes</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivity.map((order, index) => (
                  <div key={order.display_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        order.status === 'completed' ? 'bg-orange-500' :
                        order.status === 'pending' ? 'bg-gray-400' :
                        order.status === 'cancelled' ? 'bg-gray-600' : 'bg-orange-400'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-800">Commande #{order.display_id}</p>
                        <p className="text-xs text-gray-500">
                          {order.customer_id?.name || 'Client inconnu'} • {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-gray-500 capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucune commande récente</p>
                  </div>
                )}
              </div>
            </div>

            {/* Analyse des statuts détaillée */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Performance des statuts</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value: any, name: string) => {
                    if (name === "Revenus") return formatCurrency(Number(value));
                    return value;
                  }} />
                  <Legend />
                  <Bar dataKey="value" fill="#f97316" name="Nombre" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="revenue" fill="#6b7280" name="Revenus" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {orderStatusData.map((stat, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm text-gray-700">{stat.name}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                        {stat.value} cmd
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{formatCurrency(stat.revenue)}</p>
                    <p className="text-xs text-gray-400">
                      {stat.value > 0 ? formatCurrency(stat.revenue / stat.value) : 0}/cmd
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Heatmap des performances temporelles */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Performance temporelle détaillée</h2>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === "Revenus" || name === "Panier moyen") return formatCurrency(Number(value));
                    return value;
                  }}
                />
                <Legend />
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="revenue" 
                  fill="url(#colorRevenue2)" 
                  stroke="#f97316" 
                  strokeWidth={2} 
                  name="Revenus" 
                />
                <Bar 
                  yAxisId="right" 
                  dataKey="orders" 
                  fill="#6b7280" 
                  name="Commandes" 
                  radius={[8, 8, 0, 0]} 
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="avgOrder" 
                  stroke="#fb923c" 
                  strokeWidth={3} 
                  dot={{ r: 4 }} 
                  name="Panier moyen" 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Pied de page avec résumé */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-500">Période analysée</p>
            <p className="text-lg font-semibold text-gray-800">
              {timeRange === 'all' ? 'Toute période' : `Derniers ${timeRange === '7d' ? '7 jours' : timeRange === '30d' ? '30 jours' : '90 jours'}`}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Taux de conversion</p>
            <p className="text-lg font-semibold text-orange-600">
              {customers.totalCustomers > 0 ? ((filteredOrders.length / customers.totalCustomers) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Valeur client moyenne</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrency(customers.totalCustomers > 0 ? customers.totalSpent / customers.totalCustomers : 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}