import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles.css";
import PortfolioPage from "./pages/PortfolioPage.jsx";
import WritingPage from "./pages/WritingPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import RouteEffects from "./components/RouteEffects.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <RouteEffects />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          {/* one route so opening an essay never remounts the list behind it */}
          <Route path="/writing/:slug?" element={<WritingPage />} />
          <Route path="/writing.html" element={<Navigate to="/writing" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
