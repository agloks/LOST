//------------------------------------------- VARIAVEIS -----------------------------------------------------------------------

//construir o objeto canvas
var canvasObj = document.createElement("canvas")
var draw = canvasObj.getContext("2d")
document.body.appendChild(canvasObj)
canvasObj.style.position = "relative"
//setando tamnho do canvas numa variavel e atribuindo
var width = canvasObj.width = window.innerWidth
var height = canvasObj.height = window.innerHeight
var halfWidth = width/2
var halfHeight = height/2
var fov = 350//field of vision = campo de visao, (ele trabalha com o z para da perspectiva)
var offSetX = 0
var offSetY = 0
//condições do jogo
var endGame = false
var start = false
//sons do jogo
var gunSound = new Audio("./Songs/gunshot.wav")
gunSound.volume = 0.35
var backgroundSound = new Audio("./Songs/landscape.mp3")
backgroundSound.volume = 0.84
var ghostPage = new Audio("./Songs/ghostBegin.wav")
ghostPage.volume = 1

//cor do olho variavel rosto
var color = "black"

//tiro
const RAIO_TIRO = 22

class Monster {
    constructor () {
        this.reset = false
        this.clickado = true
        this.alvo = null
        this.saveX = null
        this.saveY = null
        this.moveX = null
        this.moveY = null
        this.size = -20
        this.levelSpeed = 1
        this.levelSize = 1
        this.call = 0
        this.callSpeed = 0
    }

    setLevelSize(option,level) {
        if(option === "size" && this.call === 0) {
            this.levelSize += level
        }
        this.call += 1;
    }

    setLevelSpeed(option,level) {
        if(option === "speed" && this.callSpeed === 0) {
            this.levelSpeed += level
        }
        this.callSpeed += 1;
    }


    kill() {
        //os numero fixo dentro da condição é para alinha o alvo no meio do monstro
        if(( Math.abs(mouse.posX - this.saveX+9-this.moveX) <= RAIO_TIRO ) 
        && ( Math.abs(mouse.posY - this.saveY+18-this.moveY) <= RAIO_TIRO )) {
            this.clickado = true // este é responsavel por matar o monstro
            this.moveX = 0
            this.moveY = 0 
        }
    }
    
    
    invcocation (click,reset,color) {

        let randomMapaPositionX = Math.floor( Math.random() * (width - halfWidth*0.20) )//deixa numa margem de distancia das extremidade
        let randomMapaPositionY = -Math.floor( Math.random() * ((halfHeight-300) - halfHeight*0.20))//menos da metade do mapa, overflow para cima com -

        if (click||reset) {
            this.size = -20
            /*requestAnimationFrame se atualiza em microsegundos entao se é usado um meio de salvação para desenha na posilçao correta
            enquanto não foi eliminado o this*/
            this.saveX = randomMapaPositionX
            this.saveY = randomMapaPositionY

            rosto(this.saveX,this.saveY,this.size,color)
            this.reset = false
            this.clickado = false
            this.moveX = 0
            this.moveY = 0
        }
        else {
            let randomLayerX = display.layerX[ Math.floor( Math.random()*display.layerX.length ) ]
            let randomLayerY = display.layerY[ Math.floor( Math.random()*display.layerY.length ) ]
            if (this.size < 60) {
                this.size += this.levelSize*0.03
            }
            else if(this.size < 180) {
                this.size += this.levelSize*0.05
            }
            else {
                this.size += this.levelSize*0.07
            }
            if (this.moveX+this.saveX > randomLayerX) {this.moveX -= this.levelSpeed }
            else if (this.moveX+this.saveX < randomLayerX) {this.moveX += this.levelSpeed }
            if (this.moveY > randomLayerY) {this.moveY -= this.levelSpeed  }
            else if (this.moveY < randomLayerY) {this.moveY += this.levelSpeed }

            rosto( this.saveX + this.moveX , this.saveY + this.moveY , this.size , color)
        }
    }
}

//posição do mouse eixo X e Y
class Mouse {
    constructor() {
        this.mouseX = 0
        this.mouseY = 0
        this.offSetX = 0
        this.offSetY = 0
        this.posX = 0
        this.posY = 0
        this.viewY = 0
    }
}

class Display {
    constructor() {
        this.layerX = 
        [
            width-width*0.03,
            width+width*0.03,
            -width-width*0.16,
            -width-width*0.40,
            width-width*0.80,
            halfWidth,
            width-width*0.50,
            -width-width*0.25,
            width-width*0.07,
            width+width*0.07
        ]
        this.layerY = 
        [
            halfHeight-halfHeight*0.08,
            halfHeight-halfHeight*0.10,
            halfHeight-halfHeight*0.04,
            halfHeight-halfHeight*0.20,
            halfHeight-halfHeight*0.14,
            -halfHeight-halfHeight*0.04
        ]
    }
}

//guarda os pixels
class Pixel {    
    constructor() {
        this.floorPixel = [];
    }
    //metodo adiciona os pixel
    setFloorPixel(x,y,z) {
        this.floorPixel.push([x,y,z])
    }
    //metodo retorna a lista pixel
    getFloorPixel(index) {
        return this.floorPixel[index]
    }
}


//instanciando as classes
var mouse = new Mouse()
var display = new Display()
var newPixel = new Pixel()
//monsters
var monster = new Monster()
var monster_two = new Monster()
var monster_three = new Monster()
var monster_four = new Monster()
var monster_five = new Monster()
var monster_six = new Monster()
var monster_seven = new Monster()
var monster_eight = new Monster()
var monster_nine = new Monster()
var monster_ten = new Monster()

var allMonster = 
[
    monster,
    monster_two,
    monster_three,
    monster_four,
    monster_five,
    monster_six,
    monster_seven,
    monster_eight,
    monster_nine,
    monster_ten,
]

//------------------------------------------------- MAPA -----------------------------------------------------------------------


/*
1)tamanho da animaçao
2)a inicialização começo dos pontos, a condição é o final dos pontos
3)o incremento é responsavel pela distancia de espaçamento entre os pontos
4)z incremento aumenta velocidade
5)z de menor para maior faz de longe vim para perto, z de maior para menor faz de perto vim para longe
6)14 + (altura visao)
*/
for(let x = -width; x<width; x += 3) {
    for(let z = -650; z < 850; z += 12){
        let zOscillation = Math.cos( z * (Math.PI*4/320)) //mexe em ondas Y
        let xOscillation = Math.cos( (x+z) * (Math.PI*2/450)) //mexe em ondas X
        newPixel.setFloorPixel(x,( zOscillation + xOscillation * 14+55 ),z)
    }
}


//responsavel por da cor aos nossos pixels
function setColorPixel(imagedata, x, y, r, g, b) {

    //condição para ver se o pixel se encontra no canvas
    if ((x < 0) || (x > width) || (y < 0) || (y > width)) {return}

    let i = ((y >> 0) * imagedata.width + (x >> 0)) * 4 //operando em bitwise

    imagedata.data[i] = r
    imagedata.data[i + 1] = g
    imagedata.data[i + 2] = b
    imagedata.data[i + 3] = 255
}


function floor() {

    //aqui é responsavel pela criação de pixel, que mais tarde empurraremos para dentro do canva
    let imageDataPixels = draw.getImageData(0,0,width,height)

    //new
    offSetX += (mouse.mouseX - offSetX)*0.2; 
    offSetY += (mouse.mouseY - offSetY)*0.2; 

    let sizeArrayPixel = newPixel.floorPixel.length
    while(sizeArrayPixel--) {
        //pega o primeiro array da array bi-dimensional, este é nossos pixel coordenadas
        let catchPixel = newPixel.getFloorPixel(sizeArrayPixel)

        //aqui é a magica, a scale é a qual vai ser responsavel em fazer que o 2d tenha perspectiva
        var scale = fov / (fov + catchPixel[2])//[2] == z
        
        //capturo os pontos do pixel gerado pelo for, e aqui que acontece a renderização das coordenadas fornecidas
        var p2x = ( (catchPixel[0] + offSetX) * scale) + halfWidth//[0] == x
        var p2y = ( (catchPixel[1] + offSetY) * scale) + halfHeight + 60 //[1] == y

        setColorPixel(imageDataPixels,p2x, p2y - (mouse.viewY) ,255,0,0)

        //aqui é responsavel pelo movimento, pois vai sempre ta fazendo o acrescimo do ponto z
        catchPixel[2] -= 1

        //aqui ocorre o afastamento do fundo constamente, para que nunca se aproxime
        if (catchPixel[2] < -fov) catchPixel[2] += (fov * 2);
    }

    //aqui colocamos o pixel dentro do canvas
    draw.putImageData(imageDataPixels,0,0)
}


//------------------------------------------------- EVENTOS -------------------------------------------------------------------

//som do tiro
function soundFire() {
    gunSound.play()
}

//recoil do tiro
function recoils() {
    canvasObj.style.top = `${Math.floor(20-Math.random()*40)}px`
    canvasObj.style.left = `${Math.floor(10-Math.random()*20)}px`
}

//função para obter posição do click
canvasObj.onclick = (e) => {

    //start game
    start = true
    //condição start o recoil somente quando inicia o jogo
    if(endGame !== true && start === true) { recoils() }

    soundFire()
    mouse.posX = e.layerX
    mouse.posY = e.layerY

    //faz a verificação na array
    workMonsters("kill")

    //condição reseta o game no fim de jogo
    if(endGame === true) {
        setInterval(() => {
            if (mouse.posX < width && mouse.posY < height) {window.location.reload()}
        },10000)
    }
}

//função para atualizar constante movimentação mouse
function onMouseMove(e) {
    mouse.mouseX = (halfWidth - e.clientX) * 0.1;//if hW = 2000, e.ClientX = 50 => 1950 * 0.1 => mouseX will be 195
    mouse.mouseY = (halfHeight - e.clientY) * 0.1;//if hW = 1000, e.ClientX = 50 => 950 * 0.1 => mouseX will be 95
}

//globais para seconds
var minutesActual = 0
var secondsTotal = 0
var secondsOld = 0
var secondsCount = 0
function seconds (secondsCount) {
    secondsCount = new Date().getSeconds()  
    if (secondsOld !== secondsCount) {
        secondsOld = secondsCount 
        secondsTotal += 1
        }
    if (secondsTotal === 60) {
      minutesActual += 1
      secondsTotal = 0
    }
    return `${minutesActual} : ${(secondsTotal < 10) ? '0'+secondsTotal.toString() : secondsTotal}` // seconds
}


document.addEventListener("mousemove",onMouseMove)


//-------------------------------------------- DESENHOS -----------------------------------------------------------

function rosto (x,y,s,color = "black") {

    let gradient = draw.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop("0", "magenta")
    gradient.addColorStop("0.2", "white")
    gradient.addColorStop("0.6","yellow")
    gradient.addColorStop("0.5","purple")
    gradient.addColorStop("0.3", "green")
    gradient.addColorStop("0.7","red")
    gradient.addColorStop("0.8", "orange")
    gradient.addColorStop("1.0", "red")

    if( s < 50 ) { monster.alvo = y-10+s/4 }
    else if( s < 100 ) { monster.alvo = y-15+s/7 }
    else if( s < 150 ) { monster.alvo = y-17+s/10 }
    else if( s < 220 ) { monster.alvo = y-19+s/12 }
    else { monster.alvo = y-25+s/13 }

    draw.beginPath()//circulo
    draw.strokeStyle = gradient
    draw.fillStyle = "black"
    draw.arc(x,y,35+s,0,Math.PI*2)
    draw.lineWidth = 2
    draw.fill()
    draw.stroke()
    draw.closePath()

    draw.beginPath()//linha Y
    draw.arc(x-28-s*0.65,y,37+s+s/6,5*Math.PI/3,Math.PI/3)
    draw.lineWidth = 1
    draw.fill()
    draw.stroke()
    draw.closePath()

    draw.beginPath()//linha X_baixo
    draw.arc(x,y-20-s/3,39+s+s/8,5*Math.PI/6,Math.PI/6,true)
    draw.lineWidth = 1
    // draw.fill()
    draw.stroke()
    draw.closePath()

    draw.beginPath()//linha X_cima
    draw.arc(x,y+49+s+s/3,65+s*1.9,4*Math.PI/3,5*Math.PI/3)
    draw.lineWidth = 1
    // draw.stroke()
    draw.closePath()

    draw.beginPath()//alvo
    draw.arc(x+5,monster.alvo,7,0,Math.PI*2)
    draw.fill()
    draw.stroke()
    draw.closePath()

    draw.beginPath()//olho direito
    draw.arc(x+17+s/3,y-8-s/3,14+s/4,0,Math.PI*2)
    draw.lineWidth = 4
    draw.fillStyle = color
    draw.fill()
    draw.stroke()
    draw.closePath()

    draw.beginPath()//olho esquerdo
    draw.arc(x-12-s/3,y-7-s/3,14+s/4,0,Math.PI*2)
    draw.fill()
    draw.stroke()
    draw.closePath()

    draw.beginPath()//boca
    draw.arc(x+5,y+17+s/3,21+s/6,0,Math.PI*2)
    draw.fill()
    draw.stroke()
    draw.closePath()
}

function lifeDraw(life) {
    draw.font = "30px Comic Sans MS";
    draw.fillStyle = "white";
    draw.textAlign = "center";
    draw.fillText(`${seconds(secondsTotal)}`, 100, halfHeight+halfHeight*0.075);
    draw.fillText(`Life : ${life}%`, 100, halfHeight+halfHeight*0.20); 
}

function end(opacity) {
    draw.rect(-10,0,width,halfHeight)
    draw.fillStyle = `rgba(0,0,0,${opacity})`
    draw.fillRect(-10,0,width,halfHeight)
    draw.fillStyle = "red"
    draw.font = `${opacity*110}px Comic Sans MS`;
    draw.fillText("GAME OVER",halfWidth-halfWidth*0.08,halfHeight-halfHeight*0.30)

    draw.font = "22px Georgia";
    draw.fillStyle = "white";
    draw.fillText("C L I C K      A N YW H E R E      T O       R E S T A R T", halfWidth-halfWidth*0.08 , halfHeight+halfHeight*0.02);
}

function begin(opacity) {
    draw.rect(-10,0,width,halfHeight)
    draw.fillStyle = `rgba(0,0,0,${opacity})`
    draw.fillRect(0,0,width,height)
    draw.fillStyle = "white"
    draw.font = `${opacity*110}px Georgia`;
    draw.fillStyle = "white";
    draw.fillText("L     O      S      T",halfWidth - halfWidth * 0.50, halfHeight - halfHeight * 0.10);
}


// ------------------------------------------------ RENDENRIZAÇÃO ------------------------------------------------------


var clear = (option) => {
    if (option === "floor") { draw.clearRect(0,273,width,height) } 
    else if(option === "rastro") { draw.clearRect(-10,0,width,273) }
    else if(option === "life") {draw.clearRect(0,halfHeight,192,74)}
    else { draw.clearRect(0,0,width,height) }
}

//var para o render
var fpsByTime = 0
var initBug = 0
var time = 0
var idRender = null
var life = 100
var opacity = 0.0
var opacityStart = 1
var choice = 0

function workMonsters(option = null, quanty = 0 ,level = 0, change = "size") {
    if(option === "kill"){
        for(let k = 0; k < allMonster.length; k++) {
            allMonster[k].kill()
        }
    }
    if(option === "invocation") {
        allMonster[quanty].setLevelSize(change,level) 
        allMonster[quanty].invcocation(allMonster[quanty].clickado,false,color) 
    }
    if(change === "speed") {
        allMonster[quanty].setLevelSpeed(change,level)
    }
    if(option === "resetCall") {
        for(let k = 0; k < allMonster.length; k++) {
            allMonster[k].call = 0
            allMonster[k].callSpeed = 0
            allMonster[k].levelSpeed = 1
            allMonster[k].levelSize = 1
        }
    }
}


function render() {
    
    clear("floor")
    floor()

    idRender = requestAnimationFrame(render)

    //pagina fixa inicial
    if(start === false) { 
        begin(opacityStart)
        ghostPage.play()
    }

    //fade-out pagina inicial
    if(opacityStart > 0 && start === true && time < 100){
        time += 1
        opacityStart -= 0.01
        begin(opacityStart)
    }

    //começo do jogo
    if(life > 1 && start === true && time > 99) { 
     
        //limpa o floor que fica no topo no começo da rendereziação
        fpsByTime += 1
        initBug += 1
        time += 1
        backgroundSound.play()
        lifeDraw(life)

                
        if(initBug == 2){
            clear("floor")
            // initBug = 0  efeito chao tremendo
        }

        //faz o rastro do fanstama
        if(fpsByTime === 4 || monster.clickado === true || monster_two.clickado === true ||
             monster_three.clickado === true || monster_four.clickado === true ||
              monster_five.clickado === true || monster_six.clickado === true ||
              monster_seven.clickado === true || monster_eight.clickado === true ||
              monster_nine.clickado === true || monster_ten.clickado === true) {
            clear("rastro")
            fpsByTime = 0
        }

// --------------------------- TIME NIVEL ----------------------------------------------------------------------------------------

        if( (secondsTotal > 1 && secondsTotal < 20) && minutesActual === 0) {
            //monster one
            workMonsters("invocation", 0 , 10, "size")
            workMonsters(null, 0 , 4, "speed")
        }
        else if((secondsTotal > 20 && secondsTotal < 40 ) && minutesActual === 0) {
            backgroundSound.volume = 0.90
            ghostPage.pause()
            //permitir setar atribuito
            if(choice === 0) {
                workMonsters("resetCall")
                choice += 1
            }
            
            //monster one
            workMonsters("invocation", 0 , 16, "size")
            workMonsters(null, 0 , 3, "speed")

            //monster two
            workMonsters("invocation", 1 , 16, "size")
            workMonsters(null, 1 , 2, "speed")

            //monster three
            workMonsters("invocation", 2 , 17, "size")
            workMonsters(null, 2 , 1, "speed")

            //monster four
            workMonsters("invocation", 3 , 18, "size")
            workMonsters(null, 3 , 2, "speed")
        }
        else if(secondsTotal > 40 && minutesActual < 1) {
            //permitir setar atribuito
            if(choice === 1) {
                workMonsters("resetCall")
                choice += 1
            }

            color = "red"

            //monster one
            workMonsters("invocation", 0 , 30, "size")
            workMonsters(null, 0 , 10, "speed")

            //monster two
            workMonsters("invocation", 1 , 30, "size")
            workMonsters(null, 1 , 10, "speed")
        }
        else if((secondsTotal > 0 && minutesActual === 1) && (secondsTotal < 42  && minutesActual === 1)) {
            //permitir setar atribuito
            if(choice === 2) {
                workMonsters("resetCall")
                choice += 1
            }
            
            (seconds % 2 === 0) ? color = "red" : color = "black"

            //monster one
            workMonsters("invocation", 0 , 22, "size")
            workMonsters(null, 0 , 9, "speed")

            //monster two
            workMonsters("invocation", 1 , 29, "size")
            workMonsters(null, 1 , 8, "speed")

            //monster three
            workMonsters("invocation", 2 , 32, "size")
            workMonsters(null, 2 , 7, "speed")
        }
        else if(secondsTotal > 42 && minutesActual === 1) {
            if(choice === 3){
                workMonsters("resetCall")
                choice += 1
            }

            color = "black"

            //monster one
            workMonsters("invocation", 0 , 8, "size")
            workMonsters(null, 0 , 4, "speed")

            //monster two
            workMonsters("invocation", 1 , 10, "size")
            workMonsters(null, 1 , 4, "speed")

            //monster three
            workMonsters("invocation", 2 , 10, "size")
            workMonsters(null, 2 , 3, "speed")

            //monster four
            workMonsters("invocation", 3 , 12, "size")
            workMonsters(null, 3 , 2, "speed")

            //monster five
            workMonsters("invocation", 5 , 10, "size")
            workMonsters(null, 4 , 3, "speed")

            //monster six
            workMonsters("invocation", 5 , 14, "size")
            workMonsters(null, 5 , 3, "speed")
        }
        else if( (secondsTotal > 0 && secondsTotal < 58) && minutesActual === 2) {
            backgroundSound.volume = 1
            //permitir setar atribuito
            if(choice === 4) {
                workMonsters("resetCall")
                choice += 1
            }

            if (seconds % 3 === 0 && seconds % 5 === 0) {color = "red"}
            else if(seconds % 3) {color = "black"}
            else{color = "white"}
            
            //monster one
            workMonsters("invocation", 0 , 51, "size")
            workMonsters(null, 0 , 14, "speed")

        }
        else if(secondsTotal < 30 && minutesActual === 3) {
            //permitir setar atribuito
            if(choice === 4) {
                workMonsters("resetCall")
                choice += 1
            }
            //monster one
            workMonsters("invocation", 0 , 15, "size")
            workMonsters(null, 0 , 15, "speed")

            //monster two
            workMonsters("invocation", 1 , 12, "size")
            workMonsters(null, 1 , 18, "speed")

            //monster three
            workMonsters("invocation", 2 , 30, "size")
            workMonsters(null, 2 , 6, "speed")

             //monster four
             workMonsters("invocation", 3 , 39, "size")
             workMonsters(null, 3 , 5, "speed")
 
             //monster five
             workMonsters("invocation", 4 , 9, "size")
             workMonsters(null, 4 , 21, "speed")
        }
        else if(secondsTotal > 30 && minutesActual <= 3) {
            //permitir setar atribuito
            if(choice === 5) {
                workMonsters("resetCall")
                choice += 1
            }
            //monster one
            workMonsters("invocation", 0 , 50, "size")
            workMonsters(null, 0 , 2, "speed")

            //monster two
            workMonsters("invocation", 1 , 12, "size")
            workMonsters(null, 1 , 30, "speed")

            //monster three
            workMonsters("invocation", 2 , 28, "size")
            workMonsters(null, 2 , 3, "speed")

             //monster four
             workMonsters("invocation", 3 , 39, "size")
             workMonsters(null, 3 , 4, "speed")
 
        }
        else if((secondsTotal > 0 && secondsTotal < 50) && minutesActual === 4) {
            //permitir setar atribuito
            if(choice === 6) {
                workMonsters("resetCall")
                choice += 1
            }
            //monster one
            workMonsters("invocation", 0 , 20, "size")
            workMonsters(null, 0 , 2, "speed")

            //monster two
            workMonsters("invocation", 1 , 20, "size")
            workMonsters(null, 1 , 2, "speed")

            //monster three
            workMonsters("invocation", 2 , 15, "size")
            workMonsters(null, 2 , 12, "speed")

             //monster four
             workMonsters("invocation", 3 , 25, "size")
             workMonsters(null, 3 , 5, "speed")
 
             //monster five
             workMonsters("invocation", 4 , 10, "size")
             workMonsters(null, 4 , 2, "speed")
             
             //monster six
             workMonsters("invocation", 5 , 10, "size")
             workMonsters(null, 5 , 2, "speed")
             
             //monster seven
             workMonsters("invocation", 6 , 10, "size")
             workMonsters(null, 6 , 2, "speed")

             //monster eight
             workMonsters("invocation", 7 , 12, "size")
             workMonsters(null, 7 , 2, "speed")

             //monster nine
             workMonsters("invocation", 8 , 12, "size")
             workMonsters(null, 8 , 2, "speed")

             //monster ten
             workMonsters("invocation", 9 , 1, "size")
             workMonsters(null, 9 , 42, "speed")
        }
        else if(minutesActual >= 5) {
            //permitir setar atribuito
            if(choice === 5) {
                workMonsters("resetCall")
                choice += 1
            }
            
            //monster one
            workMonsters("invocation", 0 , 59, "size")
            workMonsters(null, 0 , 20, "speed")
        }

// --------------------------- TIME NIVEL ----------------------------------------------------------------------------------------

        //condição de dano recebido
        if( monster.size > 300 || monster_two.size > 300 || monster_three.size > 300 
            || monster_four.size > 300 || monster_five.size > 300 || monster_six.size > 300
            || monster_seven.size > 300 || monster_eight.size > 300 || monster_nine.size > 300
            || monster_ten.size > 300) {
            document.body.style.background = "white"
            cancelAnimationFrame(idRender)
            life -= 12,5
            setTimeout( () => {
                document.body.style.background = "black" 
                render()
                clear("all")
                monster.invcocation(monster.clickado,true)
                monster_two.invcocation(monster_two.clickado,true)
                monster_three.invcocation(monster.clickado,true)
                monster_four.invcocation(monster_four.clickado,true)
                monster_five.invcocation(monster_five.invcocation,true)
                monster_six.invcocation(monster_six.clickado,true)
                monster_seven.invcocation(monster_six.clickado,true)
                monster_eight.invcocation(monster_six.clickado,true)
                monster_nine.invcocation(monster_six.clickado,true)
                monster_ten.invcocation(monster_six.clickado,true)
                } , 105 )
            }    
        }
    
    //lose game
    if( life < 1 ){
        endGame = true
        if(opacity < 1){
            clear("rasto")
            opacity += 0.02
            end(opacity)
        } else { 
            cancelAnimationFrame (idRender)
            clear("life")
            canvasObj.style.top = "0px"
            canvasObj.style.left = "0px"
            end(opacity) 
        }
    }
}

render()