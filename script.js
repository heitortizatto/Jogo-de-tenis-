const canvas = document.getElementById("jogoCanvas");
const ctx = canvas.getContext("2d");

// Posição e velocidade da bolinha
let bolaX = canvas.width / 2;
let bolaY = canvas.height / 2;
let velocidadeBolaX = 5; 
let velocidadeBolaY = 5; 
const raioBola = 10;

// Configurações das Raquetes
const raqueteLargura = 10;
const raqueteAltura = 100;
let raqueteJogadorY = 250;     
let raqueteComputadorY = 250;  

// Tabela de pontuação no formato real de Tênis
const tabelaTenis = ["0", "15", "30", "40"];
let pontosJogador = 0;
let pontosComputador = 0;
let mensagemVitoria = "";

// CONTROLE 1: Mouse (Computador)
canvas.addEventListener('mousemove', function(evento) {
    let retangulo = canvas.getBoundingClientRect();
    let escalaY = canvas.height / retangulo.height;
    let mousePosY = (evento.clientY - retangulo.top) * escalaY;
    raqueteJogadorY = mousePosY - (raqueteAltura / 2); 
});

// CONTROLE 2: Toque na tela (Celular)
canvas.addEventListener('touchmove', function(evento) {
    evento.preventDefault();
    let retangulo = canvas.getBoundingClientRect();
    let escalaY = canvas.height / retangulo.height;
    let toquePosY = (evento.touches[0].clientY - retangulo.top) * escalaY;
    raqueteJogadorY = toquePosY - (raqueteAltura / 2);
}, { passive: false });

// Reinicia o jogo ao clicar na tela após o fim de uma partida
canvas.addEventListener('click', function() {
    if (mensagemVitoria !== "") {
        pontosJogador = 0;
        pontosComputador = 0;
        mensagemVitoria = "";
        resetarBola();
    }
});

function moverTudo() {
    // Para o movimento da bola se a partida tiver acabado
    if (mensagemVitoria !== "") return;

    bolaX += velocidadeBolaX;
    bolaY += velocidadeBolaY;

    // Inteligência Artificial do Computador
    let centroRaqueteComputador = raqueteComputadorY + (raqueteAltura / 2);
    if (centroRaqueteComputador < bolaY - 35) {
        raqueteComputadorY += 6;
    } else if (centroRaqueteComputador > bolaY + 35) {
        raqueteComputadorY -= 6;
    }

    // Quicar no teto e no chão
    if (bolaY > canvas.height || bolaY < 0) {
        velocidadeBolaY = -velocidadeBolaY;
    }

    // Bola bateu na esquerda (Jogador)
    if (bolaX < 0) {
        if (bolaY > raqueteJogadorY && bolaY < raqueteJogadorY + raqueteAltura) {
            velocidadeBolaX = -velocidadeBolaX;
        } else {
            pontosComputador++;
            if (pontosComputador >= 4) {
                mensagemVitoria = "COMPUTADOR VENCEU O GAME!";
            } else {
                resetarBola();
            }
        }
    }

    // Bola bateu na direita (Computador)
    if (bolaX > canvas.width) {
        if (bolaY > raqueteComputadorY && bolaY < raqueteComputadorY + raqueteAltura) {
            velocidadeBolaX = -velocidadeBolaX;
        } else {
            pontosJogador++;
            if (pontosJogador >= 4) {
                mensagemVitoria = "VOCÊ VENCEU O GAME!";
            } else {
                resetarBola();
            }
        }
    }
}

function resetarBola() {
    bolaX = canvas.width / 2;
    bolaY = canvas.height / 2;
    velocidadeBolaX = -velocidadeBolaX;
}

function desenharTudo() {
    // 1. Quadra
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Rede
    ctx.fillStyle = "white";
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 1, i, 2, 20);
    }

    // 3. Raquete do Jogador (Rosa)
    ctx.fillStyle = "hotpink";
    ctx.fillRect(0, raqueteJogadorY, raqueteLargura, raqueteAltura);

    // 4. Raquete do Computador (Branca)
    ctx.fillStyle = "white";
    ctx.fillRect(canvas.width - raqueteLargura, raqueteComputadorY, raqueteLargura, raqueteAltura);

    // 5. Bolinha
    ctx.beginPath();
    ctx.arc(bolaX, bolaY, raioBola, 0, Math.PI * 2, true);
    ctx.fill();

    // 6. Placar em formato de Tênis (0, 15, 30, 40)
    ctx.font = "40px Arial";
    ctx.fillStyle = "hotpink"; // Placar do jogador em rosa
    ctx.fillText(tabelaTenis[pontosJogador] || "40", 200, 60);

    ctx.fillStyle = "white";   // Placar do computador em branco
    ctx.fillText(tabelaTenis[pontosComputador] || "40", 600, 60);

    // Exibe a mensagem quando alguém vence o Game
    if (mensagemVitoria !== "") {
        ctx.font = "32px Arial";
        ctx.fillStyle = "yellow";
        ctx.fillText(mensagemVitoria, canvas.width / 2 - 210, canvas.height / 2);
        ctx.font = "18px Arial";
        ctx.fillText("Clique ou toque na tela para jogar novamente", canvas.width / 2 - 170, canvas.height / 2 + 40);
    }
}

function loopDoJogo() {
    moverTudo();
    desenharTudo();
    requestAnimationFrame(loopDoJogo);
}

loopDoJogo();
