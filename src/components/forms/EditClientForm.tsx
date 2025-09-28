
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types';

const clientSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email inválido'),
  endereco: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface EditClientFormProps {
  client: Client;
  onSuccess?: () => void;
}

export function EditClientForm({ client, onSuccess }: EditClientFormProps) {
  const { updateClient } = useData();
  const { toast } = useToast();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nome: client.nome,
      telefone: client.telefone || '',
      email: client.email || '',
      endereco: client.endereco || '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      await updateClient(client.id, data as Omit<Client, 'id'>);
      toast({
        title: 'Cliente atualizado',
        description: `${data.nome} foi atualizado com sucesso.`,
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o cliente.',
        variant: 'destructive',
      });
    }
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
                <Input placeholder="Nome do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(11) 99999-9999" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="cliente@exemplo.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input placeholder="Rua, número - Cidade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            Atualizar Cliente
          </Button>
        </div>
      </form>
    </Form>
  );
}
