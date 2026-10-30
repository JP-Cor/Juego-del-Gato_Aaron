'use strict';

const KEY = 'juego-gato-v2';
const $ = id => document.getElementById(id);
const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const difficultyNames = {easy:'Fácil',medium:'Intermedio',hard:'Difícil'};
let aiTimer = null;
let state = createState();

function createState(){
    return {screen:'mode',mode:null,difficulty:null,names:{X:'Jugador 1',O:'Jugador 2'},scores:{X:0,O:0,draws:0},board:Array(9).fill(''),turn:'X',finished:false,started:false,aiThinking:false};
}

function load(){
    try{
        const saved=JSON.parse(localStorage.getItem(KEY));
        if(saved&&saved.names&&saved.scores&&Array.isArray(saved.board)&&saved.board.length===9){
            state={...createState(),...saved,names:{...createState().names,...saved.names},scores:{...createState().scores,...saved.scores}};
            if(!['one','two'].includes(state.mode)||!['easy','medium','hard',null].includes(state.difficulty)) state.mode=null;
            if(!state.board.every(value=>['','X','O'].includes(value))) state.board=Array(9).fill('');
        }else{
            const legacy=JSON.parse(localStorage.getItem('juego-gato-v1'));
            if(legacy&&legacy.names&&legacy.scores) state={...state,names:legacy.names,scores:legacy.scores};
        }
    }catch(error){ console.warn('No se pudo recuperar la partida guardada.',error); }
}
function save(){
    try{localStorage.setItem(KEY,JSON.stringify(state));}
    catch(error){console.warn('No se pudo guardar la partida.',error);}
}
function winner(board=state.board){
    for(const line of lines){const [a,b,c]=line;if(board[a]&&board[a]===board[b]&&board[a]===board[c])return {symbol:board[a],line};}
    return null;
}
function show(screen){
    ['modeScreen','difficultyScreen','namesScreen','gameScreen'].forEach(id=>$(id).classList.add('hidden'));
    $(screen).classList.remove('hidden');
    state.screen=screen.replace('Screen','').replace('game','game').replace('mode','mode').replace('difficulty','difficulty').replace('names','names');
}
function render(){
    if(state.started){renderGame();return;}
    if(state.mode==='one'&&state.difficulty) show('namesScreen');
    else if(state.mode==='one') show('difficultyScreen');
    else if(state.mode==='two') show('namesScreen');
    else show('modeScreen');
    updateNamesForm();
}
function updateNamesForm(){
    const one=state.mode==='one';
    $('namesTitle').textContent=one?'Nombre del jugador':'Ingresa los nombres de los jugadores';
    $('configuration').textContent=one?'🤖 Computadora (O) · Dificultad: '+difficultyNames[state.difficulty]:'Jugador 1 (X) VS Jugador 2 (O)';
    $('secondNameGroup').classList.toggle('hidden',one);
    $('nameXLabel').textContent=one?'Nombre del jugador':'Jugador 1';
    $('nameX').placeholder=one?'Tu nombre':'Nombre del jugador 1';
}
function renderGame(){
    show('gameScreen');
    const one=state.mode==='one';
    $('modeLabel').textContent=one?'🤖 1 JUGADOR':'👥 2 JUGADORES';
    $('matchup').textContent=state.names.X+' (X) VS '+state.names.O+' (O)';
    $('difficultyLabel').textContent=one?'Dificultad: '+difficultyNames[state.difficulty]:'Turnos alternados';
    $('labelX').textContent=state.names.X+' (X)';$('labelO').textContent=state.names.O+' (O)';
    $('scoreX').textContent=state.scores.X;$('scoreO').textContent=state.scores.O;$('draws').textContent=state.scores.draws;
    $('played').textContent='Partidas jugadas: '+(state.scores.X+state.scores.O+state.scores.draws);
    const win=winner();
    $('status').textContent=win?'🏆 Ganó '+state.names[win.symbol]+'!':state.finished?'🤝 ¡Empate!':state.aiThinking?'🤖 La computadora está pensando...':'Turno de '+state.names[state.turn]+' ('+state.turn+')';
    $('board').replaceChildren();
    state.board.forEach((value,index)=>{
        const button=document.createElement('button');button.type='button';button.className='cell'+(value==='O'?' o':'')+(win&&win.line.includes(index)?' win':'');
        button.textContent=value;button.disabled=!!value||state.finished||state.aiThinking||(one&&state.turn==='O');
        button.setAttribute('aria-label','Casilla '+(index+1)+(value?', '+value:', vacía'));button.addEventListener('click',()=>move(index));$('board').append(button);
    });
}
function begin(skip){
    clearAiTimer();state.names.X=$('nameX').value.trim()||'Jugador 1';state.names.O=state.mode==='one'?'Computadora':($('nameO').value.trim()||'Jugador 2');
    state.board=Array(9).fill('');state.turn='X';state.finished=false;state.started=true;state.aiThinking=false;save();renderGame();
}
function move(index){
    if(state.finished||state.aiThinking||state.board[index]||(state.mode==='one'&&state.turn==='O'))return;
    state.board[index]=state.turn;finishOrContinue();
    if(!state.finished&&state.mode==='one'&&state.turn==='O') scheduleAi();
    save();renderGame();
}
function finishOrContinue(){
    const win=winner();
    if(win){state.scores[win.symbol]++;state.finished=true;}
    else if(state.board.every(Boolean)){state.scores.draws++;state.finished=true;}
    else state.turn=state.turn==='X'?'O':'X';
}
function scheduleAi(){
    state.aiThinking=true;renderGame();
    aiTimer=setTimeout(()=>{aiTimer=null;if(!state.started||state.finished)return;const index=chooseAiMove();state.aiThinking=false;state.board[index]='O';finishOrContinue();save();renderGame();},400+Math.floor(Math.random()*301));
}
function chooseAiMove(){
    const available=state.board.map((value,index)=>value?null:index).filter(index=>index!==null);
    if(state.difficulty==='easy')return available[Math.floor(Math.random()*available.length)];
    const winning=findImmediate('O');if(winning!==null)return winning;
    const block=findImmediate('X');if(state.difficulty==='medium'&&block!==null)return block;
    if(state.difficulty==='medium')return available[Math.floor(Math.random()*available.length)];
    return minimax(state.board,true).index;
}
function findImmediate(symbol){
    for(const index of state.board.map((value,i)=>value?null:i).filter(i=>i!==null)){const board=[...state.board];board[index]=symbol;if(winner(board)?.symbol===symbol)return index;}
    return null;
}
function minimax(board,maximizing){
    const win=winner(board);if(win)return {score:win.symbol==='O'?10:-10};
    if(board.every(Boolean))return {score:0};
    const moves=[];
    board.forEach((value,index)=>{if(!value){const next=[...board];next[index]=maximizing?'O':'X';const result=minimax(next,!maximizing);moves.push({index,score:result.score+(result.score>0?(maximizing?-1:1):(result.score<0?(maximizing?1:-1):0))});}});
    return maximizing?moves.reduce((best,move)=>move.score>best.score?move:best):moves.reduce((best,move)=>move.score<best.score?move:best);
}
function clearAiTimer(){if(aiTimer!==null){clearTimeout(aiTimer);aiTimer=null;}state.aiThinking=false;}
function newGame(){clearAiTimer();state.board=Array(9).fill('');state.turn='X';state.finished=false;save();renderGame();}
function confirmAction(title,text,action){$('confirmTitle').textContent=title;$('confirmText').textContent=text;$('confirm').showModal();$('accept').onclick=()=>{$('confirm').close();action();};}

$('onePlayer').addEventListener('click',()=>{state.mode='one';state.difficulty=null;state.started=false;save();render();});
$('twoPlayers').addEventListener('click',()=>{state.mode='two';state.difficulty=null;state.started=false;save();render();});
document.querySelectorAll('.difficulty').forEach(button=>button.addEventListener('click',()=>{state.difficulty=button.dataset.difficulty;save();render();}));
$('backToMode').addEventListener('click',()=>{state.mode=null;state.difficulty=null;save();render();});
$('backToPrevious').addEventListener('click',()=>{if(state.mode==='one'&&state.difficulty){state.difficulty=null;save();render();}else{state.mode=null;save();render();}});
$('start').addEventListener('click',()=>begin(false));$('skip').addEventListener('click',()=>begin(true));$('next').addEventListener('click',newGame);
$('resetScore').addEventListener('click',()=>confirmAction('¿Reiniciar marcador?','Se borrarán todas las estadísticas, pero se conservarán los jugadores.',()=>{state.scores={X:0,O:0,draws:0};newGame();}));
$('changePlayers').addEventListener('click',()=>confirmAction('¿Cambiar jugadores?','El marcador actual se reiniciará al comenzar con los nuevos nombres.',()=>{clearAiTimer();state.started=false;state.scores={X:0,O:0,draws:0};$('nameX').value='';$('nameO').value='';save();render();}));
$('changeMode').addEventListener('click',()=>confirmAction('¿Cambiar modalidad?','El marcador actual se reiniciará al comenzar la nueva configuración.',()=>{clearAiTimer();state=createState();save();render();}));
$('cancel').addEventListener('click',()=>$('confirm').close());

load();
if(state.started){state.started=false;state.board=Array(9).fill('');state.finished=false;}
render();
