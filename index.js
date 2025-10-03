import { select, input, checkbox } from "@inquirer/prompts";
import fs from "fs/promises";

// ===== Variáveis Globais =====
let mensagem = "🎮 Bem-vindo ao Sistema de Conquistas!";
let jogos = [];

// ===== Helpers =====
const toBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(s)) return true;
    if (["false", "0", "no", "n"].includes(s)) return false;
  }
  return false;
};

const nextGameId = () => {
  if (!Array.isArray(jogos) || jogos.length === 0) return 1;
  const max = Math.max(...jogos.map((j) => Number(j.id) || 0));
  return max + 1;
};

const nextConquistaId = (jogo) => {
  const conquistas = Array.isArray(jogo.conquistas) ? jogo.conquistas : [];
  if (conquistas.length === 0) return 1;
  const max = Math.max(...conquistas.map((c) => Number(c.id) || 0));
  return max + 1;
};

// ===== Persistência =====
const carregarJogos = async () => {
  try {
    const dados = await fs.readFile("jogos.json", "utf-8");
    const parsed = JSON.parse(dados);
    if (!Array.isArray(parsed)) {
      jogos = [];
    } else {
      jogos = parsed.map((jogo) => ({
        id: jogo.id ?? nextGameId(),
        nome: jogo.nome ?? "Sem nome",
        plataforma: jogo.plataforma ?? "N/A",
        genero: jogo.genero ?? "N/A",
        conquistas: Array.isArray(jogo.conquistas)
          ? jogo.conquistas.map((c) => ({
              id: c?.id ?? null,
              titulo: c?.titulo ?? "Sem título",
              descricao: c?.descricao ?? "",
              dificuldade: c?.dificuldade ?? "média",
              desbloqueada: toBool(c?.desbloqueada),
              dataDesbloqueio: c?.dataDesbloqueio ?? null,
              pontos: Number(c?.pontos) || 0,
            }))
          : [],
      }));

      // garantir IDs únicos
      jogos.forEach((j) => {
        j.conquistas = j.conquistas.map((c, i) => ({
          ...c,
          id: c.id ?? i + 1,
        }));
      });
    }
  } catch {
    jogos = [];
  }
};

const salvarJogos = async () => {
  try {
    await fs.writeFile("jogos.json", JSON.stringify(jogos, null, 2));
  } catch (err) {
    console.error("Erro ao salvar jogos.json:", err.message);
  }
};

// ===== Funcionalidades =====

// 1. Cadastrar jogo
const cadastrarJogo = async () => {
  const nome = (await input({ message: "Nome do jogo:" })) || "";
  if (!nome.trim()) {
    mensagem = "⚠️ O nome do jogo não pode ser vazio.";
    return;
  }

  const plataforma = (await input({ message: "Plataforma:" })) || "N/A";
  const genero = (await input({ message: "Gênero:" })) || "N/A";

  const jogo = {
    id: nextGameId(),
    nome: nome.trim(),
    plataforma: plataforma.trim(),
    genero: genero.trim(),
    conquistas: [],
  };

  jogos.push(jogo);
  mensagem = `🎮 Jogo "${jogo.nome}" cadastrado com sucesso!`;
};

// 2. Adicionar conquista
const adicionarConquista = async () => {
  if (jogos.length === 0) {
    mensagem = "⚠️ Nenhum jogo cadastrado!";
    return;
  }

  const jogoId = await select({
    message: "Selecione o jogo:",
    choices: jogos.map((j) => ({ name: `${j.nome} [${j.plataforma}]`, value: j.id })),
  });

  const jogo = jogos.find((j) => j.id === jogoId);
  if (!jogo) return;

  const titulo = (await input({ message: "Título da conquista:" })) || "";
  if (!titulo.trim()) {
    mensagem = "⚠️ O título não pode ser vazio.";
    return;
  }

  const descricao = (await input({ message: "Descrição:" })) || "";
  const dificuldade = await select({
    message: "Dificuldade:",
    choices: [
      { name: "Fácil", value: "fácil" },
      { name: "Média", value: "média" },
      { name: "Difícil", value: "difícil" },
    ],
  });
  const pontos = Number(await input({ message: "Pontos:" })) || 0;

  const conquista = {
    id: nextConquistaId(jogo),
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    dificuldade,
    desbloqueada: false,
    dataDesbloqueio: null,
    pontos,
  };

  jogo.conquistas.push(conquista);
  mensagem = `🏆 Conquista "${conquista.titulo}" adicionada ao jogo ${jogo.nome}!`;
};

// 3. Marcar conquista desbloqueada
const desbloquearConquista = async () => {
  if (jogos.length === 0) {
    mensagem = "⚠️ Nenhum jogo cadastrado!";
    return;
  }

  const jogoId = await select({
    message: "Selecione o jogo:",
    choices: jogos.map((j) => ({ name: `${j.nome} [${j.plataforma}]`, value: j.id })),
  });

  const jogo = jogos.find((j) => j.id === jogoId);
  if (!jogo || jogo.conquistas.length === 0) {
    mensagem = "⚠️ Este jogo não possui conquistas.";
    return;
  }

  const escolhidas = await checkbox({
    message: "Selecione conquistas para desbloquear:",
    choices: jogo.conquistas.map((c) => ({
      name: `${c.titulo} (${c.dificuldade}, ${c.pontos} pts)`,
      value: c.id,
      checked: toBool(c.desbloqueada),
    })),
  });

  escolhidas.forEach((id) => {
    const c = jogo.conquistas.find((x) => x.id === id);
    if (c && !toBool(c.desbloqueada)) {
      c.desbloqueada = true;
      c.dataDesbloqueio = new Date().toLocaleString("pt-BR");
    }
  });

  mensagem = "🏅 Conquista(s) desbloqueada(s)!";
};

// 4. Visualizar conquistas
const visualizarConquistas = async () => {
  if (jogos.length === 0) {
    mensagem = "⚠️ Nenhum jogo cadastrado!";
    return;
  }

  const modo = await select({
    message: "Visualizar por:",
    choices: [
      { name: "Por jogo", value: "jogo" },
      { name: "Por status", value: "status" },
    ],
  });

  if (modo === "jogo") {
    const jogoId = await select({
      message: "Selecione o jogo:",
      choices: jogos.map((j) => ({ name: j.nome, value: j.id })),
    });

    const jogo = jogos.find((j) => j.id === jogoId);
    console.clear();
    console.log(`🎮 Conquistas de ${jogo.nome}:\n`);

    if (jogo.conquistas.length === 0) {
      console.log("⚠️ Nenhuma conquista cadastrada.");
    } else {
      jogo.conquistas.forEach((c) => {
        const statusStr = toBool(c.desbloqueada)
          ? `✅ Desbloqueada em ${c.dataDesbloqueio}`
          : "🔒 Pendente";
        console.log(`🏅 ${c.titulo} (${c.pontos} pts) - ${statusStr}`);
      });
    }
  } else {
    const status = await select({
      message: "Filtrar por:",
      choices: [
        { name: "✅ Desbloqueadas", value: true },
        { name: "❌ Pendentes", value: false },
      ],
    });

    console.clear();
    console.log(`📌 Conquistas ${status ? "Desbloqueadas" : "Pendentes"}:\n`);

    let encontrou = false;
    jogos.forEach((jogo) => {
      const filtradas = jogo.conquistas.filter((c) => toBool(c.desbloqueada) === status);
      if (filtradas.length > 0) {
        encontrou = true;
        console.log(`🎮 ${jogo.nome}`);
        filtradas.forEach((c) =>
          console.log(`   - ${c.titulo} (${c.pontos} pts)`)
        );
      }
    });

    if (!encontrou) console.log("⚠️ Nenhuma encontrada.");
  }

  await input({ message: "ENTER para voltar ao menu:" });
};

// 5. Estatísticas
const estatisticas = async () => {
  console.clear();
  console.log("📊 Estatísticas por jogo:\n");

  jogos.forEach((jogo) => {
    const total = jogo.conquistas.length;
    const desbloq = jogo.conquistas.filter((c) => toBool(c.desbloqueada)).length;
    const progresso = total > 0 ? ((desbloq / total) * 100).toFixed(2) : "0.00";

    console.log(`🎮 ${jogo.nome} [${jogo.plataforma}]`);
    console.log(`   Conquistas: ${desbloq}/${total} (${progresso}%)\n`);
  });

  await input({ message: "ENTER para voltar ao menu:" });
};

// 6. Ranking
const ranking = async () => {
  console.clear();
  console.log("🏆 Ranking de Jogos:\n");

  const rank = [...jogos].sort((a, b) => {
    const pa = a.conquistas.length
      ? a.conquistas.filter((c) => toBool(c.desbloqueada)).length / a.conquistas.length
      : 0;
    const pb = b.conquistas.length
      ? b.conquistas.filter((c) => toBool(c.desbloqueada)).length / b.conquistas.length
      : 0;
    return pb - pa;
  });

  rank.forEach((j, i) => {
    const total = j.conquistas.length;
    const desbloq = j.conquistas.filter((c) => toBool(c.desbloqueada)).length;
    const progresso = total > 0 ? ((desbloq / total) * 100).toFixed(2) : "0.00";
    console.log(`${i + 1}º 🎮 ${j.nome} - ${desbloq}/${total} (${progresso}%)`);
  });

  await input({ message: "ENTER para voltar ao menu:" });
};

// ===== Sistema =====
const mostrarMensagem = () => {
  console.clear();
  if (mensagem) {
    console.log(mensagem + "\n");
    mensagem = "";
  }
};

const start = async () => {
  await carregarJogos();

  while (true) {
    mostrarMensagem();
    await salvarJogos();

    const opcao = await select({
      message: "🎮 Menu >",
      choices: [
        { name: "Cadastrar jogo", value: "cadastrarJogo" },
        { name: "Adicionar conquista", value: "adicionarConquista" },
        { name: "Desbloquear conquista", value: "desbloquearConquista" },
        { name: "Visualizar conquistas", value: "visualizar" },
        { name: "Estatísticas por jogo", value: "estatisticas" },
        { name: "Ranking de jogos", value: "ranking" },
        { name: "Sair", value: "sair" },
      ],
    });

    switch (opcao) {
      case "cadastrarJogo":
        await cadastrarJogo();
        break;
      case "adicionarConquista":
        await adicionarConquista();
        break;
      case "desbloquearConquista":
        await desbloquearConquista();
        break;
      case "visualizar":
        await visualizarConquistas();
        break;
      case "estatisticas":
        await estatisticas();
        break;
      case "ranking":
        await ranking();
        break;
      case "sair":
        console.log("👋 Até a próxima!");
        return;
    }
  }
};

start();
