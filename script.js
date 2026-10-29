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

// CONTROLE 1: Mouse
canvas.addEventListener('mousemove', function(evento) {
    let retangulo = canvas.getBoundingClientRect();
    let escalaY = canvas.height / retangulo.height; // Calcula a proporção da tela
    let mousePosY = (evento.clientY - retangulo.top) * escalaY;
    raqueteJogadorY = mousePosY - (raqueteAltura / 2); 
});

// CONTROLE 2: Toque na tela (Celular)
canvas.addEventListener('touchmove', function(evento) {
    evento.preventDefault(); // Impede a tela do celular de rolar
    let retangulo = canvas.getBoundingClientRect();
    let escalaY = canvas.height / retangulo.height; // Calcula a proporção da tela
    let toquePosY = (evento.touches[0].clientY - retangulo.top) * escalaY;
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
    velocidadeBolaX = -velocidadeBolaX; // Inverte o lado que a bola sai
}

// Desenha tudo na tela a cada quadro
function desenharTudo() {
    // 1. Apaga a tela desenhando a quadra preta
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Rede
    ctx.fillStyle = "white";
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 1, i, 2, 20);
    }

    // 3. Raquetes
    ctx.fillRect(0, raqueteJogadorY, raqueteLargura, raqueteAltura);
    ctx.fillRect(canvas.width - raqueteLargura, raqueteComputadorY, raqueteLargura, raqueteAltura);

    // 4. Bolinha
    ctx.beginPath();
    ctx.arc(bolaX, bolaY, raioBola, 0, Math.PI * 2, true);
    ctx.fill();

    // 5. Placar
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
