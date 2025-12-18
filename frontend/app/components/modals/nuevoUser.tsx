"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Sparkles
} from "lucide-react";

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (data: {
    nombre: string;
    email: string;
    password: string;
    rol: string;
  }) => void;
}

const ROLES = [
  { value: "USER", label: "Usuario", description: "Acceso básico", color: "text-blue-600", bgColor: "bg-blue-100" },
  { value: "ADMIN", label: "Administrador", description: "Acceso completo", color: "text-purple-600", bgColor: "bg-purple-100" },
];

export default function NewUser({ isOpen, onClose, onCreateUser }: NewUserModalProps) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "USER",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "nombre":
        if (!value.trim()) return "El nombre es requerido";
        if (value.length < 2) return "Mín. 2 caracteres";
        return "";
      
      case "email":
        if (!value.trim()) return "El correo es requerido";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Correo inválido";
        return "";
      
      case "password":
        if (!value) return "La contraseña es requerida";
        if (value.length < 3) return "Mín. 3 caracteres";
        return "";
      
      default:
        return "";
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTouched = { nombre: true, email: true, password: true };
    setTouched(newTouched);
    
    const newErrors: Record<string, string> = {};
    Object.keys(form).forEach(key => {
      if (key !== "rol") {
        const error = validateField(key, form[key as keyof typeof form]);
        if (error) newErrors[key] = error;
      }
    });
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onCreateUser(form);
    setIsSubmitting(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setForm({ nombre: "", email: "", password: "", rol: "USER" });
    setErrors({});
    setTouched({});
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { width: "0%", color: "bg-gray-200", text: "" };
    if (password.length < 3) return { width: "25%", color: "bg-red-500", text: "Débil" };
    if (password.length < 6) return { width: "50%", color: "bg-orange-500", text: "Media" };
    if (password.length < 8) return { width: "75%", color: "bg-yellow-500", text: "Buena" };
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    if (!hasNumber || !hasLetter) return { width: "75%", color: "bg-yellow-500", text: "Buena" };
    return { width: "100%", color: "bg-green-500", text: "Fuerte" };
  };

  const selectedRole = ROLES.find(role => role.value === form.rol);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 z-[60] flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-lg sm:rounded-xl shadow-lg w-full max-w-[295px] sm:max-w-md my-4 sm:my-0"
            >
              {/* Header ultra compacto */}
              <div className="p-3 sm:p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <UserPlus className="text-white w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-base font-bold text-gray-800 truncate">
                        Nuevo Usuario
                      </h2>
                      <p className="text-xs text-gray-500 truncate">
                        Complete los datos
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="p-1 sm:p-1.5 rounded-md hover:bg-gray-100 flex-shrink-0"
                  >
                    <X className="text-gray-500 w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Formulario ultra compacto */}
              <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Campo Nombre */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <User className="w-3 h-3 flex-shrink-0" />
                    <span>Nombre completo</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Ej: Juan Pérez"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors.nombre ? "border-red-300" : "border-gray-300"
                    } text-gray-800 placeholder:text-gray-400 bg-white`}
                  />
                  {errors.nombre && touched.nombre && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                      {errors.nombre}
                    </p>
                  )}
                </div>

                {/* Campo Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span>Correo electrónico</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="usuario@ejemplo.com"
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } text-gray-800 placeholder:text-gray-400 bg-white`}
                  />
                  {errors.email && touched.email && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 flex-shrink-0" />
                    <span>Contraseña</span>
                    <span className="text-gray-500 font-normal">(mín. 3)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="••••••••"
                      className={`w-full px-3 py-2 pr-9 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errors.password ? "border-red-300" : "border-gray-300"
                      } text-gray-800 placeholder:text-gray-400 bg-white`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {form.password && (
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-600">Seguridad:</span>
                        <span className={`font-medium ${
                          form.password.length < 3 ? "text-red-600" :
                          form.password.length < 6 ? "text-orange-600" :
                          form.password.length < 8 ? "text-yellow-600" :
                          "text-green-600"
                        }`}>
                          {getPasswordStrength(form.password).text}
                        </span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${getPasswordStrength(form.password).color}`}
                          style={{ width: getPasswordStrength(form.password).width }}
                        />
                      </div>
                    </div>
                  )}
                  {errors.password && touched.password && (
                    <p className="text-[11px] text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Campo Rol - Compacto */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Shield className="w-3 h-3 flex-shrink-0" />
                    <span>Tipo de Usuario</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(role => (
                      <motion.button
                        key={role.value}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setForm(prev => ({ ...prev, rol: role.value }))}
                        className={`p-2 rounded-md border text-left ${
                          form.rol === role.value
                            ? `${role.bgColor} border-blue-400`
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className={`p-1 rounded ${role.bgColor}`}>
                            <Shield className={`w-2.5 h-2.5 ${role.color}`} />
                          </div>
                          <span className={`text-xs font-semibold ${role.color} truncate`}>
                            {role.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-600 line-clamp-1">
                          {role.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                  {selectedRole && (
                    <div className="flex items-start gap-1.5 mt-1.5 px-2.5 py-1.5 bg-gray-50 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] text-gray-700">
                        {form.rol === "USER"
                          ? "Acceso limitado a funciones básicas"
                          : "Puede gestionar usuarios y configuraciones"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleClose}
                    className="flex-1 px-3 py-2 rounded-md font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-xs sm:text-sm"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={isSubmitting}
                    className={`flex-1 px-3 py-2 rounded-md font-medium text-white transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
                      isSubmitting
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Crear Usuario</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}