import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";

import AccessGate from "@/pages/AccessGate";
import IdentityPage from "@/pages/IdentityPage";
import NetworkRoom from "@/pages/NetworkRoom";
import SignalsPage from "@/pages/SignalsPage";
import CasesPage from "@/pages/CasesPage";
import OperatorsPage from "@/pages/OperatorsPage";
import ProfilePage from "@/pages/ProfilePage";
import CommandPage from "@/pages/CommandPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRouter() {
  const { currentUserId } = useStore();

  if (!currentUserId) {
    return <AccessGate />;
  }

  return (
    <AppShell>
      <Switch>
        <Route path="/" component={IdentityPage} />
        <Route path="/identity" component={IdentityPage} />
        <Route path="/network" component={NetworkRoom} />
        <Route path="/signals" component={SignalsPage} />
        <Route path="/cases" component={CasesPage} />
        <Route path="/operators" component={OperatorsPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/command" component={CommandPage} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <ProtectedRouter />
          </WouterRouter>
        </AppProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
