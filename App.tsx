import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import AdminPage from "@/pages/admin-page";
import { useAuth } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <Route path="/auth">
        <AuthPage />
      </Route>
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
