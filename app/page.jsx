"use client";

import { useEffect, useState } from "react";
import { publicService } from "@/services/public";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { RegistrationSuccessModal } from "@/components/postulacion/RegistrationSuccessModal";
import { InstallPrompt } from "@/components/InstallPrompt";

import { Suspense } from "react";

function LandingContent() {
  const [modalidades, setModalidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const registroExitosoCodigo = searchParams.get("registro_exitoso");

  const handleCloseModal = () => {
    // Limpiar el query param sin recargar la página
    router.replace("/");
  };

  useEffect(() => {
    const fetchModalidades = async () => {
      try {
        const data = await publicService.getModalidades();
        setModalidades(data);
      } catch (error) {
        console.error("Error cargando modalidades", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModalidades();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/image.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="font-bold text-lg">SIREM</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-24 lg:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('/bolivian-military-soldiers-armed-forces-bolivia-fl.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30" />

        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <Image
                src="/images/image.png"
                alt="Escudo Bolivia"
                width={60}
                height={60}
                className="object-contain"
              />
              <div className="h-12 w-px bg-white/20" />
              <div>
                <p className="text-sm font-medium text-slate-300 tracking-wider uppercase">
                  Ministerio de Defensa
                </p>
                <p className="text-xs text-slate-400">
                  Estado Plurinacional de Bolivia
                </p>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Sistema de <span className="text-primary">Reclutamiento</span>{" "}
              Militar
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
              Plataforma oficial para la gestión de postulantes al servicio
              premilitar y militar. Consulta las modalidades vigentes e inicia
              tu proceso de inscripción.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#modalidades">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-6"
                >
                  Ver Modalidades
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modalidades Section */}
      <section id="modalidades" className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Convocatorias Vigentes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Selecciona la modalidad que se ajuste a tu perfil para ver los
            requisitos y fechas de inscripción.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modalidades.map((modalidad) => (
              <Card
                key={modalidad.id}
                className="group hover:shadow-xl transition-all duration-300 border-muted bg-card"
              >
                <CardHeader>
                  <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <CalendarIcon className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">
                    {modalidad.nombre}
                  </CardTitle>
                  <CardDescription className="font-medium text-primary">
                    {modalidad.edad_minima} - {modalidad.edad_maxima} años
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 line-clamp-3">
                    {modalidad.descripcion ||
                      "Consulte los detalles de esta modalidad en la unidad más cercana."}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <span>Inicio:</span>
                      <span className="font-medium text-foreground">
                        {modalidad.fecha_inicio_inscripcion || "Por definir"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cierre:</span>
                      <span className="font-medium text-foreground">
                        {modalidad.fecha_fin_inscripcion || "Por definir"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" disabled>
                    Inscripción en Unidad
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4 text-white">
                <Image
                  src="/images/image.png"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="object-contain grayscale opacity-80"
                />
                <span className="font-bold text-lg">SIREM</span>
              </div>
              <p className="text-sm leading-relaxed">
                Sistema de Reclutamiento Militar del Estado Plurinacional de
                Bolivia. Gestión transparente y eficiente para el servicio a la
                patria.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">
                Enlaces de Interés
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Ministerio de Defensa
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Fuerzas Armadas
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Normativa Vigente
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm">
                <li>Av. 20 de Octubre, La Paz</li>
                <li>Tel: (2) 2123456</li>
                <li>Email: contacto@mindef.gob.bo</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-xs">
            <p>
              &copy; {new Date().getFullYear()} Ministerio de Defensa. Todos los
              derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal de éxito de registro */}
      {registroExitosoCodigo && (
        <RegistrationSuccessModal
          isOpen={!!registroExitosoCodigo}
          onClose={handleCloseModal}
          codigoInscripcion={registroExitosoCodigo}
        />
      )}

      <InstallPrompt />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LandingContent />
    </Suspense>
  );
}
