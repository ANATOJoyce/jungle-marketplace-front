import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Données pour les graphiques
const salesData = [
  { name: "Jan", revenue: 420000, transactions: 890015 },
  { name: "Fév", revenue: 380000, transactions: 750000 },
  { name: "Mar", revenue: 520000, transactions: 930000 },
  { name: "Avr", revenue: 470000, transactions: 820000 },
  { name: "Mai", revenue: 610000, transactions: 1120000 },
  { name: "Jun", revenue: 580000, transactions: 980000 },
  { name: "Jul", revenue: 690000, transactions: 1290000 },
  { name: "Aoû", revenue: 720000, transactions: 1350000 },
  { name: "Sep", revenue: 650000, transactions: 1180000 },
  { name: "Oct", revenue: 590000, transactions: 1050000 },
  { name: "Nov", revenue: 480000, transactions: 890000 }
];

const productData = [
  { name: "Produit A", ventes: 320, profit: 45000 },
  { name: "Produit B", ventes: 290, profit: 38000 },
  { name: "Produit C", ventes: 180, profit: 22000 },
  { name: "Produit D", ventes: 150, profit: 18000 },
  { name: "Produit E", ventes: 120, profit: 15000 }
];

const categoryData = [
  { name: "Électronique", value: 35, color: "#f59e0b" },
  { name: "Vêtements", value: 25, color: "#3b82f6" },
  { name: "Maison", value: 20, color: "#10b981" },
  { name: "Sports", value: 12, color: "#f97316" },
  { name: "Autres", value: 8, color: "#6b7280" }
];

const recentActivities = [
  { id: 1, action: "Nouvelle commande", user: "Client A", time: "Il y a 2 min", amount: "1,250 FCFA" },
  { id: 2, action: "Paiement reçu", user: "Client B", time: "Il y a 5 min", amount: "890 FCFA" },
  { id: 3, action: "Produit ajouté", user: "Admin", time: "Il y a 12 min", amount: "1500 FCFA" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Tableau de bord pour aujourd'hui</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-orange-100 text-sm">Solde Total</p>
                <h3 className="text-2xl font-bold">100 000 FCFA</h3>
              </div>
              <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                +12.5%
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-orange-100 text-sm">Solde Engagé: 80 000 le mois dernier</span>
            </div>
          </div>

          {/* Total Income */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-6 rounded-2xl text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-300 text-sm">Revenus Totaux</p>
                <h3 className="text-2xl font-bold">180 000 FCFA</h3>
              </div>
              <div className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                +8.3%
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-300 text-sm">Solde Engagé: 563,000 FCFA le mois dernier</span>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-600 text-sm">Utilisateurs Actifs</p>
                <h3 className="text-2xl font-bold text-gray-900">10,980</h3>
              </div>
              <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{value: 75}, {value: 25}]}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={30}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                    >
                      <Cell fill="#f59e0b" />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="text-center">
              <span className="text-gray-500 text-sm">75% d'activité</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Overview */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Aperçu des Ventes</h2>
                <p className="text-gray-600 text-sm">Dernières ventes de tous les temps</p>
              </div>
              <div className="flex space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <span>Revenus</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  <span>Transactions</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `€${value.toLocaleString()}` : value.toLocaleString(),
                  name === 'revenue' ? 'Revenus' : 'Transactions'
                ]} />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="transactions" stroke="#6b7280" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Product Sales */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Ventes par Produit</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'profit' ? `FCFA${value.toLocaleString()}` : value,
                  name === 'profit' ? 'Profit' : 'Ventes'
                ]} />
                <Bar dataKey="ventes" fill="#3b82f6" />
                <Bar dataKey="profit" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Répartition par Catégorie</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Activités Récentes</h2>
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm text-gray-600">David Williams et 20+ autres</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.user} • {activity.time}</p>
                    </div>
                  </div>
                  {activity.amount && (
                    <div className={`font-semibold ${
                      activity.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {activity.amount}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors">
                Voir Toutes les Activités
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}