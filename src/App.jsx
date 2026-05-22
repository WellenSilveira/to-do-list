import { useState, useEffect } from "react";
import Auth from "./view/auth.jsx"; 
import Admin from "./view/admin.jsx"; 
import EditarPerfil from "./view/editarPerfil.jsx";
import "./App.css";

function App() {
  // --- GERENCIAMENTO DE ESTADO EM NÍVEL DE APLICATIVO (AUTENTICAÇÃO E PERFIL) ---
  const [user, setUser] = useState("");
  const [iconePerfil, setIconePerfil] = useState("");

  // --- GERENCIAMENTO DE ESTADO DOS DADOS DO TO-DO LIST ---
  const [page, setPage] = useState("tasks");
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [removedTasks, setRemovedTasks] = useState([]);
  const [historySearch, setHistorySearch] = useState("");

  // --- ESTADO DE CONTROLE DE INTERFACE COMPONENIZADA (DROPDOWN) ---
  const [showConfigMenu, setShowConfigMenu] = useState(false);

  // --- NAVEGAÇÃO INTERNA: RENDERIZAÇÃO DA TELA DE EDIÇÃO DE PERFIL ---
  const handleEditarPerfil = () => {
    setShowConfigMenu(false); 

    if (user.toLowerCase() === "admin") {
      alert("O perfil do administrador do sistema não pode ser alterado por aqui.");
      return;
    }

    setPage("editar-perfil"); 
  };

  // --- REGRA DE NEGÓCIO: PERSISTÊNCIA E MIGRAÇÃO DE DADOS EM LOGOUT/ALTERAÇÃO ---
  const salvarNovoPerfil = (novoNome, novoIcone) => {
    const nomeTrimpado = novoNome.trim();

    const usuariosRegistrados = localStorage.getItem("usuarios_registrados");
    let lista = usuariosRegistrados ? JSON.parse(usuariosRegistrados) : [];

    if (nomeTrimpado.toLowerCase() !== user.toLowerCase()) {
      if (lista.some((u) => u.username.toLowerCase() === nomeTrimpado.toLowerCase())) {
        alert("Este nome de usuário já está em uso.");
        return;
      }
    }

    // Migração de chaves do LocalStorage para evitar perda de dados relacionados ao histórico do usuário
    localStorage.setItem(`todos_${nomeTrimpado}`, localStorage.getItem(`todos_${user}`) || "[]");
    localStorage.setItem(`completed_${nomeTrimpado}`, localStorage.getItem(`completed_${user}`) || "[]");
    localStorage.setItem(`removed_${nomeTrimpado}`, localStorage.getItem(`removed_${user}`) || "[]");

    if (nomeTrimpado.toLowerCase() !== user.toLowerCase()) {
      localStorage.removeItem(`todos_${user}`);
      localStorage.removeItem(`completed_${user}`);
      localStorage.removeItem(`removed_${user}`);
    }

    // Atualização da coleção global de usuários e persistência do estado de sessão
    lista = lista.map((u) => {
      if (u.username === user) {
        return { ...u, username: nomeTrimpado, avatar: novoIcone };
      }
      return u;
    });

    localStorage.setItem("usuarios_registrados", JSON.stringify(lista));
    localStorage.setItem("usuario_atual", nomeTrimpado);
    localStorage.setItem(`avatar_${nomeTrimpado}`, novoIcone);

    // Sincronização do estado local do componente principal
    setUser(nomeTrimpado);
    setIconePerfil(novoIcone); 
    alert("Perfil atualizado com sucesso!");
    setPage("tasks");
  };

  // --- OPERAÇÃO DE ATUALIZAÇÃO DE CREDENCIAIS (MUTABILIDADE DO ARRANJO DE USUÁRIOS) ---
  const handleConfigurarLogin = () => {
    setShowConfigMenu(false); 

    if (user.toLowerCase() === "admin") {
      alert("Para alterar a senha do admin principal, modifique a constante diretamente no código do Auth.jsx.");
      return;
    }

    const novaSenha = prompt("Configurações de Login: Digite a sua nova senha:");

    if (!novaSenha || !novaSenha.trim()) {
      alert("A senha não pode ser vazia.");
      return;
    }

    const usuariosRegistrados = localStorage.getItem("usuarios_registrados");
    let lista = usuariosRegistrados ? JSON.parse(usuariosRegistrados) : [];

    lista = lista.map((u) => {
      if (u.username === user) {
        return { ...u, password: novaSenha.trim() };
      }
      return u;
    });

    localStorage.setItem("usuarios_registrados", JSON.stringify(lista));
    alert("Sua senha de login foi atualizada com sucesso!");
  };

  // --- EFICÁCIA DO CICLO DE VIDA (1): HIDRATAÇÃO DO ESTADO INICIAL VIA ARMAZENAMENTO LOCAL ---
  useEffect(() => {
    const loggedUser = localStorage.getItem("usuario_atual");
    if (loggedUser) {
      setUser(loggedUser);
      const savedAvatar = localStorage.getItem(`avatar_${loggedUser}`);
      if (savedAvatar) setIconePerfil(savedAvatar);
    }
  }, []);

  // --- EFICÁCIA DO CICLO DE VIDA (2): SINCRONIZAÇÃO DE REGISTROS DE DADOS BASEADOS NO ESCOPO DO USUÁRIO ---
  useEffect(() => {
    if (user && user.toLowerCase() !== "admin") {
      const savedTodos = localStorage.getItem(`todos_${user}`);
      const savedCompleted = localStorage.getItem(`completed_${user}`);
      const savedRemoved = localStorage.getItem(`removed_${user}`);
      const savedAvatar = localStorage.getItem(`avatar_${user}`);

      setTodos(savedTodos ? JSON.parse(savedTodos) : []);
      setCompletedTasks(savedCompleted ? JSON.parse(savedCompleted) : []);
      setRemovedTasks(savedRemoved ? JSON.parse(savedRemoved) : []);
      setIconePerfil(savedAvatar || "");
    }
  }, [user]);

  // --- EFICÁCIA DO CICLO DE VIDA (3): PERSISTÊNCIA REATIVA POR DEPENDÊNCIAS DE MATRIZES ---
  useEffect(() => {
    if (user && user.toLowerCase() !== "admin") {
      localStorage.setItem(`todos_${user}`, JSON.stringify(todos));
      localStorage.setItem(`completed_${user}`, JSON.stringify(completedTasks));
      localStorage.setItem(`removed_${user}`, JSON.stringify(removedTasks));
    }
  }, [todos, completedTasks, removedTasks, user]);

  // --- SISTEMA DE AUDITORIA INTERNA (LOGS DE EVENTOS DE MUTABILIDADE) ---
  const registrarLog = (usuario, acao, tarefa) => {
    const logsAtuais = localStorage.getItem("logs_movimentacao");
    const listaLogs = logsAtuais ? JSON.parse(logsAtuais) : [];

    const novoLog = {
      id: crypto.randomUUID(),
      usuario: usuario,
      acao: acao,
      tarefa: tarefa,
      data: new Date().toLocaleString("pt-BR"),
    };

    localStorage.setItem("logs_movimentacao", JSON.stringify([novoLog, ...listaLogs]));
  };

  // --- INTERRUPÇÃO DE SESSÃO (REVOGAÇÃO DE TOKEN / LIMPEZA DE ESTADOS) ---
  const handleLogout = () => {
    localStorage.removeItem("usuario_atual");
    setUser("");
    setIconePerfil("");
  };

  // --- REGRAS DE MANIPULAÇÃO DO FLUXO DE COMPROMISSOS (C.R.U.D LOCAL) ---
  const handleAddTask = () => {
    if (!task.trim()) return;
    setTodos((current) => [
      ...current,
      { id: crypto.randomUUID(), text: task.trim(), done: false },
    ]);
    registrarLog(user, "Adicionou", task.trim());
    setTask("");
  };

  const handleToggle = (id) => {
    setTodos((current) => {
      const next = current.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      );
      const toggled = current.find((todo) => todo.id === id);
      if (toggled && !toggled.done) {
        setCompletedTasks((history) => {
          if (history.some((item) => item.id === toggled.id)) return history;
          return [...history, { id: toggled.id, text: toggled.text }];
        });
        registrarLog(user, "Concluiu", toggled.text);
      }
      return next;
    });
  };

  const handleDelete = (id) => {
    setTodos((current) => {
      const deleted = current.find((todo) => todo.id === id);
      if (deleted && !deleted.done) {
        setRemovedTasks((history) => [
          ...history,
          { id: deleted.id, text: deleted.text },
        ]);
        registrarLog(user, "Removeu", deleted.text);
      }
      return current.filter((todo) => todo.id !== id);
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleAddTask();
    }
  };

  // --- RENDERIZAÇÃO CONDICIONAL DE BLOQUEIOS DE ACESSO ---
  if (!user) {
    return <Auth onLoginSuccess={(username) => setUser(username)} />;
  }

  if (user.toLowerCase() === "admin") {
    return <Admin onLogout={handleLogout} />;
  }

  return (
    <div className="app-container">
      {/* SEÇÃO INFORMATIVA DO PERFIL DE USUÁRIO CORRENTE */}
      <div style={styles.headerInfoContainer}>
        <div style={styles.colunaUsuario}>
          
          {/* Container dinâmico para renderização de propriedades em background-image */}
          <div 
            style={{
              ...styles.caixaIcone,
              backgroundImage: iconePerfil ? `url(${iconePerfil})` : "none",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              backgroundColor: iconePerfil ? "#151515" : "#5d4900",
            }}
          >
            {/* Fallback tipográfico baseado em caractere inicial caso não exista avatar definido */}
            {!iconePerfil && (
              <span style={styles.letraAvatar}>
                {user.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          <span style={styles.conexaoTexto}>@{user}</span>
        </div>

        <div style={styles.colunaControles}>
          <div style={styles.wrapperEngrenagem}>
            <button
              onClick={() => setShowConfigMenu(!showConfigMenu)}
              style={styles.btnEngrenagem}
              title="Opções de Conta"
            >
              Menu
            </button>

            {showConfigMenu && (
              <div style={styles.dropdownMenu} data-darkreader-ignore="true">
                <button
                  onClick={handleEditarPerfil}
                  style={styles.dropdownItem}
                  data-darkreader-ignore="true"
                  onMouseEnter={styles.dropdownItem.onMouseEnter}
                  onMouseLeave={styles.dropdownItem.onMouseLeave}
                >
                  Editar Perfil
                </button>
                <button
                  onClick={handleConfigurarLogin}
                  style={styles.dropdownItem}
                  data-darkreader-ignore="true"
                  onMouseEnter={styles.dropdownItem.onMouseEnter}
                  onMouseLeave={styles.dropdownItem.onMouseLeave}
                >
                  Configurações de Login
                </button>
              </div>
            )}
          </div>

          <button onClick={handleLogout} style={styles.btnSair}>
            Sair da Conta
          </button>
        </div>
      </div>

      {/* COMPONENTE DE SELEÇÃO DE FLUXOS INTERNOS (TABULAÇÃO) */}
      <nav className="app-nav">
        <button
          className={page === "tasks" ? "active" : ""}
          onClick={() => setPage("tasks")}
        >
          Tarefas
        </button>
        <button
          className={page === "history" ? "active" : ""}
          onClick={() => setPage("history")}
        >
          Histórico
        </button>
      </nav>

      {/* RENDERIZAÇÃO DA VIEW: GERENCIAMENTO DE COMPROMISSOS ATIVOS */}
      {page === "tasks" && (
        <>
          <section className="task-input">
            <input
              type="text"
              value={task}
              onChange={(event) => setTask(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nova tarefa"
            />
            <button onClick={handleAddTask}>Adicionar</button>
          </section>

          <section className="task-list">
            {todos.length === 0 ? (
              <p className="empty-state">
                Nenhuma tarefa ainda. Adicione uma acima.
              </p>
            ) : (
              <ul>
                {todos.map((todo) => (
                  <li key={todo.id} className={todo.done ? "done" : ""}>
                    <label>
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => handleToggle(todo.id)}
                      />
                      <span>{todo.text}</span>
                    </label>
                    <button onClick={() => handleDelete(todo.id)}>
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {/* RENDERIZAÇÃO DA VIEW: HISTÓRICO COMPLETO E QUERIES DE BUSCA */}
      {page === "history" && (
        <section className="history-section">
          <h2>Histórico</h2>

          <div className="history-search">
            <input
              type="text"
              placeholder="Buscar no histórico..."
              value={historySearch}
              onChange={(event) => setHistorySearch(event.target.value)}
            />
          </div>

          <div className="history-grid">
            <div className="history-card">
              <h3>Concluídas</h3>
              {completedTasks.filter((item) =>
                item.text.toLowerCase().includes(historySearch.toLowerCase()),
              ).length === 0 ? (
                <p className="empty-state">
                  Nenhuma tarefa concluída encontrada.
                </p>
              ) : (
                <ul>
                  {completedTasks
                    .filter((item) =>
                      item.text.toLowerCase().includes(historySearch.toLowerCase()),
                    )
                    .map((item) => (
                      <li key={item.id}>{item.text}</li>
                    ))}
                </ul>
              )}
            </div>

            <div className="history-card">
              <h3>Removidas sem conclusão</h3>
              {removedTasks.filter((item) =>
                item.text.toLowerCase().includes(historySearch.toLowerCase()),
              ).length === 0 ? (
                <p className="empty-state">
                  Nenhuma tarefa removida encontrada.
                </p>
              ) : (
                <ul>
                  {removedTasks
                    .filter((item) =>
                      item.text.toLowerCase().includes(historySearch.toLowerCase()),
                    )
                    .map((item) => (
                      <li key={item.id}>{item.text}</li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* RENDERIZAÇÃO DA VIEW: FORMULÁRIO COMPLEMENTAR DE CONFIGURAÇÃO DE PERFIL */}
      {page === "editar-perfil" && (
        <EditarPerfil 
          usuarioAtual={user} 
          iconeAtual={iconePerfil} 
          onSalvar={salvarNovoPerfil} 
          onCancelar={() => setPage("tasks")} 
        />
      )}
    </div>
  );
}

// --- DICIONÁRIO DE ESTILOS JAVASCRIPT EM ESCALA LOCAL (CSS-IN-JS PATTERN) ---
const styles = {
  headerInfoContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "15px 0",
    borderBottom: "2px solid #ffd400",
    marginBottom: "25px",
    position: "relative",
  },
  colunaUsuario: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
  },
  caixaIcone: {
    width: "100px",
    height: "100px",
    border: "2px solid #ffd400",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
  },
  letraAvatar: {
    fontSize: "42px",
    fontWeight: "bold",
    color: "#ffd400",
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  conexaoTexto: {
    fontSize: "14px",
    color: "#56722b",
    fontWeight: "bold",
  },
  colunaControles: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "10px",
    paddingBottom: "4px",
  },
  wrapperEngrenagem: {
    position: "relative",
    display: "inline-block",
  },
  btnEngrenagem: {
    background: "none",
    border: "none",
    color: "#ffd400",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "0",
    fontWeight: "bold",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    right: "0px",
    marginTop: "8px",
    backgroundColor: "#1a1a1a",
    border: "2px solid #5d4900",
    borderRadius: "8px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
    padding: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    zIndex: 200,
    colorScheme: "dark",
  },
  dropdownItem: {
    background: "none",
    border: "none",
    color: "#56722b",
    padding: "8px 12px",
    textAlign: "left",
    fontSize: "13px",
    borderRadius: "4px",
    cursor: "pointer",
    width: "100%",
    fontWeight: "bold",
    transition: "background-color 0.2s, color 0.2s",
    forcedColorAdjust: "none",

    onMouseEnter: (e) => {
      e.target.style.setProperty("color", "#a4ffa4", "important");
      e.target.style.setProperty("background-color", "#2d4a22", "important");
    },
    onMouseLeave: (e) => {
      e.target.style.setProperty("color", "#56722b", "important");
      e.target.style.setProperty("background-color", "transparent", "important");
    },
  },
  btnSair: {
    background: "none",
    border: "none",
    color: "#ff4d4d",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px",
    padding: "0",
  },
};

export default App;