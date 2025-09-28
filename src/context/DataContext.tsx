import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
// REMOVIDO: import { workOrders as baseOrders } from '@/data/mockData';
import {
  Client,
  Technician,
  ServiceType,
  WorkOrder,
  Status,
  Priority,
} from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";

interface DataContextValue {
  clients: Client[];
  technicians: Technician[];
  serviceTypes: ServiceType[];
  workOrders: WorkOrder[];
  // addOrder e updateOrderStatus agora persistem no Supabase
  addOrder: (
    order: Omit<WorkOrder, "historico"> & { historico?: WorkOrder["historico"] }
  ) => Promise<void>;
  updateOrder: (
    id: string,
    order: Partial<Omit<WorkOrder, "id" | "historico">>
  ) => Promise<void>;
  updateOrderStatus: (
    id: string,
    status: Status,
    note?: string
  ) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, "id">) => Promise<void>;
  updateClient: (id: string, client: Omit<Client, "id">) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addTechnician: (technician: Omit<Technician, "id">) => Promise<void>;
  updateTechnician: (
    id: string,
    technician: Omit<Technician, "id">
  ) => Promise<void>;
  deleteTechnician: (id: string) => Promise<void>;
  addServiceType: (serviceType: Omit<ServiceType, "id">) => Promise<void>;
  // Permitir atualização parcial para corrigir o erro do EditServiceTypeForm.tsx
  updateServiceType: (
    id: string,
    serviceType: Partial<Omit<ServiceType, "id">>
  ) => Promise<void>;
  deleteServiceType: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

// Helpers de mapeamento entre DB (snake_case) e app (camelCase)
const mapDbToWorkOrder = (row: any): WorkOrder => ({
  id: row.id,
  clienteId: row.cliente_id,
  tipoServicoId: row.tipo_servico_id,
  tiposServico: row.tipos_servico ?? undefined,
  descricaoProblema: row.descricao_problema,
  prioridade: row.prioridade as Priority,
  status: row.status as Status,
  dataAbertura: row.data_abertura,
  previsaoConclusao: row.previsao_conclusao ?? undefined,
  tecnicoId: row.tecnico_id ?? undefined,
  historico: (row.historico ?? []) as WorkOrder["historico"],
  valorServico: row.valor_servico ?? undefined,
  valorPecas: row.valor_pecas ?? undefined,
  valorDeslocamento: row.valor_deslocamento ?? undefined,
  valorTotal: row.valor_total ?? undefined,
  desconto: row.desconto ?? undefined,
  formaPagamento: row.forma_pagamento ?? undefined,
  statusPagamento: row.status_pagamento ?? undefined,
  dataPagamento: row.data_pagamento ?? undefined,
  observacoesFinanceiras: row.observacoes_financeiras ?? undefined,
});

const mapWorkOrderToDb = (
  o: Omit<WorkOrder, "historico"> & { historico: WorkOrder["historico"] }
) => ({
  id: o.id,
  cliente_id: o.clienteId,
  tipo_servico_id: o.tipoServicoId,
  tipos_servico: o.tiposServico ?? null,
  descricao_problema: o.descricaoProblema,
  prioridade: o.prioridade,
  status: o.status,
  data_abertura: o.dataAbertura,
  previsao_conclusao: o.previsaoConclusao ?? null,
  tecnico_id: o.tecnicoId ?? null,
  // Cast para JSON aceito pelo Supabase
  historico: o.historico as any,
  valor_servico: o.valorServico ?? null,
  valor_pecas: o.valorPecas ?? null,
  valor_deslocamento: o.valorDeslocamento ?? null,
  valor_total: o.valorTotal ?? null,
  desconto: o.desconto ?? null,
  forma_pagamento: o.formaPagamento ?? null,
  status_pagamento: o.statusPagamento ?? null,
  data_pagamento: o.dataPagamento ?? null,
  observacoes_financeiras: o.observacoesFinanceiras ?? null,
});

// Helpers de mapeamento para ServiceType
const mapDbToServiceType = (row: any): ServiceType => ({
  id: row.id,
  nome: row.nome,
  precoBase: row.preco_base ?? undefined,
  precoMinimo: row.preco_minimo ?? undefined,
  precoMaximo: row.preco_maximo ?? undefined,
  descricao: row.descricao ?? undefined,
  ativo: row.ativo ?? true,
});

const mapServiceTypeToDb = (s: Partial<ServiceType>) => ({
  nome: s.nome,
  preco_base: s.precoBase ?? null,
  preco_minimo: s.precoMinimo ?? null,
  preco_maximo: s.precoMaximo ?? null,
  descricao: s.descricao ?? null,
  ativo: s.ativo ?? true,
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  // REMOVIDO: inicialização com mock. Agora começa vazio e busca do Supabase.
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  // Carrega clientes do Supabase quando o usuário estiver autenticado
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setClients([]);
      return;
    }

    const fetchClients = async () => {
      console.log("[DataContext] Fetching clients from Supabase");
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[DataContext] Error fetching clients:", error);
        throw error;
      }
      setClients((data ?? []) as Client[]);
    };

    fetchClients();
  }, [user, authLoading]);

  // Carrega técnicos do Supabase quando o usuário estiver autenticado
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setTechnicians([]);
      return;
    }

    const fetchTechnicians = async () => {
      console.log("[DataContext] Fetching technicians from Supabase");
      const { data, error } = await supabase
        .from("technicians")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[DataContext] Error fetching technicians:", error);
        throw error;
      }
      setTechnicians((data ?? []) as Technician[]);
    };

    fetchTechnicians();
  }, [user, authLoading]);

  // Carrega tipos de serviço do Supabase quando o usuário estiver autenticado
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setServiceTypes([]);
      return;
    }

    const fetchServiceTypes = async () => {
      console.log("[DataContext] Fetching service types from Supabase");
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[DataContext] Error fetching service types:", error);
        throw error;
      }
      const mapped = (data ?? []).map(mapDbToServiceType);
      setServiceTypes(mapped);
    };

    fetchServiceTypes();
  }, [user, authLoading]);

  // Carrega ordens de serviço (OS) do Supabase quando o usuário estiver autenticado
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setWorkOrders([]);
      return;
    }

    const fetchWorkOrders = async () => {
      console.log("[DataContext] Fetching work orders from Supabase");
      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[DataContext] Error fetching work orders:", error);
        throw error;
      }

      const mapped = (data ?? []).map(mapDbToWorkOrder);
      setWorkOrders(mapped);
    };

    fetchWorkOrders();
  }, [user, authLoading]);

  const addOrder: DataContextValue["addOrder"] = async (orderInput) => {
    // Historico padrão caso não venha do formulário
    const historico = orderInput.historico ?? [
      {
        data: new Date().toISOString(),
        descricao: "OS criada",
        status: orderInput.status,
      },
    ];
    const order: Omit<WorkOrder, "historico"> & {
      historico: WorkOrder["historico"];
    } = {
      ...orderInput,
      dataAbertura: new Date().toISOString(),
      historico,
    };

    console.log("[DataContext] Inserting work order into Supabase", order);
    const payload = mapWorkOrderToDb(order);
    const { data, error } = await supabase
      .from("work_orders")
      .insert(payload)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[DataContext] Error inserting work order:", error);
      throw error;
    }

    if (data) {
      const mapped = mapDbToWorkOrder(data);
      setWorkOrders((prev) => [mapped, ...prev]);
    }
  };

  const updateOrderStatus: DataContextValue["updateOrderStatus"] = async (
    id,
    status,
    note
  ) => {
    const current = workOrders.find((o) => o.id === id);
    const baseHistorico = current?.historico ?? [];
    const novoHistorico = [
      ...baseHistorico,
      {
        data: new Date().toISOString(),
        descricao: note || `Status atualizado para ${status}`,
        status,
      },
    ];

    console.log(
      "[DataContext] Updating work order status in Supabase",
      id,
      status
    );
    const { data, error } = await supabase
      .from("work_orders")
      .update({ status, historico: novoHistorico as any })
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[DataContext] Error updating work order:", error);
      throw error;
    }

    if (data) {
      const updated = mapDbToWorkOrder(data);
      setWorkOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } else {
      // Se por algum motivo não retornou dado, ainda atualiza localmente para manter consistência visual
      setWorkOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status, historico: novoHistorico } : o
        )
      );
    }
  };

  const updateOrder: DataContextValue["updateOrder"] = async (
    id,
    orderUpdate
  ) => {
    console.log(
      "[DataContext] Updating work order in Supabase",
      id,
      orderUpdate
    );

    // Mapear os campos para snake_case
    const updateData: any = {};
    if (orderUpdate.clienteId !== undefined)
      updateData.cliente_id = orderUpdate.clienteId;
    if (orderUpdate.tipoServicoId !== undefined)
      updateData.tipo_servico_id = orderUpdate.tipoServicoId;
    if (orderUpdate.descricaoProblema !== undefined)
      updateData.descricao_problema = orderUpdate.descricaoProblema;
    if (orderUpdate.prioridade !== undefined)
      updateData.prioridade = orderUpdate.prioridade;
    if (orderUpdate.status !== undefined)
      updateData.status = orderUpdate.status;
    if (orderUpdate.previsaoConclusao !== undefined)
      updateData.previsao_conclusao = orderUpdate.previsaoConclusao;
    if (orderUpdate.tecnicoId !== undefined)
      updateData.tecnico_id = orderUpdate.tecnicoId;

    const { data, error } = await supabase
      .from("work_orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[DataContext] Error updating work order:", error);
      throw error;
    }

    if (data) {
      const updatedOrder = mapDbToWorkOrder(data);
      setWorkOrders((prev) =>
        prev.map((o) => (o.id === id ? updatedOrder : o))
      );
    }
  };

  const deleteOrder: DataContextValue["deleteOrder"] = async (id) => {
    console.log("[DataContext] Deleting work order from Supabase", id);
    const { error } = await supabase.from("work_orders").delete().eq("id", id);

    if (error) {
      console.error("[DataContext] Error deleting work order:", error);
      throw error;
    }

    setWorkOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const addClient: DataContextValue["addClient"] = async (client) => {
    console.log("[DataContext] Inserting client into Supabase", client);
    const { data, error } = await supabase
      .from("clients")
      .insert(client)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[DataContext] Error inserting client:", error);
      throw error;
    }

    if (data) {
      setClients((prev) => [data as Client, ...prev]);
    }
  };

  const updateClient: DataContextValue["updateClient"] = async (id, client) => {
    console.log("[DataContext] Updating client in Supabase", id, client);
    const { data, error } = await supabase
      .from("clients")
      .update(client)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[DataContext] Error updating client:", error);
      throw error;
    }

    if (data) {
      setClients((prev) =>
        prev.map((c) => (c.id === id ? (data as Client) : c))
      );
    }
  };

  const deleteClient: DataContextValue["deleteClient"] = async (id) => {
    console.log("[DataContext] Deleting client from Supabase", id);
    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      console.error("[DataContext] Error deleting client:", error);
      throw error;
    }

    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const addTechnician: DataContextValue["addTechnician"] = async (
    technician
  ) => {
    console.log("[DataContext] Inserting technician into Supabase", technician);
    const { data, error } = await supabase
      .from("technicians")
      .insert(technician)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[DataContext] Error inserting technician:", error);
      throw error;
    }

    if (data) {
      setTechnicians((prev) => [data as Technician, ...prev]);
    }
  };

  const updateTechnician: DataContextValue["updateTechnician"] = async (
    id,
    technician
  ) => {
    console.log(
      "[DataContext] Updating technician in Supabase",
      id,
      technician
    );
    const { data, error } = await supabase
      .from("technicians")
      .update(technician)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[DataContext] Error updating technician:", error);
      throw error;
    }

    if (data) {
      setTechnicians((prev) =>
        prev.map((t) => (t.id === id ? (data as Technician) : t))
      );
    }
  };

  const deleteTechnician: DataContextValue["deleteTechnician"] = async (id) => {
    console.log("[DataContext] Deleting technician from Supabase", id);
    const { error } = await supabase.from("technicians").delete().eq("id", id);

    if (error) {
      console.error("[DataContext] Error deleting technician:", error);
      throw error;
    }

    setTechnicians((prev) => prev.filter((t) => t.id !== id));
  };

  const addServiceType: DataContextValue["addServiceType"] = async (
    serviceType
  ) => {
    console.log(
      "[DataContext] Inserting service type into Supabase",
      serviceType
    );
    const payload = mapServiceTypeToDb(serviceType);
    const { data, error } = await supabase
      .from("service_types")
      .insert(payload)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[DataContext] Error inserting service type:", error);
      throw error;
    }

    if (data) {
      const mapped = mapDbToServiceType(data);
      setServiceTypes((prev) => [mapped, ...prev]);
    }
  };

  const updateServiceType: DataContextValue["updateServiceType"] = async (
    id,
    serviceType
  ) => {
    console.log(
      "[DataContext] Updating service type in Supabase",
      id,
      serviceType
    );
    const payload = mapServiceTypeToDb(serviceType);
    const { data, error } = await supabase
      .from("service_types")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[DataContext] Error updating service type:", error);
      throw error;
    }

    if (data) {
      const mapped = mapDbToServiceType(data);
      setServiceTypes((prev) =>
        prev.map((t) => (t.id === id ? mapped : t))
      );
    }
  };

  const deleteServiceType: DataContextValue["deleteServiceType"] = async (
    id
  ) => {
    console.log("[DataContext] Deleting service type from Supabase", id);
    const { error } = await supabase
      .from("service_types")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[DataContext] Error deleting service type:", error);
      throw error;
    }

    setServiceTypes((prev) => prev.filter((t) => t.id !== id));
  };

  const value = useMemo(
    () => ({
      clients,
      technicians,
      serviceTypes,
      workOrders,
      addOrder,
      updateOrder,
      updateOrderStatus,
      deleteOrder,
      addClient,
      updateClient,
      deleteClient,
      addTechnician,
      updateTechnician,
      deleteTechnician,
      addServiceType,
      updateServiceType,
      deleteServiceType,
    }),
    [clients, technicians, serviceTypes, workOrders]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
