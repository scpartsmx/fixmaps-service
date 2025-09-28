
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { ServiceType } from '@/types';

const serviceTypeSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  precoBase: z.number().min(0, 'Preço base deve ser positivo').optional().or(z.literal('')),
  precoMinimo: z.number().min(0, 'Preço mínimo deve ser positivo').optional().or(z.literal('')),
  precoMaximo: z.number().min(0, 'Preço máximo deve ser positivo').optional().or(z.literal('')),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
}).refine((data) => {
  if (data.precoMinimo && data.precoBase && data.precoMinimo > data.precoBase) {
    return false;
  }
  if (data.precoBase && data.precoMaximo && data.precoBase > data.precoMaximo) {
    return false;
  }
  return true;
}, {
  message: 'Preço mínimo deve ser menor ou igual ao preço base, e preço base deve ser menor ou igual ao preço máximo',
  path: ['precoBase'],
});

type ServiceTypeFormData = z.infer<typeof serviceTypeSchema>;

interface ServiceTypeFormProps {
  onSuccess?: () => void;
}

export function ServiceTypeForm({ onSuccess }: ServiceTypeFormProps) {
  const { addServiceType } = useData();
  const { toast } = useToast();

  const form = useForm<ServiceTypeFormData>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: {
      nome: '',
      precoBase: undefined,
      precoMinimo: undefined,
      precoMaximo: undefined,
      descricao: '',
      ativo: true,
    },
  });

  const onSubmit = async (data: ServiceTypeFormData) => {
    await addServiceType(data as Omit<ServiceType, 'id'>);
    toast({
      title: 'Tipo de serviço cadastrado',
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
              <FormLabel>Nome do Tipo de Serviço</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Manutenção, Reparo, Instalação" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição detalhada do tipo de serviço" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="precoMinimo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Mínimo (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0,00" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="precoBase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Base (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0,00" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="precoMaximo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Máximo (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0,00" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Tipo de serviço ativo
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Desmarque para desativar este tipo de serviço
                </p>
              </div>
            </FormItem>
          )}
        />
        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            Cadastrar Tipo de Serviço
          </Button>
        </div>
      </form>
    </Form>
  );
}
