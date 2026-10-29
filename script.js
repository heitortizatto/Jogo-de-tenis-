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

// Placar
let pontuacaoJogador = 0;
let pontuacaoComputador = 0;

// CONTROLE 1: Mouse (para o computador)
canvas.addEventListener('mousemove', function(evento) {
    let retangulo = canvas.getBoundingClientRect();
    let mousePosY = evento.clientY - retangulo.top;
    raqueteJogadorY = mousePosY - (raqueteAltura / 2); 
});

// CONTROLE 2: Toque na tela (para o celular)
canvas.addEventListener('touchmove', function(evento) {
    evento.preventDefault(); // Impede a tela de rolar enquanto joga
    let retangulo = canvas.getBoundingClientRect();
    let toquePosY = evento.touches[0].clientY - retangulo.top;
    raqueteJogadorY = toquePosY - (raqueteAltura / 2);
}, { passive: false });

// Calcula a física, os pontos e o movimento
function moverTudo() {
    bolaX += velocidadeBolaX;
    bolaY += velocidadeBolaY;

    // Inteligência Artificial do Computador
    let centroRaqueteComputador = raqueteComputadorY + (raqueteAltura / 2);
    if (centroRaqueteComputador < bolaY - 35) {
        raqueteComputadorY += 6;
    } else if (centroRaqueteComputador > bolaY + 35) {
        raqueteComputadorY -= 6;
    }

    // Faz a bola quicar no teto e no chão
    if (bolaY > canvas.height || bolaY < 0) {
        velocidadeBolaY = -velocidadeBolaY;
    }

    // Verifica se a bola bateu na esquerda
    if (bolaX < 0) {
        if (bolaY > raqueteJogadorY && bolaY < raqueteJogadorY + raqueteAltura) {
            velocidadeBolaX = -velocidadeBolaX; 
        } else {
            pontuacaoComputador++; 
            resetarBola();
        }
    }

    // Verifica se a bola bateu na direita
    if (bolaX > canvas.width) {
        if (bolaY > raqueteComputadorY && bolaY < raqueteComputadorY + raqueteAltura) {
            velocidadeBolaX = -velocidadeBolaX; 
        } else {
            pontuacaoJogador++; 
            resetarBola();
        }
    }
}

// Devolve a bola para o centro após um ponto
function resetarBola() {
    bolaX = canvas.width / 2;
    bolaY = canvas.height / 2;
    velocidadeBolaX = -velocidadeBolaX; 
}

// Desenha tudo na tela a cada quadro
function desenharTudo() {
    // Quadra
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rede
    ctx.fillStyle = "white";
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 1, i, 2, 20);
    }

    // Raquetes
    ctx.fillRect(0, raqueteJogadorY, raqueteLargura, raqueteAltura);
    ctx.fillRect(canvas.width - raqueteLargura, raqueteComputadorY, raqueteLargura, raqueteAltura);

    // Bolinha
    ctx.beginPath();
    ctx.arc(bolaX, bolaY, raioBola, 0, Math.PI * 2, true);
    ctx.fill();

    // Placar
    ctx.font = "40px Arial";
    ctx.fillText(pontuacaoJogador, 200, 60);
    ctx.fillText(pontuacaoComputador, 600, 60);
}

// Cria o "motor" do jogo
function loopDoJogo() {
    moverTudo();
    desenharTudo();
    requestAnimationFrame(loopDoJogo);
}

// Inicia o jogo
loopDoJogo();
