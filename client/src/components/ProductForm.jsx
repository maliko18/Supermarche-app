import { useState, useEffect } from 'react';
import { createProduit, updateProduit, getCategories } from '../services/api';

function ProductForm({ produit, onSaved, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    nom: '',
    prix: '',
    quantite: '',
    seuil_alerte: '10',
    code_barres: '',
    emplacement: '',
    categorie_id: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    if (produit) {
      setForm({
        nom: produit.nom || '',
        prix: produit.prix || '',
        quantite: produit.quantite || '',
        seuil_alerte: produit.seuil_alerte || '10',
        code_barres: produit.code_barres || '',
        emplacement: produit.emplacement || '',
        categorie_id: produit.categorie_id || ''
      });
    }
  }, [produit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nom || !form.prix || !form.quantite) {
      setError('Nom, prix et quantité sont obligatoires');
      return;
    }

    const data = {
      ...form,
      prix: parseFloat(form.prix),
      quantite: parseInt(form.quantite),
      seuil_alerte: parseInt(form.seuil_alerte) || 10,
      categorie_id: form.categorie_id ? parseInt(form.categorie_id) : null
    };

    try {
      if (produit) {
        await updateProduit(produit.id, data);
      } else {
        await createProduit(data);
      }
      onSaved();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div className="product-form">
      <h3>{produit ? 'Modifier le produit' : 'Ajouter un produit'}</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom *</label>
          <input name="nom" value={form.nom} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Prix (€) *</label>
          <input name="prix" type="number" step="0.01" min="0" value={form.prix} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Quantité *</label>
          <input name="quantite" type="number" min="0" value={form.quantite} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Seuil d'alerte</label>
          <input name="seuil_alerte" type="number" min="0" value={form.seuil_alerte} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Code-barres</label>
          <input name="code_barres" value={form.code_barres} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Emplacement</label>
          <input name="emplacement" value={form.emplacement} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Catégorie</label>
          <select name="categorie_id" value={form.categorie_id} onChange={handleChange}>
            <option value="">-- Sélectionner --</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary">
            {produit ? 'Enregistrer' : 'Ajouter'}
          </button>
          <button type="button" className="btn" onClick={onCancel} style={{ background: '#95a5a6', color: 'white' }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
