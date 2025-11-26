"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Upload,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { postulantesService } from "@/services/postulantes";
import { toast } from "sonner";

export function DocumentUpload({
  codigo,
  requiredDocs,
  uploadedDocs = [],
  onUploadSuccess,
}) {
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedDocType, setSelectedDocType] = useState(null);

  // Mapa de documentos subidos: { TIPO: true/false }
  const uploadedMap = uploadedDocs.reduce((acc, doc) => {
    acc[doc.tipo_documento] = true;
    return acc;
  }, {});

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedDocType) return;

    setUploadingId(selectedDocType);
    try {
      await postulantesService.subirDocumento(codigo, selectedDocType, file);
      toast.success(
        `Documento ${formatDocType(selectedDocType)} subido correctamente`
      );
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Error al subir el documento");
    } finally {
      setUploadingId(null);
      setSelectedDocType(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerUpload = (docType) => {
    setSelectedDocType(docType);
    fileInputRef.current?.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
      />

      {requiredDocs.map((docType) => {
        const isUploaded = uploadedMap[docType];
        const isUploading = uploadingId === docType;

        return (
          <div
            key={docType}
            className={cn(
              "flex flex-col justify-between p-4 rounded-xl border transition-all duration-200",
              isUploaded
                ? "bg-emerald-50/50 border-emerald-200 shadow-sm"
                : "bg-card border-border hover:border-primary/50 hover:shadow-md"
            )}
          >
            <div className="flex items-start gap-3 mb-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  isUploaded
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-primary/10 text-primary"
                )}
              >
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p
                  className="font-semibold text-sm text-foreground truncate"
                  title={formatDocType(docType)}
                >
                  {formatDocType(docType)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isUploaded
                    ? "Verificado y almacenado"
                    : "Requerido para habilitación"}
                </p>
              </div>
            </div>

            <div className="mt-auto pt-2">
              {isUploaded ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 cursor-default"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Completado
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={isUploading}
                  onClick={() => triggerUpload(docType)}
                  className="w-full"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isUploading ? "Subiendo..." : "Subir Archivo"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDocType(type) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
