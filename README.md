# [Sistemas De Conquistas De Jogos de PC]

## Descrição
Um Sistema de conquistas de jogos de diferentes plataformas.

## Funcionalidades
- [ ] Cadastro de jogo
- [ ] Adicionar Conquistas
- [ ] Visualizar conquistas por jogo
- [ ] Estatísticas 
- [ ] Ranking de jogos mais completados

## Como Executar
1. Clone o repositório
2. Execute `npm install`
3. Execute `node index.js`

## Tecnologias Utilizadas
- Node.js
- @inquirer/prompts
- File System (fs)

## Estrutura de Dados
Estrutura geral

A estrutura de dados principal é:

let jogos = [];


Ou seja, temos um array chamado jogos, que armazena vários objetos — cada um representando um jogo.

Cada jogo contém, por sua vez, outro array interno chamado conquistas, com objetos representando cada conquista.

 Estrutura de um jogo

Cada item dentro do array jogos tem a seguinte estrutura:

{
  id: number,            // identificador único do jogo
  nome: string,          // nome do jogo
  plataforma: string,    // ex: "PC", "PlayStation", etc.
  genero: string,        // ex: "Ação", "RPG"
  conquistas: [          // lista de conquistas desse jogo
    {
      id: number,              // identificador único da conquista
      titulo: string,          // nome/título da conquista
      descricao: string,       // descrição textual
      dificuldade: string,     // "fácil", "média" ou "difícil"
      desbloqueada: boolean,   // indica se foi desbloqueada
      dataDesbloqueio: string, // data/hora em que foi desbloqueada
      pontos: number           // pontuação atribuída
    },
    ...
  ]
}

 Tipo de Estrutura

A estrutura é uma lista de objetos (array de objetos), o que é muito comum em JavaScript.

Podemos representar visualmente assim:

jogos (Array)
│
├── [0] Jogo
│    ├── id: 1
│    ├── nome: "The Witcher 3"
│    ├── plataforma: "PC"
│    ├── genero: "RPG"
│    └── conquistas (Array)
│         ├── [0] { id: 1, titulo: "Caçador", desbloqueada: true, ... }
│         └── [1] { id: 2, titulo: "Mago", desbloqueada: false, ... }
│
├── [1] Jogo
│    └── ...
└── ...

 Persistência (salvamento dos dados)

Os dados são salvos e carregados de um arquivo jogos.json:

carregarJogos() lê o arquivo e converte o JSON em um array de objetos (jogos).

salvarJogos() converte o array jogos de volta em JSON e grava no arquivo.

 Exemplo de como o arquivo jogos.json pode ficar:

[
  {
    "id": 1,
    "nome": "The Witcher 3",
    "plataforma": "PC",
    "genero": "RPG",
    "conquistas": [
      {
        "id": 1,
        "titulo": "Caçador de Monstros",
        "descricao": "Mate 10 monstros",
        "dificuldade": "média",
        "desbloqueada": true,
        "dataDesbloqueio": "06/10/2025 15:42:00",
        "pontos": 50
      }
    ]
  }
]

 Funções auxiliares que manipulam a estrutura

nextGameId() → gera o próximo ID de jogo baseado no maior ID existente.

nextConquistaId(jogo) → gera o próximo ID de conquista para o jogo específico.

toBool(v) → converte valores variados (ex: "true", 1, "yes") em booleanos.

Essas funções ajudam a manter consistência na estrutura de dados.

 Em resumo:
Nível	    Tipo	Descrição
jogos	    Array	Lista de todos os jogos
jogo	    Object	Representa um jogo e contém um array de conquistas
conquistas	Array	Lista de conquistas de um jogo
conquista	Object	Representa uma conquista individual com seus atributos

## Capturas de Tela
Capturas de tela estão no Slide

## Autor
Nome:
Matheus F. S. Mueller 

Contato:
matheusfernando234567@gmail.com

## Link do Slide
https://www.canva.com/design/DAG1DgTq6QQ/-1NZJC5E4RSQYinlAC4emg/edit?utm_content=DAG1DgTq6QQ&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

## Aprendizados
Aprendi sobre o desenvolvimento de conquistas de jogos , além de aprender um pouco mais sobre como fazer os códigos além de também de sistemas que aprendi com a ajuda do chat GPT e também de exlicações que ele me deu , com os testes que eu fiz do sistema , todos deram certos e também com ajuda do chat GPT que me indicou alguns erros mas foram corrigidos
