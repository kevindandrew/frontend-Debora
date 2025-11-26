"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { materialesService } from "@/services/materiales";

const formSchema = z.object({
  descripcion: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
});

export function SolicitudMaterialForm({ onSuccess }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descripcion: "",
    },
  });

  async function onSubmit(values) {
    setIsLoading(true);
    try {
      await materialesService.solicitarMaterial(values.descripcion);
      toast({
        title: "Solicitud enviada",
        description:
          "Tu solicitud de material ha sido registrada correctamente.",
      });
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitar Material</CardTitle>
        <CardDescription>
          Describe el material que necesita tu unidad.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Pedido</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: 50 resmas de papel bond, 10 cajas de bolígrafos..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Solicitud
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
