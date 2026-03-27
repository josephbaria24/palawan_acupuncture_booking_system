import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";

// Pages
import LandingPage from "./pages/landing";
import AdminLogin from "./pages/admin/login";
import AdminDashboard from "./pages/admin/dashboard";
import SchedulesList from "./pages/admin/schedules";
import ScheduleDetail from "./pages/admin/schedules/detail";
import NewSchedule from "./pages/admin/schedules/new";
import AssignClient from "./pages/admin/assign";
import PublicCalendar from "./pages/public/calendar";
import PublicBooking from "./pages/public/book";
import TrackBooking from "./pages/public/track";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity, // local mock DB doesn't get stale from server
    }
  }
});

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/book" component={PublicCalendar} />
      <Route path="/book/:scheduleId" component={PublicBooking} />
      <Route path="/track" component={TrackBooking} />
      <Route path="/track/:code" component={TrackBooking} />

      {/* Admin Login (public) */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Protected Admin Routes */}
      <Route path="/admin">
        {() => <ProtectedRoute><AdminDashboard /></ProtectedRoute>}
      </Route>
      <Route path="/admin/schedules">
        {() => <ProtectedRoute><SchedulesList /></ProtectedRoute>}
      </Route>
      <Route path="/admin/schedules/new">
        {() => <ProtectedRoute><NewSchedule /></ProtectedRoute>}
      </Route>
      <Route path="/admin/schedules/:id">
        {() => <ProtectedRoute><ScheduleDetail /></ProtectedRoute>}
      </Route>
      <Route path="/admin/assign">
        {() => <ProtectedRoute><AssignClient /></ProtectedRoute>}
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
