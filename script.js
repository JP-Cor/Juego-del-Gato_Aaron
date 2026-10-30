'use strict';
const KEY='juego-gato-v1';
const $=id=>document.getElementById(id);
const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const fresh=()=>({names:{X:'Jugador X',O:'Jugador O'},scores:{X:0,O:0,draws:0},board:Array(9).fill(''),turn:'X',finished:false,started:false,trackScore:true});
let state=fresh();
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&saved.started&&Array.isArray(saved.board)&&saved.board.length===9&&saved.names&&saved.scores&&['X','O'].includes(saved.turn)&&saved.board.every(v=>['','X','O'].includes(v))){state=saved;}}catch(_error){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_error){}}
function winner(){for(const line of lines){const [a,b,c]=line;if(state.board[a]&&state.board[a]===state.board[b]&&state.board[a]===state.board[c])return {symbol:state.board[a],line};}return null;}
function render(){ $('setup').classList.toggle('hidden',state.started);$('game').classList.toggle('hidden',!state.started);if(!state.started)return;
$('scorePanel').classList.toggle('hidden',!state.trackScore);$('played').classList.toggle('hidden',!state.trackScore);$('labelX').textContent=state.names.X+' (X)';$('labelO').textContent=state.names.O+' (O)';$('scoreX').textContent=state.scores.X;$('scoreO').textContent=state.scores.O;$('draws').textContent=state.scores.draws;$('played').textContent='Partidas jugadas: '+(state.scores.X+state.scores.O+state.scores.draws);
const win=winner();$('status').textContent=win?'🏆 Ganó '+state.names[win.symbol]+'!':state.board.every(Boolean)?'🤝 ¡Empate!':'Turno de '+state.names[state.turn]+' ('+state.turn+')';
$('board').replaceChildren();state.board.forEach((value,index)=>{const button=document.createElement('button');button.type='button';button.className='cell'+(value==='O'?' o':'')+(win&&win.line.includes(index)?' win':'');button.textContent=value;button.disabled=!!value||state.finished;button.setAttribute('aria-label','Casilla '+(index+1)+(value?', '+value:', vacía'));button.addEventListener('click',()=>move(index));$('board').append(button);});}
function start(skip){state=fresh();state.started=true;state.trackScore=$('trackScore').checked;if(!skip){state.names.X=$('nameX').value.trim()||'Jugador X';state.names.O=$('nameO').value.trim()||'Jugador O';}save();render();}
function move(index){if(state.finished||state.board[index])return;state.board[index]=state.turn;const win=winner();if(win){if(state.trackScore)state.scores[win.symbol]++;state.finished=true;}else if(state.board.every(Boolean)){if(state.trackScore)state.scores.draws++;state.finished=true;}else{state.turn=state.turn==='X'?'O':'X';}save();render();}
function next(){state.board=Array(9).fill('');state.turn='X';state.finished=false;save();render();}
$('start').addEventListener('click',()=>start(false));$('skip').addEventListener('click',()=>start(true));$('next').addEventListener('click',next);
$('reset').addEventListener('click',()=>{$('confirm').showModal();});$('cancel').addEventListener('click',()=>$('confirm').close());$('accept').addEventListener('click',()=>{state=fresh();$('nameX').value='';$('nameO').value='';$('trackScore').checked=true;save();$('confirm').close();render();});
render();
