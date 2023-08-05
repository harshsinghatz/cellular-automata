// Constants
const primary = {
  main: "#1976d2",
  light: "#42a5f5",
  dark: "#1565c0",
  contrastText: "#fff",
  red: "#e57373",
  green: "#66bb6a",
};

const CANVAS_ROWS = 32;
const CANVAS_COLUMN = 32;
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 900;
const CELL_WIDTH = CANVAS_WIDTH / CANVAS_COLUMN;
const CELL_HEIGHT = CANVAS_HEIGHT / CANVAS_ROWS;

const stateMapping = {
  DEAD: 0,
  ALIVE: 1,
};

// Add basic UI template
const id = "space";
const space = document.getElementById(id) as HTMLCanvasElement;

if (!space) throw new Error(`Canvas with id ${id} doesn't exist`);

space.width = CANVAS_WIDTH;
space.height = CANVAS_HEIGHT;

const ctx = space.getContext("2d");

if (!ctx) throw new Error("Context doesn't exist");

ctx.fillStyle = primary.dark;
ctx.fillRect(0, 0, space.width, space.height);

const createState = () => {
  const newState: Array<Array<number>> = [];

  for (let i = 0; i < CANVAS_ROWS; i++) {
    const rows = [...new Array(CANVAS_COLUMN).fill(0)];

    newState.push(rows);
  }

  return newState;
};

// Rendering;
let State = createState();
let nextState = createState();

type Transition = {
  [key: string]: number;
};

const getNeighboursCount = (
  rowIndex: number,
  numOfState: number,
  colIndex: number
) => {
  const neighborsCount = new Array<number>(numOfState).fill(0);
  for (let i = -1; i <= 1; i++) {
    let actualRowIndex = rowIndex + i;
    if (actualRowIndex < 0) {
      actualRowIndex = CANVAS_ROWS - 1;
    }

    if (actualRowIndex >= CANVAS_ROWS) {
      actualRowIndex = 0;
    }

    for (let j = -1; j <= 1; j++) {
      let actualColIndex = colIndex + j;
      if (i === 0 && j === 0) continue;
      if (actualColIndex < 0 || actualColIndex >= CANVAS_COLUMN) {
        actualColIndex = CANVAS_COLUMN - 1;
      }

      if (actualColIndex >= CANVAS_COLUMN) {
        actualColIndex = 0;
      }
      const neighbor = State[actualRowIndex][actualColIndex];
      neighborsCount[neighbor] += 1;
    }
  }

  return neighborsCount;
};

const GameOfLifeTransition: Transition[] = [
  {
    "53": 1,
    default: 0,
  },
  {
    "62": 1,
    "53": 1,
    default: 0,
  },
];

const getNextState = (nextState: typeof State) => {
  for (let rowIndex = 0; rowIndex < State.length; rowIndex++) {
    const row = State[rowIndex];

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cell = State[rowIndex][colIndex];
      const counts = getNeighboursCount(
        rowIndex,
        Object.keys(stateMapping).length,
        colIndex
      );

      const setCurCellVal = (val: number) =>
        (nextState[rowIndex][colIndex] = val);

      const stateTransition = counts.join("");
      const nextTransition =
        GameOfLifeTransition[cell][stateTransition] === undefined
          ? GameOfLifeTransition[cell].default
          : GameOfLifeTransition[cell][stateTransition];
      setCurCellVal(nextTransition);
    }
  }
};

const renderAliveCells = (state: typeof State) => {
  for (let row = 0; row < CANVAS_ROWS; row++) {
    for (let col = 0; col < CANVAS_COLUMN; col++) {
      if (state[row][col] === stateMapping.ALIVE) {
        ctx.fillStyle = primary.green;
        ctx.fillRect(
          CELL_WIDTH * col,
          CELL_HEIGHT * row,
          CELL_WIDTH,
          CELL_HEIGHT
        );
      } else {
        if (state[row][col] === stateMapping.DEAD) {
          ctx.fillStyle = primary.dark;
          ctx.fillRect(
            CELL_WIDTH * col,
            CELL_HEIGHT * row,
            CELL_WIDTH,
            CELL_HEIGHT
          );
        }
      }
    }
  }
};

space.addEventListener("click", (e) => {
  const col = Math.floor(e.offsetX / CELL_WIDTH);
  const row = Math.floor(e.offsetY / CELL_HEIGHT);
  State[row][col] = 1;
  renderAliveCells(State);
});

document.getElementById("next")?.addEventListener("click", () => {
  getNextState(nextState);
  renderAliveCells(nextState);

  State = nextState;
  nextState = createState();
});

renderAliveCells(State);
