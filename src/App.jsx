import { useState, useEffect } from 'react';
import Auth from './view/auth.jsx'; // Caminho baseado na sua estrutura de arquivos
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

  // 1. EFEITO: Verifica se já existe um usuário logado ao abrir o app
  useEffect(() => {
    const loggedUser = localStorage.getItem('usuario_atual');
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, []);

  // 2. EFEITO: Sempre que o usuário logar/mudar, carrega o histórico específico dele
  useEffect(() => {
    if (user) {
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
    if (user) {
      localStorage.setItem(`todos_${user}`, JSON.stringify(todos));
      localStorage.setItem(`completed_${user}`, JSON.stringify(completedTasks));
      localStorage.setItem(`removed_${user}`, JSON.stringify(removedTasks));
    }
  }, [todos, completedTasks, removedTasks, user]);

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
  // Se não houver usuário ativo, bloqueia o app e mostra a tela de Login/Cadastro
  if (!user) {
    return <Auth onLoginSuccess={(username) => setUser(username)} />;
  }

  // Se o usuário estiver logado, exibe o To-Do List completo com os dados dele
  return (
    <div className="app-container">
      {/* Barra de usuário no topo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>
          Conectado como: <strong style={{ color: '#3b82f6' }}>{user}</strong>
        </span>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
          Sair da Conta
        </button>
      </div>

      <header>
        <h1>To-do List</h1>
        <p>Projeto React iniciante para praticar estado, eventos e listas.</p>
      </header>

      <nav className="app-nav">
        <button
          className={page === 'tasks' ? 'active' : ''}
          onClick={() => setPage('tasks')}
        >
          Tarefas
        </button>
        <button
          className={page === 'history' ? 'active' : ''}
          onClick={() => setPage('history')}
        >
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
                    .filter((item) =>
                      item.text.toLowerCase().includes(historySearch.toLowerCase())
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
                item.text.toLowerCase().includes(historySearch.toLowerCase())
              ).length === 0 ? (
                <p className="empty-state">Nenhuma tarefa removida encontrada.</p>
              ) : (
                <ul>
                  {removedTasks
                    .filter((item) =>
                      item.text.toLowerCase().includes(historySearch.toLowerCase())
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
    </div>
  );
}

export default App;