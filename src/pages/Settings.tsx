import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthProvider";
import { Lock, User, Building2 } from "lucide-react";
import SEO from "@/components/SEO";
import { CompanyData } from "@/types";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "A senha atual deve ter pelo menos 6 caracteres"),
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme a nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const companyDataSchema = z.object({
  nome: z.string().min(1, "Nome da empresa é obrigatório"),
  razaoSocial: z.string().optional(),
  cnpj: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  website: z.string().optional(),
  observacoes: z.string().optional(),
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
type CompanyDataValues = z.infer<typeof companyDataSchema>;

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);

  const changePasswordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const companyForm = useForm<CompanyDataValues>({
    resolver: zodResolver(companyDataSchema),
    defaultValues: {
      nome: "",
      razaoSocial: "",
      cnpj: "",
      inscricaoEstadual: "",
      inscricaoMunicipal: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      telefone: "",
      celular: "",
      email: "",
      website: "",
      observacoes: "",
    },
  });

  // Carregar dados da empresa
  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      setIsLoadingCompany(true);
      const { data, error } = await supabase
        .from("empresa")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("[Settings] Error loading company data:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados da empresa",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setCompanyData(data);
        // Preencher o formulário com os dados carregados
        companyForm.reset({
          nome: data.nome || "",
          razaoSocial: data.razao_social || "",
          cnpj: data.cnpj || "",
          inscricaoEstadual: data.inscricao_estadual || "",
          inscricaoMunicipal: data.inscricao_municipal || "",
          endereco: data.endereco || "",
          numero: data.numero || "",
          complemento: data.complemento || "",
          bairro: data.bairro || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
          cep: data.cep || "",
          telefone: data.telefone || "",
          celular: data.celular || "",
          email: data.email || "",
          website: data.website || "",
          observacoes: data.observacoes || "",
        });
      }
    } catch (error) {
      console.error("[Settings] Unexpected error loading company data:", error);
    } finally {
      setIsLoadingCompany(false);
    }
  };

  const onSaveCompanyData = async (values: CompanyDataValues) => {
    try {
      const companyDataToSave = {
        nome: values.nome,
        razao_social: values.razaoSocial,
        cnpj: values.cnpj,
        inscricao_estadual: values.inscricaoEstadual,
        inscricao_municipal: values.inscricaoMunicipal,
        endereco: values.endereco,
        numero: values.numero,
        complemento: values.complemento,
        bairro: values.bairro,
        cidade: values.cidade,
        estado: values.estado,
        cep: values.cep,
        telefone: values.telefone,
        celular: values.celular,
        email: values.email,
        website: values.website,
        observacoes: values.observacoes,
      };

      let result;
      if (companyData?.id) {
        // Atualizar dados existentes
        result = await supabase
          .from("empresa")
          .update(companyDataToSave)
          .eq("id", companyData.id)
          .select()
          .single();
      } else {
        // Inserir novos dados
        result = await supabase
          .from("empresa")
          .insert(companyDataToSave)
          .select()
          .single();
      }

      if (result.error) {
        console.error("[Settings] Error saving company data:", result.error);
        toast({
          title: "Erro",
          description:
            "Falha ao salvar dados da empresa: " + result.error.message,
          variant: "destructive",
        });
        return;
      }

      setCompanyData(result.data);
      toast({
        title: "Sucesso!",
        description: "Dados da empresa salvos com sucesso.",
      });
    } catch (error) {
      console.error("[Settings] Unexpected error saving company data:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao salvar os dados",
        variant: "destructive",
      });
    }
  };

  const onChangePassword = async (values: ChangePasswordValues) => {
    console.log("[Settings] changing password");

    try {
      // First verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: values.currentPassword,
      });

      if (signInError) {
        toast({
          title: "Erro",
          description: "Senha atual incorreta",
          variant: "destructive",
        });
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) {
        console.error("[Settings] password update error", updateError);
        toast({
          title: "Erro",
          description: "Falha ao alterar senha: " + updateError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso.",
      });

      // Reset form
      changePasswordForm.reset();
    } catch (error) {
      console.error("[Settings] unexpected error", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <SEO
        title="Configurações — Service PRO"
        description="Configurações da conta"
      />
      <h1 className="text-2xl font-semibold mb-6">Configurações</h1>

      <div className="grid gap-6 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Dados da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingCompany ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Carregando dados da empresa...
                </p>
              </div>
            ) : (
              <Form {...companyForm}>
                <form
                  onSubmit={companyForm.handleSubmit(onSaveCompanyData)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={companyForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o nome da empresa"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="razaoSocial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razão Social</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite a razão social"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="00.000.000/0001-00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="inscricaoEstadual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Estadual</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite a inscrição estadual"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o endereço" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="Número" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite a cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="UF" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 1234-5678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="celular"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Celular</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="contato@empresa.com.br"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={companyForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://www.empresa.com.br"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={companyForm.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações adicionais sobre a empresa"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Salvar Dados da Empresa
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Alterar Senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...changePasswordForm}>
              <form
                onSubmit={changePasswordForm.handleSubmit(onChangePassword)}
                className="space-y-4"
              >
                <FormField
                  control={changePasswordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha Atual</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite sua senha atual"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={changePasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite a nova senha"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={changePasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Confirme a nova senha"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Alterar Senha
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
