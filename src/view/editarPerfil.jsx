import { useState } from "react";

function EditarPerfil({ usuarioAtual, iconeAtual, onSalvar, onCancelar }) {
  const [novoNome, setNovoNome] = useState(usuarioAtual);

  // 🔄 BUSCA AUTOMÁTICA DE IMAGENS ACESSANDO O OBJETO DE MÓDULO DO VITE
  const arquivosImagens = import.meta.glob("/public/avatares/*.{png,jpg,jpeg,PNG,JPG,JPEG}", { eager: true });
  
  const listaIcones = Object.values(arquivosImagens).map((modulo) => {
    const caminhoCompleto = modulo.default;
    return caminhoCompleto.replace(/^\/public/, "");
  });

  // O estado 'novoIcone' guarda qual imagem está selecionada atualmente
  const [novoIcone, setNovoIcone] = useState(iconeAtual || listaIcones[0] || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!novoNome.trim()) {
      alert("O nome de usuário não pode ficar vazio.");
      return;
    }
    onSalvar(novoNome, novoIcone);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.titulo}>👤 Editar Perfil</h2>
      <p style={styles.subtitulo}>
        Altere as suas informações de exibição no sistema.
      </p>

      {/* 🌟 QUADRO DE PRÉVIA EM TEMPO REAL CORRIGIDO */}
      <div style={styles.containerPrevia}>
        <div style={styles.circuloPrevia}>
          {novoIcone ? (
            <div 
              style={{
                ...styles.imgPreviaFundo,
                backgroundImage: `url(${novoIcone})`,
              }} 
              aria-label="Prévia do Avatar"
            />
          ) : (
            <span style={styles.letraPrevia}>{usuarioAtual.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div style={styles.infoPrevia}>
          <span style={styles.txtPreviaNome}>@{novoNome || usuarioAtual}</span>
          <span style={styles.txtPreviaStatus}>Prévia do Perfil</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.formulario}>
        
        {/* 🛡️ SEÇÃO DE SELEÇÃO DE IMAGENS */}
        <div style={styles.campoGrupo}>
          <label style={styles.label}>Escolha seu Ícone de Avatar:</label>
          <div style={styles.gradeIcones}>
            {listaIcones.length === 0 ? (
              <p style={{ color: "#ff4d4d", fontSize: "13px" }}>Nenhuma imagem encontrada em public/avatares/</p>
            ) : (
              listaIcones.map((caminhoUrl) => (
                <button
                  key={caminhoUrl} // 👈 Corrigido aqui (não usa mais caminmeUrl)
                  type="button"
                  onClick={() => setNovoIcone(caminhoUrl)}
                  style={{
                    ...styles.botaoIcone,
                    backgroundColor: novoIcone === caminhoUrl ? "#5d4900" : "#252525",
                    borderColor: novoIcone === caminhoUrl ? "#ffd400" : "#5d4900",
                  }}
                >
                  <img 
                    src={caminhoUrl} 
                    alt="Opção de Avatar" 
                    style={styles.imgAvatar} 
                  />
                </button>
              ))
            )}
          </div>
        </div>

        <div style={styles.campoGrupo}>
          <label style={styles.label}>Nome de Usuário Atual:</label>
          <input
            type="text"
            value={`@${usuarioAtual}`}
            disabled
            style={styles.inputDisabled}
          />
        </div>

        <div style={styles.campoGrupo}>
          <label style={styles.label}>Novo Nome de Usuário:</label>
          <input
            type="text"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Digite o novo username..."
            maxLength={20}
            style={styles.input}
          />
        </div>

        <div style={styles.botoesContainer}>
          <button type="button" onClick={onCancelar} style={styles.btnCancelar}>
            Cancelar
          </button>
          <button type="submit" style={styles.btnSalvar}>
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#1a1a1a",
    border: "2px solid #5d4900",
    borderRadius: "8px",
    padding: "25px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
    marginTop: "10px",
  },
  titulo: {
    color: "#ffd400",
    fontSize: "22px",
    margin: "0 0 8px 0",
    fontWeight: "bold",
  },
  subtitulo: {
    color: "#a4a4a4",
    fontSize: "14px",
    margin: "0 0 20px 0",
  },
  containerPrevia: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "#151515",
    padding: "15px",
    borderRadius: "8px",
    border: "1px dashed #5d4900",
    marginBottom: "20px",
  },
  circuloPrevia: {
    width: "140px", 
    height: "140px",
    backgroundColor: "#252525",
    border: "3px solid #ffd400",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    boxShadow: "0 6px 15px rgba(0,0,0,0.5)",
  },
  imgPreviaFundo: {
    width: "100%",
    height: "100%",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain", // Preenche tudo sem deixar rebarba preta!
    backgroundColor: "#151515",
  },
  letraPrevia: {
    color: "#ffd400",
    fontSize: "24px",
    fontWeight: "bold",
  },
  infoPrevia: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  txtPreviaNome: {
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
  },
  txtPreviaStatus: {
    color: "#56722b",
    fontSize: "12px",
    textTransform: "uppercase",
    fontWeight: "bold",
    letterSpacing: "0.5px",
  },
  formulario: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  campoGrupo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    color: "#56722b",
    fontSize: "13px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  gradeIcones: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#151515",
    borderRadius: "6px",
    border: "1px solid #333333",
    maxHeight: "220px",
    overflowY: "auto",
  },
  botaoIcone: {
    width: "64px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid transparent",
    borderRadius: "8px",
    cursor: "pointer",
    padding: "4px",
    transition: "all 0.2s ease",
  },
  imgAvatar: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  input: {
    backgroundColor: "#252525",
    border: "1px solid #5d4900",
    borderRadius: "6px",
    padding: "10px 12px",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
  },
  inputDisabled: {
    backgroundColor: "#151515",
    border: "1px solid #333333",
    borderRadius: "6px",
    padding: "10px 12px",
    color: "#777777",
    fontSize: "14px",
    cursor: "not-allowed",
  },
  botoesContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "10px",
  },
  btnCancelar: {
    background: "none",
    border: "1px solid #ff4d4d",
    color: "#ff4d4d",
    padding: "10px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnSalvar: {
    backgroundColor: "#5d4900",
    border: "1px solid #ffd400",
    color: "#ffd400",
    padding: "10px 20px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  },
};

export default EditarPerfil;