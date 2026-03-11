import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getProduits, getCategories } from "../services/api";
import AIChat from "../components/AIChat";

function getStockStatus(quantite, seuil) {
  if (quantite === 0) return { label: "Rupture", className: "badge-rupture" };
  if (quantite <= seuil) return { label: "Faible", className: "badge-faible" };
  return { label: "En stock", className: "badge-stock" };
}

function ProductList() {
  const [produits, setProduits] = useState([]);
  const [categorieName, setCategorieName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categorie = searchParams.get("categorie");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [data, cats] = await Promise.all([
          getProduits(categorie),
          getCategories(),
        ]);
        setProduits(data);
        if (categorie) {
          const cat = cats.find((c) => c.id === parseInt(categorie));
          setCategorieName(cat ? cat.nom : "Produits");
        } else {
          setCategorieName("Tous les produits");
        }
      } catch (err) {
        console.error("Erreur chargement produits", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categorie]);

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="product-page">
      <div className="product-list-container">
        <div className="product-list-main">
          <div className="product-list-header">
            <div>
              <Link to="/" className="back-link">
                ← Retour aux catégories
              </Link>
              <h1 className="product-list-title">{categorieName}</h1>
              <p className="product-list-subtitle">
                Gestion de l'inventaire en temps réel
              </p>
            </div>
            <button
              className="btn-add"
              onClick={() => navigate("/produits/new")}
            >
              + Ajouter un produit
            </button>
          </div>

          <div className="product-table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>PRODUIT</th>
                  <th>ÉTAT</th>
                  <th>QUANTITÉ</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {produits.map((p) => {
                  const status = getStockStatus(p.quantite, p.seuil_alerte);
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link
                          to={`/produits/${p.id}`}
                          className="product-name-link"
                        >
                          {p.nom}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="quantity-cell">
                        <span
                          className={
                            p.quantite <= p.seuil_alerte ? "text-danger" : ""
                          }
                        >
                          {p.quantite} unité{p.quantite > 1 ? "s" : ""}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-icon"
                          onClick={() => navigate(`/produits/${p.id}`)}
                        >
                          ✏️
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {produits.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-row">
                      Aucun produit trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <AIChat categorie={categorieName} />
      </div>
    </div>
  );
}

export default ProductList;
