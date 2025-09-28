import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Users,
  Wrench,
  BarChart3,
  Search,
  Settings,
  LogIn,
  LogOut,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthProvider";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Ordens", url: "/ordens", icon: FileText },
  { title: "Nova OS", url: "/ordens/nova", icon: FilePlus2 },
  { title: "Clientes", url: "/clientes", icon: Users },
  { title: "Técnicos", url: "/tecnicos", icon: Wrench },
  { title: "Tipos de Serviço", url: "/tipos-servico", icon: Settings },
  { title: "Calendário", url: "/calendario", icon: Calendar },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
];

function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="bg-gradient-to-b from-background to-muted/20">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-primary px-4 py-6 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:text-center">
            <span className="group-data-[collapsible=icon]:hidden">
              Service PRO
            </span>
            <span className="hidden group-data-[collapsible=icon]:block text-xs font-bold">
              SP
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:px-1">
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="rounded-lg hover:bg-accent/50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground group-data-[collapsible=icon]:justify-center"
                    tooltip={item.title}
                  >
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium group-data-[collapsible=icon]:hidden">
                        {item.title}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50 group-data-[collapsible=icon]:p-1">
        <SidebarMenuButton
          asChild
          isActive={isActive("/configuracoes")}
          className="rounded-lg hover:bg-accent/50 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground group-data-[collapsible=icon]:justify-center"
          tooltip="Configurações"
        >
          <NavLink
            to="/configuracoes"
            className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center"
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm group-data-[collapsible=icon]:hidden">
              Configurações
            </span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { user, signOut } = useAuth();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/ordens?busca=${encodeURIComponent(q)}`);
  };

  const handleAuthClick = async () => {
    if (user) {
      await signOut();
      navigate("/auth");
      return;
    }
    navigate("/auth");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="h-16 flex items-center justify-between border-b border-border/50 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-accent rounded-lg" />
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="secondary"
                onClick={handleAuthClick}
                className="inline-flex items-center gap-2"
              >
                {user ? (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Entrar</span>
                  </>
                )}
              </Button>
            </div>
          </header>
          <div className="p-6 bg-gradient-to-br from-background via-background to-muted/10 min-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
