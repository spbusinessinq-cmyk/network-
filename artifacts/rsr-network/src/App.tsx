import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Shield } from "lucide-react";

import AccessGate from "@/pages/AccessGate";
import CommandDeckPage from "@/pages/CommandDeckPage";
import IdentityPage from "@/pages/IdentityPage";
import NetworkRoom from "@/pages/NetworkRoom";
import SignalsPage from "@/pages/SignalsPage";
import CasesPage from "@/pages/CasesPage";
import OperatorsPage from "@/pages/OperatorsPage";
import DossierPage from "@/pages/DossierPage";
import ProfilePage from "@/pages/ProfilePage";
import CommandPage from "@/pages/CommandPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#050607] flex items-center justify-center">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="text-center space-y-4 z-10">
        <Shield className="w-8 h-8 text-emerald-500 mx-auto animate-pulse" />
        <div className="text-xs font-mono tracking-widest text-zinc-500 uppercase">Establishing secure connection...</div>
      </div>
    </div>
  );
}

function ProtectedRouter() {
  const { currentUserId, isLoading, isInitialized } = useStore();

  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  if (!currentUserId) {
    return <AccessGate />;
  }

  return (
    <AppShell>
      <Switch>
        <Route path="/" component={CommandDeckPage} />
        <Route path="/identity" component={IdentityPage} />
        <Route path="/network" component={NetworkRoom} />
        <Route path="/signals" component={SignalsPage} />
        <Route path="/cases" component={CasesPage} />
        <Route path="/operators" component={OperatorsPage} />
        <Route path="/operators/:userId" component={DossierPage} />
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
