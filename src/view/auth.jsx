import { useState } from 'react';

// --- CREDENCIAIS DE CONTROLE DE ACESSO ADMINISTRATIVO (HARDCODED PARA FINS DE DESENVOLVIMENTO) ---
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

function Auth({ onLoginSuccess }) {
  // --- GERENCIAMENTO DE ESTADO DE AUTENTICAÇÃO E CONTROLE DE FLUXO ---
  const [isRegistering, setIsRegistering] = useState(false); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- ACESSO E EXTRAÇÃO DE REGISTROS DO ARMAZENAMENTO LOCAL ---
  const getRegisteredUsers = () => {
    const users = localStorage.getItem('usuarios_registrados');
    return users ? JSON.parse(users) : [];
  };

  // --- REGRA DE NEGÓCIO: ROTINA DE PERSISTÊNCIA DE NOVOS USUÁRIOS ---
  const handleRegister = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos!');
      return;
    }

    // Validação restritiva para evitar colisão com credenciais do administrador do sistema
    if (username.trim().toLowerCase() === ADMIN_USERNAME) {
      setError('Este nome de usuário é reservado e não pode ser cadastrado.');
      return;
    }

    const currentUsers = getRegisteredUsers();

    // Verificação de unicidade do identificador de usuário (Username)
    const userExists = currentUsers.some(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (userExists) {
      setError('Este nome de usuário já está sendo usado.');
      return;
    }

    // Inserção e atualização da coleção de usuários no armazenamento local
    const newUser = { username: username.trim(), password: password };
    const updatedUsers = [...currentUsers, newUser];
    localStorage.setItem('usuarios_registrados', JSON.stringify(updatedUsers));

    alert('Cadastro realizado com sucesso! Proceda para a autenticação.');
    setIsRegistering(false); 
    setPassword('');
  };

  // --- REGRA DE NEGÓCIO: ROTINA DE AUTENTICAÇÃO E CHECAGEM DE CREDENCIAIS ---
  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos!');
      return;
    }

    // Intercepção prioritária de fluxo para validação da conta administradora
    if (username.trim().toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('usuario_atual', 'admin');
      onLoginSuccess('admin');
      return; 
    }

    // Validação de credenciais contra a coleção de usuários comuns
    const currentUsers = getRegisteredUsers();

    const validUser = currentUsers.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );

    if (!validUser) {
      setError('Usuário ou senha incorretos.');
      return;
    }

    // Inicialização da sessão e disparo de callback de sucesso
    localStorage.setItem('usuario_atual', validUser.username);
    onLoginSuccess(validUser.username);
  };

  return (
    <div className="auth-container" style={styles.container}>
      {/* RENDERIZAÇÃO TIPOGRÁFICA DINÂMICA DE ACORDO COM O FLUXO ATIVO */}
      <h2 style={styles.titulo}>{isRegistering ? 'Criar Nova Conta' : 'Entrar no Sistema'}</h2>
      
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

      {/* CONTROLE DE ALTERNÂNCIA DE TELA COM HIGIENIZAÇÃO DE ESTADOS TEMPORÁRIOS */}
      <p style={styles.textoAlternar}>
        {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta ainda?'} {' '}
        <span 
          style={styles.link} 
          onClick={() => {
            setIsRegistering(!isRegistering); 
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

// --- DICIONÁRIO DE ESTILOS EM ESCOPO LOCAL (CSS-IN-JS PATTERN) ---
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