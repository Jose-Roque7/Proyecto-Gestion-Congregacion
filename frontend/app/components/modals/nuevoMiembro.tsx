import { useState, useEffect } from "react";
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  Briefcase, 
  Image as ImageIcon, 
  MapPin, 
  IdCard, 
  Save, 
  Droplets,
  Home,
  Check
} from "lucide-react";

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
  genero: string;
  puesto?: string;
  fecha_ingreso?: string;
  fecha_nacimiento: string;
  direccion?: string;
  telefono: string;
  estado?: boolean;
  bautizado?: boolean;
  fecha_bautismo?: string;
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
    genero: "MASCULINO",
    puesto: "",
    fecha_ingreso: "",
    fecha_nacimiento: "",
    direccion: "",
    telefono: "",
    estado: true,
    bautizado: false,
    fecha_bautismo: "",
  };

  const [form, setForm] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cedulaDisplay, setCedulaDisplay] = useState("");
  const [telefonoDisplay, setTelefonoDisplay] = useState("");

  // Estado para mostrar/ocultar fecha de bautismo
  const [showFechaBautismo, setShowFechaBautismo] = useState(false);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setForm(initialFormState);
        setCedulaDisplay("");
        setTelefonoDisplay("");
        setErrors({});
        setIsSubmitting(false);
        setShowFechaBautismo(false);
      }, 300);
    }
  }, [open]);

  // Efecto para mostrar/ocultar fecha de bautismo según el checkbox
  useEffect(() => {
    if (form.bautizado) {
      setShowFechaBautismo(true);
    } else {
      setShowFechaBautismo(false);
      setForm(prev => ({ ...prev, fecha_bautismo: "" }));
    }
  }, [form.bautizado]);

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
    const { name, value, type } = e.target;
    
    // Si es checkbox
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } 
    // Si no es cédula ni teléfono, manejar normalmente
    else if (name !== 'cedula' && name !== 'telefono') {
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

    if (!form.genero) newErrors.genero = "Requerido";

    // Validar fecha de bautismo si está marcado como bautizado
    if (form.bautizado && !form.fecha_bautismo) {
      newErrors.fecha_bautismo = "Requerida si está bautizado";
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
      {/* Overlay borroso moderno */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-100 transition-all duration-300"
        onClick={handleClose}
      />
      
      {/* Modal con diseño moderno responsivo */}
      <div className="fixed inset-0 z-101 flex items-center justify-center p-3 sm:p-4">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 border border-gray-200 overflow-hidden max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header limpio y minimalista */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2.5 rounded-lg">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Nuevo Miembro</h2>
                  <p className="text-gray-500 text-sm sm:text-base font-medium">Complete la información requerida</p>
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

          {/* Formulario moderno */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto custom-scrollbar max-h-[calc(90vh-80px)]">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              
              {/* Nombres */}
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
                {errors.nombres && (
                  <p className="text-xs text-red-500 mt-1">{errors.nombres}</p>
                )}
              </div>

              {/* Apellidos */}
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
                {errors.apellidos && (
                  <p className="text-xs text-red-500 mt-1">{errors.apellidos}</p>
                )}
              </div>

              {/* Género */}
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
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.genero && (
                  <p className="text-xs text-red-500 mt-1">{errors.genero}</p>
                )}
              </div>

              {/* Estado */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <div className="flex items-center h-full">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, estado: !prev.estado }))}
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

              {/* Cédula */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cédula de Identidad
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
                {errors.cedula && (
                  <p className="text-xs text-red-500 mt-1">{errors.cedula}</p>
                )}
              </div>

              {/* Teléfono */}
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
                {errors.telefono && (
                  <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>
                )}
              </div>

              {/* Fecha Nacimiento */}
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
                {errors.fecha_nacimiento && (
                  <p className="text-xs text-red-500 mt-1">{errors.fecha_nacimiento}</p>
                )}
              </div>

              {/* Bautizado */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Bautizado
                </label>
                <div className="flex items-center h-full">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, bautizado: !prev.bautizado }))}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className={`relative w-10 h-5 rounded-full transition-colors ${form.bautizado ? 'bg-blue-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transform transition-transform ${form.bautizado ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                    <span className={`text-sm font-medium ${form.bautizado ? 'text-blue-700' : 'text-gray-500'}`}>
                      {form.bautizado ? 'Sí' : 'No'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Fecha Bautismo (Condicional) */}
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
                      value={form.fecha_bautismo}
                      onChange={handleChange}
                      max={today}
                      className={`w-full border ${errors.fecha_bautismo ? 'border-red-300' : 'border-gray-200'} focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-3 text-gray-900 transition-all duration-200 text-sm sm:text-base`}
                    />
                  </div>
                  {errors.fecha_bautismo && (
                    <p className="text-xs text-red-500 mt-1">{errors.fecha_bautismo}</p>
                  )}
                </div>
              )}

              {/* Puesto */}
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
                    value={form.puesto}
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

              {/* Fecha Ingreso */}
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
                    value={form.fecha_ingreso}
                    onChange={handleChange}
                    max={today}
                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-3 text-gray-900 transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Imagen URL */}
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
                    value={form.img}
                    onChange={handleChange}
                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </div>

              {/* Dirección */}
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
                    value={form.direccion}
                    onChange={handleChange}
                    className="w-full border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 resize-none min-h-[80px] text-sm sm:text-base"
                    placeholder="Ingrese dirección completa"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Botones responsivos */}
            <div className="flex flex-col m-10 sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-100">
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
                    <Check className="w-4 h-4" />
                    <span>Guardar Miembro</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Estilos responsivos */}
      <style jsx global>{`
        /* Estilos para datepicker */
        input[type="date"] {
          color-scheme: light;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0.5;
          cursor: pointer;
          width: 16px;
          height: 16px;
          padding: 2px;
          transition: opacity 0.2s;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
        
        /* Scroll personalizado */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        
        /* Animación suave de entrada */
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .fixed.inset-0.z-50 > div {
          animation: slideIn 0.25s ease-out;
        }
        
        /* Focus mejorado */
        input:focus, 
        textarea:focus, 
        select:focus {
          outline: none;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1) !important;
        }
        
        /* Transiciones suaves */
        input, textarea, select, button {
          transition: all 0.15s ease-in-out;
        }
        
        /* Estilos para móviles */
        @media (max-width: 640px) {
          .fixed.inset-0.z-50 > div {
            border-radius: 1rem;
            margin: 0.5rem;
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </>
  );
}