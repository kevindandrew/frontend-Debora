"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { publicService } from "@/services/public";
import { toast } from "sonner";
import {
  CheckCircle,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DOCUMENT_TYPES = [
  { value: "ci_anverso", label: "Cédula de Identidad (Anverso)" },
  { value: "ci_reverso", label: "Cédula de Identidad (Reverso)" },
  { value: "certificado_nacimiento", label: "Certificado de Nacimiento" },
  { value: "titulo_bachiller", label: "Título de Bachiller / Libreta" },
  { value: "foto_4x4", label: "Fotografía 4x4 Fondo Rojo" },
];

export function DocumentUploadModal({ isOpen, onClose, codigoInscripcion }) {
  const [selectedType, setSelectedType] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedType || !file) {
      toast.error("Selecciona un tipo de documento y un archivo");
      return;
    }

    setLoading(true);
    try {
      await publicService.subirDocumento(codigoInscripcion, selectedType, file);

      toast.success("Documento subido correctamente");

      const typeLabel = DOCUMENT_TYPES.find(
        (t) => t.value === selectedType
      )?.label;
      setUploadedDocs([...uploadedDocs, { type: typeLabel, name: file.name }]);

      setFile(null);
      setSelectedType("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error subiendo documento", error);
      toast.error("Error al subir el documento. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Subir Documentos Digitales
          </DialogTitle>
          <DialogDescription>
            Gestionando documentos para el postulante:{" "}
            <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {codigoInscripcion}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground/80">
              Tipo de Documento
            </Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el documento..." />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((doc) => (
                  <SelectItem key={doc.value} value={doc.value}>
                    {doc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer bg-muted/20",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              file ? "border-green-500/50 bg-green-50/30" : ""
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="font-medium text-sm text-foreground">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Cambiar archivo
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="font-medium text-sm">
                  Haz clic o arrastra un archivo aquí
                </p>
                <p className="text-xs">Soporta PDF, JPG, PNG (Máx 5MB)</p>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={loading || !file || !selectedType}
            className="w-full h-11 text-base shadow-sm"
          >
            {loading ? (
              "Subiendo..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Subir Documento
              </>
            )}
          </Button>

          {uploadedDocs.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Documentos Subidos en esta sesión
              </h4>
              <div className="grid gap-2">
                {uploadedDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">
                          {doc.type}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {doc.name}
                        </span>
                      </div>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-center border-t pt-4 mt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
