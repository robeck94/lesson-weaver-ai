import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Generator from "./pages/Generator";
import GameTemplates from "./pages/GameTemplates";
import NotFound from "./pages/NotFound";
import { useSettings } from "./contexts/SettingsContext";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { getFontFamilyClass } = useSettings();
  
  useEffect(() => {
    // Apply font family to body
    document.body.className = getFontFamilyClass();
  }, [getFontFamilyClass]);

  return (
    <>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/game-templates" element={<GameTemplates />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
