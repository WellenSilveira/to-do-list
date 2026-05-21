import { useState, useEffect } from 'react';
import Auth from './view/auth.jsx'; // Caminho baseado na estrutura de arquivos
import Admin from './view/admin.jsx'; // Importando o painel para renderizar aqui
import './App.css';

function App() {
  // --- ESTADOS DE AUTENTICAÇÃO ---
  const [user, setUser] = useState('');

  // --- ESTADOS DO TO-DO LIST ---
  const [page, setPage] = useState('tasks');
  const [task, setTask] = useState('');
  const [todos, setTodos] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [removedTasks, setRemovedTasks] = useState([]);
  const [historySearch, setHistorySearch] = useState('');

  // ⚙️ --- NOVO ESTADO: CONTROLE DO MENU FLUTUANTE ---
  const [showConfigMenu, setShowConfigMenu] = useState(false);

  // 👤 --- FUNÇÃO: EDITAR PERFIL ---
  const handleEditarPerfil = () => {
    setShowConfigMenu(false); // Fecha o menu
    
    if (user.toLowerCase() === 'admin') {
      alert('O perfil do administrador do sistema não pode ser alterado por aqui.');
      return;
    }

    const novoNome = prompt(`Editar Perfil: Altere o nome do seu usuário (Atual: ${user}):`);
    
    if (!novoNome || !novoNome.trim()) return;

    const nomeTrimpado = novoNome.trim();

    // Busca a lista global para atualizar
    const usuariosRegistrados = localStorage.getItem('usuarios_registrados');
    let lista = usuariosRegistrados ? JSON.parse(usuariosRegistrados) : [];

    // Verifica se o novo nome já existe (e não é o dele mesmo)
    if (lista.some(u => u.username.toLowerCase() === nomeTrimpado.toLowerCase() && nomeTrimpado.toLowerCase() !== user.toLowerCase())) {
      alert('Este nome de usuário já está em uso.');
      return;
    }

    // 1. Migra os dados do LocalStorage do nome antigo para o novo nome
    localStorage.setItem(`todos_${nomeTrimpado}`, localStorage.getItem(`todos_${user}`) || '[]');
    localStorage.setItem(`completed_${nomeTrimpado}`, localStorage.getItem(`completed_${user}`) || '[]');
    localStorage.setItem(`removed_${nomeTrimpado}`, localStorage.getItem(`removed_${user}`) || '[]');

    // Limpa os antigos
    localStorage.removeItem(`todos_${user}`);
    localStorage.removeItem(`completed_${user}`);
    localStorage.removeItem(`removed_${user}`);

    // 2. Atualiza o nome dentro do array global de usuários cadastrados
    lista = lista.map(u => {
      if (u.username === user) {
        return { ...u, username: nomeTrimpado };
      }
      return u;
    });

    localStorage.setItem('usuarios_registrados', JSON.stringify(lista));
    localStorage.setItem('usuario_atual', nomeTrimpado);
    
    // 3. Atualiza o estado do React
    setUser(nomeTrimpado);
    alert('Nome de usuário updated com sucesso!');
  };

  // 🔑 --- FUNÇÃO: CONFIGURAÇÕES DE LOGIN (ALTERAR SENHA PRÓPRIA) ---
  const handleConfigurarLogin = () => {
    setShowConfigMenu(false); // Fecha o menu

    if (user.toLowerCase() === 'admin') {
      alert('Para alterar a senha do admin principal, modifique a constante diretamente no código do Auth.jsx.');
      return;
    }

    const novaSenha = prompt('Configurações de Login: Digite a sua nova senha:');
    
    if (!novaSenha || !novaSenha.trim()) {
      alert('A senha não pode ser vazia.');
      return;
    }

    const usuariosRegistrados = localStorage.getItem('usuarios_registrados');
    let lista = usuariosRegistrados ? JSON.parse(usuariosRegistrados) : [];

    // Atualiza a senha no array global
    lista = lista.map(u => {
      if (u.username === user) {
        return { ...u, password: novaSenha.trim() };
      }
      return u;
    });

    localStorage.setItem('usuarios_registrados', JSON.stringify(lista));
    alert('Sua senha de login foi atualizada com sucesso!');
  };

  // 1. EFEITO: Verifica se já existe um usuário logado ao abrir o app
  useEffect(() => {
    const loggedUser = localStorage.getItem('usuario_atual');
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, []);

  // 2. EFEITO: Sempre que o usuário logar/mudar, carrega o histórico específico dele (se não for admin)
  useEffect(() => {
    if (user && user.toLowerCase() !== 'admin') {
      const savedTodos = localStorage.getItem(`todos_${user}`);
      const savedCompleted = localStorage.getItem(`completed_${user}`);
      const savedRemoved = localStorage.getItem(`removed_${user}`);

      setTodos(savedTodos ? JSON.parse(savedTodos) : []);
      setCompletedTasks(savedCompleted ? JSON.parse(savedCompleted) : []);
      setRemovedTasks(savedRemoved ? JSON.parse(savedRemoved) : []);
    }
  }, [user]);

  // 3. EFEITO: Salva as listas locais automaticamente sempre que houver modificações
  useEffect(() => {
    if (user && user.toLowerCase() !== 'admin') {
      localStorage.setItem(`todos_${user}`, JSON.stringify(todos));
      localStorage.setItem(`completed_${user}`, JSON.stringify(completedTasks));
      localStorage.setItem(`removed_${user}`, JSON.stringify(removedTasks));
    }
  }, [todos, completedTasks, removedTasks, user]);

  // --- FUNÇÃO DE LOGS (ADMINISTRATIVO) ---
  const registrarLog = (usuario, acao, tarefa) => {
    const logsAtuais = localStorage.getItem('logs_movimentacao');
    const listaLogs = logsAtuais ? JSON.parse(logsAtuais) : [];
    
    const novoLog = {
      id: crypto.randomUUID(),
      usuario: usuario,
      acao: acao, 
      tarefa: tarefa,
      data: new Date().toLocaleString('pt-BR')
    };

    localStorage.setItem('logs_movimentacao', JSON.stringify([novoLog, ...listaLogs]));
  };

  // --- FUNÇÕES DE LOGOUT ---
  const handleLogout = () => {
    localStorage.removeItem('usuario_atual');
    setUser('');
  };

  // --- FUNÇÕES DO TO-DO LIST ---
  const handleAddTask = () => {
    if (!task.trim()) return;
    setTodos((current) => [
      ...current,
      { id: crypto.randomUUID(), text: task.trim(), done: false }
    ]);
    registrarLog(user, 'Adicionou', task.trim()); 
    setTask('');
  };

  const handleToggle = (id) => {
    setTodos((current) => {
      const next = current.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      );
      const toggled = current.find((todo) => todo.id === id);
      if (toggled && !toggled.done) {
        setCompletedTasks((history) => {
          if (history.some((item) => item.id === toggled.id)) {
            return history;
          }
          return [...history, { id: toggled.id, text: toggled.text }];
        });
        registrarLog(user, 'Concluiu', toggled.text); 
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
          { id: deleted.id, text: deleted.text }
        ]);
        registrarLog(user, 'Removeu', deleted.text); 
      }
      return current.filter((todo) => todo.id !== id);
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleAddTask();
    }
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---
  if (!user) {
    return <Auth onLoginSuccess={(username) => setUser(username)} />;
  }

  if (user.toLowerCase() === 'admin') {
    return <Admin onLogout={handleLogout} />;
  }

  return (
    <div className="app-container">
      {/* 🛠️ BARRA DE USUÁRIO CORRIGIDA COM A ENGRENAGEM E MENU FLUTUANTE */}
      <div style={styles.headerInfoContainer}>
        <span style={styles.conexaoTexto}>
          Conectado como: <strong style={{ color: '#3b82f6' }}>{user}</strong>
        </span>
        
        <div style={styles.wrapperEngrenagem}>
          <button 
            onClick={() => setShowConfigMenu(!showConfigMenu)} 
            style={styles.btnEngrenagem}
            title="Opções de Conta"
          >
            ⚙️ Menu
          </button>

          {/* Menu Flutuante condicional */}
          {showConfigMenu && (
            <div style={styles.dropdownMenu}>
              <button onClick={handleEditarPerfil} style={styles.dropdownItem}>
                👤 Editar Perfil
              </button>
              <button onClick={handleConfigurarLogin} style={styles.dropdownItem}>
                🔑 Configurações de Login
              </button>
            </div>
          )}
        </div>

        <button onClick={handleLogout} style={styles.btnSair}>
          Sair da Conta
        </button>
      </div>

      <header>
        <h1>To-do List</h1>
        <p>Projeto React iniciante para praticar estado, eventos e listas.</p>
      </header>

      <nav className="app-nav">
        <button className={page === 'tasks' ? 'active' : ''} onClick={() => setPage('tasks')}>
          Tarefas
        </button>
        <button className={page === 'history' ? 'active' : ''} onClick={() => setPage('history')}>
          Histórico
        </button>
      </nav>

      {page === 'tasks' ? (
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
              <p className="empty-state">Nenhuma tarefa ainda. Adicione uma acima.</p>
            ) : (
              <ul>
                {todos.map((todo) => (
                  <li key={todo.id} className={todo.done ? 'done' : ''}>
                    <label>
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => handleToggle(todo.id)}
                      />
                      <span>{todo.text}</span>
                    </label>
                    <button onClick={() => handleDelete(todo.id)}>Remover</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
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
                item.text.toLowerCase().includes(historySearch.toLowerCase())
              ).length === 0 ? (
                <p className="empty-state">Nenhuma tarefa concluída encontrada.</p>
              ) : (
                <ul>
                  {completedTasks
                    .filter((item) => item.text.toLowerCase().includes(historySearch.toLowerCase()))
                    .map((item) => (
                      <li key={item.id}>{item.text}</li>
                    ))}
                </ul>
              )}
            </div>

            <div className="history-card">
              <h3>Removidas sem conclusão</h3>
              {removedTasks.filter((item) =>
                item.text.toLowerCase().includes(historySearch.toLowerCase())
              ).length === 0 ? (
                <p className="empty-state">Nenhuma tarefa removida encontrada.</p>
              ) : (
                <ul>
                  {removedTasks
                    .filter((item) => item.text.toLowerCase().includes(historySearch.toLowerCase()))
                    .map((item) => (
                      <li key={item.id}>{item.text}</li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// 🎨 OBJETO DE ESTILOS ADICIONAIS PARA COMPOR O LAYOUT DA ENGRENAGEM
const styles = {
  headerInfoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '20px',
    position: 'relative'
  },
  conexaoTexto: {
    fontSize: '14px',
    color: '#94a3b8'
  },
  wrapperEngrenagem: {
    position: 'relative',
    display: 'inline-block'
  },
  btnEngrenagem: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '2px 5px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%', // Abre para baixo da palavra "⚙️ Menu"
    right: 0,
    marginTop: '6px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    zIndex: 150,
    minWidth: '170px'
  },
  dropdownItem: {
    background: 'none',
    border: 'none',
    color: '#cbd5e1',
    padding: '8px 12px',
    textAlign: 'left',
    fontSize: '13px',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%'
  },
  btnSair: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
    padding: '0'
  }
};

export default App;