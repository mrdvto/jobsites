import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./contexts/DataContext";
import { useState } from "react";
import JobSiteList from "./pages/JobSiteList";
import JobSiteDetail from "./pages/JobSiteDetail";
import JobSiteChangeLog from "./pages/JobSiteChangeLog";
import ManageDropdowns from "./pages/ManageDropdowns";
import NotFound from "./pages/NotFound";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<JobSiteList />} />
              <Route path="/site/:id" element={<JobSiteDetail />} />
              <Route path="/site/:id/changelog" element={<JobSiteChangeLog />} />
              <Route path="/settings/dropdowns" element={<ManageDropdowns />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
