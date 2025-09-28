import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/context/DataContext';
import { WorkOrder } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { StatsCards } from '@/components/StatsCards';

export default function OrdersList() {
  const [searchParams] = useSearchParams();
  const busca = searchParams.get('busca') || '';
  const [selectedStatus, setSelectedStatus] = useState<string>('__all__');
  const { toast } = useToast();
  const { workOrders = [], clients = [] } = useData();

  const filteredOrders = workOrders.filter((order) => {
    const statusMatch = selectedStatus === '__all__' || order.status === selectedStatus;
    const client = clients.find(c => c.id === order.clienteId);
    const searchMatch =
      order.id.toLowerCase().includes(busca.toLowerCase()) ||
      (client?.nome.toLowerCase().includes(busca.toLowerCase()) ?? false) ||
      order.descricaoProblema.toLowerCase().includes(busca.toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ordens de Serviço</h1>
        <Button asChild className="bg-primary hover:bg-primary/90 rounded-lg">
          <Link to="/ordens/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova OS
          </Link>
        </Button>
      </div>

      <StatsCards />

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Lista de Ordens</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48 rounded-lg border-muted">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="__all__">Todos os status</SelectItem>
                  <SelectItem value="Aberta">Aberta</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Aguardando Peças">Aguardando Peças</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedStatus("__all__")}
                className="rounded-lg"
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">OS #</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Nenhuma ordem encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {filteredOrders.map((order: WorkOrder) => {
                  const client = clients.find(c => c.id === order.clienteId);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{client?.nome || 'Cliente não encontrado'}</TableCell>
                      <TableCell>
                        <CardDescription className="line-clamp-1">{order.descricaoProblema}</CardDescription>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            order.status === 'Aberta' && 'bg-yellow-500 text-yellow-50',
                            order.status === 'Em Andamento' && 'bg-blue-500 text-blue-50',
                            order.status === 'Concluída' && 'bg-green-500 text-green-50',
                            order.status === 'Cancelada' && 'bg-red-500 text-red-50',
                            order.status === 'Aguardando Peças' && 'bg-orange-500 text-orange-50'
                          )}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="link" size="sm">
                          <Link to={`/ordens/${order.id}`}>Ver detalhes</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
