/*
  Structure of board
*/
function Gameboard() {
  const spaces = 9;
  const board = [];

  for(let pos = 0; pos < spaces; pos++){
    board[pos] = Space();
  };

  getBoard = () => board;

  pickSpace = (position, mark) => {
    board[position].setMark(mark);
  };

  printBoard = () => {
    const grid = [[],[],[]];
    let row = 0

    board.forEach((item, index) => {
      const mark = item.getMark();
      grid[row].push(mark||' ');  
      if(index % 3 == 2){
        row++;  
      } 
    });
    console.table(grid);
  };

  return {
    getBoard,
    pickSpace,
    printBoard
  };
}

/*
  Single mark area
*/
function Space() {
  let mark = '';

  const setMark = (pick) => {
    if(mark == ''){
      mark = pick;
    }
  }

  const getMark = () => mark;

  return {
    setMark,
    getMark
  };
}

/*
  Player array
  picks: count number os marks applied
*/
function Player(pos) {
  const player = [
    {
      name: 'Player One',
      mark: 'cross',
      picks: 0,
    },{
      name: 'Player Two',
      mark: 'circle',
      picks: 0
    }
  ];

  const tie = [];

  const get = (param) => player[pos][param];

  const reset = () => player[pos].picks = 0;

  const pickAdd = () => {
    player[pos].picks++;
  };

  return {
    get,
    reset,
    tie,
    pickAdd
  };
}

/*
  Working game, gather all previous factories
*/
function Gamework(display, marks) {
  const [playerOne, playerTwo] = [Player(0), Player(1)];
  let board = Gameboard();
  let finished = false;
  const defaultDisplay = display.innerHTML;

  let activePlayer = playerOne;

  const switchPlayers = () => {
    activePlayer = activePlayer === playerOne ? playerTwo : playerOne;
  };

  const getActivePlayer = () => {
    return activePlayer;
  };

  const setTitleName = () => {
    const playerName = document.querySelector('#name');
    if(playerName){
      playerName.textContent = activePlayer.get('name');
    }
  };

  // check for winner
  const verifyGame = () => {
    const testBoard = board.getBoard();
    const activeMark = activePlayer.get('mark');

    console.log('verifyGame: ', activePlayer.get('name'), activeMark);

    // get the marked positions by active player
    const reduced = testBoard.reduce((group, item, index) => {
      if(item.getMark() != '' && item.getMark() == activeMark){
        group.push(index);
      }
      return group;
    },[]);

    // check possible combinations of tie
    const validate = (combinations) => {
      for(comb of combinations){
        let r = 0;
        for(item of comb){
          if(reduced.includes(item)){
            r++;
          }
        }
        if(r == 3){
          activePlayer.tie = comb;
          return true;
        }
      }
      return false;
    }

    // player picks should match one of these combinations
    // reduced = [..n]
    const columns = validate([[0,3,6],[1,4,7],[2,5,8]]);
    const rows = validate([[0,1,2],[3,4,5],[6,7,8]]);
    const diagonal = validate([[0,4,8],[2,4,6]]);

    const name = activePlayer.get('name');

    if(columns || rows || diagonal) finished = true;

    if (columns) {
      return `=== ${name} win on collumn! ===`;
    } else if (rows) {
      return `=== ${name} win on row! ===`;
    } else if (diagonal) {
      return `=== ${name} win on diagonal! ===`;
    } else if (finished) {
      return 'GAME OVER with no winner';
    } else {
      return 'There is no winner yet...';
    }
  };

  const round = (position) => {

    if(finished){
      return;
    }

    let markedSpaces = 0;

    activePlayer.pickAdd();
    board.pickSpace(position, activePlayer.get('mark'));

    board.getBoard().forEach(item => {
      const mark = item.getMark();
      markedSpaces += (mark ? 1 : 0);
    });

    if(markedSpaces == 9){
      finished = true;
    }

    if(activePlayer.get('picks') > 2) {
      const result = verifyGame();
      console.log(`${result}`);

      if(finished){
        display.innerHTML = result;
        activePlayer.tie.forEach(item => {
          marks[item].classList.add('win');
        });
      }
    }

    switchPlayers();
    setTitleName();

    if(finished) board.printBoard();
  };

  // init
  const startGame = () => {
    console.log('GAME START!');
    setTitleName();
  };

  const reset = () => {
    playerOne.reset();
    playerTwo.reset();
    board = Gameboard();
    finished = false;
    activePlayer = playerOne;
    activePlayer.tie = [];
    display.innerHTML = defaultDisplay;
    setTitleName();
    marks.forEach(mark => mark.classList.remove('cross', 'circle', 'win'));
  };

  const isFinished = () => finished;

  startGame();

  return {
    getActivePlayer,
    round,
    reset,
    isFinished
  };
}
const display = document.querySelector('.display');
const marks = document.querySelectorAll('.mark');

const game = Gamework(display, marks);

marks.forEach(mark => {
  mark.addEventListener('click', (event) => {
    const element = event.target;
    const markPosition = element.dataset.pos;
    const markIcon = game.getActivePlayer().get('mark');

    if(!game.isFinished()){
      game.round(markPosition);
      element.classList.add(markIcon);
    };

    element.removeEventListener('click', this);
  });
});

function Tests() {

  // test random picks
  const random = () => {
    const picks = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    while(picks.length && !game.isFinished()){
      const pos = Math.floor(Math.random() * picks.length);
      const singlePick = picks[pos];

      setMark(singlePick);
      picks.splice(pos, 1);
      game.round(singlePick);
    }
  }

  // test few rounds with winner
  const few = () => {
    const rounds = [2, 0, 6, 4, 8, 5, 7];

    for(pos of rounds){
      setMark(pos);
      game.round(pos);
    }
  }

  // draw scenario
  const draw = () => {
    const rounds = [0, 4, 8, 6, 3, 1, 2, 5, 7];

    for(pos of rounds){
      setMark(pos);
      game.round(pos);
    }
  }

  const setMark = (pos) => {
    if(game.isFinished()) return;

    const markIcon = game.getActivePlayer().get('mark');
    marks[pos].classList.add(markIcon);
  } 

  return {
    random,
    few,
    draw
  }
}

const { random, few, draw } = Tests();
