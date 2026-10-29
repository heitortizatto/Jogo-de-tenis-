// Captura o elemento canvas do HTML
const canvas = document.getElementById("jogoCanvas");
// Define que vamos desenhar em 2D
const ctx = canvas.getContext("2d");

// Variáveis para a posição inicial da bolinha (bem no meio da tela)
let bolaX = canvas.width / 2;
let bolaY = canvas.height / 2;
let raioBola = 10;

function desenharTudo() {
    // 1. Desenha a quadra (um grande retângulo preto preenchendo o canvas)
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Desenha a rede no meio da quadra
    ctx.fillStyle = "white";
    for (let i = 0; i < canvas.height; i += 40) {
        // x, y, largura, altura
        ctx.fillRect(canvas.width / 2 - 1, i, 2, 20); 
    }

    // 3. Desenha a bolinha
    ctx.fillStyle = "white";
    ctx.beginPath();
    // arc(x, y, raio, angulo_inicial, angulo_final) -> cria um círculo
    ctx.arc(bolaX, bolaY, raioBola, 0, Math.PI * 2, true); 
    ctx.fill();
}

// Executa a função para pintar a tela pela primeira vez
desenharTudo();

