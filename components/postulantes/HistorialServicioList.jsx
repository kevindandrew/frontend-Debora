"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Flag, Award, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { postulantesService } from "@/services/postulantes";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const formSchema = z.object({
  titulo: z.string().min(3, "El título es requerido"),
  descripcion: z.string().min(5, "La descripción es requerida"),
  tipo_evento: z.string().min(1, "Seleccione un tipo de evento"),
  fecha_evento: z.string().min(1, "La fecha es requerida"),
});

export function HistorialServicioList({ postulacionId, readOnly = false }) {
  const { toast } = useToast();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      tipo_evento: "OTRO",
      fecha_evento: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (postulacionId) {
      fetchHistorial();
    }
  }, [postulacionId]);

  const fetchHistorial = async () => {
    try {
      const data = await postulantesService.getHistorial(postulacionId);
      // Ordenar por fecha descendente
      const sorted = data.sort(
        (a, b) => new Date(b.fecha_evento) - new Date(a.fecha_evento)
      );
      setHistorial(sorted);
    } catch (error) {
      console.error("Error fetching historial:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      await postulantesService.agregarHistorial(postulacionId, values);
      toast({
        title: "Evento registrado",
        description: "El evento ha sido agregado al historial.",
      });
      form.reset();
      setIsDialogOpen(false);
      fetchHistorial();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar el evento.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getIcon = (tipo) => {
    switch (tipo) {
      case "FELICITACION":
        return <Award className="h-5 w-5 text-yellow-500" />;
      case "SANCION":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "ASCENSO":
        return <Flag className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Historial de Servicio</CardTitle>
          <CardDescription>
            Registro de eventos, ascensos y sanciones.
          </CardDescription>
        </div>
        {!readOnly && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Evento</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 mt-4"
                >
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Ascenso a Cabo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipo_evento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FELICITACION">
                                Felicitación
                              </SelectItem>
                              <SelectItem value="SANCION">Sanción</SelectItem>
                              <SelectItem value="ASCENSO">Ascenso</SelectItem>
                              <SelectItem value="OTRO">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fecha_evento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha</FormLabel>
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
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detalles del evento..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Guardar Evento
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : historial.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            No hay eventos registrados en el historial.
          </div>
        ) : (
          <div className="relative border-l border-muted ml-3 space-y-6">
            {historial.map((evento) => (
              <div key={evento.id} className="ml-6 relative">
                <div className="absolute -left-[35px] bg-background p-1 rounded-full border">
                  {getIcon(evento.tipo_evento)}
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <h4 className="font-semibold text-sm">{evento.titulo}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {evento.descripcion}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap mt-1 sm:mt-0">
                    {format(new Date(evento.fecha_evento), "PPP", {
                      locale: es,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
