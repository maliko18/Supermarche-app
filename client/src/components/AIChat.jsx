import { useState } from "react";
import { chatAI } from "../services/api";

function AIChat({ categorie, produit }) {
  const initMessage = produit
    ? `Bonjour ! Je suis prêt à vous aider à analyser les performances de ce produit. Que souhaitez-vous savoir sur le **${produit.nom}** ?`
    : categorie
      ? `Bonjour ! Je peux vous aider à analyser le stock de la catégorie **${categorie}**. Posez-moi une question comme "Quels produits sont bientôt en rupture ?"`
      : "Bonjour ! Je suis votre assistant de gestion de stock. Posez-moi une question.";

  const [messages, setMessages] = useState([
    { role: "assistant", content: initMessage },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = produit
    ? [
        "Est-ce que ce prix est compétitif ?",
        "Prévision de rupture de stock",
        "Optimisation de l'emplacement",
      ]
    : [];

  const handleSend = async (text) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    const newMessages = [...messages, { role: "user", content: question }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const data = await chatAI(question);
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.reponse },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Désolé, une erreur est survenue. Vérifiez la configuration de l'API IA.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="ai-chat">
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <span className="ai-avatar">🤖</span>
          <div>
            <strong>Assistant Inventaire IA</strong>
            <span className="ai-status">● Prêt à aider</span>
          </div>
        </div>
      </div>
      <div className="ai-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="ai-message assistant typing">
            ⏳ Réflexion en cours...
          </div>
        )}

        {suggestions.length > 0 && messages.length <= 1 && (
          <div className="ai-suggestions">
            <span className="ai-suggestions-label">SUGGESTIONS D'ANALYSE</span>
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="ai-suggestion-btn"
                onClick={() => handleSend(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="ai-chat-footer">
        <div className="ai-chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              produit ? "Posez une question à l'IA..." : "Poser une question..."
            }
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading}
            className="send-btn"
          >
            ➤
          </button>
        </div>
        <p className="ai-disclaimer">
          L'IA peut faire des erreurs. Vérifiez les informations critiques.
        </p>
      </div>
    </div>
  );
}

export default AIChat;
