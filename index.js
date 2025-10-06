const { select, input } = require('@inquirer/prompts');
const fs = require('fs').promises;
const path = require('path');

let mensagem = "🎮 Bem-vindo ao Sistema de Conquistas!";
let jogos = [];

// ===== Persistência =====
const carregarJogos = async () => {
    try {
        const dados = await fs.readFile(path.join(__dirname, "jogos.json"), "utf-8");
        jogos = JSON.parse(dados);
    } catch {
        jogos = [];
    }
};

const salvarJogos = async () => {
    await fs.writeFile(path.join(__dirname, "jogos.json"), JSON.stringify(jogos, null, 2));
};

// ===== Funções auxiliares =====
const toBool = (value) => {
    return value === true || value === "true";
};

// ===== Funcionalidades =====

// 1. Cadastrar jogo
const cadastrarJogo = async () => {
    const nome = await input({ message: "Nome do jogo:" });
    if (!nome.trim()) {
        mensagem = "⚠️ O nome do jogo não pode ser vazio.";
        return;
    }

    const plataforma = await input({ message: "Plataforma:" });
    const genero = await input({ message: "Gênero:" });

    jogos.push({
        id: jogos.length + 1,
        nome,
        plataforma,
        genero,
        conquistas: []
    });

    mensagem = `🎮 Jogo "${nome}" cadastrado com sucesso!`;
};

// 2. Adicionar conquista por jogo
const adicionarConquista = async () => {
    if (jogos.length === 0) {
        mensagem = "⚠️ Nenhum jogo cadastrado!";
        return;
    }

    const jogoId = await select({
        message: "Selecione o jogo:",
        choices: jogos.map(j => ({ name: j.nome, value: j.id }))
    });

    const jogo = jogos.find(j => j.id === jogoId);

    const titulo = await input({ message: "Título da conquista:" });
    if (!titulo.trim()) {
        mensagem = "⚠️ O título não pode ser vazio.";
        return;
    }

    const descricao = await input({ message: "Descrição:" });
    const dificuldade = await select({
        message: "Dificuldade:",
        choices: [
            { name: "Fácil", value: "fácil" },
            { name: "Média", value: "média" },
            { name: "Difícil", value: "difícil" }
        ]
    });

    let pontos;
    while (true) {
        const pontosInput = await input({ message: "Pontos (número):" });
        pontos = parseInt(pontosInput);
        if (!isNaN(pontos)) break;
        console.log("⚠️ Por favor, insira um número válido para os pontos.");
    }

    jogo.conquistas.push({
        id: jogo.conquistas.length + 1,
        titulo,
        descricao,
        dificuldade,
        desbloqueada: false,
        dataDesbloqueio: null,
        pontos
    });

    mensagem = `🏆 Conquista "${titulo}" adicionada ao jogo ${jogo.nome}!`;
};

// 3. Marcar conquista como desbloqueada com data
const desbloquearConquista = async () => {
    if (!Array.isArray(jogos) || jogos.length === 0) {
        mensagem = "⚠️ Nenhum jogo cadastrado!";
        return;
    }

    const jogoId = await select({
        message: "Selecione o jogo:",
        choices: jogos.map(j => ({ name: j.nome || "Sem nome", value: j.id }))
    });

    const jogo = jogos.find(j => j.id === jogoId);

    if (!jogo) {
        mensagem = "⚠️ Jogo não encontrado!";
        return;
    }

    const conquistas = Array.isArray(jogo.conquistas) ? jogo.conquistas : [];

    if (conquistas.length === 0) {
        mensagem = "⚠️ Este jogo não possui conquistas.";
        return;
    }

    const conquistaId = await select({
        message: "Selecione a conquista para desbloquear:",
        choices: conquistas.map(c => ({ name: c.titulo || "Sem título", value: c.id }))
    });

    const conquista = conquistas.find(c => c.id === conquistaId);

    if (!conquista) {
        mensagem = "⚠️ Conquista não encontrada!";
        return;
    }

    if (conquista.desbloqueada) {
        mensagem = "✅ Esta conquista já foi desbloqueada.";
        return;
    }

    conquista.desbloqueada = true;
    conquista.dataDesbloqueio = new Date().toLocaleDateString("pt-BR");

    mensagem = `🏅 Conquista "${conquista.titulo}" desbloqueada com sucesso!`;
};

// 4. Visualizar conquistas de um jogo
const visualizarConquistas = async () => {
    if (jogos.length === 0) {
        mensagem = "⚠️ Nenhum jogo cadastrado!";
        return;
    }

    const jogoId = await select({
        message: "Selecione o jogo:",
        choices: jogos.map(j => ({ name: j.nome, value: j.id }))
    });

    const jogo = jogos.find(j => j.id === jogoId);

    if (!jogo || jogo.conquistas.length === 0) {
        mensagem = "⚠️ Este jogo não possui conquistas cadastradas.";
        return;
    }

    console.clear();
    console.log(`\n🎮 ${jogo.nome} - ${jogo.plataforma} (${jogo.genero})`);
    console.log("━".repeat(60));
    
    jogo.conquistas.forEach(c => {
        const status = c.desbloqueada ? "✅" : "🔒";
        const data = c.desbloqueada ? ` [${c.dataDesbloqueio}]` : "";
        console.log(`\n${status} ${c.titulo} - ${c.pontos} pts`);
        console.log(`   ${c.descricao}`);
        console.log(`   Dificuldade: ${c.dificuldade}${data}`);
    });
    
    console.log("\n" + "━".repeat(60));
    await input({ message: "\nPressione ENTER para continuar..." });
};

// 5. Estatísticas por jogo
const estatisticas = async () => {
    if (jogos.length === 0) {
        mensagem = "⚠️ Nenhum jogo cadastrado!";
        return;
    }

    const jogoId = await select({
        message: "Selecione o jogo:",
        choices: jogos.map(j => ({ name: j.nome, value: j.id }))
    });

    const jogo = jogos.find(j => j.id === jogoId);

    if (!jogo) {
        mensagem = "⚠️ Jogo não encontrado!";
        return;
    }

    const total = jogo.conquistas.length;
    const desbloqueadas = jogo.conquistas.filter(c => c.desbloqueada).length;
    const percentual = total > 0 ? ((desbloqueadas / total) * 100).toFixed(1) : 0;
    
    const pontosGanhos = jogo.conquistas
        .filter(c => c.desbloqueada)
        .reduce((sum, c) => sum + c.pontos, 0);
    
    const pontosTotal = jogo.conquistas.reduce((sum, c) => sum + c.pontos, 0);

    const porDificuldade = {
        fácil: { total: 0, desbloqueadas: 0 },
        média: { total: 0, desbloqueadas: 0 },
        difícil: { total: 0, desbloqueadas: 0 }
    };

    jogo.conquistas.forEach(c => {
        porDificuldade[c.dificuldade].total++;
        if (c.desbloqueada) {
            porDificuldade[c.dificuldade].desbloqueadas++;
        }
    });

    console.clear();
    console.log(`\n📊 Estatísticas - ${jogo.nome}`);
    console.log("━".repeat(60));
    console.log(`\n🎮 Progresso Geral:`);
    console.log(`   Total de conquistas: ${total}`);
    console.log(`   Desbloqueadas: ${desbloqueadas} (${percentual}%)`);
    console.log(`   Pontos: ${pontosGanhos}/${pontosTotal}`);
    
    console.log(`\n📈 Por Dificuldade:`);
    console.log(`   Fácil: ${porDificuldade.fácil.desbloqueadas}/${porDificuldade.fácil.total}`);
    console.log(`   Média: ${porDificuldade.média.desbloqueadas}/${porDificuldade.média.total}`);
    console.log(`   Difícil: ${porDificuldade.difícil.desbloqueadas}/${porDificuldade.difícil.total}`);
    
    console.log("\n" + "━".repeat(60));
    await input({ message: "\nPressione ENTER para continuar..." });
};

// 6. Ranking de jogos
const ranking = async () => {
    if (jogos.length === 0) {
        mensagem = "⚠️ Nenhum jogo cadastrado!";
        return;
    }

    const ranking = jogos.map(jogo => {
        const total = jogo.conquistas.length;
        const desbloqueadas = jogo.conquistas.filter(c => c.desbloqueada).length;
        const percentual = total > 0 ? ((desbloqueadas / total) * 100).toFixed(1) : 0;
        const pontosGanhos = jogo.conquistas
            .filter(c => c.desbloqueada)
            .reduce((sum, c) => sum + c.pontos, 0);

        return {
            nome: jogo.nome,
            total,
            desbloqueadas,
            percentual: parseFloat(percentual),
            pontosGanhos
        };
    }).sort((a, b) => b.percentual - a.percentual || b.pontosGanhos - a.pontosGanhos);

    console.clear();
    console.log("\n🏆 Ranking de Jogos");
    console.log("━".repeat(60));
    
    ranking.forEach((jogo, index) => {
        const posicao = index + 1;
        const medalha = posicao === 1 ? "🥇" : posicao === 2 ? "🥈" : posicao === 3 ? "🥉" : `${posicao}º`;
        console.log(`\n${medalha} ${jogo.nome}`);
        console.log(`   Progresso: ${jogo.desbloqueadas}/${jogo.total} (${jogo.percentual}%)`);
        console.log(`   Pontos: ${jogo.pontosGanhos}`);
    });
    
    console.log("\n" + "━".repeat(60));
    await input({ message: "\nPressione ENTER para continuar..." });
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
                { name: "Sair", value: "sair" }
            ]
        });

        switch (opcao) {
            case "cadastrarJogo": await cadastrarJogo(); break;
            case "adicionarConquista": await adicionarConquista(); break;
            case "desbloquearConquista": await desbloquearConquista(); break;
            case "visualizar": await visualizarConquistas(); break;
            case "estatisticas": await estatisticas(); break;
            case "ranking": await ranking(); break;
            case "sair": console.log("👋 Até a próxima!"); return;
        }
    }
};

start();
