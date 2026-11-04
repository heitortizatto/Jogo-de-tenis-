const canvas = document.getElementById("jogoCanvas");
const ctx = canvas.getContext("2d");

// Estados do Jogo
const ESTADO_MENU = 0;
const ESTADO_JOGANDO = 1;
const ESTADO_FIM = 2;
let estadoAtual = ESTADO_MENU;
let modoJogo = "1P"; 

// Posição e velocidade da bolinha
let bolaX = canvas.width / 2;
let bolaY = canvas.height / 2;
let velocidadeInicial = 5;
let velocidadeBolaX = velocidadeInicial; 
let velocidadeBolaY = velocidadeInicial; 
const raioBola = 10;
const velocidadeMaxima = 15; 

// HISTÓRICO PARA O RASTRO BRILHANTE
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

// Tabela de pontuação de Tênis
const tabelaTenis = ["0", "15", "30", "40"];
let pontosJogador = 0;
let pontosComputador = 0;
let mensagemVitoria = "";

// CONTROLE 1: Mouse
canvas.addEventListener('mousemove', function(evento) {
    if (estadoAtual === ESTADO_JOGANDO) {
        let retangulo = canvas.getBoundingClientRect();
        let escalaY = canvas.height / retangulo.height;
        let mousePosY = (evento.clientY - retangulo.top) * escalaY;
        raqueteJogadorY = mousePosY - (raqueteAltura / 2); 
    }
});

// CONTROLE 2: Toque na tela (Celular)
canvas.addEventListener('touchmove', function(evento) {
    if (estadoAtual === ESTADO_JOGANDO) {
        evento.preventDefault();
        let retangulo = canvas.getBoundingClientRect();
        let escalaY = canvas.height / retangulo.height;
        let toquePosY = (evento.touches[0].clientY - retangulo.top) * escalaY;
        raqueteJogadorY = toquePosY - (raqueteAltura / 2);
    }
}, { passive: false });

// Menu e Reinício
canvas.addEventListener('click', function(evento) {
    let retangulo = canvas.getBoundingClientRect();
    let escalaX = canvas.width / retangulo.width;
    let escalaY = canvas.height / retangulo.height;
    let clickX = (evento.clientX - retangulo.left) * escalaX;
    let clickY = (evento.clientY - retangulo.top) * escalaY;

    if (estadoAtual === ESTADO_MENU) {
        if (clickX >= 250 && clickX <= 550 && clickY >= 230 && clickY <= 290) {
            modoJogo = "1P";
            iniciarPartida();
        }
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
    historicoBola = []; // Limpa o rastro ao resetar
    let direcaoX = velocidadeBolaX > 0 ? -1 : 1;
    velocidadeBolaX = direcaoX * velocidadeInicial;
    velocidadeBolaY = (Math.random() > 0.5 ? 1 : -1) * velocidadeInicial;
}

function moverTudo() {
    if (estadoAtual !== ESTADO_JOGANDO) return;

    // Salva a posição atual para gerar o rastro
    historicoBola.push({ x: bolaX, y: bolaY });

    // Quanto mais rápida a bola, mais longo fica o rastro (máximo de 12 posições)
    let velocidadeAtual = Math.abs(velocidadeBolaX);
    let tamanhoMaximoRastro = Math.min(12, Math.floor(velocidadeAtual * 1.5));
    
    while (historicoBola.length > tamanhoMaximoRastro) {
        historicoBola.shift(); // Remove os rastros mais antigos
    }

    // Aumento gradual da velocidade
    if (velocidadeAtual < velocidadeMaxima) {
        velocidadeBolaX *= 1.0008;
        velocidadeBolaY *= 1.0008;
    }

    bolaX += velocidadeBolaX;
    bolaY += velocidadeBolaY;

    // Controles por Teclado
    if (teclas["w"] || teclas["W"]) raqueteJogadorY -= 7;
    if (teclas["s"] || teclas["S"]) raqueteJogadorY += 7;

    if (modoJogo === "1P") {
        let centroComputador = raqueteComputadorY + (raqueteAltura / 2);
        if (centroComputador < bolaY - 35) raqueteComputadorY += 6;
        else if (centroComputador > bolaY + 35) raqueteComputadorY -= 6;
    } else {
        if (teclas["ArrowUp"]) raqueteComputadorY -= 7;
        if (teclas["ArrowDown"]) raqueteComputadorY += 7;
    }

    raqueteJogadorY = Math.max(0, Math.min(canvas.height - raqueteAltura, raqueteJogadorY));
    raqueteComputadorY = Math.max(0, Math.min(canvas.height - raqueteAltura, raqueteComputadorY));

    if (bolaY > canvas.height || bolaY < 0) {
        velocidadeBolaY = -velocidadeBolaY;
    }

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
    // Quadra Verde
    ctx.fillStyle = "#1b4d3e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (estadoAtual === ESTADO_MENU) {
        ctx.fillStyle = "#ccff00";
        ctx.font = "bold 46px Arial";
        ctx.textAlign = "center";
        ctx.fillText("JOGO DE TÊNIS", canvas.width / 2, 140);

        ctx.fillStyle = "hotpink";
        ctx.fillRect(250, 230, 300, 60);
        ctx.fillStyle = "white";
        ctx.font = "bold 22px Arial";
        ctx.fillText("1 JOGADOR (vs PC)", canvas.width / 2, 267);

        ctx.fillStyle = "#00bfff";
        ctx.fillRect(250, 320, 300, 60);
        ctx.fillStyle = "white";
        ctx.fillText("2 JOGADORES (LOCAL)", canvas.width / 2, 357);

        ctx.font = "16px Arial";
        ctx.fillStyle = "#ddd";
        ctx.fillText("J1 (Rosa): Mouse/Toque ou W/S  |  J2 (Azul): Setas ↑ / ↓", canvas.width / 2, 450);
        ctx.textAlign = "left";

    } else if (estadoAtual === ESTADO_JOGANDO || estadoAtual === ESTADO_FIM) {
        // Rede
        ctx.fillStyle = "white";
        for (let i = 0; i < canvas.height; i += 40) {
            ctx.fillRect(canvas.width / 2 - 1, i, 2, 20);
        }

        // Raquetes
        ctx.fillStyle = "hotpink";
        ctx.fillRect(0, raqueteJogadorY, raqueteLargura, raqueteAltura);

        ctx.fillStyle = modoJogo === "2P" ? "#00bfff" : "white";
        ctx.fillRect(canvas.width - raqueteLargura, raqueteComputadorY, raqueteLargura, raqueteAltura);

        // --- DESENHO DO RASTRO DA BOLA ---
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

        // --- DESENHO DA BOLA PRINCIPAL COM BRILHO (GLOW) ---
        ctx.save();
        ctx.shadowBlur = 15; // Intensidade do brilho neon
        ctx.shadowColor = "#ccff00"; // Cor do brilho
        ctx.fillStyle = "#ccff00";
        ctx.beginPath();
        ctx.arc(bolaX, bolaY, raioBola, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();

        // Placar
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "hotpink";
        ctx.fillText(tabelaTenis[pontosJogador] || "40", 200, 60);

        ctx.fillStyle = modoJogo === "2P" ? "#00bfff" : "white";
        ctx.fillText(tabelaTenis[pontosComputador] || "40", 600, 60);

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
