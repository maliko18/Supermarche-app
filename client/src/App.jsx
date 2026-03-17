import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import StockNotifications from "./components/StockNotifications";

function App() {
  const [ecoMode, setEcoMode] = useState(() => {
    return localStorage.getItem("eco-mode") === "on";
  });

  useEffect(() => {
    if (ecoMode) {
      document.body.classList.add("eco-mode");
      localStorage.setItem("eco-mode", "on");
    } else {
      document.body.classList.remove("eco-mode");
      localStorage.setItem("eco-mode", "off");
    }
  }, [ecoMode]);

  return (
    <BrowserRouter>
      <div className="eco-toggle-wrapper">
        <button
          className={`eco-toggle-btn ${ecoMode ? "active" : ""}`}
          onClick={() => setEcoMode((prev) => !prev)}
          aria-label={
            ecoMode ? "Désactiver le mode éco" : "Activer le mode éco"
          }
        >
          {ecoMode ? "🌿" : "⚡"}
        </button>
        <span className="eco-toggle-tooltip">
          {ecoMode ? "Mode éco activé" : "Mode éco désactivé"}
        </span>
      </div>

      <StockNotifications />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produits" element={<ProductList />} />
        <Route path="/produits/new" element={<ProductDetail />} />
        <Route path="/produits/:id" element={<ProductDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
