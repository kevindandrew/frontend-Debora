// Mock Data for Military Recruitment System

export const usuarios = [
  {
    id: 1,
    nombre: "Cnel. Juan Pérez",
    email: "admin@ejercito.bo",
    rol: "ADMINISTRADOR",
    avatar: "/military-officer-avatar.jpg",
  },
  {
    id: 2,
    nombre: "Dr. María García",
    email: "medico@ejercito.bo",
    rol: "MEDICO",
    avatar: "/female-doctor-avatar.png",
  },
  {
    id: 3,
    nombre: "Sgto. Carlos López",
    email: "supervisor@ejercito.bo",
    rol: "SUPERVISOR",
    avatar: "/military-sergeant-avatar.jpg",
  },
  {
    id: 4,
    nombre: "Pedro Mamani",
    email: "postulante@gmail.com",
    rol: "POSTULANTE",
    avatar: "/young-male-applicant-avatar.jpg",
  },
]

export const postulantes = [
  {
    id: 1,
    nombre: "Pedro Mamani Quispe",
    ci: "12345678",
    fechaNacimiento: "2005-03-15",
    modalidad: "Premilitar",
    unidad: "Regimiento Colorados",
    estado: "INSCRITO",
    telefono: "70012345",
    email: "pedro.mamani@gmail.com",
  },
  {
    id: 2,
    nombre: "Juan Carlos Fernández",
    ci: "23456789",
    fechaNacimiento: "2004-07-22",
    modalidad: "Militar",
    unidad: "Batallón de Ingeniería",
    estado: "EN_EVALUACION",
    telefono: "71234567",
    email: "jc.fernandez@gmail.com",
  },
  {
    id: 3,
    nombre: "Luis Alberto Rojas",
    ci: "34567890",
    fechaNacimiento: "2005-01-10",
    modalidad: "Premilitar",
    unidad: "Regimiento Camacho",
    estado: "APTO",
    telefono: "72345678",
    email: "luis.rojas@gmail.com",
  },
  {
    id: 4,
    nombre: "Miguel Ángel Torrez",
    ci: "45678901",
    fechaNacimiento: "2004-11-28",
    modalidad: "Militar",
    unidad: "Regimiento Colorados",
    estado: "NO_APTO",
    telefono: "73456789",
    email: "miguel.torrez@gmail.com",
  },
  {
    id: 5,
    nombre: "Roberto Choque Mamani",
    ci: "56789012",
    fechaNacimiento: "2005-05-05",
    modalidad: "Premilitar",
    unidad: "Batallón de Comunicaciones",
    estado: "EN_EVALUACION",
    telefono: "74567890",
    email: "roberto.choque@gmail.com",
  },
  {
    id: 6,
    nombre: "Fernando Huanca Lima",
    ci: "67890123",
    fechaNacimiento: "2004-09-18",
    modalidad: "Militar",
    unidad: "Regimiento Camacho",
    estado: "INSCRITO",
    telefono: "75678901",
    email: "fernando.huanca@gmail.com",
  },
]

export const documentos = [
  {
    id: 1,
    postulante_id: 4,
    tipo: "Certificado de Nacimiento",
    url: "/uploads/cert_nacimiento_pedro.pdf",
    estado: "SUBIDO",
  },
  {
    id: 2,
    postulante_id: 4,
    tipo: "Carnet de Identidad",
    url: null,
    estado: "PENDIENTE",
  },
  {
    id: 3,
    postulante_id: 4,
    tipo: "Boleta de Pago",
    url: "/uploads/boleta_pedro.pdf",
    estado: "SUBIDO",
  },
  {
    id: 4,
    postulante_id: 4,
    tipo: "Certificado Médico",
    url: null,
    estado: "PENDIENTE",
  },
]

export const unidades = [
  { id: 1, nombre: "Regimiento Colorados", ciudad: "La Paz", capacidad: 500, inscritos: 342 },
  { id: 2, nombre: "Regimiento Camacho", ciudad: "Cochabamba", capacidad: 400, inscritos: 287 },
  { id: 3, nombre: "Batallón de Ingeniería", ciudad: "Santa Cruz", capacidad: 300, inscritos: 198 },
  { id: 4, nombre: "Batallón de Comunicaciones", ciudad: "Oruro", capacidad: 250, inscritos: 156 },
]

export const evaluaciones = [
  {
    id: 1,
    postulante_id: 2,
    tipo: "MEDICA",
    peso: null,
    estatura: null,
    resultado: null,
    evaluador_id: 2,
    fecha: null,
  },
  {
    id: 2,
    postulante_id: 5,
    tipo: "FISICA",
    flexiones: null,
    abdominales: null,
    test_psicologico: null,
    resultado: null,
    evaluador_id: 3,
    fecha: null,
  },
]

export const estadisticas = {
  totalInscritos: 983,
  totalAptos: 456,
  unidadesActivas: 4,
  alertas: 12,
}
