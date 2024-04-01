import classNames from "classnames"
import { useContext } from "react"
import { createContext } from "react"
import { useReducer } from "react"
import { getLineH, getLineV } from "./sudoku"

const boardPatterns = {
  1: [
      '971000280','420619000','300872000',
      '009100068','746083050','085600023',
      '617003000','000067000','000009708',
  ]
}
const board = boardPatterns[1].map(v => v.split('').map(n => parseInt(n)));

function getAkar2(n) {
  let v = 1
  let tmp = 0
  do {
    tmp = v**2
    if (tmp == n) {
      return v
    }
    v++
  } while (tmp <= n)
  return 0;
}


/**
 * board = [
 *    [9,7,1,0,0,0,2,8,0],
 *    [4,2,0,6,1,9,0,0,0],
 *    [3,0,0,8,7,2,0,0,0], 
 *    [0,0,9,1,0,0,0,6,8],
 *    [7,4,6,0,8,3,0,5,0],
 *    [0,8,5,6,0,0,0,2,3],
 *    [6,1,7,0,0,3,0,0,0],
 *    [0,0,0,0,6,7,0,0,0],
 *    [0,0,0,0,0,9,7,0,8],
 * ]
 * 
 * return [
 *    [9,7,1,4,2,0,3,0,0],
 *    [0,0,0,6,1,9,8,7,2],
 *    [2,8,0,0,0,0,0,0,0],
 *    [0,0,9,7,4,6,6,1,7],
 *    [1,0,0,0,8,3,0,0,3],
 *    [0,6,8,0,5,0,0,0,0],
 *    [0,0,0,0,0,0,0,6,7],
 *    [0,0,3,0,2,0,0,7,0],
 *    [0,6,7,0,0,0,0,0,0],
 * ]
 */
function transformBoard2RowCell(board) {
  const result = [];
  const blockSize = Math.sqrt(board.length); // Ukuran blok (baris/kolom) dalam kotak sudoku

  // Bagi array board menjadi subarray blockSize x blockSize
  for (let i = 0; i < board.length; i += blockSize) {
      for (let j = 0; j < board.length; j += blockSize) {
          const subarray = [];
          // Isi subarray blockSize x blockSize dengan nilai dari board
          for (let k = i; k < i + blockSize; k++) {
              for (let l = j; l < j + blockSize; l++) {
                  subarray.push({
                      x: l,
                      y: k,
                      val: board[k][l]
                  });
              }
          }
          // Tambahkan subarray blockSize x blockSize ke dalam array result
          result.push(subarray);
      }
  }
  return result;
}

function getRowBoard(board, x, y) {
  return board[y]
}

const ACTIONS = {
  SELECTED_CELL: "selected_cell",
  INCREMENT: "increment",
  DECREMENT: "decrement",
  HIGHLIGHT_CELLS: "highlight_cells",
}

function reducer(state, action) {
  action.step = action.step || 1
  switch (action.type) {
    case ACTIONS.INCREMENT:
      return { count: state.count + action.step }
    case ACTIONS.DECREMENT:
      if (state.count <= 0) return { count: 0 }
      return { count: state.count - action.step }
    case ACTIONS.SELECTED_CELL:
      return { activeCellId: action.cellId }
    case ACTIONS.HIGHLIGHT_CELLS:
      return { highlightCells: action.highlightCells }
    default:
      throw new Error('Unhandled action')
  }
}

const SudokuContext = createContext();
const SudokuProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    count: 0,
    activeCellId: null,
    highlightCells: [],
  });

  const value = {
    state: state,
    dispatch: dispatch,
    setActiveCell: (cellId) => {
      dispatch({ type: ACTIONS.SELECTED_CELL, cellId})
    },
    highlightCellScope: (boxIndex, cellIndex) => {
      const lineH = getLineH(board, cellIndex, boxIndex)
      // const lineV = getLineV(board, cellIndex, boxIndex)
      console.log('lineH', cellIndex, boxIndex);
      let highlightCells = []
      highlightCells.push(
        ...lineH.indexs.map(({x, y}) => [x, y].join('-'))
      )
      // highlightCells.push(
      //   ...lineV.indexs.map(({x, y}) => [x, y].join('-'))
      // )

      dispatch({ type: ACTIONS.HIGHLIGHT_CELLS, highlightCells})
    }
  };

  return (
    <SudokuContext.Provider value={value}>
      {children}
    </SudokuContext.Provider>
  );
}

export default function App() {
  return (
    <SudokuProvider>
      <main className="flex justify-center items-center align-middle bg-slate-300 h-screen w-screen">
        <div className="-mt-56">
          <h1>SUDOKU</h1>
          <Board />
        </div>
      </main>
    </SudokuProvider>
  )
}

function Counter() {
  const { state } = useContext(SudokuContext)

  return (
    <div className="text-3xl">
      <span className="px-5">{state.count}</span>
      <CounterBtn />
    </div>
  )
}

function CounterBtn() {
  const { dispatch } = useContext(SudokuContext)

  const increment = () => dispatch({ type: "INCREMENT" })
  const decrement = () => dispatch({ type: "DECREMENT" })

  return (
    <div className="text-3xl flex gap-5">
      <button onClick={decrement}>&#8722;</button>
      <button onClick={increment}>&#43;</button>
    </div>
  )
}


function Board() {
  return (
    <div className="bg-white p-3 shadow-xl rounded-lg">
      <div className="grid grid-cols-3 select-none border border-slate-800">
        {board.map((cells, i) => (
          <Boxes key={i} cells={cells} id={i} />
        ))}
      </div>
    </div>
  )
}

function Boxes({cells, id}) {
  return (
    <div>
      <div className="grid grid-cols-3 border border-slate-800">
        {cells.map((v, i) => (
          <Cell 
            value={v} 
            key={i} 
            id={[id, i].join("-")}
            boxIndex={id}
            cellIndex={i}
            onChangeActiveCell={(id) => setActiveCell(i)}
          />
        ))}
      </div>
    </div>
  )
}

function Cell({ value = null, id, boxIndex, cellIndex}) {
  const { state, setActiveCell, highlightCellScope} = useContext(SudokuContext)

  return (
    <div 
      className={classNames("cell", {
        "selected": id === state.activeCellId,
        "highlight": state.highlightCells.includes(id)
      })}
      onClick={() => {
        setActiveCell(id)
        highlightCellScope(boxIndex, cellIndex)
      }} 
    >
      {value || ''}
    </div>
  )
}

