const canvas = document.getElementById("jogoCanvas");
const ctx = canvas.getContext("2d");

// Estados do Jogo
const ESTADO_MENU = 0;
const ESTADO_DIFICULDADE = 1;
const ESTADO_JOGANDO = 2;
const ESTADO_FIM = 3;
let estadoAtual = ESTADO_MENU;

let modoJogo = "1P"; // "1P", "2P" ou "PAREDAO"
let dificuldade = "MEDIO"; // "FACIL", "MEDIO", "IMPOSSIVEL"

// Posição e velocidade da bolinha
let bolaX = canvas.width / 2;
let bolaY = canvas.height / 2;
let velocidadeInicial = 5;
let velocidadeBolaX = velocidadeInicial; 
let velocidadeBolaY = velocidadeInicial; 
const raioBola = 10;
const velocidadeMaxima = 15; 

// Histórico para o Rastro Brilhante
let historicoBola = [];

// Configurações das Raquetes
const raqueteLargura = 10;
const raqueteAltura = 100;
let raqueteJogadorY = 250;     
let raqueteComputadorY = 250;  

// Controle de Teclado
const teclas = {};
window.addEventListener("keydown", function(e) { teclas[e.key] = true; });
window.addEventListener("keyup", function(e) { teclas[e.key] = false; });

// Pontuação
const tabelaTenis = ["0", "15", "30", "40"];
let pontosJogador = 0;
let pontosComputador = 0;
let rebatidasParedao = 0;
let mensagemVitoria = "";

// CONTROLE 1: Mouse (Jogador 1)
canvas.addEventListener('mousemove', function(evento) {
    if (estadoAtual === ESTADO_JOGANDO) {
        let retangulo = canvas.getBoundingClientRect();
        let escalaY = canvas.height / retangulo.height;
        let mousePosY = (evento.clientY - retangulo.top) * escalaY;
        raqueteJogadorY = mousePosY - (raqueteAltura / 2); 
    }
});

// CONTROLE 2: Toque na tela (Celular - Jogador 1)
canvas.addEventListener('touchmove', function(evento) {
    if (estadoAtual === ESTADO_JOGANDO) {
        evento.preventDefault();
        let retangulo = canvas.getBoundingClientRect();
        let escalaY = canvas.height / retangulo.height;
        let toquePosY = (evento.touches[0].clientY - retangulo.top) * escalaY;
        raqueteJogadorY = toquePosY - (raqueteAltura / 2);
    }
}, { passive: false });

// Cliques nos Menus e Telas
canvas.addEventListener('click', function(evento) {
    let retangulo = canvas.getBoundingClientRect();
    let escalaX = canvas.width / retangulo.width;
    let escalaY = canvas.height / retangulo.height;
    let clickX = (evento.clientX - retangulo.left) * escalaX;
    let clickY = (evento.clientY - retangulo.top) * escalaY;

    if (estadoAtual === ESTADO_MENU) {
        // Botão 1: 1 Jogador vs PC -> Vai para seleção de dificuldade
        if (clickX >= 250 && clickX <= 550 && clickY >= 200 && clickY <= 250) {
            modoJogo = "1P";
            estadoAtual = ESTADO_DIFICULDADE;
        }
        // Botão 2: 2 Jogadores Local
        if (clickX >= 250 && clickX <= 550 && clickY >= 270 && clickY <= 320) {
            modoJogo = "2P";
            iniciarPartida();
        }
        // Botão 3: Modo Paredão
        if (clickX >= 250 && clickX <= 550 && clickY >= 340 && clickY <= 390) {
            modoJogo = "PAREDAO";
            iniciarPartida();
        }
    } 
    else if (estadoAtual === ESTADO_DIFICULDADE) {
        // Fácil
        if (clickX >= 250 && clickX <= 550 && clickY >= 200 && clickY <= 250) {
            dificuldade = "FACIL";
            iniciarPartida();
        }
        // Médio
        if (clickX >= 250 && clickX <= 550 && clickY >= 270 && clickY <= 320) {
            dificuldade = "MEDIO";
            iniciarPartida();
        }
        // Impossível
        if (clickX >= 250 && clickX <= 550 && clickY >= 340 && clickY <= 390) {
            dificuldade = "IMPOSSIVEL";
            iniciarPartida();
        }
        // Voltar
        if (clickX >= 250 && clickX <= 550 && clickY >= 410 && clickY <= 450) {
            estadoAtual = ESTADO_MENU;
        }
    } 
    else if (estadoAtual === ESTADO_FIM) {
        estadoAtual = ESTADO_MENU;
    }
});

function iniciarPartida() {
    pontosJogador = 0;
    pontosComputador = 0;
    rebatidasParedao = 0;
    mensagemVitoria = "";
    estadoAtual = ESTADO_JOGANDO;
    resetarBola();
}

function resetarBola() {
    bolaX = canvas.width / 2;
    bolaY = canvas.height / 2;
    historicoBola = [];
    let direcaoX = velocidadeBolaX > 0 ? -1 : 1;
    velocidadeBolaX = direcaoX * velocidadeInicial;
    velocidadeBolaY = (Math.random() > 0.5 ? 1 : -1) * velocidadeInicial;
}

function moverTudo() {
    if (estadoAtual !== ESTADO_JOGANDO) return;

    // Rastro da bola
    historicoBola.push({ x: bolaX, y: bolaY });
    let velocidadeAtual = Math.abs(velocidadeBolaX);
    let tamanhoMaximoRastro = Math.min(12, Math.floor(velocidadeAtual * 1.5));
    while (historicoBola.length > tamanhoMaximoRastro) {
        historicoBola.shift();
    }

    // Aumento de velocidade da bola com o tempo
    if (velocidadeAtual < velocidadeMaxima) {
        velocidadeBolaX *= 1.0008;
        velocidadeBolaY *= 1.0008;
    }

    bolaX += velocidadeBolaX;
    bolaY += velocidadeBolaY;

    // Controles Teclado (Jogador 1)
    if (teclas["w"] || teclas["W"]) raqueteJogadorY -= 7;
    if (teclas["s"] || teclas["S"]) raqueteJogadorY += 7;

    // Lógica da Raquete Direita (IA / Jogador 2)
    if (modoJogo === "1P") {
        let centroComputador = raqueteComputadorY + (raqueteAltura / 2);
        let velPC = 6;
        let margemErro = 30;

        // Ajusta velocidade e precisão da IA conforme a dificuldade escolhida
        if (dificuldade === "FACIL") {
            velPC = 3.5;
            margemErro = 50;
        } else if (dificuldade === "MEDIO") {
            velPC = 6.0;
            margemErro = 30;
        } else if (dificuldade === "IMPOSSIVEL") {
            velPC = 11.0;
            margemErro = 5;
        }

        if (centroComputador < bolaY - margemErro) {
            raqueteComputadorY += velPC;
        } else if (centroComputador > bolaY + margemErro) {
            raqueteComputadorY -= velPC;
        }
    } else if (modoJogo === "2P") {
        if (teclas["ArrowUp"]) raqueteComputadorY -= 7;
        if (teclas["ArrowDown"]) raqueteComputadorY += 7;
    }

    raqueteJogadorY = Math.max(0, Math.min(canvas.height - raqueteAltura, raqueteJogadorY));
    raqueteComputadorY = Math.max(0, Math.min(canvas.height - raqueteAltura, raqueteComputadorY));

    // Quicar no teto e chão
    if (bolaY > canvas.height || bolaY < 0) {
        velocidadeBolaY = -velocidadeBolaY;
    }

    // Colisão Esquerda (Jogador 1)
    if (bolaX < 0) {
        if (bolaY > raqueteJogadorY && bolaY < raqueteJogadorY + raqueteAltura) {
            velocidadeBolaX = -velocidadeBolaX;
            if (modoJogo === "PAREDAO") rebatidasParedao++;
        } else {
            if (modoJogo === "PAREDAO") {
                mensagemVitoria = "FIM DE JOGO! REBATIDAS: " + rebatidasParedao;
                estadoAtual = ESTADO_FIM;
            } else {
                pontosComputador++;
                if (pontosComputador >= 4) {
                    mensagemVitoria = modoJogo === "1P" ? "COMPUTADOR VENCEU!" : "JOGADOR 2 VENCEU!";
                    estadoAtual = ESTADO_FIM;
                } else {
                    resetarBola();
                }
            }
        }
    }

    // Colisão Direita (Computador / Jogador 2 / Parede)
    if (bolaX > canvas.width) {
        if (modoJogo === "PAREDAO") {
            velocidadeBolaX = -velocidadeBolaX;
        } else if (bolaY > raqueteComputadorY && bolaY < raqueteComputadorY + raqueteAltura) {
            velocidadeBolaX = -velocidadeBolaX;
        } else {
            pontosJogador++;
            if (pontosJogador >= 4) {
                mensagemVitoria = "JOGADOR 1 VENCEU!";
                estadoAtual = ESTADO_FIM;
            } else {
                resetarBola();
            }
        }
    }
}

function desenharTudo() {
    // Fundo Quadra
    ctx.fillStyle = "#1b4d3e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (estadoAtual === ESTADO_MENU) {
        // --- MENU PRINCIPAL ---
        ctx.fillStyle = "#ccff00";
        ctx.font = "bold 44px Arial";
        ctx.textAlign = "center";
        ctx.fillText("JOGO DE TÊNIS", canvas.width / 2, 130);

        ctx.fillStyle = "hotpink";
        ctx.fillRect(250, 200, 300, 50);
        ctx.fillStyle = "white";
        ctx.font = "bold 18px Arial";
        ctx.fillText("1 JOGADOR (vs PC)", canvas.width / 2, 232);

        ctx.fillStyle = "#00bfff";
        ctx.fillRect(250, 270, 300, 50);
        ctx.fillStyle = "white";
        ctx.fillText("2 JOGADORES (LOCAL)", canvas.width / 2, 302);

        ctx.fillStyle = "#ffaa00";
        ctx.fillRect(250, 340, 300, 50);
        ctx.fillStyle = "white";
        ctx.fillText("MODO PAREDÃO (SOLO)", canvas.width / 2, 372);

        ctx.font = "15px Arial";
        ctx.fillStyle = "#ddd";
        ctx.fillText("J1 (Rosa): Mouse/Toque ou W/S  |  J2 (Azul): Setas ↑ / ↓", canvas.width / 2, 440);
        ctx.textAlign = "left";

    } else if (estadoAtual === ESTADO_DIFICULDADE) {
        // --- TELA DE SELEÇÃO DE DIFICULDADE ---
        ctx.fillStyle = "#ccff00";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("ESCOLHA A DIFICULDADE", canvas.width / 2, 130);

        // Botão Fácil
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(250, 200, 300, 50);
        ctx.fillStyle = "white";
        ctx.font = "bold 18px Arial";
        ctx.fillText("FÁCIL", canvas.width / 2, 232);

        // Botão Médio
        ctx.fillStyle = "#f39c12";
        ctx.fillRect(250, 270, 300, 50);
        ctx.fillStyle = "white";
        ctx.fillText("MÉDIO", canvas.width / 2, 302);

        // Botão Impossível
        ctx.fillStyle = "#e74c3c";
        ctx.fillRect(250, 340, 300, 50);
        ctx.fillStyle = "white";
        ctx.fillText("IMPOSSÍVEL", canvas.width / 2, 372);

        // Botão Voltar
        ctx.fillStyle = "#7f8c8d";
        ctx.fillRect(250, 410, 300, 40);
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.fillText("VOLTAR", canvas.width / 2, 435);

        ctx.textAlign = "left";

    } else if (estadoAtual === ESTADO_JOGANDO || estadoAtual === ESTADO_FIM) {
        // --- TELA DE JOGO ---
        if (modoJogo !== "PAREDAO") {
            ctx.fillStyle = "white";
            for (let i = 0; i < canvas.height; i += 40) {
                ctx.fillRect(canvas.width / 2 - 1, i, 2, 20);
            }
        }

        // Raquete Jogador 1 (Rosa)
        ctx.fillStyle = "hotpink";
        ctx.fillRect(0, raqueteJogadorY, raqueteLargura, raqueteAltura);

        // Raquete Lado Direito / Parede
        if (modoJogo === "PAREDAO") {
            ctx.fillStyle = "#ffaa00";
            ctx.fillRect(canvas.width - 6, 0, 6, canvas.height);
        } else {
            ctx.fillStyle = modoJogo === "2P" ? "#00bfff" : "white";
            ctx.fillRect(canvas.width - raqueteLargura, raqueteComputadorY, raqueteLargura, raqueteAltura);
        }

        // Rastro da Bola
        for (let i = 0; i < historicoBola.length; i++) {
            let pos = historicoBola[i];
            let proporcao = (i + 1) / historicoBola.length;
            let opacidade = proporcao * 0.4; 
            let tamanhoRastro = raioBola * proporcao;

            ctx.save();
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, tamanhoRastro, 0, Math.PI * 2, true);
            ctx.fillStyle = `rgba(204, 255, 0, ${opacidade})`;
            ctx.fill();
            ctx.restore();
        }

        // Bola com Glow
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ccff00";
        ctx.fillStyle = "#ccff00";
        ctx.beginPath();
        ctx.arc(bolaX, bolaY, raioBola, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();

        // Placar
        ctx.font = "bold 40px Arial";
        if (modoJogo === "PAREDAO") {
            ctx.fillStyle = "#ffaa00";
            ctx.fillText("REBATIDAS: " + rebatidasParedao, 280, 60);
        } else {
            ctx.fillStyle = "hotpink";
            ctx.fillText(tabelaTenis[pontosJogador] || "40", 200, 60);

            ctx.fillStyle = modoJogo === "2P" ? "#00bfff" : "white";
            ctx.fillText(tabelaTenis[pontosComputador] || "40", 600, 60);
        }

        // Fim de Jogo
        if (estadoAtual === ESTADO_FIM) {
            ctx.textAlign = "center";
            ctx.font = "bold 36px Arial";
            ctx.fillStyle = "#ccff00";
            ctx.fillText(mensagemVitoria, canvas.width / 2, canvas.height / 2 - 20);
            
            ctx.font = "20px Arial";
            ctx.fillStyle = "white";
            ctx.fillText("Clique na tela para voltar ao Menu", canvas.width / 2, canvas.height / 2 + 30);
            ctx.textAlign = "left";
        }
    }
}

function loopDoJogo() {
    moverTudo();
    desenharTudo();
    requestAnimationFrame(loopDoJogo);
}

loopDoJogo();
