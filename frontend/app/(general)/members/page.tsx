'use client'

import { useState, useEffect } from 'react'
import Navbar from '../../components/navbar'

// Definición de tipos
enum UserGene {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
}

interface Member {
  id: string
  nombres: string
  apellidos: string
  cedula?: string
  img?: string
  genero: UserGene
  iglesiaId?: string
  puesto?: string
  fecha_ingreso?: string
  fecha_nacimiento: string
  direccion?: string
  telefono: string
  estado?: boolean
  bautizado?: boolean
  fecha_bautismo?: string
}

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

const formatFecha = (fecha?: string) => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatFechaCorta = (fecha?: string) => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  })
}

// Hook personalizado para detectar el tamaño de pantalla
const useScreenSize = (mobileBreakpoint: number = 1025) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [screenWidth, setScreenWidth] = useState<number>(0);

  useEffect(() => {
    // Función para verificar el tamaño
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width <= mobileBreakpoint);
    };

    // Verificar al cargar
    checkScreenSize();

    // Configurar event listener para cambios de tamaño
    window.addEventListener('resize', checkScreenSize);

    // Limpiar event listener al desmontar
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [mobileBreakpoint]);

  return { isMobile, screenWidth };
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive' | 'bautizado' | 'no_bautizado' | 'hombres' | 'mujeres'>('all')
  const { isMobile, screenWidth } = useScreenSize(1025);

  // Form states
  const [formData, setFormData] = useState<Omit<Member, 'id'>>({
    nombres: '',
    apellidos: '',
    cedula: '',
    img: '',
    genero: UserGene.MASCULINO,
    iglesiaId: '',
    puesto: '',
    fecha_ingreso: '',
    fecha_nacimiento: '',
    direccion: '',
    telefono: '',
    estado: true,
    bautizado: false,
    fecha_bautismo: ''
  })

  // Fetch miembros inicial
  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const mockData: Member[] = [
        {
          id: '1',
          nombres: 'Juan Carlos',
          apellidos: 'Pérez Rodríguez',
          cedula: '00112345678',
          genero: UserGene.MASCULINO,
          fecha_nacimiento: '1990-05-15',
          telefono: '8091234567',
          puesto: 'Diácono Principal',
          fecha_ingreso: '2020-01-15',
          direccion: 'Calle Principal #123, Santo Domingo Este',
          estado: true,
          bautizado: true,
          fecha_bautismo: '2015-06-20'
        },
        {
          id: '2',
          nombres: 'María Elena',
          apellidos: 'Gómez de la Cruz',
          cedula: '40278901234',
          genero: UserGene.FEMENINO,
          fecha_nacimiento: '1985-08-22',
          telefono: '8298765432',
          puesto: 'Líder de Alabanza',
          fecha_ingreso: '2019-03-10',
          direccion: 'Av. Independencia #456, Distrito Nacional',
          estado: true,
          bautizado: true,
          fecha_bautismo: '2010-12-10'
        },
        {
          id: '3',
          nombres: 'Carlos Alberto',
          apellidos: 'Martínez Fernández',
          cedula: '00123456789',
          genero: UserGene.MASCULINO,
          fecha_nacimiento: '1992-11-30',
          telefono: '8495551234',
          puesto: 'Pastor Asociado',
          fecha_ingreso: '2018-06-20',
          direccion: 'Calle Las Flores #789, Santiago',
          estado: true,
          bautizado: false
        },
        {
          id: '4',
          nombres: 'Ana María',
          apellidos: 'Fernández López',
          cedula: '22345678901',
          genero: UserGene.FEMENINO,
          fecha_nacimiento: '1998-03-12',
          telefono: '8097778888',
          puesto: 'Maestra de Niños',
          fecha_ingreso: '2021-09-05',
          direccion: 'Sector Los Ríos #321',
          estado: true,
          bautizado: true,
          fecha_bautismo: '2020-08-15'
        }
      ]

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
      (activeFilter === 'bautizado' && member.bautizado) ||
      (activeFilter === 'no_bautizado' && !member.bautizado) ||
      (activeFilter === 'hombres' && member.genero === UserGene.MASCULINO) ||
      (activeFilter === 'mujeres' && member.genero === UserGene.FEMENINO)

    return matchesSearch && matchesFilter
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCreate = async () => {
    try {
      const newMember: Member = {
        ...formData,
        id: Date.now().toString()
      }

      setMembers(prev => [...prev, newMember])
      setShowCreateModal(false)
      resetForm()
    } catch (error) {
      console.error('Error creating member:', error)
    }
  }

  const handleEdit = (member: Member) => {
    setSelectedMember(member)
    setFormData({
      nombres: member.nombres,
      apellidos: member.apellidos,
      cedula: member.cedula || '',
      img: member.img || '',
      genero: member.genero,
      iglesiaId: member.iglesiaId || '',
      puesto: member.puesto || '',
      fecha_ingreso: member.fecha_ingreso || '',
      fecha_nacimiento: member.fecha_nacimiento,
      direccion: member.direccion || '',
      telefono: member.telefono,
      estado: member.estado ?? true,
      bautizado: member.bautizado ?? false
    })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!selectedMember) return

    try {
      setMembers(prev => prev.map(member =>
        member.id === selectedMember.id
          ? { ...formData, id: member.id }
          : member
      ))

      setShowEditModal(false)
      resetForm()
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
      iglesiaId: '',
      puesto: '',
      fecha_ingreso: '',
      fecha_nacimiento: '',
      direccion: '',
      telefono: '',
      estado: true,
      bautizado: false
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${member.bautizado ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              {member.bautizado ? 'BAUTIZADO' : 'NO BAUTIZADO'}
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
            {member.bautizado && member.fecha_bautismo && (
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
          <button
            onClick={() => handleEdit(member)}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <button
            onClick={() => handleDelete(member)}
            className="flex-1 bg-red-600 text-white rounded-lg py-2 text-xs font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
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
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">{members.filter(m => m.estado === false).length}</span> Inactivos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">{members.filter(m => m.bautizado === false).length}</span> Sin Bautizar
                      </span>
                    </div>
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
                        <option value="inactive">Inactivos</option>
                        <option value="bautizado">Bautizados</option>
                        <option value="no_bautizado">No bautizados</option>
                        <option value="hombres">Hombres</option>
                        <option value="mujeres">Mujeres</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Botón Nuevo - Responsive */}
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
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">{members.filter(m => m.estado === false).length}</span> Inactivos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">{members.filter(m => m.bautizado === false).length}</span> Sin Bautizar
                      </span>
                    </div>
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
                        <option value="inactive">Inactivos</option>
                        <option value="bautizado">Bautizados</option>
                        <option value="no_bautizado">No bautizados</option>
                        <option value="hombres">Hombres</option>
                        <option value="mujeres">Mujeres</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Botón Nuevo - Responsive */}
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center justify-center px-3 sm:px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors whitespace-nowrap"
                    >
                      <svg className="h-4 w-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="hidden sm:inline">Nuevo</span>
                    </button>
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
                {!searchTerm && (
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
              {/* Header de tabla mejorado */}
              <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Lista de Miembros</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      {filteredMembers.length} miembros encontrados
                      {searchTerm && ` para "${searchTerm}"`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-700 bg-white px-4 py-2 rounded-lg border border-gray-200">
                      <span className="font-semibold text-blue-600">{filteredMembers.length}</span> de{' '}
                      <span className="font-semibold">{members.length}</span> miembros
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Nuevo Miembro
                    </button>
                  </div>
                </div>
              </div>

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
                  {!searchTerm && (
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
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-5 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          <div className="flex items-center justify-center text-center gap-2">
                            <span>Miembro</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                            </svg>
                          </div>
                        </th>
                        <th className="py-5 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Información Personal
                        </th>
                        <th className="py-5 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Contacto
                        </th>
                        <th className="py-5 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Fechas Importantes
                        </th>
                        <th className="py-5 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Estado
                        </th>
                        <th className="py-5 px-6 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
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
                            className={`hover:bg-blue-50/50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
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
                                {member.bautizado && member.fecha_bautismo && (
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
                                {!member.bautizado && (
                                  <div className="mt-4 text-center">
                                    <div className="text-[10px] text-center font-semibold text-gray-500 uppercase tracking-wide mb-1">BAUTIZO</div>
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
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold ${member.bautizado ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200' : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200'}`}>
                                      {member.bautizado ? (
                                        <>
                                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                          BAUTIZADO
                                        </>
                                      ) : (
                                        <>
                                          <span className="h-2 w-2 rounded-full  bg-gray-400"></span>
                                          AÚN
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
                                <button
                                  onClick={() => handleEdit(member)}
                                  className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(member)}
                                  className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Eliminar
                                </button>
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
    </>
  )
}