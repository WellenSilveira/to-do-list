import { useState, useEffect } from "react";

function Admin({ onLogout }) {
  // --- GERENCIAMENTO DE ESTADO E FLUXO DE COMPONENTES ---
  const [usuarios, setUsuarios] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState("");

  // --- EFEITOS COLATERAIS: CARREGAMENTO INICIAL DE DADOS PERSISTIDOS ---
  useEffect(() => {
    const listaUsers = localStorage.getItem("usuarios_registrados");
    const listaLogs = localStorage.getItem("logs_movimentacao");

    setUsuarios(listaUsers ? JSON.parse(listaUsers) : []);
    setLogs(listaLogs ? JSON.parse(listaLogs) : []);
  }, []);

  // --- ROTINA DE AUDITORIA E SEGURANÇA: RELEMBRAMENTO DE CREDENCIAIS ---
  const resetarSenha = (usernameParaResetar) => {
    if (usernameParaResetar.toLowerCase() === "admin") {
      alert(
        "Não é possível resetar a senha do administrador principal por aqui.",
      );
      return;
    }

    const novaSenhaTemp = prompt(
      `Digite uma nova senha temporária para o usuário "${usernameParaResetar}":`,
    );

    if (!novaSenhaTemp || !novaSenhaTemp.trim()) {
      return;
    }

    // Mapeamento e atualização atômica de registro específico na coleção
    const novosUsuarios = usuarios.map((u) => {
      if (u.username === usernameParaResetar) {
        return { ...u, password: novaSenhaTemp.trim() };
      }
      return u;
    });

    localStorage.setItem("usuarios_registrados", JSON.stringify(novosUsuarios));
    setUsuarios(novosUsuarios);

    alert(
      `Senha de "${usernameParaResetar}" resetada com sucesso!\nInforme a nova senha temporária ao usuário.`,
    );
  };

  // --- ROTINA DE PURGAÇÃO: REMOÇÃO DE CONTAS E EXPURGO DE DADOS ATRELADOS ---
  const deletarUsuario = (usernameParaDeletar) => {
    if (usernameParaDeletar.toLowerCase() === "admin") {
      alert("Você não pode deletar a conta do administrador!");
      return;
    }

    if (
      confirm(
        `Tem certeza que deseja apagar permanentemente o usuário "${usernameParaDeletar}" e todas as suas listas?`,
      )
    ) {
      // 1. Exclusão do identificador lógico do usuário na coleção primária
      const novosUsuarios = usuarios.filter(
        (u) => u.username !== usernameParaDeletar,
      );
      localStorage.setItem(
        "usuarios_registrados",
        JSON.stringify(novosUsuarios),
      );
      setUsuarios(novosUsuarios);

      // 2. Desalocação e purgação de coleções secundárias (Tabelas/Listas) do armazenamento local
      localStorage.removeItem(`todos_${usernameParaDeletar}`);
      localStorage.removeItem(`completed_${usernameParaDeletar}`);
      localStorage.removeItem(`removed_${usernameParaDeletar}`);

      alert(`Usuário ${usernameParaDeletar} removido com sucesso.`);
    }
  };

  // --- FILTRAGEM DINÂMICA DE LOGS DE AUDITORIA (EM MEMÓRIA) ---
  const logsFiltrados = logs.filter((log) =>
    log.usuario.toLowerCase().includes(filtroUsuario.toLowerCase()),
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Painel do Administrador</h2>
        <button onClick={onLogout} style={styles.btnSair}>
          Sair do Painel
        </button>
      </header>

      {/* SEÇÃO 1: GESTÃO DE USUÁRIOS CADASTRADOS */}
      <section style={styles.section}>
        <h3 style={styles.subtitulo}>
          Gestão de Usuários Cadastrados ({usuarios.length})
        </h3>
        <div style={styles.tabelaContainer}>
          <table style={styles.tabela}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Nome de Usuário</th>
                <th style={styles.th}>Senha</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.username} style={styles.tr}>
                  <td style={styles.td}>
                    <strong>{u.username}</strong>
                  </td>
                  {/* Mascaramento visual para conformidade básica de visualização */}
                  <td style={styles.td}>
                    <span style={styles.senhaMascarada}>••••••••</span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => resetarSenha(u.username)}
                        style={styles.btnResetar}
                      >
                        Resetar Senha
                      </button>
                      <button
                        onClick={() => deletarUsuario(u.username)}
                        style={styles.btnDeletar}
                      >
                        Excluir Conta
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SEÇÃO 2: RELATÓRIO DE MOVIMENTAÇÃO DIÁRIA (AUDIT LOGS) */}
      <section style={styles.section}>
        <h3 style={styles.subtitulo}>Relatório de Movimentação Diária</h3>

        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Filtrar logs por nome de usuário..."
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            style={styles.inputBusca}
          />
        </div>

        <div style={styles.logsContainer}>
          {logsFiltrados.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center" }}>
              Nenhuma atividade registrada hoje.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {logsFiltrados.map((log) => (
                <div key={log.id} style={styles.logCard}>
                  <span style={styles.logData}>{log.data}</span>
                  <p style={styles.logTexto}>
                    O usuário{" "}
                    <strong style={{ color: "#3b82f6" }}>{log.usuario}</strong>{" "}
                    <span style={styles.acaoBadge(log.acao)}>{log.acao}</span> a
                    tarefa: <em style={{ color: "#f8fafc" }}>"{log.tarefa}"</em>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// --- ARQUITETURA DE ESTILOS LOCAIS (CSS-IN-JS PATTERN) ---
const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
    color: "#f8fafc",
    fontFamily: "sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "2px solid #334155",
    paddingBottom: "20px",
    marginBottom: "30px",
  },
  subtitulo: { color: "#3b82f6", marginBottom: "15px" },
  section: {
    backgroundColor: "#1e293b",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    marginBottom: "30px",
  },
  tabelaContainer: { overflowX: "auto" },
  tabela: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { borderBottom: "2px solid #334155" },
  th: { padding: "12px", color: "#94a3b8", fontSize: "14px" },
  tr: { borderBottom: "1px solid #334155" },
  td: { padding: "12px", fontSize: "15px", verticalAlign: "middle" },
  senhaMascarada: {
    color: "#64748b",
    letterSpacing: "3px",
    fontSize: "18px",
    fontFamily: "monospace",
  },
  inputBusca: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #334155",
    backgroundColor: "#0f172a",
    color: "#fff",
  },
  logsContainer: { maxHeight: "300px", overflowY: "auto", paddingRight: "5px" },
  logCard: {
    backgroundColor: "#0f172a",
    padding: "12px",
    borderRadius: "8px",
    borderLeft: "4px solid #3b82f6",
  },
  logData: {
    fontSize: "11px",
    color: "#64748b",
    display: "block",
    marginBottom: "4px",
  },
  logTexto: { fontSize: "14px", color: "#cbd5e1" },
  btnSair: {
    padding: "8px 16px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnDeletar: {
    padding: "6px 12px",
    background: "none",
    border: "1px solid #ef4444",
    color: "#ef4444",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  btnResetar: {
    padding: "6px 12px",
    background: "none",
    border: "1px solid #3b82f6",
    color: "#3b82f6",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
  },
  // Injeção condicional de propriedades de estilo dinâmico baseado em tokens de ação
  acaoBadge: (acao) => {
    let cor = "#10b981";
    if (acao === "Adicionou") cor = "#3b82f6";
    if (acao === "Removeu") cor = "#f59e0b";
    return {
      backgroundColor: `${cor}22`,
      color: cor,
      padding: "2px 6px",
      borderRadius: "4px",
      fontWeight: "bold",
      fontSize: "12px",
    };
  },
};

export default Admin;