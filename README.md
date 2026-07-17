# Tripulação em Apuros

**Equipe:** Arthur Quintanilha Duarte  
**Disciplina:** Design e Desenvolvimento de Jogos — 5º período

Jogo de furtividade e sobrevivência ambientado em um navio mercante invadido por piratas. Na demo, o jogador percorre o porão, elimina o pirata na sala do capitão e foge com as chaves até o bote salva-vidas.

---

## Download e instalação

| | |
|---|---|
| **Jogar online** | https://arthur-quintanilha.github.io/tripulacao-em-apuros/ |
| **Repositório** | https://github.com/Arthur-Quintanilha/tripulacao-em-apuros |
| **Plataforma** | Web (navegador) |

**Requisitos:** navegador com suporte a HTML5 e JavaScript (Chrome, Firefox, Edge ou equivalente). Conexão com a internet recomendada na primeira execução — o Phaser 3 é carregado via CDN.

### Passo a passo

1. Acesse o link acima no navegador para jogar online, **ou** clone o repositório e abra o arquivo `index.html` localmente.
2. Se preferir rodar com servidor local (recomendado para desenvolvimento), execute na pasta do projeto:

```bash
npx serve .
```

3. Abra o endereço exibido no terminal (geralmente `http://localhost:3000`) e aguarde a tela de carregamento.

---

## Como jogar

**Objetivo:** sobreviver e escapar do navio usando furtividade. Na versão demo, percorra o porão, elimine o pirata na sala do capitão e fuja com as chaves até o bote salva-vidas.

### Controles

| Ação | Tecla / input |
|------|----------------|
| Mover | `WASD` / setas |
| Pular | `Espaço` (usado para subir na caixa no porão) |
| Agachar / furtivo | `Shift` |
| Atacar | Botão esquerdo do mouse (eliminação furtiva por trás) |
| Interagir / avançar diálogo | `E` ou clique |

### Dicas para o testador

- Comece pelo menu principal e inicie uma nova partida; leia os diálogos do narrador e do marujo ferido no porão.
- No porão, fale com o marujo caído para receber o canivete; depois pule na caixa (`Espaço`) para alcançar a escada quebrada e sair.
- No convés, aproxime-se furtivamente (`Shift`) do pirata na sala do capitão e ataque por trás com clique do mouse.
- Após eliminar o pirata, pegue as chaves e fuja agachado até o bote salva-vidas para vencer a demo.

---

## Vídeos

- **Gameplay no YouTube:** [URL]
- **Vídeo original:** [URL do Google Drive]

---

## Informações complementares

- O vertical slice inicial foi desenvolvido em GDevelop. Após dificuldades de evoluir o projeto na ferramenta, o desenvolvimento foi migrado para **Phaser 3** com HTML5, CSS e JavaScript.
- Versão demo (**v1.0.0**) com sequência de abertura: **Porão → Convés**.
- Gênero: furtividade e sobrevivência ambientada em um navio pirata.
- Desenvolvido com HTML5, CSS3, JavaScript e Phaser 3 (via CDN).
- Projeto acadêmico da **UFOP**.
- O jogo possui tela de carregamento, menu, sistema de diálogos, inventário, HUD e telas de vitória / game over.

---

## Contato

**E-mail:** arthur.quintanilha@aluno.ufop.edu.br
