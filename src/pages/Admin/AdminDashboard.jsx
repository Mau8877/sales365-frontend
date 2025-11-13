import React from "react";
import RoleGuard from "@/components/RoleGuard";
import authService from "@/services/auth";
import { motion } from "framer-motion";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BsGraphUp,
  BsCalendarCheck,
  BsCalendarDate,
  BsCashCoin,
} from "react-icons/bs";

// --- Tus Datos Estáticos (los dejamos por ahora) ---
const salesData = [
  { name: "Ene", ventas: 4000 }, { name: "Feb", ventas: 3000 },
  { name: "Mar", ventas: 5000 }, { name: "Abr", ventas: 4500 },
  { name: "May", ventas: 6000 }, { name: "Jun", ventas: 5500 },
  { name: "Jul", ventas: 7000 }, { name: "Ago", ventas: 6500 },
  { name: "Sep", ventas: 7200 }, { name: "Oct", ventas: 8000 },
  { name: "Nov", ventas: 7500 }, { name: "Dic", ventas: 9000 },
];

const topProductsData = [
  { name: "Producto A", vendidos: 400 }, { name: "Producto B", vendidos: 300 },
  { name: "Producto C", vendidos: 200 }, { name: "Producto D", vendidos: 150 },
  { name: "Producto E", vendidos: 100 },
];

const recentSalesData = [
  { id: "V-1005", cliente: "Ana Torres", total: 150.0, estado: "Completado" },
  { id: "V-1004", cliente: "Carlos Ruiz", total: 80.5, estado: "Completado" },
  { id: "V-1003", cliente: "Luisa Mendoza", total: 220.0, estado: "Pendiente" },
  { id: "V-1002", cliente: "Javier Gómez", total: 45.0, estado: "Completado" },
  { id: "V-1001", cliente: "Sofía Castro", total: 300.0, estado: "Cancelado" },
];
// ----------------------------------------

// --- Tu Componente KpiCard (sin cambios) ---
const KpiCard = ({ title, value, icon, iconBgClass, iconColorClass, custom }) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      willChange: 'transform, opacity'
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: i * 0.12,
        duration: 0.5 
      },
    }),
  };

  return (
    <motion.div
      variants={cardVariants}
      custom={custom}
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${iconBgClass}`}>
          {React.cloneElement(icon, { className: `text-2xl ${iconColorClass}` })}
        </div>
      </div>
    </motion.div>
  );
};


const AdminDashboard = () => {
  const currentUser = authService.getCurrentUser();

  const getStatusClass = (estado) => {
    switch (estado) {
      case "Completado": return "bg-green-100 text-green-800";
      case "Pendiente": return "bg-yellow-100 text-yellow-800";
      case "Cancelado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      willChange: 'transform, opacity'
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: i * 0.12,
        duration: 0.5 
      },
    }),
  };

  return (
    // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
    // He quitado 'p-6', 'min-h-screen', 'bg-gray-50' y 'text-gray-900'.
    // Ahora este <div> es transparente y deja que el Layout (padre)
    // controle el fondo y el padding.
    <motion.div 
      className="space-y-6" 
      initial="hidden" 
      animate="visible"
    >

      {/* --- KPIs (Usando datos estáticos) --- */}
      <RoleGuard allowedRoles={["admin", "Admin", "superAdmin", "vendedor"]}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title="Ventas de Hoy" 
            value="$1,450" 
            icon={<BsCalendarCheck />} 
            iconBgClass="bg-blue-100"
            iconColorClass="text-blue-600"
            custom={0} 
          />
          <KpiCard 
            title="Ventas del Mes" 
            value="$28,720" 
            icon={<BsCalendarDate />} 
            iconBgClass="bg-green-100"
            iconColorClass="text-green-600"
            custom={1} 
          />
          <KpiCard 
            title="Ventas del Año" 
            value="$310,900" 
            icon={<BsGraphUp />} 
            iconBgClass="bg-indigo-100"
            iconColorClass="text-indigo-600"
            custom={2} 
          />
          <KpiCard 
            title="Ticket Promedio" 
            value="$112.50" 
            icon={<BsCashCoin />} 
            iconBgClass="bg-yellow-100"
            iconColorClass="text-yellow-600"
            custom={3} 
          />
        </div>
      </RoleGuard>

      {/* --- Gráficos (Usando datos estáticos) --- */}
      <RoleGuard allowedRoles={["admin", "Admin", "superAdmin", "vendedor"]}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div
            variants={cardVariants}
            custom={4}
            className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de Ventas Anuales
            </h3>
            <div className="w-full min-h-[300px]">
              <ResponsiveContainer width="100%" aspect={2}>
                <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="ventas" stroke="#4f46e5" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            custom={5}
            className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Productos Más Vendidos
            </h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" width={80} stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px' }} />
                  <Bar dataKey="vendidos" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </RoleGuard>

      {/* --- Tabla (Usando datos estáticos) --- */}
      <RoleGuard allowedRoles={["admin", "Admin", "superAdmin", "vendedor"]}>
        <motion.div
          variants={cardVariants}
          custom={6}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ventas Recientes
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Venta</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSalesData.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.cliente}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sale.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(sale.estado)}`}>
                        {sale.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </RoleGuard>
    </motion.div>
  );
};

export default AdminDashboard;