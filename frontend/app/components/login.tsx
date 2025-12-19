'use client'
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaChurch} from 'react-icons/fa';
import {login} from '../lib/crud';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { connectToServer } from '../lib/socket-client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(true);

   useEffect(() => {
    connectToServer();
  }, []);

   useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (showLoader) return(
    <div className="fixed inset-0 bg-white flex justify-center items-center z-50">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
   
       const data = {
        email, password
       }
       const res = await login(data); // Llamar a la API para login

       if(res.messege === 'Usuario o contraseña incorrectos'){
        toast.error('Credenciales incorrectas');
        setLoading(false); 
       }else{
        toast.success('¡Bienvenido!');
        // Marcar que venimos del login (hard navigation)
        sessionStorage.setItem('lastNavigationType', 'hard');
        // Inicializar historial de navegación
        sessionStorage.setItem('navigationHistory', JSON.stringify(['/']));
        router.push('/dashboard'); 
        
       }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-400 via-gray-300 to-white p-4 relative overflow-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      {/* Fondo espiritual con elementos decorativos */}
      <div className="absolute inset-0">
        {/* Luz celestial */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-cyan-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-indigo-100/30 to-blue-100/20 rounded-full blur-3xl"></div>
        
        {/* Patrones sutiles */}
        <div className="absolute hidden md:block w-15 h-15 top-10 right-10 text-gray-500 text-6xl">
          <img src="icon.png"/>
        </div>
        <div className="absolute hidden md:block w-15 h-15 bottom-10 left-10 text-gray-500 text-6xl">
          <img src="icon.png"/>
        </div>
        
        {/* Rayos de luz */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-blue-50/10 to-white/0"></div>
      </div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white backdrop-blur-sm rounded-2xl shadow-xl p-6 w-full max-w-sm border border-blue-100"
      >
        {/* Encabezado espiritual */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex select-none pointer-events-none items-center justify-center w-45 h-45  mb-3 "
          >
            <img src="logo.png" className='select-none pointer-events-none' />
          </motion.div>
        </div>

        {/* Formulario compacto */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FaEnvelope className="text-blue-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="w-full pl-10 pr-4 py-3 bg-white border border-blue-100 rounded-lg text-gray-700 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-sm"
                required
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FaLock className="text-blue-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full pl-10 pr-10 py-3 bg-white border border-blue-100 rounded-lg text-gray-700 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <FaEyeSlash className="text-blue-400 hover:text-blue-500 text-sm" />
                ) : (
                  <FaEye className="text-blue-400 hover:text-blue-500 text-sm" />
                )}
              </button>
            </div>
          </div>

          {/* Botón de Acceso */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md transition-all flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Accediendo...
              </>
            ) : (
              'Ingresar al sistema'
            )}
          </motion.button>
        </form>

        {/* Separador */}
        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-blue-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-blue-400">Acceso espiritual</span>
          </div>
        </div>
       
      </motion.div>
    </div>
  );
};
export default Login;