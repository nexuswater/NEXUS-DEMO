import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout/Layout";
import Home from "@/pages/home";
import Mint from "@/pages/mint";
import Trade from "@/pages/trade";
import Retire from "@/pages/retire";
import Explorer from "@/pages/explorer";
import Marketplace from "@/pages/marketplace";
import NotFound from "@/pages/not-found";


function Router() {
  return (
    <Layout>
      {({ xrplAddress, isConnected }) => (
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/explorer" component={Explorer} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/mint" component={() => <Mint xrplAddress={xrplAddress} isConnected={isConnected} />} />
          <Route path="/retire" component={Retire} />
          <Route component={NotFound} />
        </Switch>
      )}
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
