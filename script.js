const canvas = document.getElementById("jogoCanvas");
const ctx = canvas.getContext("2d");

// Estados do Jogo
const ESTADO_MENU = 0;
const ESTADO_JOGANDO = 1;
const ESTADO_FIM = 2;
let estadoAtual = ESTADO_MENU;
let modoJogo = "1P"; // "1P" (vs PC) ou "2P" (2 Jogadores)

// Posição e velocidade da bolinha
let bolaX = canvas.width / 2;
let bolaY = canvas.height / 2;
let velocidadeInicial = 5;
let velocidadeBolaX = velocidadeInicial; 
let velocidadeBolaY = velocidadeInicial; 
const raioBola = 10;
const velocidadeMaxima = 14; // Limite de velocidade para manter o jogo jogável

// Configurações das Raquetes
const raqueteLargura = 10;
const raqueteAltura = 100;
let raqueteJogadorY = 250;     
let raqueteComputadorY = 250;  

// Controle de Teclado (Para o Jogador 2 e alternativa ao Jogador 1)
const teclas = {};
window.addEventListener("keydown", function(e) { teclas[e.key] = true; });
window.addEventListener("keyup", function(e) { teclas[e.key] = false; });

// Tabela de pontuação de Tênis
const tabelaTenis = ["0", "15", "30", "40"];
let pontosJogador = 0;
let pontosComputador = 0;
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

// Cliques para navegar no Menu e Reiniciar
canvas.addEventListener('click', function(evento) {
    let retangulo = canvas.getBoundingClientRect();
    let escalaX = canvas.width / retangulo.width;
    let escalaY = canvas.height / retangulo.height;
    let clickX = (evento.clientX - retangulo.left) * escalaX;
    let clickY = (evento.clientY - retangulo.top) * escalaY;

    if (estadoAtual === ESTADO_MENU) {
        // Botão 1 Jogador
        if (clickX >= 250 && clickX <= 550 && clickY >= 230 && clickY <= 290) {
            modoJogo = "1P";
            iniciarPartida();
        }
        // Botão 2 Jogadores
        if (clickX >= 250 && clickX <= 550 && clickY >= 320 && clickY <= 380) {
            modoJogo = "2P";
            iniciarPartida();
        }
    } else if (estadoAtual === ESTADO_FIM) {
        estadoAtual = ESTADO_MENU;
    }
});

function iniciarPartida() {
    pontosJogador = 0;
    pontosComputador = 0;
    mensagemVitoria = "";
    estadoAtual = ESTADO_JOGANDO;
    resetarBola();
}

function resetarBola() {
    bolaX = canvas.width / 2;
    bolaY = canvas.height / 2;
    // Reseta a velocidade para a base inicial ao começar um novo ponto
    let direcaoX = velocidadeBolaX > 0 ? -1 : 1;
    velocidadeBolaX = direcaoX * velocidadeInicial;
    velocidadeBolaY = (Math.random() > 0.5 ? 1 : -1) * velocidadeInicial;
}

function moverTudo() {
    if (estadoAtual !== ESTADO_JOGANDO) return;

    // Aumento gradual da velocidade da bola com o passar do tempo do ponto
    if (Math.abs(velocidadeBolaX) < velocidadeMaxima) {
        velocidadeBolaX *= 1.0008;
        velocidadeBolaY *= 1.0008;
    }

    bolaX += velocidadeBolaX;
    bolaY += velocidadeBolaY;

    // Controles por Teclado:
    // Jogador 1 (W / S)
    if (teclas["w"] || teclas["W"]) raqueteJogadorY -= 7;
    if (teclas["s"] || teclas["S"]) raqueteJogadorY += 7;

    // Movimentação do Lado Direito (Computador ou Jogador 2)
    if (modoJogo === "1P") {
        // Inteligência Artificial
        let centroComputador = raqueteComputadorY + (raqueteAltura / 2);
        if (centroComputador < bolaY - 35) raqueteComputadorY += 6;
        else if (centroComputador > bolaY + 35) raqueteComputadorY -= 6;
    } else {
        // Jogador 2 via Setas do Teclado (↑ / ↓)
        if (teclas["ArrowUp"]) raqueteComputadorY -= 7;
        if (teclas["ArrowDown"]) raqueteComputadorY += 7;
    }

    // Limites das raquetes dentro da tela
    raqueteJogadorY = Math.max(0, Math.min(canvas.height - raqueteAltura, raqueteJogadorY));
    raqueteComputadorY = Math.max(0, Math.min(canvas.height - raqueteAltura, raqueteComputadorY));

    // Quicar no teto e no chão
    if (bolaY > canvas.height || bolaY < 0) {
        velocidadeBolaY = -velocidadeBolaY;
    }

    // Bola bateu na esquerda (Jogador 1)
    if (bolaX < 0) {
        if (bolaY > raqueteJogadorY && bolaY < raqueteJogadorY + raqueteAltura) {
            velocidadeBolaX = -velocidadeBolaX;
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

    // Bola bateu na direita (Jogador 2 / Computador)
    if (bolaX > canvas.width) {
        if (bolaY > raqueteComputadorY && bolaY < raqueteComputadorY + raqueteAltura) {
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
    // Fundo verde da quadra
    ctx.fillStyle = "#1b4d3e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (estadoAtual === ESTADO_MENU) {
        // --- TELA INICIAL ---
        ctx.fillStyle = "#ccff00";
        ctx.font = "bold 46px Arial";
        ctx.textAlign = "center";
        ctx.fillText("JOGO DE TÊNIS", canvas.width / 2, 140);

        // Botão 1 Jogador
        ctx.fillStyle = "hotpink";
        ctx.fillRect(250, 230, 300, 60);
        ctx.fillStyle = "white";
        ctx.font = "bold 22px Arial";
        ctx.fillText("1 JOGADOR (vs PC)", canvas.width / 2, 267);

        // Botão 2 Jogadores
        ctx.fillStyle = "#00bfff";
        ctx.fillRect(250, 320, 300, 60);
        ctx.fillStyle = "white";
        ctx.fillText("2 JOGADORES (LOCAL)", canvas.width / 2, 357);

        // Instruções de controle
        ctx.font = "16px Arial";
        ctx.fillStyle = "#ddd";
        ctx.fillText("J1 (Rosa): Mouse/Toque ou W/S  |  J2 (Azul): Setas ↑ / ↓", canvas.width / 2, 450);
        ctx.textAlign = "left"; // Reseta o alinhamento de texto

    } else if (estadoAtual === ESTADO_JOGANDO || estadoAtual === ESTADO_FIM) {
        // --- TELA DE JOGO ---
        // Rede
        ctx.fillStyle = "white";
        for (let i = 0; i < canvas.height; i += 40) {
            ctx.fillRect(canvas.width / 2 - 1, i, 2, 20);
        }

        // Raquete Jogador 1 (Rosa)
