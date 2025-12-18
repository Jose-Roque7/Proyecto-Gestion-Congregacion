'use client'
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Church,
  Target,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  UsersRound,
  CalendarDays,
  UserCheck,
  BookOpen,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { jwtDecode } from 'jwt-decode';
import Cookies from "js-cookie";
import { FaChurch } from "react-icons/fa";

interface CustomJwtPayload {
  userId: string;
  name: string;
  rol: string;
  nameChurch?: string;
  logoChurch?: string;
  [key: string]: any;
}

// Tipos
interface DashboardData {
  totalMembers: number;
  baptized: number;
  newMembers: number;
  retentionRate: number;
  growthRate: number;
  genderRatio: { male: number; female: number };
  ageGroups: Array<{ group: string; count: number; color: string }>;
  monthlyGrowth: Array<{ month: string; members: number; }>;
  recentEvents: Array<{ title: string; date: string; type: string; icon: any }>;
}

// Datos iniciales con colores azules
const initialData: DashboardData = {
  totalMembers: 1245,
  baptized: 890,
  newMembers: 48,
  retentionRate: 94.2,
  growthRate: 12,
  genderRatio: { male: 620, female: 625 },
  ageGroups: [
    { group: '0-18', count: 330, color: '#60A5FA' },
    { group: '19-35', count: 400, color: '#3B82F6' },
    { group: '36-60', count: 350, color: '#2563EB' },
    { group: '60+', count: 165, color: '#1D4ED8' }
  ],
  monthlyGrowth: [
    { month: 'May', members: 50 },
    { month: 'Jun', members: 100 },
    { month: 'Jul', members: 200 },
    { month: 'Ago', members: 300 },
    { month: 'Sep', members: 400 },
    { month: 'Oct', members: 1000 },
    { month: 'Nov', members: 1500 }
  ],
  recentEvents: [
    { title: 'Cumpleaño de la iglesia', date: '13 Nov', type: 'Fiesta', icon: Church },
    { title: 'Cena del Señor', date: '18 Nov', type: 'Comunión', icon: BookOpen },
    { title: 'Conferencia Jóvenes', date: '22 Nov', type: 'Conferencia', icon: UsersRound },
    { title: 'Noche de Oración', date: '25 Nov', type: 'Oración', icon: Heart }
  ]
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [userData, setUserData] = useState<CustomJwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoError, setLogoError] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    
    // Verificar el tipo de navegación
    const navigationType = sessionStorage.getItem('lastNavigationType');
    // Mostrar loader solo si es 'hard' (recarga o desde login)
    const shouldShowLoader = navigationType === 'hard';
    setShowLoader(shouldShowLoader);
    
    // Siempre marcar como 'hard' para futuras recargas
    sessionStorage.setItem('lastNavigationType', 'hard');
  }, []);

  useEffect(() => {
    // Cargar datos
    const loadData = async () => {
      
      try {
        // Cargar datos del usuario
        const token = Cookies.get('auth_token');
        if (token) {
          try {
            const decoded = jwtDecode<CustomJwtPayload>(token);
            setUserData(decoded);
            console.log('📊 Dashboard Page - User data loaded');
          } catch (error) {
            console.error('Error decoding token:', error);
          }
        }

        // Simular tiempo de carga
        if (showLoader) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setData(initialData);
        setIsLoading(false);
        
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setData(initialData);
        setIsLoading(false);
      }
    };

    loadData();
  }, [showLoader]);

  // Efecto para resetear el error del logo
  useEffect(() => {
    setLogoError(false);
  }, [userData?.logoChurch]);

  // Colores para gráficos en tonos azules
  const COLORS = ['#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'];

  // Mostrar loader completo para HARD navigation (recarga o primera carga)
  if (isLoading && showLoader) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col justify-center items-center z-50">
        {/* Logo o título de la aplicación */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            {userData?.nameChurch ? (
              <h1 className="text-3xl font-bold text-blue-900">{userData.nameChurch}</h1>
            ) : (
              <h1 className="text-3xl font-bold text-blue-900">Bienvenido</h1>
            )}
          </div>
          {userData?.name && (
            <p className="text-gray-600">Hola, {userData.name}</p>
          )}
          <p className="text-gray-600 mt-2">Cargando...</p>
        </div>

        {/* Spinner principal */}
        <div className="relative">
          {/* Spinner exterior */}
          <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
          {/* Spinner interior animado */}
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Indicador de progreso */}
        <div className="mt-8 w-64">
          <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
          <div className="mt-2 text-center">
            <span className="text-sm text-blue-600 font-medium">
              {userData ? 'Cargando datos...' : 'Inicializando...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Si está cargando pero NO debe mostrar loader (navegación interna)
  if (isLoading && !showLoader) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-12">
          {/* Skeleton rápido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-blue-100 p-5 md:p-6">
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-4 md:mb-5">
                    <div className="p-3 rounded-xl bg-blue-50">
                      <div className="w-6 h-6 md:w-7 md:h-7 bg-blue-200 rounded"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-5 w-20 bg-blue-100 rounded-full"></div>
                    </div>
                  </div>
                  <div>
                    <div className="h-4 w-24 bg-blue-100 rounded mb-2"></div>
                    <div className="h-8 w-16 bg-blue-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Si no hay datos todavía, mostrar algo
  if (!data) {
    return null;
  }

  // Cards principales con colores azules
  const statsCards = [
    {
      title: "Miembros Totales",
      value: data.totalMembers.toLocaleString(),
      icon: Users,
      change: `+${data.growthRate}% este año`,
      color: "from-blue-500 to-blue-600",
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50"
    },
    {
      title: "Bautizados",
      value: data.baptized.toLocaleString(),
      icon: Church,
      change: `${Math.round((data.baptized / data.totalMembers) * 100)}% de la congregación`,
      color: "from-blue-600 to-blue-700",
      iconColor: "text-blue-700",
      iconBg: "bg-blue-100"
    },
    {
      title: "Nuevos Miembros",
      value: data.newMembers.toString(),
      icon: UserCheck,
      change: "este mes",
      color: "from-blue-400 to-blue-500",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50"
    },
    {
      title: "Retención",
      value: `${data.retentionRate}%`,
      icon: Target,
      change: "+2.1% vs año pasado",
      color: "from-cyan-500 to-blue-500",
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-50"
    }
  ];

  // Determinar delays de animación basados en si vino con loader o no
  const getAnimationDelay = (baseDelay: number) => {
    return showLoader ? baseDelay : baseDelay * 0.3; // Más rápido si no vino con loader
  };

  // Cuando todo esté cargado, mostrar la página completa
  console.log('📊 Dashboard Page - Rendering FULL DASHBOARD');
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-12">

        {/* Hero Centrado con Imagen Oscurecida */}
        <div className="relative hidden md:block rounded-b-2xl w-full min-h-[70vh] md:min-h-[80vh] overflow-hidden mb-6 md:mb-8 pt-40 md:pt-15">

          {/* Imagen oscurecida */}
          <div className="absolute inset-0">
            <img
              src="dashboard.jpg"
              alt="Iglesia"
              className="w-full h-full object-cover brightness-75 "
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          {/* Contenido completamente centrado */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">

            {/* Todo centrado en columna */}
            <div className="max-w-3xl mx-auto py-0 md:space-y-8">

              {/* Logo centrado - Oculto en móvil - CORREGIDO */}
              <div className="block">
                <div
                  className="w-20 h-20 md:w-24 md:h-24 mx-auto select-none"
                  style={{ userSelect: 'none' }}
                >
                  {userData?.logoChurch && !logoError ? (
                    <img
                      src={userData.logoChurch}
                      alt="Logo de la iglesia"
                      className="w-full h-full object-contain rounded-full select-none"
                      onError={() => setLogoError(true)}
                      style={{ userSelect: 'none' }}
                    />
                  ) : (
                    <FaChurch
                      className="w-full h-full text-white p-2 select-none"
                      style={{ userSelect: 'none' }}
                    />
                  )}
                </div>
              </div>

              {/* Título centrado - Más pequeño en móvil */}
              <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-white">
                {userData?.nameChurch || 'Congregación'}
              </h1>

              {/* Saludo centrado - Oculto en móvil */}
              {userData?.name && (
                <p className="text-white/90 text-lg md:text-2xl hidden md:block">
                  Bienvenido, {userData.name}
                </p>
              )}

              {/* Stats centrados en línea - Más compactos en móvil */}
              <div className="flex justify-center gap-6 md:gap-16 pt-2 md:pt-4">
                <div className="text-center">
                  <div className="text-white text-2xl md:text-5xl lg:text-6xl font-bold">
                    {data.totalMembers.toLocaleString()}
                  </div>
                  <div className="text-white/80 text-sm md:text-xl">
                    Miembros
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-white text-2xl md:text-5xl lg:text-6xl font-bold">
                    {data.recentEvents.length}
                  </div>
                  <div className="text-white/80 text-sm md:text-xl">
                    Eventos
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Cards de Estadísticas - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: getAnimationDelay(0.3) }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: getAnimationDelay(0.4 + index * 0.1) }}
              whileHover={{ y: -4 }}
              className="group bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between mb-4 md:mb-5">
                  <div className={`p-3 rounded-xl ${stat.iconBg} transition-transform group-hover:scale-110`}>
                    <stat.icon className={`w-6 h-6 md:w-7 md:h-7 ${stat.iconColor}`} />
                  </div>
                  <div className="text-right">
                    <span className="text-xs md:text-sm font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm md:text-base font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl md:text-3xl font-bold text-blue-900">
                    {stat.value}
                  </p>
                </div>
              </div>
              {/* Barra inferior con gradiente */}
              <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: getAnimationDelay(0.2) }}
          className="text-center mb-8 md:mb-12"
        >
          {/* Indicadores rápidos - Versión móvil mejorada */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: getAnimationDelay(0.3) }}
            className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 sm:mt-6 md:mt-8"
          >
            {/* Card simple - Género */}
            <div className="flex-1 bg-white rounded-lg border border-blue-100 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <UsersRound className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-blue-900">
                    Género
                  </span>
                </div>
                <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                  Balance
                </span>
              </div>

              <div className="space-y-2">
                {/* Barra mujeres */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-pink-600 font-medium">Mujeres</span>
                    <span className="text-blue-900 font-bold">{data.genderRatio.female.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{
                        width: `${(data.genderRatio.female / (data.genderRatio.female + data.genderRatio.male)) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Barra hombres */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-blue-600 font-medium">Hombres</span>
                    <span className="text-blue-900 font-bold">{data.genderRatio.male.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(data.genderRatio.male / (data.genderRatio.female + data.genderRatio.male)) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="pt-2 border-t border-blue-100">
                  <div className="text-center">
                    <span className="text-xs text-blue-500">
                      Total: <span className="font-bold text-blue-700">{(data.genderRatio.female + data.genderRatio.male).toLocaleString()}</span> miembros
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card simple - Eventos */}
            <div className="flex-1 bg-white rounded-lg border border-blue-100 p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <span className="text-sm sm:text-base font-medium text-blue-900">
                    Eventos
                  </span>
                </div>
                <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                  {data.recentEvents.length}
                </span>
              </div>

              <div className="space-y-3">
                {/* Próximo evento */}
                {data.recentEvents.length > 0 ? (
                  <>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-xs font-medium text-blue-900 truncate">
                              Próximo evento
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-blue-800 truncate">
                            {data.recentEvents[0]?.title}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">{data.recentEvents[0]?.date}</p>
                        </div>
                        <div className="ml-2">
                          <div className="text-xs font-medium text-white bg-blue-600 px-2 py-1 rounded-full">
                            {data.recentEvents[0]?.type}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contador de próximos */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600">
                        Próximos {Math.max(0, data.recentEvents.length - 1)} eventos
                      </span>
                      <ChevronRight className="w-4 h-4 text-blue-400" />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-blue-300 mb-2">
                      <CalendarDays className="w-8 h-8 mx-auto" />
                    </div>
                    <p className="text-sm text-blue-500">Sin eventos</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Sección de Gráficos - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">

          {/* Gráfico de Barras - Crecimiento */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: getAnimationDelay(0.5) }}
            className="bg-white rounded-lg sm:rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mx-1 sm:mx-0"
          >
            <div className="p-3 sm:p-4 md:p-6">
              {/* Header responsivo */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 md:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 md:p-3 rounded-lg bg-blue-50 flex-shrink-0">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-blue-900 truncate">
                      Crecimiento Mensual
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm truncate">
                      Evolución de la congregación
                    </p>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap self-start sm:self-center">
                  Últimos 7 meses
                </div>
              </div>

              {/* Contenedor del gráfico optimizado para móvil */}
              <div className="h-[180px] xs:h-[200px] sm:h-[220px] md:h-64 lg:h-72 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.monthlyGrowth}
                    margin={{
                      top: 5,
                      right: 2,
                      bottom: window.innerWidth < 320 ? 15 : 20,
                      left: window.innerWidth < 320 ? -10 : 0
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="2 2"
                      stroke="#E5E7EB"
                      vertical={false}
                      strokeOpacity={0.6}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#4B5563',
                        fontSize: window.innerWidth < 320 ? 9 : window.innerWidth < 400 ? 10 : 12,
                        fontWeight: 500
                      }}
                      interval="preserveStartEnd"
                      minTickGap={window.innerWidth < 320 ? 2 : 5}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#4B5563',
                        fontSize: window.innerWidth < 320 ? 9 : window.innerWidth < 400 ? 10 : 11
                      }}
                      width={window.innerWidth < 320 ? 25 : 35}
                      tickFormatter={(value) => {
                        if (window.innerWidth < 320) {
                          return value >= 1000 ? `${Math.round(value / 100)}k` : value;
                        }
                        return value >= 1000 ? `${value / 1000}k` : value;
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} miembros`, 'Total']}
                      labelFormatter={(label) => `Mes: ${label}`}
                      contentStyle={{
                        borderRadius: '6px',
                        border: '1px solid #DBEAFE',
                        background: 'white',
                        padding: window.innerWidth < 320 ? '6px' : '8px',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)',
                        fontSize: window.innerWidth < 320 ? '11px' : '13px',
                        minWidth: window.innerWidth < 320 ? '100px' : '120px'
                      }}
                      labelStyle={{
                        color: '#1E40AF',
                        fontWeight: 600,
                        fontSize: window.innerWidth < 320 ? '11px' : '13px',
                        marginBottom: '4px'
                      }}
                    />
                    <Bar
                      dataKey="members"
                      name="Miembros"
                      radius={[window.innerWidth < 320 ? 2 : 3, window.innerWidth < 320 ? 2 : 3, 0, 0]}
                      fill="#3B82F6"
                      animationBegin={0}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      barSize={window.innerWidth < 320 ? 15 : window.innerWidth < 400 ? 20 : 24}
                    />
                  </BarChart>
                </ResponsiveContainer>

                {/* Indicador para móviles pequeños */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center sm:hidden ">
                  <div className="text-[10px] xs:text-[15px] text-blue-500 font-medium bg-white/80 px-2 py-0.5 rounded-full">
                    Desliza para ver más →
                  </div>
                </div>
              </div>

              {/* Mini leyenda informativa */}
              <div className="mt-2 sm:mt-7 flex items-center justify-center gap-2 text-center">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[15px] xs:text-xs text-blue-700 font-medium">
                    Miembros totales por mes
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Gráfico de Pastel - Distribución por Edad */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: getAnimationDelay(0.6) }}
            className="bg-white rounded-lg sm:rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mx-1 sm:mx-0"
          >
            <div className="p-3 sm:p-4 md:p-6 lg:p-7">
              {/* Header - Stack vertical en móvil pequeño */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 lg:mb-8">
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  <div className="p-1.5 sm:p-2 md:p-3 lg:p-3.5 rounded-lg bg-blue-50 flex-shrink-0">
                    <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-blue-900 truncate">
                      Distribución por Edad
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm md:text-base truncate">
                      Composición demográfica
                    </p>
                  </div>
                </div>
                <div className="text-xs sm:text-sm md:text-base lg:text-lg text-blue-600 bg-blue-50 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-full whitespace-nowrap self-start sm:self-center">
                  Total: {data.totalMembers.toLocaleString()}
                </div>
              </div>

              {/* Gráfico - Altura adaptable */}
              <div className="h-[140px] xs:h-[150px] sm:h-[160px] md:h-[170px] lg:h-[180px] xl:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.ageGroups}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => {
                        const { payload } = props;
                        const percentage = ((payload?.count || 0) / data.totalMembers * 100).toFixed(1);
                        return `${percentage}%`;
                      }}
                      outerRadius="75%"
                      innerRadius="35%"
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {data.ageGroups.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          className="hover:opacity-80 transition-opacity"
                          stroke="#fff"
                          strokeWidth={1.5}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => {
                        const percentage = ((props.payload?.count || 0) / data.totalMembers * 100).toFixed(1);
                        return [
                          <div key="tooltip" className="text-center min-w-[100px]">
                            <div className="font-bold text-blue-900 text-sm">{props.payload?.group}</div>
                            <div className="text-blue-700 font-semibold text-sm">{value.toLocaleString()} personas</div>
                            <div className="text-blue-600 text-xs">{percentage}% del total</div>
                          </div>
                        ];
                      }}
                      contentStyle={{
                        borderRadius: '6px',
                        border: '1px solid #DBEAFE',
                        background: 'white',
                        padding: '8px',
                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.15)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Leyenda - Ajuste responsive */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 mt-3">
                {data.ageGroups.map((group, index) => {
                  const percentage = ((group.count / data.totalMembers) * 100).toFixed(1);
                  return (
                    <div
                      key={group.group}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="text-xs font-medium text-blue-900 truncate">
                          {group.group}
                        </div>
                        <div className="text-[10px] text-blue-600 truncate">
                          {group.count.toLocaleString()} ({percentage}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Información resumen para PC */}
              <div className="hidden lg:flex items-center justify-between mt-4 pt-4 border-t border-blue-100">
                <div className="text-sm text-blue-600">
                  <span className="font-semibold">Mayor grupo:</span> {data.ageGroups.reduce((prev, current) => (prev.count > current.count) ? prev : current).group}
                </div>
                <div className="text-sm text-blue-600">
                  <span className="font-semibold">Menor grupo:</span> {data.ageGroups.reduce((prev, current) => (prev.count < current.count) ? prev : current).group}
                </div>
                <div className="text-sm text-blue-600">
                  <span className="font-semibold">Promedio:</span> {(data.totalMembers / data.ageGroups.length).toFixed(0)} por grupo
                </div>
              </div>

              {/* Información adicional para móviles pequeños */}
              <div className="mt-2 sm:hidden text-center">
                <div className="text-[10px] xs:text-[11px] text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded-full inline-block">
                  👆 Toca cada grupo para más información
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Próximos Eventos - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: getAnimationDelay(0.7) }}
          className="bg-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        >
          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 md:p-3 rounded-lg bg-blue-50">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-blue-900">Próximos Eventos</h3>
                  <p className="text-gray-500 text-sm">Actividades de la congregación</p>
                </div>
              </div>
              <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                {data.recentEvents.length} eventos programados
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {data.recentEvents.map((event, index) => {
                const EventIcon = event.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: getAnimationDelay(0.8 + index * 0.1) }}
                    className="group bg-white border border-blue-100 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-300 p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                        <EventIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                        {event.type}
                      </span>
                    </div>
                    <h4 className="font-semibold text-blue-900 mb-2 line-clamp-2 text-sm md:text-base">
                      {event.title}
                    </h4>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-50">
                      <div className="text-sm font-medium text-blue-800">{event.date}</div>
                      <div className="text-xs text-blue-600">2024</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: getAnimationDelay(1) }}
          className="mt-8 md:mt-12 pt-6 border-t border-blue-100"
        >
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <p className="text-sm text-blue-600 font-medium">
                Sistema en tiempo real • Actualización automática
              </p>
            </div>
            <p className="text-xs text-blue-400">
              © {new Date().getFullYear()} Dashboard de Congregación
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}