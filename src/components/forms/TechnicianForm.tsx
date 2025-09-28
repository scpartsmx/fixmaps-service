
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Technician } from '@/types';

const technicianSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  especialidade: z.string().optional(),
});

type TechnicianFormData = z.infer<typeof technicianSchema>;

interface TechnicianFormProps {
  onSuccess?: () => void;
}

export function TechnicianForm({ onSuccess }: TechnicianFormProps) {
  const { addTechnician } = useData();
  const { toast } = useToast();

  const form = useForm<TechnicianFormData>({
    resolver: zodResolver(technicianSchema),
    defaultValues: {
      nome: '',
      especialidade: '',
    },
  });

  const onSubmit = async (data: TechnicianFormData) => {
    await addTechnician(data as Omit<Technician, 'id'>);
    toast({
      title: 'Técnico cadastrado',
      description: `${data.nome} foi cadastrado com sucesso.`,
    });
    form.reset();
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do técnico" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="especialidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidade</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Eletricista, Informática" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            Cadastrar Técnico
          </Button>
        </div>
      </form>
    </Form>
  );
}
