// components/Navbar.tsx
'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  UsersRound,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Settings,
  ChevronRight,
  ArrowLeftToLine,
  BarChart3,
  Shield,
  Crown,
  UserCog,
  Calendar,
  FileText,
  MessageSquare,
  Image,
  Video,
  Bell,
  HelpCircle,
  Library,
  Home
} from 'lucide-react';
import { FaChurch } from 'react-icons/fa';
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import NewUser from './modals/nuevoUser';
import { createUser } from '../lib/crud';


interface CustomJwtPayload {
  userId: string;
  name: string;
  rol: string;
  nameChurch?: string;
  logoChurch?: string;
  [key: string]: any;
}

type UserRole = 'ROOT' |'SUPER_ADMIN' | 'ADMIN' | 'USER';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState<CustomJwtPayload | null>(null);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleCreateUser = async (data: any) => {
    await createUser(data);
  };

  // Obtener datos del usuario desde el token
  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (token) {
      try {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        setUserData(decoded);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Reiniciar error de imagen cuando cambian los datos del usuario
  useEffect(() => {
    setImageError(false);
  }, [userData?.logoChurch]);

  // Definir todas las rutas del sistema
  const navItems = [
    { 
      id: 'Inicio', 
      label: 'Dashboard', 
      icon: BarChart3, 
      href: '/dashboard',
      paths: ['/dashboard'] 
    },
    { 
      id: 'members', 
      label: 'Miembros', 
      icon: Users, 
      href: '/members',
      paths: ['/members', '/members/[id]', '/members/new'] 
    },
    { 
      id: 'finance', 
      label: 'Finanzas', 
      icon: DollarSign, 
      href: '/finance',
      paths: ['/finance', '/finance/reports', '/finance/transactions'] 
    },
    { 
      id: 'courses', 
      label: 'Cursos', 
      icon: BookOpen, 
      href: '/courses',
      paths: ['/courses', '/courses/[id]', '/courses/new'] 
    },
    { 
      id: 'families', 
      label: 'Familias', 
      icon: UsersRound, 
      href: '/families',
      paths: ['/families', '/families/[id]'] 
    },
    { 
      id: 'events', 
      label: 'Eventos', 
      icon: Calendar, 
      href: '/events',
      paths: ['/events', '/events/[id]', '/events/calendar'] 
    }
  ];

  // Función para determinar si un item está activo
  const isItemActive = (itemPaths: string[]) => {
    if (!pathname) return false;
    return itemPaths.some(path => {
      // Para rutas dinámicas como /members/[id]
      if (path.includes('[id]')) {
        const basePath = path.split('/[')[0];
        return pathname.startsWith(basePath + '/') && pathname !== basePath;
      }
      // Para rutas exactas
      return pathname === path || pathname.startsWith(path + '/');
    });
  };

  // Encontrar el item activo actual
  const getActiveItem = () => {
    for (const item of navItems) {
      if (isItemActive(item.paths)) {
        return item.id;
      }
    }
    return navItems[0].id; // Default
  };

  const activeSection = getActiveItem();

  // Constantes con valores por defecto
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  const DEFAULT_CHURCH_NAME = 'Iglesia Cristiana';
  const DEFAULT_USER_NAME = 'Usuario';
  const DEFAULT_USER_ROLE = 'USER';

  // Valores seguros con manejo de null/undefined/vacío
  const hasValidLogo = userData?.logoChurch?.trim() && !imageError;
  const churchLogo = hasValidLogo ? userData!.logoChurch! : FALLBACK_IMAGE;
  const churchName = userData?.nameChurch?.trim() ? userData.nameChurch : DEFAULT_CHURCH_NAME;
  const userName = userData?.name?.trim() ? userData.name : DEFAULT_USER_NAME;
  const userRole = (userData?.rol?.trim() as UserRole) || DEFAULT_USER_ROLE;
  const userInitial = userName.charAt(0).toUpperCase();

  // Icono según rol
  const getRoleIcon = () => {
    switch(userRole) {
      case 'ROOT': return Settings;
      case 'SUPER_ADMIN': return Crown;
      case 'ADMIN': return Shield;
      default: return UserCog;
    }
  };
  const RoleIcon = getRoleIcon();

  // Color según rol
  const getRoleColor = () => {
    switch(userRole) {
      case 'ROOT': return 'from-blue-600 to-blue-800';
      case 'SUPER_ADMIN': return 'from-blue-600 to-blue-800';
      case 'ADMIN': return 'from-blue-500 to-blue-700';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  // Efectos para scroll y click fuera
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.navbar-element')) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleNewSystemUser = () => {
    setOpen(true);
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const handleSettings = () => {
    console.log('Abriendo configuración...');
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const handleGoToHome = () => {
    router.push('/home');
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    Cookies.remove('auth_token');
    router.push('/');
    setIsProfileOpen(false);
    setIsMenuOpen(false);
  };

  interface ProfileOption {
    label: string;
    icon: React.ComponentType<any>;
    onClick: () => void;
    color: string;
    bgColor: string;
    iconColor: string;
    showForRoles: UserRole[];
  }

  const profileOptions: ProfileOption[] = [
    {
      label: 'Volver al Inicio',
      icon: ArrowLeftToLine,
      onClick: handleGoToHome,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      showForRoles: ['SUPER_ADMIN', 'ROOT']
    },
    {
      label: 'Nuevo Usuario',
      icon: PlusCircle,
      onClick: handleNewSystemUser,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      showForRoles: ['ROOT','SUPER_ADMIN', 'ADMIN']
    },
    {
      label: 'Configuración',
      icon: Settings,
      onClick: handleSettings,
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      showForRoles: ['ROOT','SUPER_ADMIN', 'ADMIN']
    }
  ];

  // Animaciones
  const navbarVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1
      }
    }
  };

  const menuVariants: Variants = {
    hidden: { x: "-100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      x: "-100%",
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const profileVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  // Componente para el logo de la iglesia
  const ChurchLogo = () => {
    if (hasValidLogo) {
      return (
        <img 
          src={churchLogo}
          alt={churchName}
          className="w-full h-full object-cover rounded-lg"
          onError={handleImageError}
        />
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
        <FaChurch className="text-white text-2xl" />
      </div>
    );
  };

  const filteredProfileOptions = profileOptions.filter(option => 
    option.showForRoles.includes(userRole)
  );

  return (
    <>
      <NewUser
        isOpen={open}
        onClose={() => setOpen(false)} 
        onCreateUser={handleCreateUser}
      />
      
      {/* Navbar Principal */}
      <motion.nav
        initial="hidden"
        animate="visible"
        variants={navbarVariants}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white shadow-md border-b border-blue-100' 
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo y Nombre */}
            <div className="flex items-center space-x-3 navbar-element">
              {/* Botón Menú Móvil */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                aria-label="Menú"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.button>
              
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center space-x-3 no-underline">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm overflow-hidden"
                >
                  <ChurchLogo />
                </motion.div>
                
                {/* Nombre de la Iglesia */}
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-blue-900 truncate max-w-xs">
                    {churchName}
                  </h1>
                  <p className="text-blue-600 text-xs">Administración</p>
                </div>
              </Link>
            </div>

            {/* Navegación Desktop - Solo items principales */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, i) => {
                const isActive = isItemActive(item.paths);
                return (
                  <Link 
                    key={item.id} 
                    href={item.href}
                    className="no-underline"
                  >
                    <motion.div
                      custom={i}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
                        isActive 
                          ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-md' 
                          : 'text-blue-700 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon size={18} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="navIndicator"
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/80 rounded-full"
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Controles Derecha */}
            <div className="flex items-center">
              {/* Perfil */}
              <div className="relative navbar-element">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center p-1.5 rounded-lg hover:bg-blue-50 navbar-element"
                  aria-label="Perfil de usuario"
                >
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getRoleColor()} flex items-center justify-center shadow-sm`}>
                    <span className="text-white font-bold text-sm">{userInitial}</span>
                  </div>
                </motion.button>

                {/* Dropdown Perfil */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      variants={profileVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-blue-100 z-50"
                    >
                      {/* Header del Perfil */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor()} flex items-center justify-center shadow-sm`}>
                            <span className="text-white font-bold">{userInitial}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-blue-900 font-bold text-sm truncate" title={userName}>
                              {userName}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <p className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-medium capitalize" title={userRole}>
                                {userRole.toLowerCase().replace('_', ' ')}
                              </p>
                              <RoleIcon size={12} className="text-blue-600" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Opciones del Perfil */}
                      <div className="p-2">
                        {filteredProfileOptions.map((option) => (
                          <motion.button
                            key={option.label}
                            whileHover={{ x: 4 }}
                            onClick={option.onClick}
                            className={`flex items-center w-full p-3 ${option.color} hover:bg-blue-50 rounded-lg transition-colors mb-1`}
                          >
                            <div className={`w-8 h-8 rounded-lg ${option.bgColor} flex items-center justify-center mr-3`}>
                              <option.icon size={16} className={option.iconColor} />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-sm">{option.label}</p>
                            </div>
                            <ChevronRight size={16} className="ml-auto text-blue-400" />
                          </motion.button>
                        ))}

                        {/* Separador */}
                        <div className="my-2 px-3">
                          <div className="h-px bg-blue-100"></div>
                        </div>

                        {/* Logout */}
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={handleLogout}
                          className="flex items-center w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mr-3">
                            <LogOut size={16} className="text-red-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-sm">Cerrar Sesión</p>
                          </div>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Menú Móvil - Sidebar Lateral */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            
            {/* Sidebar Lateral */}
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl border-r border-blue-100"
            >
              {/* Header Sidebar */}
              <div className="p-5 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-blue-900">Navegación</h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-blue-100 text-blue-700"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                
                {/* Información de la iglesia en móvil */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm overflow-hidden">
                    <ChurchLogo />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-900 truncate max-w-[180px]">
                      {churchName}
                    </h3>
                    <p className="text-blue-600 text-xs">Administración</p>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 font-medium capitalize">
                      {userRole.toLowerCase().replace('_', ' ')}
                      <RoleIcon size={10} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Navegación Móvil - Todos los items */}
              <div className="p-4 overflow-y-auto h-[calc(100vh-160px)]">
                <div className="space-y-1 mb-6">
                  {navItems.map((item, i) => {
                    const isActive = isItemActive(item.paths);
                    
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="no-underline"
                      >
                        <motion.div
                          custom={i}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                            isActive 
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                              : 'text-blue-700 hover:bg-blue-50'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-white/20' : 'bg-blue-100'
                          }`}>
                            <item.icon size={18} className={isActive ? 'text-white' : 'text-blue-600'} />
                          </div>
                          <span className="font-medium text-sm">{item.label}</span>
                          {isActive && (
                            <ChevronRight size={16} className="ml-auto text-white" />
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Espacio para navbar fijo */}
      <div className="h-16"></div>
    </>
  );
}