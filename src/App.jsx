import { useState, useEffect } from "react";
import Auth from "./view/auth.jsx"; 
import Admin from "./view/admin.jsx"; 
import EditarPerfil from "./view/editarPerfil.jsx";
import "./App.css";

function App() {
  // --- ESTADOS DE AUTENTICAÇÃO E PERFIL ---
  const [user, setUser] = useState("");
  //  NOVO ESTADO: Guarda o ícone do avatar selecionado pelo usuário
  const [iconePerfil, setIconePerfil] = useState("");

  // --- ESTADOS DO TO-DO LIST ---
  const [page, setPage] = useState("tasks");
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [removedTasks, setRemovedTasks] = useState([]);
  const [historySearch, setHistorySearch] = useState("");

  //  --- ESTADO DO MENU FLUTUANTE ---
  const [showConfigMenu, setShowConfigMenu] = useState(false);

  //  --- FUNÇÃO: REDIRECIONAR PARA PÁGINA DE EDITAR PERFIL ---
  const handleEditarPerfil = () => {
    setShowConfigMenu(false); // Fecha o menu flutuante

    if (user.toLowerCase() === "admin") {
      alert("O perfil do administrador do sistema não pode ser alterado por aqui.");
      return;
    }

    setPage("editar-perfil"); // Redireciona o app para a nova tela
  };

  // --- FUNÇÃO: SALVAR ALTERAÇÕES DO PERFIL (ATUALIZADA) ---
  const salvarNovoPerfil = (novoNome, novoIcone) => {
    const nomeTrimpado = novoNome.trim();

    // Busca a lista global para atualizar
    const usuariosRegistrados = localStorage.getItem("usuarios_registrados");
    let lista = usuariosRegistrados ? JSON.parse(usuariosRegistrados) : [];

    // Se mudou o nome, verifica se o novo já existe no sistema para outro usuário
    if (nomeTrimpado.toLowerCase() !== user.toLowerCase()) {
      if (lista.some((u) => u.username.toLowerCase() === nomeTrimpado.toLowerCase())) {
        alert("Este nome de usuário já está em uso.");
        return;
      }
    }

    // 1. Migra os dados do LocalStorage do nome antigo para o novo nome
    localStorage.setItem(`todos_${nomeTrimpado}`, localStorage.getItem(`todos_${user}`) || "[]");
    localStorage.setItem(`completed_${nomeTrimpado}`, localStorage.getItem(`completed_${user}`) || "[]");
    localStorage.setItem(`removed_${nomeTrimpado}`, localStorage.getItem(`removed_${user}`) || "[]");

    // Limpa os dados antigos apenas se o nome realmente mudou
    if (nomeTrimpado.toLowerCase() !== user.toLowerCase()) {
      localStorage.removeItem(`todos_${user}`);
      localStorage.removeItem(`completed_${user}`);
      localStorage.removeItem(`removed_${user}`);
    }

    // 2. Atualiza os dados (username e avatar) dentro do array de usuários cadastrados
    lista = lista.map((u) => {
      if (u.username === user) {
        return { ...u, username: nomeTrimpado, avatar: novoIcone };
      }
      return u;
    });

    localStorage.setItem("usuarios_registrados", JSON.stringify(lista));
    localStorage.setItem("usuario_atual", nomeTrimpado);
    localStorage.setItem(`avatar_${nomeTrimpado}`, novoIcone);

    // 3. Atualiza os estados do React e retorna à base
    setUser(nomeTrimpado);
    setIconePerfil(novoIcone); // Atualiza dinamicamente o cabeçalho
    alert("Perfil atualizado com sucesso!");
    setPage("tasks");
  };

  // --- FUNÇÃO: CONFIGURAÇÕES DE LOGIN (ALTERAR SENHA PRÓPRIA) ---
  const handleConfigurarLogin = () => {
    setShowConfigMenu(false); // Fecha o menu

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
    alert("Sua senha de login foi updated com sucesso!");
  };

  // 1. EFEITO: Verifica se já existe um usuário logado ao abrir o app
  useEffect(() => {
    const loggedUser = localStorage.getItem("usuario_atual");
    if (loggedUser) {
      setUser(loggedUser);
      // Carrega o avatar salvo para esse usuário
      const savedAvatar = localStorage.getItem(`avatar_${loggedUser}`);
      if (savedAvatar) setIconePerfil(savedAvatar);
    }
  }, []);

  // 2. EFEITO: Sempre que o usuário logar/mudar, carrega o histórico específico dele
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

  // 3. EFEITO: Salva as listas locais automaticamente sempre que houver modificações
  useEffect(() => {
    if (user && user.toLowerCase() !== "admin") {
      localStorage.setItem(`todos_${user}`, JSON.stringify(todos));
      localStorage.setItem(`completed_${user}`, JSON.stringify(completedTasks));
      localStorage.setItem(`removed_${user}`, JSON.stringify(removedTasks));
    }
  }, [todos, completedTasks, removedTasks, user]);

  // --- FUNÇÃO DE LOGS (ADMINISTRATIVO) ---
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

  // --- FUNÇÕES DE LOGOUT ---
  const handleLogout = () => {
    localStorage.removeItem("usuario_atual");
    setUser("");
    setIconePerfil("");
  };

  // --- FUNÇÕES DO TO-DO LIST ---
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

  if (!user) {
    return <Auth onLoginSuccess={(username) => setUser(username)} />;
  }

  if (user.toLowerCase() === "admin") {
    return <Admin onLogout={handleLogout} />;
  }

  return (
    <div className="app-container">
      {/* BARRA DE USUÁRIO DINÂMICA COM SUPORTE A AVATAR EM SEGUNDO PLANO */}
      <div style={styles.headerInfoContainer}>
        <div style={styles.colunaUsuario}>
          
          {/* Caixa do ícone adaptada para renderizar imagem como plano de fundo */}
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
            {/* Só exibe a letra inicial se não tiver um avatar em imagem */}
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
              ⚙️ Menu
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
                  👤 Editar Perfil
                </button>
                <button
                  onClick={handleConfigurarLogin}
                  style={styles.dropdownItem}
                  data-darkreader-ignore="true"
                  onMouseEnter={styles.dropdownItem.onMouseEnter}
                  onMouseLeave={styles.dropdownItem.onMouseLeave}
                >
                  🔑 Configurações de Login
                </button>
              </div>
            )}
          </div>

          <button onClick={handleLogout} style={styles.btnSair}>
            Sair da Conta
          </button>
        </div>
      </div>

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

      {page === "history" && (
        <section className="history-section">
          <h2>Histórico</h2>

          <div className="history-search">
            <input
              type="text"
              placeholder="Buscar no histórico..."
              value={historySearch}
              onChange={(event) => setPage(event.target.value)}
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

      {/* TELA 3: EDITAR PERFIL CORRIGIDA COM OS NOVOS PARÂMETROS */}
      {page === "editar-perfil" && (
        <EditarPerfil 
          usuarioAtual={user} 
          iconeAtual={iconePerfil} //  Passa o ícone atual guardado no App
          onSalvar={salvarNovoPerfil} //  Passa a nova função atualizada
          onCancelar={() => setPage("tasks")} 
        />
      )}
    </div>
  );
}

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