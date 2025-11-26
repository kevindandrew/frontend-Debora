"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, FileText, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { postulantesService } from "@/services/postulantes";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const formSchema = z.object({
  tipo_examen: z.string().min(1, "Seleccione un tipo de examen"),
  resultado: z.string().min(1, "El resultado es requerido"),
  fecha_examen: z.string().min(1, "La fecha es requerida"),
  archivo: z.any().optional(),
});

export function ExamenesExternosList({ postulacionId, readOnly = false }) {
  const { toast } = useToast();
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo_examen: "",
      resultado: "",
      fecha_examen: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (postulacionId) {
      fetchExamenes();
    }
  }, [postulacionId]);

  const fetchExamenes = async () => {
    try {
      const data = await postulantesService.getExamenesExternos(postulacionId);
      setExamenes(data);
    } catch (error) {
      console.error("Error fetching examenes:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values) => {
    setUploading(true);
    try {
      await postulantesService.registrarExamenExterno(postulacionId, {
        ...values,
        archivo: values.archivo?.[0], // FileList to File
      });
      toast({
        title: "Examen registrado",
        description: "El examen externo se ha guardado correctamente.",
      });
      form.reset();
      fetchExamenes();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar el examen.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!readOnly && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Nuevo Examen</CardTitle>
            <CardDescription>
              Sube los resultados de exámenes médicos externos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo_examen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Examen</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="RAYOS_X">Rayos X</SelectItem>
                            <SelectItem value="ELECTROCARDIOGRAMA">
                              Electrocardiograma
                            </SelectItem>
                            <SelectItem value="SANGRE">
                              Análisis de Sangre
                            </SelectItem>
                            <SelectItem value="ORINA">
                              Análisis de Orina
                            </SelectItem>
                            <SelectItem value="OTRO">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fecha_examen"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha del Examen</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="resultado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resultado / Observaciones</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Normal, Sin alteraciones..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="archivo"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Archivo Adjunto (Opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.png"
                          onChange={(e) => {
                            onChange(e.target.files);
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={uploading}>
                  {uploading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Registrar Examen
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de Exámenes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : examenes.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              No hay exámenes registrados.
            </div>
          ) : (
            <div className="space-y-4">
              {examenes.map((examen) => (
                <div
                  key={examen.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium">{examen.tipo_examen}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {examen.resultado}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(examen.fecha_examen), "PPP", {
                        locale: es,
                      })}
                    </div>
                  </div>
                  {examen.archivo_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={examen.archivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver Archivo
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
