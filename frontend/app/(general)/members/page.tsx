'use client'

import { useState, useEffect } from 'react'
import ModalNuevoMiembro from '@/app/components/modals/nuevoMiembro'
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  Briefcase, 
  Image as ImageIcon, 
  Home, 
  IdCard, 
  Save, 
  Droplets,
  Edit,
  Trash2,
  AlertTriangle,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import Cookies from "js-cookie";
import { jwtDecode } from 'jwt-decode'
import { connectToServer, disconnectSocket } from '@/app/lib/socket-client'
import { createMiembro, getMiembros } from '@/app/lib/crud'

interface CustomJwtPayload {
  userId: string;
  name: string;
  rol: string;
  nameChurch?: string;
  logoChurch?: string;
  [key: string]: any;
}

// Definición de tipos
enum UserGene {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
}

// Nuevo enum para el estado de bautismo
enum BautismoEstado {
  BAUTIZADO = 'BAUTIZADO',
  NO_BAUTIZADO = 'NO_BAUTIZADO',
  EN_DISCIPULADO = 'EN_DISCIPULADO',
}

interface Member {
  id: string
  nombres: string
  apellidos: string
  cedula?: string
  img?: string
  genero: UserGene
  iglesia_id?: string
  puesto?: string
  fecha_ingreso?: string
  fecha_nacimiento: string
  direccion?: string
  telefono: string
  estado?: boolean
  bautismoEstado: BautismoEstado
  fecha_bautismo?: string
  familias?: string[]
}

// Función para verificar permisos según el rol
const hasPermission = (userData: CustomJwtPayload | null, requiredRoles: string[]): boolean => {
  if (!userData || !userData.rol) return false;
  return requiredRoles.includes(userData.rol);
};

// Función para obtener permisos específicos
const getPermissions = (userData: CustomJwtPayload | null) => {
  return {
    canView: hasPermission(userData, ['ROOT', 'SUPER_ADMIN', 'ADMIN', 'USER']),
    canCreate: hasPermission(userData, ['ROOT', 'SUPER_ADMIN', 'ADMIN', 'USER']),
    canEdit: hasPermission(userData, ['ROOT', 'SUPER_ADMIN', 'ADMIN']),
    canDelete: hasPermission(userData, ['ROOT', 'SUPER_ADMIN']),
    canViewAdvancedStats: hasPermission(userData, ['ROOT', 'SUPER_ADMIN', 'ADMIN']),
    canViewInactive: hasPermission(userData, ['ROOT', 'SUPER_ADMIN', 'ADMIN']),
  };
};

// Función para calcular edad
const calcularEdad = (fechaNacimiento: string): number => {
  const fechaNac = new Date(fechaNacimiento)
  const hoy = new Date()
  let edad = hoy.getFullYear() - fechaNac.getFullYear()
  const mes = hoy.getMonth() - fechaNac.getMonth()

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--
  }

  return edad
}

// Formateadores
const formatCedula = (cedula?: string) => {
  if (!cedula) return 'No especificada'
  const cleaned = cedula.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 10)}-${cleaned.substring(10)}`
  }
  return cleaned
}

const formatTelefono = (telefono: string) => {
  const cleaned = telefono.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
  }
  return telefono
}

// Función auxiliar para crear fecha sin problemas de zona horaria
const crearFechaLocal = (fecha: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [year, month, day] = fecha.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  return new Date(fecha)
}

const formatFecha = (fecha?: string) => {
  if (!fecha) return 'N/A'
  const date = crearFechaLocal(fecha)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatFechaCorta = (fecha?: string) => {
  if (!fecha) return 'N/A'
  const date = crearFechaLocal(fecha)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  })
}

// Hook personalizado para detectar el tamaño de pantalla
const useScreenSize = (mobileBreakpoint: number = 1025) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [screenWidth, setScreenWidth] = useState<number>(0);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width <= mobileBreakpoint);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [mobileBreakpoint]);

  return { isMobile, screenWidth };
};

// Componente Modal de Editar - MODIFICA ESTE CÓDIGO
const ModalEditarMiembro = ({ 
  open, 
  onClose, 
  member, 
  onSave 
}: { 
  open: boolean; 
  onClose: () => void; 
  member: Member | null; 
  onSave: (data: any) => void 
}) => {
  const [form, setForm] = useState<Member | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cedulaDisplay, setCedulaDisplay] = useState("");
  const [telefonoDisplay, setTelefonoDisplay] = useState("");
  const [showFechaBautismo, setShowFechaBautismo] = useState(false);

  // Inicializar el formulario cuando member cambia
  useEffect(() => {
    if (member) {
      setForm(member);
      setCedulaDisplay(formatCedula(member.cedula).replace('No especificada', ''));
      setTelefonoDisplay(formatTelefono(member.telefono));
      setShowFechaBautismo(member.bautismoEstado === BautismoEstado.BAUTIZADO);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [member]);

  // Limpiar formulario cuando el modal se cierra - SIMPLIFICADO
  useEffect(() => {
  if (open && member) {
    setForm(member);
    setCedulaDisplay(formatCedula(member.cedula).replace('No especificada', ''));
    setTelefonoDisplay(formatTelefono(member.telefono));
    setShowFechaBautismo(member.bautismoEstado === BautismoEstado.BAUTIZADO);
  }
  
  if (!open) {
    // Limpiar inmediatamente sin setTimeout
    setForm(null);
    setCedulaDisplay("");
    setTelefonoDisplay("");
    setErrors({});
    setIsSubmitting(false);
    setShowFechaBautismo(false);
  }
}, [open, member]);

  // Mostrar/ocultar fecha de bautismo según el estado
  useEffect(() => {
    if (form?.bautismoEstado === BautismoEstado.BAUTIZADO) {
      setShowFechaBautismo(true);
    } else {
      setShowFechaBautismo(false);
      setForm(prev => prev ? { ...prev, fecha_bautismo: "" } : null);
    }
  }, [form?.bautismoEstado]);

  // Resto del código permanece igual...
  const formatCedulaDisplay = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 10)}-${numbers.slice(10, 11)}`;
    }
  };

  const formatTelefonoDisplay = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numbersOnly = inputValue.replace(/\D/g, '').slice(0, 11);
    
    setForm(prev => prev ? { ...prev, cedula: numbersOnly } : null);
    setCedulaDisplay(formatCedulaDisplay(numbersOnly));
    
    if (errors.cedula) {
      setErrors(prev => ({ ...prev, cedula: "" }));
    }
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numbersOnly = inputValue.replace(/\D/g, '').slice(0, 10);
    
    setForm(prev => prev ? { ...prev, telefono: numbersOnly } : null);
    setTelefonoDisplay(formatTelefonoDisplay(numbersOnly));
    
    if (errors.telefono) {
      setErrors(prev => ({ ...prev, telefono: "" }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => prev ? { ...prev, [name]: checked } : null);
    } else if (name !== 'cedula' && name !== 'telefono') {
      setForm(prev => prev ? { ...prev, [name]: value } : null);
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    if (!form) return false;
    const newErrors: Record<string, string> = {};

    if (!form.nombres.trim()) newErrors.nombres = "Requerido";
    if (!form.apellidos.trim()) newErrors.apellidos = "Requerido";
    if (!form.fecha_nacimiento) newErrors.fecha_nacimiento = "Requerido";
    if (!form.telefono) {
      newErrors.telefono = "Requerido";
    } else if (!/^\d{10}$/.test(form.telefono)) {
      newErrors.telefono = "Debe tener 10 dígitos";
    }
    
    if (form.cedula && !/^\d{11}$/.test(form.cedula)) {
      newErrors.cedula = "Debe tener 11 dígitos";
    }

    if (!form.genero) newErrors.genero = "Requerido";

    if (form.bautismoEstado === BautismoEstado.BAUTIZADO && !form.fecha_bautismo) {
      newErrors.fecha_bautismo = "Requerida si está bautizado";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !validateForm()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const cleanData = Object.fromEntries(
        Object.entries(form).filter(([_, value]) => value !== "" && value !== null && value !== undefined)
      );
      onSave(cleanData);
      onClose();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Condición de renderizado simplificada - igual que en ModalEliminarMiembro
  if (!open || !form) return null;

  const today = new Date().toISOString().split('T')[0];
  const minBirthDate = new Date();
  minBirthDate.setFullYear(minBirthDate.getFullYear() - 0);
  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 100);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-100 transition-all duration-300"
        onClick={handleClose}
      />
      
      <div className="fixed inset-0 z-101 flex items-center justify-center p-3 sm:p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 border border-gray-200 overflow-hidden max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2.5 rounded-lg">
                  <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Editar Miembro</h2>
                  <p className="text-gray-500 text-sm sm:text-base font-medium">Actualice la información del miembro</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Resto del formulario permanece igual... */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombres <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="nombres"
                    value={form.nombres}
                    onChange={handleChange}
                    className={`w-full border ${errors.nombres ? 'border-red-300' : 'border-gray-200'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base`}
                    placeholder="Juan Carlos"
                  />
                </div>
                {errors.nombres && <p className="text-xs text-red-500 mt-1">{errors.nombres}</p>}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="apellidos"
                    value={form.apellidos}
                    onChange={handleChange}
                    className={`w-full border ${errors.apellidos ? 'border-red-300' : 'border-gray-200'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base`}
                    placeholder="Pérez Gómez"
                  />
                </div>
                {errors.apellidos && <p className="text-xs text-red-500 mt-1">{errors.apellidos}</p>}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Género <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <select
                    name="genero"
                    value={form.genero}
                    onChange={handleChange}
                    className={`w-full border ${errors.genero ? 'border-red-300' : 'border-gray-200'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-8 py-3 text-gray-900 transition-all duration-200 appearance-none bg-white cursor-pointer text-sm sm:text-base`}
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                  </select>
                </div>
                {errors.genero && <p className="text-xs text-red-500 mt-1">{errors.genero}</p>}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <div className="flex items-center h-full">
                  <button
                    type="button"
                    onClick={() => setForm(prev => prev ? { ...prev, estado: !prev.estado } : null)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`relative w-10 h-5 rounded-full transition-colors ${form.estado ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transform transition-transform ${form.estado ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                    <span className={`text-sm font-medium ${form.estado ? 'text-green-700' : 'text-gray-500'}`}>
                      {form.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cédula
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="cedula"
                    value={cedulaDisplay}
                    onChange={handleCedulaChange}
                    className={`w-full border ${errors.cedula ? 'border-red-300' : 'border-gray-200'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-12 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 font-mono text-sm sm:text-base`}
                    placeholder="000-0000000-0"
                    maxLength={13}
                  />
                  {form.cedula && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${form.cedula.length === 11 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                        {form.cedula.length}/11
                      </span>
                    </div>
                  )}
                </div>
                {errors.cedula && <p className="text-xs text-red-500 mt-1">{errors.cedula}</p>}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="telefono"
                    value={telefonoDisplay}
                    onChange={handleTelefonoChange}
                    className={`w-full border ${errors.telefono ? 'border-red-300' : 'border-gray-200'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-12 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 font-mono text-sm sm:text-base`}
                    placeholder="(000) 000-0000"
                    maxLength={14}
                  />
                  {form.telefono && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${form.telefono.length === 10 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                        {form.telefono.length}/10
                      </span>
                    </div>
                  )}
                </div>
                {errors.telefono && <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha Nacimiento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={form.fecha_nacimiento}
                    onChange={handleChange}
                    max={minBirthDate.toISOString().split('T')[0]}
                    min={maxBirthDate.toISOString().split('T')[0]}
                    className={`w-full border ${errors.fecha_nacimiento ? 'border-red-300' : 'border-gray-200'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-3 text-gray-900 transition-all duration-200 text-sm sm:text-base`}
                  />
                </div>
                {errors.fecha_nacimiento && <p className="text-xs text-red-500 mt-1">{errors.fecha_nacimiento}</p>}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Estado de Bautismo
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <select
                    name="bautismoEstado"
                    value={form.bautismoEstado || BautismoEstado.NO_BAUTIZADO}
                    onChange={handleChange}
                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-8 py-3 text-gray-900 transition-all duration-200 appearance-none bg-white cursor-pointer text-sm sm:text-base"
                  >
                    <option value={BautismoEstado.NO_BAUTIZADO}>No bautizado</option>
                    <option value={BautismoEstado.EN_DISCIPULADO}>En discipulado</option>
                    <option value={BautismoEstado.BAUTIZADO}>Bautizado</option>
                  </select>
                </div>
              </div>

              {showFechaBautismo && (
                <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Bautismo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      name="fecha_bautismo"
                      value={form.fecha_bautismo || ''}
                      onChange={handleChange}
                      max={today}
                      className={`w-full border ${errors.fecha_bautismo ? 'border-red-300' : 'border-gray-200'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-3 text-gray-900 transition-all duration-200 text-sm sm:text-base`}
                    />
                  </div>
                  {errors.fecha_bautismo && <p className="text-xs text-red-500 mt-1">{errors.fecha_bautismo}</p>}
                </div>
              )}

              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Puesto / Cargo
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    name="puesto"
                    value={form.puesto || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-8 py-3 text-gray-900 transition-all duration-200 appearance-none bg-white cursor-pointer text-sm sm:text-base"
                  >
                    <option value="" className="text-gray-400">Seleccione...</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Diácono">Diácono</option>
                    <option value="Anciano">Anciano</option>
                    <option value="Líder de Alabanza">Líder de Alabanza</option>
                    <option value="Maestro">Maestro</option>
                    <option value="Miembro">Miembro</option>
                    <option value="Colaborador">Colaborador</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de Ingreso
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    name="fecha_ingreso"
                    value={form.fecha_ingreso || ''}
                    onChange={handleChange}
                    max={today}
                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-3 text-gray-900 transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  URL de Imagen
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    name="img"
                    value={form.img || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-400">
                    <Home className="w-4 h-4" />
                  </div>
                  <textarea
                    name="direccion"
                    value={form.direccion || ''}
                    onChange={handleChange}
                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 resize-none min-h-[80px] text-sm sm:text-base"
                    placeholder="Ingrese dirección completa"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-700 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">ℹ️</span>
                <span>Los campos marcados con <span className="text-red-500">*</span> son obligatorios.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-4 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${isSubmitting ? 'bg-blue-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// Componente Modal de Eliminar
const ModalEliminarMiembro = ({ 
  open, 
  onClose, 
  member, 
  onConfirm 
}: { 
  open: boolean; 
  onClose: () => void; 
  member: Member | null; 
  onConfirm: () => void 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { isMobile } = useScreenSize(768);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      onConfirm();
      onClose();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open || !member) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-100 transition-all duration-300"
        onClick={handleClose}
      />
      
      <div className="fixed inset-0 z-101 flex items-center justify-center p-3 sm:p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 border border-gray-200 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header optimizado para móvil */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
            <div className={`flex items-center justify-between ${isMobile ? 'p-4' : 'p-5 sm:p-6'}`}>
              <div className="flex items-center gap-3">
                <div className="bg-red-50 p-2 rounded-lg">
                  <AlertTriangle className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} text-red-600`} />
                </div>
                <div>
                  <h2 className={`${isMobile ? 'text-lg' : 'text-lg sm:text-xl'} font-bold text-gray-900`}>
                    Eliminar Miembro
                  </h2>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 sm:p-2 rounded-lg transition-all duration-200"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className={isMobile ? 'p-4' : 'p-4 sm:p-6'}>
            {/* Contenido principal optimizado para móvil */}
            <div className="text-center mb-4 sm:mb-6"> 
              <h3 className={`font-bold text-gray-900 mb-2 ${isMobile ? 'text-lg' : 'text-lg'}`}>
                ¿Está seguro de eliminar este miembro?
              </h3>
              
              <p className={`text-gray-600 mb-4 ${isMobile ? 'text-sm' : ''}`}>
                Esta acción no se puede deshacer. El miembro será eliminado permanentemente.
              </p>
              
              {/* Información del miembro - Optimizada para móvil */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                {/* Avatar y nombre en columna para móvil, fila para desktop */}
                <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center justify-center gap-3'} mb-3`}>
                  <div className={`${isMobile ? 'mb-2' : ''} bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ${isMobile ? 'h-12 w-12' : 'h-12 w-12'}`}>
                    <span className="text-white font-bold text-lg">
                      {member.nombres.charAt(0)}{member.apellidos.charAt(0)}
                    </span>
                  </div>
                  <div className={isMobile ? '' : 'text-left'}>
                    <h4 className="font-bold text-gray-900">{member.nombres} {member.apellidos}</h4>
                    <p className="text-sm text-gray-600">{member.puesto || 'Miembro'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones optimizados para móvil */}
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-col sm:flex-row'} gap-3`}>
              <button
                type="button"
                onClick={handleClose}
                className={`px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200 ${isMobile ? 'w-full' : 'flex-1'}`}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isDeleting}
                className={`px-4 py-3 text-sm font-medium text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${isDeleting ? 'bg-red-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} ${isMobile ? 'w-full' : 'flex-1'}`}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Miembro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos responsivos adicionales */}
      <style jsx global>{`
        @media (max-width: 640px) {
          /* Asegurar que el modal no sea demasiado alto en móviles */
          .fixed.inset-0.z-101 > div {
            max-height: 90vh;
            overflow-y: auto;
          }
          
          /* Scroll suave para el contenido del modal */
          .fixed.inset-0.z-101 > div > div:nth-child(2) {
            max-height: calc(90vh - 70px);
            overflow-y: auto;
          }
        }
        
        /* Animación de entrada mejorada */
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .fixed.inset-0.z-101 > div {
          animation: slideUp 0.2s ease-out;
        }
        
        /* Efecto de toque en botones móviles */
        @media (hover: none) and (pointer: coarse) {
          button:active {
            transform: scale(0.98);
            transition: transform 0.1s;
          }
        }
      `}</style>
    </>
  );
};

export default function Members() {
  // Estados
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive' | 'bautizado' | 'no_bautizado' | 'en_discipulado' | 'hombres' | 'mujeres'>('all')
  const { isMobile } = useScreenSize(1025);
  const [userData, setUserData] = useState<CustomJwtPayload | null>(null);
  useEffect(() => {
  const token = Cookies.get('auth_token');

  // 1️⃣ Cargar datos iniciales
  fetchMembers();

  // 2️⃣ Conectar socket si hay token
  if (token) {
    connectToServer(token, setMembers);
  }

  // 3️⃣ Cleanup
  return () => {
    disconnectSocket();
  };
}, []);



  // Obtener permisos basados en el rol del usuario
  const permissions = getPermissions(userData);

  // Form states
  const [formData, setFormData] = useState<Omit<Member, 'id'>>({
    nombres: '',
    apellidos: '',
    cedula: '',
    img: '',
    genero: UserGene.MASCULINO,
    iglesia_id: '',
    puesto: '',
    fecha_ingreso: '',
    fecha_nacimiento: '',
    direccion: '',
    telefono: '',
    estado: true,
    bautismoEstado: BautismoEstado.NO_BAUTIZADO,
    fecha_bautismo: ''
  })

  // Fetch miembros inicial
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
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const mockData: Member[] = await getMiembros();

      setMembers(mockData)
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar miembros
  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      member.nombres.toLowerCase().includes(searchLower) ||
      member.apellidos.toLowerCase().includes(searchLower) ||
      (member.cedula && member.cedula.includes(searchTerm)) ||
      (member.puesto && member.puesto.toLowerCase().includes(searchLower))

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'active' && member.estado) ||
      (activeFilter === 'inactive' && !member.estado) ||
      (activeFilter === 'bautizado' && member.bautismoEstado === BautismoEstado.BAUTIZADO) ||
      (activeFilter === 'no_bautizado' && member.bautismoEstado === BautismoEstado.NO_BAUTIZADO) ||
      (activeFilter === 'en_discipulado' && member.bautismoEstado === BautismoEstado.EN_DISCIPULADO) ||
      (activeFilter === 'hombres' && member.genero === UserGene.MASCULINO) ||
      (activeFilter === 'mujeres' && member.genero === UserGene.FEMENINO)

    return matchesSearch && matchesFilter
  })
  
  // Y modifica la función handleCreate para usar formData:
  const handleCreate = async (data: any) => {
    try {

       await createMiembro(data);
      setShowCreateModal(false);
      resetForm();
      
      // Mostrar mensaje de éxito (opcional)
      toast.success('Miembro creado exitosamente');
    } catch (error) {
      toast.error('Error al crear el miembro');
    }
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member)
    setShowEditModal(true)
  }

  const handleUpdate = async (updatedData: any) => {
    if (!selectedMember) return

    try {
      setMembers(prev => prev.map(member =>
        member.id === selectedMember.id
          ? { ...updatedData, id: member.id }
          : member
      ))

      setShowEditModal(false)
      setSelectedMember(null)
    } catch (error) {
      console.error('Error updating member:', error)
    }
  }

  const handleDelete = (member: Member) => {
    setSelectedMember(member)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedMember) return

    try {
      setMembers(prev => prev.filter(member => member.id !== selectedMember.id))
      setShowDeleteModal(false)
      setSelectedMember(null)
    } catch (error) {
      console.error('Error deleting member:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      cedula: '',
      img: '',
      genero: UserGene.MASCULINO,
      iglesia_id: '',
      puesto: '',
      fecha_ingreso: '',
      fecha_nacimiento: '',
      direccion: '',
      telefono: '',
      estado: true,
      bautismoEstado: BautismoEstado.NO_BAUTIZADO,
      fecha_bautismo: ''
    })
  }

  // Componente de Card para móvil
  const MobileMemberCard = ({ member }: { member: Member }) => {
    const edad = calcularEdad(member.fecha_nacimiento)

    return (
      <div className="bg-white rounded-xl p-3 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {member.nombres.charAt(0)}{member.apellidos.charAt(0)}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${member.estado ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-sm leading-tight">
                {member.nombres} {member.apellidos.split(' ')[0]}
              </h3>
              <p className="text-gray-600 text-xs truncate">{member.puesto || 'Miembro'}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${member.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {member.estado ? 'ACTIVO' : 'INACTIVO'}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${member.bautismoEstado === BautismoEstado.BAUTIZADO ? 'bg-blue-100 text-blue-700' : member.bautismoEstado === BautismoEstado.EN_DISCIPULADO ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
              {member.bautismoEstado === BautismoEstado.BAUTIZADO ? 'BAUTIZADO' : 
               member.bautismoEstado === BautismoEstado.EN_DISCIPULADO ? 'EN DISCIPULADO' : 'NO BAUTIZADO'}
            </span>
          </div>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">CÉDULA</div>
            <div className="text-xs font-mono text-gray-800 truncate">{formatCedula(member.cedula)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">TELÉFONO</div>
            <div className="text-xs font-mono text-gray-800">{formatTelefono(member.telefono)}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">EDAD / GÉNERO</div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">{edad} años</span>
              <span className={`text-xs font-bold ${member.genero === UserGene.MASCULINO ? 'text-blue-600' : 'text-pink-600'}`}>
                {member.genero === UserGene.MASCULINO ? '♂' : '♀'}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">NACIMIENTO</div>
            <div className="text-xs text-gray-800">{formatFechaCorta(member.fecha_nacimiento)}</div>
          </div>
        </div>

        {/* Fechas adicionales */}
        <div className="bg-blue-50 rounded-lg p-2 mb-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">INGRESO</div>
              <div className="text-xs text-gray-800">{formatFechaCorta(member.fecha_ingreso)}</div>
            </div>
            {member.bautismoEstado === BautismoEstado.BAUTIZADO && member.fecha_bautismo && (
              <div>
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">BAUTIZO</div>
                <div className="text-xs text-gray-800">{formatFechaCorta(member.fecha_bautismo)}</div>
              </div>
            )}
          </div>
          {member.direccion && (
            <div className="mt-2 pt-2 border-t border-blue-100">
              <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mb-0.5">DIRECCIÓN</div>
              <div className="text-xs text-gray-800 line-clamp-1">{member.direccion}</div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          {/* Botón Editar - solo para ROOT, SUPER_ADMIN, ADMIN */}
          {permissions.canEdit && (
            <button
              onClick={() => handleEdit(member)}
              className={`bg-blue-600 text-white rounded-lg py-2 text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 ${permissions.canDelete ? 'flex-1' : 'w-full'}`}
            >
              <Edit className="w-3 h-3" />
              Editar
            </button>
          )}
          
          {/* Botón Eliminar - solo para ROOT, SUPER_ADMIN */}
          {permissions.canDelete && (
            <button
              onClick={() => handleDelete(member)}
              className="flex-1 bg-red-600 text-white rounded-lg py-2 text-xs font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Eliminar
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header Compacto y Elegante - FIXED */}
        {!isMobile ? (
          <>
            <div className="bg-white border-b border-gray-200 shadow-sm fixed top-16 left-0 right-0 z-1">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Primera fila: Título y estadísticas */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Gestión de Miembros
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                      Administra los miembros de la congregación
                    </p>
                  </div>

                  {/* Estadísticas compactas */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">{members.length}</span> Total
                      </span>
                    </div>
                    
                    {/* Mostrar estadísticas avanzadas solo para ADMIN o superior */}
                    {permissions.canViewAdvancedStats && (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          <span className="text-sm text-gray-700">
                            <span className="font-semibold">{members.filter(m => m.estado === false).length}</span> Inactivos
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-gray-700">
                            <span className="font-semibold">{members.filter(m => m.bautismoEstado === BautismoEstado.BAUTIZADO).length}</span> Bautizados
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                          <span className="text-sm text-gray-700">
                            <span className="font-semibold">{members.filter(m => m.bautismoEstado === BautismoEstado.NO_BAUTIZADO).length}</span> No bautizados
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                          <span className="text-sm text-gray-700">
                            <span className="font-semibold">{members.filter(m => m.bautismoEstado === BautismoEstado.EN_DISCIPULADO).length}</span> En discipulado
                          </span>
                        </div>
                      </>
                    )}
                    
                    {/* Para USER mostrar solo info básica */}
                    {!permissions.canViewAdvancedStats && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-700">
                          <span className="font-semibold">{members.filter(m => m.bautismoEstado === BautismoEstado.BAUTIZADO).length}</span> Bautizados
                        </span>
                      </div>
                    )}
                    
                    {/* Género siempre visible para todos */}
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">{members.filter(m => m.genero === UserGene.FEMENINO).length}</span> Mujeres
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-sky-500"></div>
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">{members.filter(m => m.genero === UserGene.MASCULINO).length}</span> Hombres
                      </span>
                    </div>
                  </div>
                </div>

                {/* Segunda fila: Búsqueda, filtro y botón */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Búsqueda */}
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar miembros..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border text-gray-800 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filtro y botón lado a lado */}
                  <div className="flex gap-3">
                    <div className="relative min-w-[180px]">
                      <select
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value as any)}
                        className="w-full appearance-none pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                      >
                        <option value="all">Todos los miembros</option>
                        <option value="active">Activos</option>
                        {/* Solo mostrar opción de inactivos para ADMIN o superior */}
                        {permissions.canViewInactive && (
                          <option value="inactive">Inactivos</option>
                        )}
                        <option value="bautizado">Bautizados</option>
                        <option value="no_bautizado">No bautizados</option>
                        <option value="en_discipulado">En discipulado</option>
                        <option value="hombres">Hombres</option>
                        <option value="mujeres">Mujeres</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Botón Nuevo - Responsive - Mostrar solo si tiene permiso */}
                    {permissions.canCreate && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center justify-center px-3 sm:px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
                      >
                        <svg className="h-4 w-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">Nuevo</span>
                        <span className="sm:hidden">+</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tercera fila: Información de estado */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{filteredMembers.length}</span> resultados
                    </span>
                    {activeFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {activeFilter === 'active' && 'Activos'}
                        {activeFilter === 'inactive' && 'Inactivos'}
                        {activeFilter === 'bautizado' && 'Bautizados'}
                        {activeFilter === 'no_bautizado' && 'No bautizados'}
                        {activeFilter === 'en_discipulado' && 'En discipulado'}
                        {activeFilter === 'hombres' && 'Hombres'}
                        {activeFilter === 'mujeres' && 'Mujeres'}
                      </span>
                    )}
                    {searchTerm && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        "{searchTerm}"
                      </span>
                    )}
                  </div>

                  {activeFilter !== 'all' && (
                    <button
                      onClick={() => setActiveFilter('all')}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Quitar filtro
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-[236px]"></div>
          </>
        ) : (
          <>
            <div className="bg-white border-b border-gray-200 shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Primera fila: Título y estadísticas */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Gestión de Miembros
                    </h1>
                    <p className="text-gray-600 text-sm mt-1">
                      Administra los miembros de la congregación
                    </p>
                  </div>

                  {/* Estadísticas compactas */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">{members.length}</span> Total
                      </span>
                    </div>
                    
                    {/* Mostrar estadísticas avanzadas solo para ADMIN o superior */}
                    {permissions.canViewAdvancedStats && (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          <span className="text-sm text-gray-700">
                            <span className="font-semibold">{members.filter(m => m.estado === false).length}</span> Inactivos
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-gray-700">
                            <span className="font-semibold">{members.filter(m => m.bautismoEstado === BautismoEstado.BAUTIZADO).length}</span> Bautizados
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                          <span className="text-sm text-gray-700">
                            <span className="font-semibold">{members.filter(m => m.bautismoEstado === BautismoEstado.NO_BAUTIZADO).length}</span> No bautizados
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                          <span className="text-sm text-gray-700">
                            <span className="font-semibold">{members.filter(m => m.bautismoEstado === BautismoEstado.EN_DISCIPULADO).length}</span> En discipulado
                          </span>
                        </div>
                      </>
                    )}
                    
                    {/* Para USER mostrar solo info básica */}
                    {!permissions.canViewAdvancedStats && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-700">
                          <span className="font-semibold">{members.filter(m => m.bautismoEstado === BautismoEstado.BAUTIZADO).length}</span> Bautizados
                        </span>
                      </div>
                    )}
                    
                    {/* Género siempre visible para todos */}
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">{members.filter(m => m.genero === UserGene.FEMENINO).length}</span> Mujeres
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-sky-500"></div>
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">{members.filter(m => m.genero === UserGene.MASCULINO).length}</span> Hombres
                      </span>
                    </div>
                  </div>
                </div>

                {/* Segunda fila: Búsqueda, filtro y botón */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Búsqueda */}
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar miembros..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border text-gray-800 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filtro y botón lado a lado */}
                  <div className="flex gap-3">
                    <div className="relative min-w-[180px]">
                      <select
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value as any)}
                        className="w-full appearance-none pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                      >
                        <option value="all">Todos los miembros</option>
                        <option value="active">Activos</option>
                        {/* Solo mostrar opción de inactivos para ADMIN o superior */}
                        {permissions.canViewInactive && (
                          <option value="inactive">Inactivos</option>
                        )}
                        <option value="bautizado">Bautizados</option>
                        <option value="no_bautizado">No bautizados</option>
                        <option value="en_discipulado">En discipulado</option>
                        <option value="hombres">Hombres</option>
                        <option value="mujeres">Mujeres</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Botón Nuevo - Responsive - Mostrar solo si tiene permiso */}
                    {permissions.canCreate && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center justify-center px-3 sm:px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
                      >
                        <svg className="h-4 w-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden sm:inline">Nuevo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tercera fila: Información de estado */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{filteredMembers.length}</span> resultados
                    </span>
                    {activeFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {activeFilter === 'active' && 'Activos'}
                        {activeFilter === 'inactive' && 'Inactivos'}
                        {activeFilter === 'bautizado' && 'Bautizados'}
                        {activeFilter === 'no_bautizado' && 'No bautizados'}
                        {activeFilter === 'en_discipulado' && 'En discipulado'}
                        {activeFilter === 'hombres' && 'Hombres'}
                        {activeFilter === 'mujeres' && 'Mujeres'}
                      </span>
                    )}
                    {searchTerm && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        "{searchTerm}"
                      </span>
                    )}
                  </div>

                  {activeFilter !== 'all' && (
                    <button
                      onClick={() => setActiveFilter('all')}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Quitar filtro
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-6">
          {/* Vista móvil (Cards) */}
          <div className="lg:hidden">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 text-sm">Cargando miembros...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow border border-gray-200 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.201V21m0 0h-4m4 0l-4-4m4 4l-4 4" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {searchTerm ? 'No se encontraron miembros' : 'No hay miembros registrados'}
                </h3>
                <p className="text-gray-600 text-xs mb-3">
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Agrega el primer miembro'}
                </p>
                {!searchTerm && permissions.canCreate && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  >
                    Agregar Primer Miembro
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <div className="text-sm text-gray-600">
                    Mostrando <span className="font-semibold">{filteredMembers.length}</span> de{' '}
                    <span className="font-semibold">{members.length}</span> miembros
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {filteredMembers.map((member) => (
                    <MobileMemberCard key={member.id} member={member} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Vista PC (Tabla Premium) */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {isLoading ? (
                <div className="p-16 text-center">
                  <div className="inline-block animate-spin rounded-full h-14 w-14 border-[3px] border-blue-500 border-t-transparent"></div>
                  <p className="mt-6 text-gray-600 font-medium text-lg">Cargando miembros...</p>
                  <p className="text-gray-500 text-sm mt-2">Por favor espera un momento</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full mb-8">
                    <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.201V21m0 0h-4m4 0l-4-4m4 4l-4 4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {searchTerm ? 'No se encontraron miembros' : 'No hay miembros registrados'}
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                    {searchTerm ? 'Intenta con otros términos de búsqueda o modifica los filtros' : 'Comienza agregando tu primer miembro a la congregación'}
                  </p>
                  {!searchTerm && permissions.canCreate && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3.5 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                    >
                      <svg className="inline-block w-5 h-5 mr-2 -mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar Primer Miembro
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px]">
                    <thead className="bg-gray-50 ">
                      <tr>
                        <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          <div className="flex items-center justify-center text-center gap-2">
                            <span>Miembro</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l-4 4" />
                            </svg>
                          </div>
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Información Personal
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Contacto
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Fechas Importantes
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Estado
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredMembers.map((member, index) => {
                        const edad = calcularEdad(member.fecha_nacimiento)
                        return (
                          <tr
                            key={member.id}
                            className={`hover:bg-blue-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                          >
                            {/* Columna Miembro */}
                            <td className="py-6 px-6">
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-lg">
                                      {member.nombres.charAt(0)}{member.apellidos.charAt(0)}
                                    </span>
                                  </div>
                                  <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[2px] border-white ${member.estado ? 'bg-green-500' : 'bg-red-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-gray-900 text-lg leading-tight">
                                    {member.nombres} {member.apellidos}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-semibold">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                      </svg>
                                      {member.puesto || 'Miembro'}
                                    </span>
                                  </div>
                                  {member.direccion && (
                                    <div className="flex items-start gap-1.5 mt-2">
                                      <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      <span className="text-xs text-gray-600 line-clamp-1">{member.direccion}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Columna Información Personal */}
                            <td className="py-6 px-6">
                              <div className="space-y-3">
                                <div>
                                  <div className="text-[10px] font-semibold text-center text-gray-500 uppercase tracking-wide mb-1">CÉDULA</div>
                                  <div className="font-mono font-bold text-center text-gray-900 text-sm bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                                    {formatCedula(member.cedula)}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <div className="text-[10px] font-semibold text-center text-gray-500 uppercase tracking-wide mb-1">GÉNERO</div>
                                    <span className={`inline-flex items-center w-15 text-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${member.genero === UserGene.MASCULINO ? 'bg-blue-100 text-center items-center justify-center text-blue-800 border border-blue-200' : 'bg-pink-100 flex items-center justify-center text-center text-pink-800 border border-pink-200'}`}>
                                      {member.genero === UserGene.MASCULINO ? (
                                        <>
                                          <span className="text-center text-blue-600">♂</span> M
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-center text-pink-600">♀</span> F
                                        </>
                                      )}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-semibold text-center text-gray-500 uppercase tracking-wide mb-1">EDAD</div>
                                    <div className="flex items-center justify-center text-center gap-2">
                                      <span className="text-lg font-bold text-gray-900">{edad}</span>
                                      <span className="text-xs text-gray-500">años</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Columna Contacto */}
                            <td className="py-6 px-6">
                              <div className="space-y-3">
                                <div>
                                  <div className="text-[10px] font-semibold text-gray-500 text-center uppercase tracking-wide mb-1">TELÉFONO</div>
                                  <div className="font-mono font-bold text-gray-900 w-31 text-sm text-center bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                                    {formatTelefono(member.telefono)}
                                  </div>
                                </div>
                                {member.fecha_nacimiento && (
                                  <div>
                                    <div className="text-[10px] font-semibold text-center text-gray-500 uppercase tracking-wide mb-1">Nacimiento</div>
                                    <div className="flex items-center gap-2 bg-gradient-to-r from-rose-50 to-pink-50 px-3 py-1.5 rounded-md border border-pink-100">
                                      <svg className="w-3.5 h-3.5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                                      </svg>
                                      <span className="text-xs font-semibold text-center text-gray-800">{formatFecha(member.fecha_nacimiento)}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Columna Fechas Importantes */}
                            <td className="py-6 px-6">
                              <div className="space-y-3">
                                <div>
                                  <div className="text-[10px] font-semibold text-gray-500 text-center uppercase tracking-wide mb-1">INGRESO</div>
                                  <div className="flex items-center justify-center text-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1.5 rounded-md border border-emerald-100">
                                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs text-center font-semibold text-gray-800">
                                      {member.fecha_ingreso ? formatFecha(member.fecha_ingreso) : 'No especificada'}
                                    </span>
                                  </div>
                                </div>
                                {member.bautismoEstado === BautismoEstado.BAUTIZADO && member.fecha_bautismo && (
                                  <div>
                                    <div className="text-[10px] text-center font-semibold text-gray-500 uppercase tracking-wide mb-1">BAUTIZO</div>
                                    <div className="flex items-center justify-center text-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-md border border-blue-100">
                                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                      <span className="text-xs font-semibold text-gray-800">{formatFecha(member.fecha_bautismo)}</span>
                                    </div>
                                  </div>
                                )}
                                {member.bautismoEstado === BautismoEstado.EN_DISCIPULADO && (
                                  <div className="mt-4 text-center">
                                    <div className="text-[10px] text-center font-semibold text-gray-500 uppercase tracking-wide mb-1">ESTADO</div>
                                    <span className="inline-flex items-center justify-center text-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                      En discipulado
                                    </span>
                                  </div>
                                )}
                                {member.bautismoEstado === BautismoEstado.NO_BAUTIZADO && (
                                  <div className="mt-4 text-center">
                                    <div className="text-[10px] text-center font-semibold text-gray-500 uppercase tracking-wide mb-1">BAUTISMO</div>
                                    <span className="inline-flex items-center justify-center text-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.882 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      No bautizado
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Columna Estado */}
                            <td className="py-6 px-6">
                              <div className="space-y-4">
                                <div className="flex text-center aling-center justify-center flex-col gap-2">
                                  <div>
                                    <div className="text-[10px] font-semibold text-center text-gray-500 uppercase tracking-wide mb-1">ESTADO</div>
                                    <span className={`inline-flex items-center justify-center text-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold ${member.estado ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200'}`}>
                                      {member.estado ? (
                                        <>
                                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                          ACTIVO
                                        </>
                                      ) : (
                                        <>
                                          <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                          INACTIVO
                                        </>
                                      )}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">BAUTISMO</div>
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold ${member.bautismoEstado === BautismoEstado.BAUTIZADO ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200' : member.bautismoEstado === BautismoEstado.EN_DISCIPULADO ? 'bg-gradient-to-r w-38 from-purple-100 to-violet-100 text-purple-800 border border-purple-200' : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200'}`}>
                                      {member.bautismoEstado === BautismoEstado.BAUTIZADO ? (
                                        <>
                                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                          BAUTIZADO
                                        </>
                                      ) : member.bautismoEstado === BautismoEstado.EN_DISCIPULADO ? (
                                        <>
                                          <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                          EN DISCIPULADO
                                        </>
                                      ) : (
                                        <>
                                          <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                                          NO BAUTIZADO
                                        </>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Columna Acciones */}
                            <td className="py-6 px-6">
                              <div className="flex flex-col gap-3 min-w-[160px]">
                                {/* Botón Editar - solo para ROOT, SUPER_ADMIN, ADMIN */}
                                {permissions.canEdit && (
                                  <button
                                    onClick={() => handleEdit(member)}
                                    className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                                  >
                                    <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Editar
                                  </button>
                                )}
                                
                                {/* Botón Eliminar - solo para ROOT, SUPER_ADMIN */}
                                {permissions.canDelete && (
                                  <button
                                    onClick={() => handleDelete(member)}
                                    className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Eliminar
                                  </button>
                                )}
                                
                                {/* Si no tiene permisos de edición ni eliminación, mostrar mensaje */}
                                {!permissions.canEdit && !permissions.canDelete && (
                                  <div className="text-center py-2">
                                    <span className="text-xs text-gray-500">Acciones no disponibles</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer de tabla con paginación */}
              {filteredMembers.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando <span className="font-semibold text-gray-900">{filteredMembers.length}</span> miembros
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Anterior
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-blue-50 border border-blue-200 rounded-lg">
                        1
                      </span>
                      <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <ModalEditarMiembro
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        member={selectedMember}
        onSave={handleUpdate}
      />

      <ModalNuevoMiembro
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />

      <ModalEliminarMiembro
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        member={selectedMember}
        onConfirm={confirmDelete}
      />
    </>
  )
}