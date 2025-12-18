import { useState, useEffect } from "react";
import { X, User, Phone, Calendar, Briefcase, Image as ImageIcon, MapPin, IdCard, Save } from "lucide-react";

interface NuevoMiembro {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface FormData {
  nombres: string;
  apellidos: string;
  cedula?: string;
  img?: string;
  puesto?: string;
  fecha_ingreso?: string;
  fecha_nacimiento: string;
  direccion?: string;
  telefono?: string;
}

export default function ModalNuevoUsuario({
  open,
  onClose,
  onSubmit,
}: NuevoMiembro) {
  const initialFormState: FormData = {
    nombres: "",
    apellidos: "",
    cedula: "",
    img: "",
    puesto: "",
    fecha_ingreso: "",
    fecha_nacimiento: "",
    direccion: "",
    telefono: "",
  };

  const [form, setForm] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cedulaDisplay, setCedulaDisplay] = useState("");
  const [telefonoDisplay, setTelefonoDisplay] = useState("");

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setForm(initialFormState);
        setCedulaDisplay("");
        setTelefonoDisplay("");
        setErrors({});
        setIsSubmitting(false);
      }, 300);
    }
  }, [open]);

  // Función para formatear cédula en display
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

  // Función para formatear teléfono en display
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
    
    // Extraer solo números y limitar a 11 dígitos
    const numbersOnly = inputValue.replace(/\D/g, '').slice(0, 11);
    
    // Guardar solo números en el estado del formulario
    setForm((prev) => ({
      ...prev,
      cedula: numbersOnly,
    }));
    
    // Actualizar display con formato
    setCedulaDisplay(formatCedulaDisplay(numbersOnly));
    
    // Limpiar error si existe
    if (errors.cedula) {
      setErrors((prev) => ({ ...prev, cedula: "" }));
    }
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Extraer solo números y limitar a 10 dígitos
    const numbersOnly = inputValue.replace(/\D/g, '').slice(0, 10);
    
    // Guardar solo números en el estado del formulario
    setForm((prev) => ({
      ...prev,
      telefono: numbersOnly,
    }));
    
    // Actualizar display con formato
    setTelefonoDisplay(formatTelefonoDisplay(numbersOnly));
    
    // Limpiar error si existe
    if (errors.telefono) {
      setErrors((prev) => ({ ...prev, telefono: "" }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Si no es cédula ni teléfono, manejar normalmente
    if (name !== 'cedula' && name !== 'telefono') {
      setForm((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const cleanData = Object.fromEntries(
        Object.entries(form).filter(([_, value]) => value !== "" && value !== null && value !== undefined)
      );
      onSubmit(cleanData);
      setForm(initialFormState);
      setCedulaDisplay("");
      setTelefonoDisplay("");
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

  if (!open) return null;

  // Fechas para validación
  const today = new Date().toISOString().split('T')[0];
  const minBirthDate = new Date();
  minBirthDate.setFullYear(minBirthDate.getFullYear() - 0);
  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 100);

  return (
    <>
  {/* Overlay elegante */}
  <div 
    className="fixed inset-0 bg-gradient-to-br from-gray-900/80 to-blue-950/90 backdrop-blur-lg z-40 transition-all duration-300"
    onClick={handleClose}
  />
  
  {/* Modal con diseño profesional */}
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div 
      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all duration-300 border border-gray-100 overflow-hidden"
      onClick={e => e.stopPropagation()}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
      }}
    >
      {/* Header profesional con azul oscuro */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border-b border-blue-700/50">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-lg border border-white/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Nuevo Usuario</h2>
              <p className="text-blue-200/90 text-sm font-medium mt-1">Complete la información requerida</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Formulario profesional */}
      <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto custom-scroll">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Nombres */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800">
              Nombres <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                className={`w-full border ${errors.nombres ? 'border-red-500' : 'border-gray-300'} focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 rounded-lg pl-12 pr-4 py-3.5 text-gray-900 placeholder-gray-500 transition-all duration-200`}
                placeholder="Juan Carlos"
              />
            </div>
            {errors.nombres && (
              <p className="text-sm text-red-600 mt-1">{errors.nombres}</p>
            )}
          </div>

          {/* Apellidos */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800">
              Apellidos <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                className={`w-full border ${errors.apellidos ? 'border-red-500' : 'border-gray-300'} focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 rounded-lg pl-12 pr-4 py-3.5 text-gray-900 placeholder-gray-500 transition-all duration-200`}
                placeholder="Pérez Gómez"
              />
            </div>
            {errors.apellidos && (
              <p className="text-sm text-red-600 mt-1">{errors.apellidos}</p>
            )}
          </div>

          {/* Cédula */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Cédula de Identidad
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-700">
                <IdCard className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                name="cedula"
                value={cedulaDisplay}
                onChange={handleCedulaChange}
                className={`w-full border ${errors.cedula ? 'border-red-500' : 'border-gray-300'} focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 rounded-lg pl-12 pr-16 py-3.5 text-gray-900 placeholder-gray-500 transition-all duration-200 font-mono`}
                placeholder="000-0000000-0"
                maxLength={13}
              />
              {form.cedula && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${form.cedula.length === 11 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                    {form.cedula.length}/11
                  </span>
                </div>
              )}
            </div>
            {errors.cedula && (
              <p className="text-sm text-red-600 mt-1">{errors.cedula}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Teléfono <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-700">
                <Phone className="w-4.5 h-4.5" />
              </div>
              <input
                type="text"
                name="telefono"
                value={telefonoDisplay}
                onChange={handleTelefonoChange}
                className={`w-full border ${errors.telefono ? 'border-red-500' : 'border-gray-300'} focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 rounded-lg pl-12 pr-16 py-3.5 text-gray-900 placeholder-gray-500 transition-all duration-200 font-mono`}
                placeholder="(000) 000-0000"
                maxLength={14}
              />
              {form.telefono && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${form.telefono.length === 10 ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                    {form.telefono.length}/10
                  </span>
                </div>
              )}
            </div>
            {errors.telefono && (
              <p className="text-sm text-red-600 mt-1">{errors.telefono}</p>
            )}
          </div>

          {/* Fecha Nacimiento */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Fecha de Nacimiento <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-700">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <input
                type="date"
                name="fecha_nacimiento"
                value={form.fecha_nacimiento}
                onChange={handleChange}
                max={minBirthDate.toISOString().split('T')[0]}
                min={maxBirthDate.toISOString().split('T')[0]}
                className={`w-full border ${errors.fecha_nacimiento ? 'border-red-500' : 'border-gray-300'} focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 rounded-lg pl-12 pr-4 py-3.5 text-gray-900 transition-all duration-200 professional-date`}
              />
            </div>
            {errors.fecha_nacimiento && (
              <p className="text-sm text-red-600 mt-1">{errors.fecha_nacimiento}</p>
            )}
          </div>

          {/* Puesto */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Puesto / Cargo
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-700 z-10">
                <Briefcase className="w-4.5 h-4.5" />
              </div>
              <select
                name="puesto"
                value={form.puesto}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 rounded-lg pl-12 pr-10 py-3.5 text-gray-900 transition-all duration-200 appearance-none bg-white cursor-pointer"
              >
                <option value="" className="text-gray-500">Seleccione un puesto</option>
                <option value="Desarrollador">Desarrollador</option>
                <option value="Diseñador">Diseñador</option>
                <option value="Analista">Analista</option>
                <option value="Gerente">Gerente</option>
                <option value="Administrador">Administrador</option>
                <option value="Consultor">Consultor</option>
                <option value="Supervisor">Supervisor</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Fecha Ingreso */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Fecha de Ingreso
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-700">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <input
                type="date"
                name="fecha_ingreso"
                value={form.fecha_ingreso}
                onChange={handleChange}
                max={today}
                className="w-full border border-gray-300 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 rounded-lg pl-12 pr-4 py-3.5 text-gray-900 transition-all duration-200 professional-date"
              />
            </div>
          </div>

          {/* Imagen URL */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800">
              URL de Imagen
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-700">
                <ImageIcon className="w-4.5 h-4.5" />
              </div>
              <input
                type="url"
                name="img"
                value={form.img}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 rounded-lg pl-12 pr-4 py-3.5 text-gray-900 placeholder-gray-500 transition-all duration-200"
                placeholder="https://ejemplo.com/imagen-perfil.jpg"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800">
              Dirección Completa
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3.5 text-blue-700">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <textarea
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                className="w-full border border-gray-300 focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 rounded-lg pl-12 pr-4 py-3.5 text-gray-900 placeholder-gray-500 transition-all duration-200 resize-none min-h-[100px]"
                placeholder="Ingrese dirección completa"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Botones profesionales */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 mt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3.5 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-300"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3.5 text-sm font-semibold text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-3 ${isSubmitting ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-900 hover:bg-blue-800'}`}
            style={{
              background: isSubmitting ? '#1e3a8a' : '#1e3a8a',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
            }}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Save className="w-4.5 h-4.5" />
                <span>Guardar Usuario</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>

  {/* Estilos profesionales */}
  <style jsx global>{`
    /* Estilos para datepicker profesional */
    .professional-date {
      color-scheme: light;
    }
    
    .professional-date::-webkit-calendar-picker-indicator {
      opacity: 0.5;
      cursor: pointer;
      width: 16px;
      height: 16px;
      padding: 2px;
      transition: opacity 0.2s;
    }
    
    .professional-date::-webkit-calendar-picker-indicator:hover {
      opacity: 1;
    }
    
    .professional-date::-webkit-datetime-edit {
      padding: 0;
      color: #374151;
    }
    
    .professional-date::-webkit-datetime-edit-fields-wrapper {
      padding: 0;
    }
    
    /* Scroll personalizado profesional */
    .custom-scroll::-webkit-scrollbar {
      width: 6px;
    }
    
    .custom-scroll::-webkit-scrollbar-track {
      background: #f3f4f6;
      border-radius: 3px;
    }
    
    .custom-scroll::-webkit-scrollbar-thumb {
      background: #9ca3af;
      border-radius: 3px;
    }
    
    .custom-scroll::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }
    
    /* Animaciones profesionales */
    @keyframes slideIn {
      0% {
        opacity: 0;
        transform: translateY(20px) scale(0.99);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    
    .fixed.inset-0.z-50 > div {
      animation: slideIn 0.3s ease-out;
    }
    
    /* Estilos de focus mejorados */
    input:focus, 
    textarea:focus, 
    select:focus {
      outline: none;
      border-color: #1e3a8a !important;
      box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.1) !important;
    }
    
    /* Transiciones suaves */
    input, textarea, select, button {
      transition: all 0.2s ease-in-out;
    }
    
    /* Efectos hover para botones */
    button:hover {
      transform: translateY(-1px);
    }
    
    button:active {
      transform: translateY(0);
    }
  `}</style>
</>
  );
}