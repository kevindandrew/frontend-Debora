"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy } from "lucide-react";
import { toast } from "sonner";

export function RegistrationSuccessModal({
  isOpen,
  onClose,
  codigoInscripcion,
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(codigoInscripcion);
    toast.success("Código copiado al portapapeles");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            ¡Registro Exitoso!
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Tu postulación ha sido registrada correctamente.
            <br />
            Por favor, guarda este código de inscripción.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className="flex items-center space-x-2 rounded-lg border bg-slate-50 p-4">
            <code className="text-2xl font-bold tracking-wider text-slate-900">
              {codigoInscripcion}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8 text-slate-500 hover:text-slate-900"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-center text-muted-foreground px-4">
            Debes presentarte en la unidad de reclutamiento seleccionada con
            este código y tus documentos físicos para continuar el proceso.
          </p>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button type="button" onClick={onClose} className="w-full sm:w-auto">
            Entendido, cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
