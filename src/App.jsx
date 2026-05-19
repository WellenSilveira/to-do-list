import { useState } from 'react';
import './App.css';

function App() {
  const [page, setPage] = useState('tasks');
  const [task, setTask] = useState('');
  const [todos, setTodos] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [removedTasks, setRemovedTasks] = useState([]);
  const [historySearch, setHistorySearch] = useState('');

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

  return (
    <div className="app-container">
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
