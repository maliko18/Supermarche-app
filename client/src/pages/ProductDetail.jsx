import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getProduit,
  deleteProduit,
  createProduit,
  updateProduit,
  getCategories,
} from "../services/api";
import AIChat from "../components/AIChat";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produit, setProduit] = useState(null);
  const [categories, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    prix: "",
    quantite: "",
    seuil_alerte: "10",
    code_barres: "",
    emplacement: "",
    categorie_id: "",
  });
  const [error, setError] = useState("");
  const isNew = id === undefined;

  useEffect(() => {
    async function load() {
      try {
        const cats = await getCategories();
        setCategoriesList(cats);
        if (!isNew) {
          const data = await getProduit(id);
          setProduit(data);
          setForm({
            nom: data.nom || "",
            prix: data.prix || "",
            quantite: data.quantite || "",
            seuil_alerte: data.seuil_alerte || "10",
            code_barres: data.code_barres || "",
            emplacement: data.emplacement || "",
            categorie_id: data.categorie_id || "",
          });
        } else {
          setEditing(true);
        }
      } catch (err) {
        console.error("Erreur chargement produit", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isNew]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nom || !form.prix || form.quantite === "") {
      setError("Nom, prix et quantité sont obligatoires");
      return;
    }
    const data = {
      ...form,
      prix: parseFloat(form.prix),
      quantite: parseInt(form.quantite),
      seuil_alerte: parseInt(form.seuil_alerte) || 10,
      categorie_id: form.categorie_id ? parseInt(form.categorie_id) : null,
    };
    try {
      if (isNew) {
        await createProduit(data);
      } else {
        await updateProduit(id, data);
      }
      navigate(-1);
    } catch (err) {
      setError("Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await deleteProduit(id);
      navigate(-1);
    } catch (err) {
      console.error("Erreur suppression", err);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  // Mode formulaire (nouveau ou édition)
  if (editing || isNew) {
    return (
      <div className="detail-page">
        <div className="detail-container">
          <div className="detail-main">
            <div className="breadcrumb">
              <Link to="/">Accueil</Link> &gt;{" "}
              <Link to="/produits">Inventaire</Link> &gt;
              <span> {isNew ? "Ajouter un produit" : "Modifier"}</span>
            </div>
            <div className="detail-form-card">
              <h2>
                {isNew ? "Ajouter un produit" : `Modifier ${produit?.nom}`}
              </h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nom *</label>
                    <input
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Catégorie</label>
                    <select
                      name="categorie_id"
                      value={form.categorie_id}
                      onChange={handleChange}
                    >
                      <option value="">-- Sélectionner --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Prix (€) *</label>
                    <input
                      name="prix"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.prix}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantité *</label>
                    <input
                      name="quantite"
                      type="number"
                      min="0"
                      value={form.quantite}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Seuil d'alerte</label>
                    <input
                      name="seuil_alerte"
                      type="number"
                      min="0"
                      value={form.seuil_alerte}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Code-barres</label>
                    <input
                      name="code_barres"
                      value={form.code_barres}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Emplacement</label>
                    <input
                      name="emplacement"
                      value={form.emplacement}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-action btn-update">
                    {isNew ? "➕ Ajouter" : "💾 Enregistrer"}
                  </button>
                  <button
                    type="button"
                    className="btn-action btn-cancel"
                    onClick={() => (isNew ? navigate(-1) : setEditing(false))}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!produit) return <div className="error-message">Produit non trouvé</div>;

  return (
    <div className="detail-page">
      <div className="detail-container">
        <div className="detail-main">
          <div className="breadcrumb">
            <Link to="/">Accueil</Link> &gt;{" "}
            <Link to="/produits">Inventaire</Link> &gt;
            <span> Détails et Gestion du Produit</span>
          </div>

          <div className="detail-card">
            <div className="detail-top">
              <div className="product-image">
                <div className="product-image-placeholder">
                  <span>📦</span>
                </div>
              </div>
              <div className="product-info">
                <h1>{produit.nom}</h1>
                <p className="product-ref">
                  Référence: SKU-
                  {produit.categorie_nom
                    ?.substring(0, 5)
                    .toUpperCase()
                    .replace(/ /g, "")}
                  -{String(produit.id).padStart(4, "0")}
                </p>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-icon">📂</span>
                    <span className="info-label">Catégorie</span>
                    <span className="info-value">{produit.categorie_nom}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">📦</span>
                    <span className="info-label">Stock actuel</span>
                    <span className="info-value bold">
                      {produit.quantite} unités
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">💰</span>
                    <span className="info-label">Prix unitaire</span>
                    <span className="info-value bold">
                      {Number(produit.prix).toFixed(2).replace(".", ",")} €
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-barcode">
              <span className="barcode-label">📊 CODE-BARRES</span>
              <span className="barcode-value">
                {produit.code_barres || "N/A"}
              </span>
            </div>

            <div className="detail-actions">
              <button
                className="btn-action btn-update"
                onClick={() => setEditing(true)}
              >
                ✏️ Mettre à jour
              </button>
              <button
                className="btn-action btn-add-stock"
                onClick={() => setEditing(true)}
              >
                ➕ Ajouter
              </button>
              <button className="btn-action btn-delete" onClick={handleDelete}>
                🗑️ Supprimer
              </button>
            </div>
          </div>

          <div className="detail-bottom-cards">
            <div className="bottom-card">
              <span className="bottom-card-icon">⚠️</span>
              <span className="bottom-card-label">Seuil d'alerte</span>
              <span className="bottom-card-value">
                {produit.seuil_alerte} unités
              </span>
            </div>
            <div className="bottom-card">
              <span className="bottom-card-icon">🏠</span>
              <span className="bottom-card-label">Emplacement</span>
              <span className="bottom-card-value">
                {produit.emplacement || "Non défini"}
              </span>
            </div>
          </div>
        </div>

        <AIChat produit={produit} />
      </div>
    </div>
  );
}

export default ProductDetail;
