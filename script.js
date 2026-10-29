const canvas = document.getElementById("jogoCanvas");
const ctx = canvas.getContext("2d");

// Posição e velocidade da bolinha
let bolaX = canvas.width / 2;
let bolaY = canvas.height / 2;
let velocidadeBolaX = 5; // Velocidade horizontal
let velocidadeBolaY = 5; // Velocidade vertical
const raioBola = 10;

// Configurações das Raquetes
const raqueteLargura = 10;
const raqueteAltura = 100;
let raqueteJogadorY = 250;     // Posição inicial da sua raquete
let raqueteComputadorY = 250;  // Posição inicial do computador

// Placar
let pontuacaoJogador = 0;
let pontuacaoComputador = 0;

// Faz a raquete do jogador seguir o movimento do mouse
canvas.addEventListener('mousemove', function(evento) {
    let retangulo = canvas.getBoundingClientRect();
    let mousePosY = evento.clientY - retangulo.top;
    // Centraliza a raquete no mouse
    raqueteJogadorY = mousePosY - (raqueteAltura / 2); 
});

// Calcula a física, os pontos e o movimento
function moverTudo() {
    bolaX += velocidadeBolaX;
    bolaY += velocidadeBolaY;

    // Inteligência Artificial simples para a raquete do Computador seguir a bola
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

    // Verifica se a bola bateu na esquerda (Sua raquete ou Ponto do PC)
    if (bolaX < 0) {
        if (bolaY > raqueteJogadorY && bolaY < raqueteJogadorY + raqueteAltura) {
            velocidadeBolaX = -velocidadeBolaX; // Rebateu!
        } else {
            pontuacaoComputador++; // PC fez ponto
            resetarBola();
        }
    }

    // Verifica se a bola bateu na direita (Raquete do PC ou Seu Ponto)
    if (bolaX > canvas.width) {
        if (bolaY > raqueteComputadorY && bolaY < raqueteComputadorY + raqueteAltura) {
            velocidadeBolaX = -velocidadeBolaX; // PC rebateu!
        } else {
            pontuacaoJogador++; // Você fez ponto!
            resetarBola();
        }
    }
}

// Devolve a bola para o centro após um ponto
function resetarBola() {
    bolaX = canvas.width / 2;
    bolaY = canvas.height / 2;
    velocidadeBolaX = -velocidadeBolaX; // Joga a bola para o outro lado
}

// Desenha tudo na tela a cada quadro
function desenharTudo() {
    // 1. Quadra
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Rede
    ctx.fillStyle = "white";
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 1, i, 2, 20);
    }

    // 3. Raquete do Jogador (Esquerda)
    ctx.fillRect(0, raqueteJogadorY, raqueteLargura, raqueteAltura);

    // 4. Raquete do Computador (Direita)
    ctx.fillRect(canvas.width - raqueteLargura, raqueteComputadorY, raqueteLargura, raqueteAltura);

    // 5. Bolinha
    ctx.beginPath();
    ctx.arc(bolaX, bolaY, raioBola, 0, Math.PI * 2, true);
    ctx.fill();

    // 6. Placar
    ctx.font = "40px Arial";
    ctx.fillText(pontuacaoJogador, 200, 60);
    ctx.fillText(pontuacaoComputador, 600, 60);
}

// Cria o "motor" do jogo: movimenta e desenha 60 vezes por segundo
function loopDoJogo() {
    moverTudo();
    desenharTudo();
    requestAnimationFrame(loopDoJogo);
}

// Inicia o jogo
loopDoJogo();
