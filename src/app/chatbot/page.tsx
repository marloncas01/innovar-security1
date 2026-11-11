"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";

interface DBMessage {
  id: string;
  type: string;
  question: string | null;
  answer: string | null;
  options: string;
  actionUrl: string | null;
  sortOrder: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

function getAnswer(input: string, faqItems: FAQItem[]): string {
  const normalized = input.toLowerCase().trim().replace(/[¿?¡!.,]/g, "");

  // 1. Exact or partial match on question
  for (const item of faqItems) {
    const normalizedQuestion = item.question.toLowerCase().replace(/[¿?¡!.,]/g, "").trim();
    if (normalized.includes(normalizedQuestion) || normalizedQuestion.includes(normalized)) {
      return item.answer;
    }
  }

  // 2. Keyword matching
  for (const item of faqItems) {
    const questionWords = item.question
      .toLowerCase()
      .replace(/[¿?¡!.,]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3);

    for (const word of questionWords) {
      if (normalized.includes(word)) {
        return item.answer;
      }
    }
  }

  // 3. Fallback keywords
  if (normalized.includes("precio") || normalized.includes("costo") || normalized.includes("cuanto") || normalized.includes("valor")) {
    return "Los costos dependen del tipo de servicio, número de cámaras y condiciones del lugar. Las visitas técnicas y cotizaciones permiten darte un presupuesto exacto y sin sorpresas.";
  }
  if (normalized.includes("horario") || normalized.includes("dias") || normalized.includes("hora") || normalized.includes("cuando")) {
    return "Atendemos de Lunes a Viernes de 8:00 AM a 12:00 PM y de 2:00 PM a 6:00 PM. Puedes agendar tu cita en los horarios disponibles directamente desde la web.";
  }
  if (normalized.includes("contacto") || normalized.includes("telefono") || normalized.includes("whatsapp") || normalized.includes("celular")) {
    return "Puedes llamarnos o escribirnos por WhatsApp al 304 445 1436. Estamos ubicados en Fómeque, Cundinamarca.";
  }
  if (normalized.includes("fomeque") || normalized.includes("cobertura") || normalized.includes("donde")) {
    return "Nuestra base de operaciones principal está en Fómeque, Cundinamarca, y cubrimos municipios vecinos del oriente de Cundinamarca.";
  }

  return "Gracias por tu consulta. Para darte una respuesta personalizada o asesoría directa, por favor contáctanos al 304 445 1436 o solicita tu cita desde la plataforma.";
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [quickQuestions, setQuickQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const [chatRes, faqRes] = await Promise.allSettled([
          fetch("/api/chatbot"),
          fetch("/api/faq"),
        ]);

        const allItems: FAQItem[] = [];

        if (chatRes.status === "fulfilled" && chatRes.value.ok) {
          const data: DBMessage[] = await chatRes.value.json();
          const fromChat = data
            .filter((m) => m.question && m.answer && m.question.trim().length > 0)
            .map((m) => ({ id: m.id, question: m.question!, answer: m.answer! }));
          allItems.push(...fromChat);
        }

        if (faqRes.status === "fulfilled" && faqRes.value.ok) {
          const faqsData = await faqRes.value.json();
          if (Array.isArray(faqsData)) {
            const fromFaq = faqsData.map((f: any) => ({
              id: f.id,
              question: f.question,
              answer: f.answer,
            }));
            allItems.push(...fromFaq);
          }
        }

        // Deduplicate
        const seen = new Set<string>();
        const unique = allItems.filter((item) => {
          const clean = item.question.toLowerCase().trim().replace(/[¿?]/g, "");
          if (seen.has(clean)) return false;
          seen.add(clean);
          return true;
        });

        setFaqItems(unique);
        setQuickQuestions(unique.map((u) => u.question));
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}-${Math.random()}`,
        text,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      if (loading) {
        addBotMessage("Iniciando asistente...");
      } else {
        addBotMessage("¡Hola! Soy el asistente virtual de Innovar Security. Haz clic en cualquiera de las preguntas frecuentes o escribe lo que necesitas saber.");
      }
    }
  }, [isOpen, messages.length, loading]);

  const handleSend = (text?: string) => {
    const question = text || input.trim();
    if (!question) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      text: question,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const answer = getAnswer(question, faqItems);
      addBotMessage(answer);
    }, 400);
  };

  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen bg-[var(--color-black)] pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/20 mb-3">
              Atención 24/7
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Asistente Virtual Innovar Security
            </h1>
            <p className="text-metal-400 max-w-xl mx-auto text-sm sm:text-base">
              Resuelve tus dudas sobre instalación de cámaras, citas técnicas, reprogramaciones y cotizaciones.
            </p>
          </div>

          {/* Quick Questions Grid */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-metal-400 uppercase tracking-wider mb-4">
              Preguntas sugeridas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setIsOpen(true);
                    setTimeout(() => handleSend(q), 100);
                  }}
                  className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-left hover:border-accent/50 hover:bg-white/[0.03] transition-all group flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-accent/20 transition-colors">
                    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-metal-200 group-hover:text-white text-sm font-medium transition-colors">
                    {q}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden mb-8 shadow-xl">
            <div className="bg-metal-900 border-b border-metal-800 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75" />
                </div>
                <div>
                  <span className="text-white font-semibold text-sm">Chat en Vivo</span>
                  <span className="text-metal-500 text-xs block">Respuestas automáticas instantáneas</span>
                </div>
              </div>
              <Link
                href="/solicitar"
                className="text-xs bg-accent hover:bg-accent-dark text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Solicitar Cita
              </Link>
            </div>

            <div className="h-96 overflow-y-auto p-5 space-y-3.5 bg-black/40">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-metal-500">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3 text-accent">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm text-metal-300 font-medium">¿En qué podemos ayudarte?</p>
                  <p className="text-xs text-metal-500 mt-1">Selecciona una pregunta sugerida arriba o escribe abajo.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.sender === "user"
                          ? "bg-accent text-white rounded-br-none shadow-glow"
                          : "bg-metal-900 border border-metal-800 text-metal-200 rounded-bl-none"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                      <span className="text-[10px] text-white/50 block mt-1 text-right">
                        {msg.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-[var(--color-border)] p-3.5 bg-metal-900/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu consulta sobre cámaras o citas..."
                  className="flex-1 bg-metal-950 border border-metal-800 rounded-xl px-4 py-2.5 text-white text-sm placeholder-metal-500 focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-accent hover:bg-accent-dark disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-glow flex items-center gap-1.5"
                >
                  <span>Enviar</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Contact Direct */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-2">¿Prefieres atención telefónica directa?</h3>
            <p className="text-metal-400 text-sm mb-4">
              Comunícate con nuestro equipo técnico para resolver inquietudes complejas o coordinar visitas de emergencia:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-black/40 rounded-xl border border-metal-800">
                <p className="text-metal-500 text-xs">Llamadas</p>
                <a href="tel:3044451436" className="text-white hover:text-accent font-medium">304 445 1436</a>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-metal-800">
                <p className="text-metal-500 text-xs">WhatsApp</p>
                <a href="https://wa.me/573044451436" target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent font-medium">304 445 1436</a>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-metal-800">
                <p className="text-metal-500 text-xs">Ubicación</p>
                <p className="text-white font-medium">Fómeque, Cund.</p>
              </div>
              <div className="p-3 bg-black/40 rounded-xl border border-metal-800">
                <p className="text-metal-500 text-xs">Horario</p>
                <p className="text-white font-medium">Lun-Vie 8AM-6PM</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-black)] border-t border-[var(--color-border)] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-metal-500">
            © {new Date().getFullYear()} Innovar Security. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </>
  );
}
