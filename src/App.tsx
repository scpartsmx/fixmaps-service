import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppWithLayout from "./AppWithLayout";
import OrdersList from "./pages/OrdersList";
import OrderNew from "./pages/OrderNew";
import OrderDetail from "./pages/OrderDetail";
import OrderEdit from "./pages/OrderEdit";
import OrderEditFinanceiro from "./pages/OrderEditFinanceiro";
import Clients from "./pages/Clients";
import Technicians from "./pages/Technicians";
import ServiceTypes from "./pages/ServiceTypes";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Calendar from "./pages/Calendar";
import Financeiro from "./pages/Financeiro";
import { AuthProvider } from "./auth/AuthProvider";
import RequireAuth from "./auth/RequireAuth";
import AuthPage from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="service-pro-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Index />
                  </RequireAuth>
                }
              />
              <Route
                path="/ordens"
                element={
                  <RequireAuth>
                    <AppWithLayout>
                      <OrdersList />
                    </AppWithLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/ordens/nova"
                element={
                  <RequireAuth>
                    <AppWithLayout>
                      <OrderNew />
                    </AppWithLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/ordens/:id"
                element={
                  <RequireAuth>
                    <AppWithLayout>
                      <OrderDetail />
                    </AppWithLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/ordens/:id/editar"
                element={
                  <RequireAuth>
                    <AppWithLayout>
                      <OrderEdit />
                    </AppWithLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/ordens/:id/editar-financeiro"
                element={
                  <RequireAuth>
                    <AppWithLayout>
                      <OrderEditFinanceiro />
                    </AppWithLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/clientes"
                element={
                  <RequireAuth>
                    <AppWithLayout>
                      <Clients />
                    </AppWithLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/tecnicos"
                element={
                  <RequireAuth>
                    <AppWithLayout>
                      <Technicians />
                    </AppWithLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/tipos-servico"
                element={
                  <RequireAuth>
                    <AppWithLayout>
                      <ServiceTypes />
                    </AppWithLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/relatorios"
                element={
                  <RequireAuth>
                    <AppWithLayout>
                      <Reports />
                    </AppWithLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <RequireAuth>
                    <AppWithLayout>
                      <Settings />
                    </AppWithLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/calendario"
                element={
                  <RequireAuth>
                    <AppWithLayout>
                      <Calendar />
                    </AppWithLayout>
                  </RequireAuth>
                }
              />
              <Route
                path="/financeiro"
                element={
                  <RequireAuth>
                    <AppWithLayout>
                      <Financeiro />
                    </AppWithLayout>
                  </RequireAuth>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
