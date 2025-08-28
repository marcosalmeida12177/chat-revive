import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Smile, Moon, Sun, Phone, Video, MoreVertical } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { EmojiPicker } from "./EmojiPicker";

interface Mensagem {
  from: "cliente" | "atendente";
  texto?: string;
  audioUrl?: string;
  type: "text" | "audio";
  timestamp: string;
}

interface Conversa {
  numero: string;
  name?: string;
  ultimas_mensagens: Mensagem[];
  naoLidas?: number;
  status?: "online" | "offline";
  avatar: string;
}

// Mock data
const MOCK_CONVERSAS: Conversa[] = [
  {
    numero: "5511999130676",
    name: "Ana Silva",
    status: "online",
    avatar: "AS",
    ultimas_mensagens: [
      { from: "cliente", texto: "Olá, preciso de ajuda com meu pedido", type: "text", timestamp: "10:30" },
      { from: "atendente", texto: "Claro! Como posso ajudar?", type: "text", timestamp: "10:31" },
      { from: "cliente", texto: "Meu pedido não chegou ainda", type: "text", timestamp: "10:32" }
    ]
  },
  {
    numero: "5511987654321",
    name: "João Santos",
    status: "offline",
    avatar: "JS",
    ultimas_mensagens: [
      { from: "cliente", texto: "audio.ogg", audioUrl: "/sample-audio.ogg", type: "audio", timestamp: "09:15" },
      { from: "atendente", texto: "Entendi sua solicitação!", type: "text", timestamp: "09:16" }
    ]
  },
  {
    numero: "5511888777666",
    name: "Maria Costa",
    status: "online",
    avatar: "MC",
    ultimas_mensagens: [
      { from: "cliente", texto: "Quando será o próximo desconto?", type: "text", timestamp: "08:45" },
      { from: "cliente", texto: "Estou aguardando uma resposta", type: "text", timestamp: "08:50" }
    ]
  },
  {
    numero: "5511777666555",
    name: "Pedro Lima",
    status: "offline",
    avatar: "PL",
    ultimas_mensagens: [
      { from: "atendente", texto: "Obrigado por entrar em contato!", type: "text", timestamp: "07:30" },
      { from: "cliente", texto: "De nada, até mais!", type: "text", timestamp: "07:31" }
    ]
  }
];

function ModernChatPanel() {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [conversas, setConversas] = useState<Conversa[]>(MOCK_CONVERSAS);
  const [conversaSelecionada, setConversaSelecionada] = useState<string | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [mensagem, setMensagem] = useState<string>("");
  const [busca, setBusca] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const mensagensRef = useRef<HTMLDivElement | null>(null);
  const [ultimaMensagemLidaCliente, setUltimaMensagemLidaCliente] = useState<Record<string, number>>({});

  const toggleDarkMode = () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle("dark");
    setIsDarkMode(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const armazenado = localStorage.getItem("ultimaMensagemLida");
    if (armazenado) {
      setUltimaMensagemLidaCliente(JSON.parse(armazenado));
    }
  }, []);

  useEffect(() => {
    // Simular atualização das conversas
    const interval = setInterval(() => {
      setConversas(current => 
        current.map(conv => {
          const totalCliente = conv.ultimas_mensagens.filter((m) => m.from === "cliente").length;
          const lidas = ultimaMensagemLidaCliente[conv.numero] || 0;
          const naoLidas = totalCliente - lidas;
          return { ...conv, naoLidas: naoLidas > 0 ? naoLidas : 0 };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [ultimaMensagemLidaCliente]);

  useEffect(() => {
    if (mensagensRef.current) {
      mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
    }
  }, [mensagens]);

  const selecionarConversa = (numero: string) => {
    setConversaSelecionada(numero);
    const conversa = conversas.find(c => c.numero === numero);
    if (conversa) {
      setMensagens(conversa.ultimas_mensagens);
      const totalDoCliente = conversa.ultimas_mensagens.filter(m => m.from === "cliente").length;
      
      setUltimaMensagemLidaCliente((prev) => {
        const atualizado = { ...prev, [numero]: totalDoCliente };
        localStorage.setItem("ultimaMensagemLida", JSON.stringify(atualizado));
        return atualizado;
      });
    }
  };

  const enviarMensagem = () => {
    if (!mensagem.trim() || !conversaSelecionada) return;

    const novaMensagem: Mensagem = {
      from: "atendente",
      texto: mensagem,
      type: "text", 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMensagens((prev) => [...prev, novaMensagem]);
    
    // Atualizar a conversa na lista
    setConversas(prev => prev.map(conv => 
      conv.numero === conversaSelecionada 
        ? { ...conv, ultimas_mensagens: [...conv.ultimas_mensagens, novaMensagem] }
        : conv
    ));
    
    setMensagem("");
  };

  const handleEmojiSelect = (emoji: string) => {
    setMensagem(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const conversasFiltradas = conversas.filter((conv) => {
    const termo = busca.toLowerCase();
    return (
      conv.numero.includes(termo) ||
      (conv.name && conv.name.toLowerCase().includes(termo))
    );
  });

  const conversaAtual = conversas.find(c => c.numero === conversaSelecionada);

  return (
    <div className="flex h-screen bg-chat-background">
      {/* Sidebar de conversas */}
      <div className="w-1/3 bg-chat-sidebar border-r border-chat-border flex flex-col">
        {/* Header da sidebar */}
        <div className="p-4 border-b border-chat-border bg-gradient-to-r from-chat-sidebar to-chat-background">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Conversas</h2>
            <Button 
              onClick={toggleDarkMode} 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 bg-background border-chat-border"
            />
          </div>
        </div>

        {/* Lista de conversas */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {conversasFiltradas.map((conv) => (
              <Card
                key={conv.numero}
                onClick={() => selecionarConversa(conv.numero)}
                className={`cursor-pointer transition-all duration-200 hover:bg-chat-hover border-chat-border ${
                  conversaSelecionada === conv.numero 
                    ? "bg-chat-active border-chat-bubble-sent shadow-sm" 
                    : "bg-transparent hover:shadow-sm"
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-br from-chat-bubble-sent to-purple-600 text-chat-bubble-sent-foreground font-semibold text-sm">
                        {conv.avatar}
                      </div>
                      {conv.status === 'online' && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-status-online rounded-full border-2 border-chat-sidebar"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm truncate">
                          {conv.name || conv.numero}
                        </span>
                        {conv.naoLidas && conv.naoLidas > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs bg-status-unread">
                            {conv.naoLidas}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground truncate">
                        {conv.ultimas_mensagens?.slice(-1)[0]?.type === 'audio' 
                          ? '🎵 Mensagem de áudio'
                          : conv.ultimas_mensagens?.slice(-1)[0]?.texto
                        }
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        {conv.ultimas_mensagens?.slice(-1)[0]?.timestamp}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Área da conversa */}
      <div className="flex-1 flex flex-col">
        {conversaSelecionada && conversaAtual ? (
          <>
            {/* Header da conversa */}
            <div className="px-6 py-4 border-b border-chat-border bg-gradient-to-r from-chat-background to-chat-sidebar">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-br from-chat-bubble-sent to-purple-600 text-chat-bubble-sent-foreground font-semibold text-sm">
                      {conversaAtual.avatar}
                    </div>
                    {conversaAtual.status === 'online' && (
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-status-online rounded-full border-2 border-chat-background"></div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">
                      {conversaAtual.name || conversaAtual.numero}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {conversaAtual.status === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Área de mensagens */}
            <div
              ref={mensagensRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-chat-background to-background"
            >
              {mensagens.map((msg, index) => {
                const isAudio = msg.type === 'audio' || msg.texto?.endsWith('.ogg');
                const audioUrl = isAudio ? (msg.audioUrl || msg.texto) : undefined;
                
                return (
                  <div
                    key={index}
                    className={`flex ${msg.from === "atendente" ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] ${msg.from === "atendente" ? 'ml-12' : 'mr-12'}`}>
                      <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                        msg.from === "atendente"
                          ? "bg-chat-bubble-sent text-chat-bubble-sent-foreground rounded-br-md"
                          : "bg-chat-bubble-received text-chat-bubble-received-foreground border-chat-border rounded-bl-md"
                      }`}>
                        {isAudio && audioUrl ? (
                          <AudioPlayer url={audioUrl} />
                        ) : (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.texto}</p>
                        )}
                      </div>
                      <div className={`text-xs text-muted-foreground mt-1 ${
                        msg.from === "atendente" ? 'text-right' : 'text-left'
                      }`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input de mensagem */}
            <div className="border-t border-chat-border bg-chat-sidebar p-4">
              <div className="flex items-end gap-3 relative">
                {showEmojiPicker && (
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                )}
                
                <Button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                  variant="ghost" 
                  size="sm"
                  className="h-10 w-10 p-0 mb-1"
                >
                  <Smile className="h-5 w-5" />
                </Button>
                
                <div className="flex-1 flex items-end gap-2">
                  <Input
                    placeholder="Digite uma mensagem..."
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                    className="flex-1 min-h-10 resize-none bg-background border-chat-border focus:border-chat-bubble-sent"
                    />
                  <Button 
                    onClick={enviarMensagem}
                    disabled={!mensagem.trim()}
                    className="h-10 w-10 p-0 bg-chat-bubble-sent hover:bg-chat-bubble-sent/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-chat-background to-background">
            <div className="text-center space-y-4 p-8">
              <div className="h-24 w-24 mx-auto rounded-full bg-gradient-to-br from-chat-bubble-sent to-purple-600 flex items-center justify-center text-chat-bubble-sent-foreground text-2xl font-bold">
                💬
              </div>
              <h3 className="text-xl font-semibold">Bem-vindo ao Chat</h3>
              <p className="text-muted-foreground max-w-md">
                Selecione uma conversa na sidebar para começar a atender seus clientes com nossa interface moderna e intuitiva.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ModernChatPanel;