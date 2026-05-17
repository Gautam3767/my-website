import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles.css";
import PortfolioPage from "./pages/PortfolioPage.jsx";
import WritingPage from "./pages/WritingPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortfolioPage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/writing.html" element={<WritingPage />} />
        <Route path="*" element={<PortfolioPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
