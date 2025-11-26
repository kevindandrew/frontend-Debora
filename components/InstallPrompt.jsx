"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
    }

    // Check if iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(ios);

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      toast.success("¡Gracias por instalar la aplicación!");
    }
  };

  if (isStandalone) return null;

  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-background border border-border p-4 rounded-lg shadow-lg z-50 flex items-center justify-between animate-in slide-in-from-bottom-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">Instalar App</p>
            <p className="text-xs text-muted-foreground">
              Pulsa "Compartir" y luego "Agregar a Inicio"
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsIOS(false)}>
          Cerrar
        </Button>
      </div>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-background border border-border p-4 rounded-lg shadow-lg z-50 flex items-center justify-between animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <Download className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">Instalar Aplicación</p>
          <p className="text-xs text-muted-foreground">
            Accede más rápido desde tu pantalla de inicio
          </p>
        </div>
      </div>
      <Button size="sm" onClick={handleInstall}>
        Instalar
      </Button>
    </div>
  );
}
