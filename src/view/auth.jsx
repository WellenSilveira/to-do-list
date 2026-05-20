import { useState } from 'react';

function Auth({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false); // Altera entre Login (false) e Cadastro (true)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Função para buscar a lista global de usuários no LocalStorage
  const getRegisteredUsers = () => {
    const users = localStorage.getItem('usuarios_registrados');
    return users ? JSON.parse(users) : [];
  };

  // --- FUNÇÃO DE CADASTRO ---
  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos!');
      return;
    }

    const currentUsers = getRegisteredUsers();

    // Evita nomes duplicados
    const userExists = currentUsers.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (userExists) {
      setError('Este nome de usuário já está sendo usado.');
      return;
    }

    // Adiciona o novo usuário
    const newUser = { username: username.trim(), password: password };
    const updatedUsers = [...currentUsers, newUser];
    localStorage.setItem('usuarios_registrados', JSON.stringify(updatedUsers));

    alert('Cadastro realizado com sucesso! Agora faça o seu login.');
    setIsRegistering(false); // Muda automaticamente para a tela de login
    setPassword('');
  };

  // --- FUNÇÃO DE LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos!');
      return;
    }

    const currentUsers = getRegisteredUsers();

    // Procura por um usuário com o mesmo nome e senha digitados
    const validUser = currentUsers.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (!validUser) {
      setError('Usuário ou senha incorretos.');
      return;
    }

    // Salva quem é o usuário ativo no navegador
    localStorage.setItem('usuario_atual', validUser.username);
    
    // Avisa o App.jsx que o login deu certo para liberar o To-Do List
    onLoginSuccess(validUser.username);
  };

  return (
    <div className="auth-container" style={styles.container}>
      {/* O título muda dinamicamente dependendo do estado */}
      <h2 style={styles.titulo}>{isRegistering ? 'Criar Nova Conta' : 'Entrar no To-Do List'}</h2>
      
      {error && <p style={styles.erro}>{error}</p>}

      <form onSubmit={isRegistering ? handleRegister : handleLogin} style={styles.formulario}>
        <div style={styles.campo}>
          <label style={styles.label}>Usuário:</label>
          <input 
            type="text" 
            placeholder="Digite seu usuário" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
        </div>
        
        <div style={styles.campo}>
          <label style={styles.label}>Senha:</label>
          <input 
            type="password" 
            placeholder="Digite sua senha" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>
        
        <button type="submit" style={styles.botao}>
          {isRegistering ? 'Cadastrar Conta' : 'Entrar'}
        </button>
      </form>

      {/* O clique agora usa !isRegistering para alternar perfeitamente */}
      <p style={styles.textoAlternar}>
        {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta ainda?'} {' '}
        <span 
          style={styles.link} 
          onClick={() => {
            setIsRegistering(!isRegistering); // Corrigido aqui!
            setError('');
            setPassword('');
            setUsername('');
          }}
        >
          {isRegistering ? 'Faça login aqui' : 'Cadastre-se aqui'}
        </span>
      </p>
    </div>
  );
}

// Estilos alinhados com o padrão do seu layout escuro
const styles = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '30px',
    backgroundColor: '#1e293b', 
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    color: '#f8fafc',
    fontFamily: 'sans-serif'
  },
  titulo: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#3b82f6'
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '14px',
    color: '#94a3b8'
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#fff',
    fontSize: '16px'
  },
  botao: {
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px'
  },
  erro: {
    color: '#ef4444',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: '14px',
    marginBottom: '15px'
  },
  textoAlternar: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '14px',
    color: '#94a3b8'
  },
  link: {
    color: '#3b82f6',
    cursor: 'pointer',
    textDecoration: 'underline'
  }
};

export default Auth;