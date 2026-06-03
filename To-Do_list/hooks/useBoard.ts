// useBoard  re-esporta il context globale della board.
// Tutte le schermate condividono lo stesso stato tramite BoardContext.

// thin re-export — tutte le schermate importano da qui
export { useBoardContext as useBoard } from '../context/BoardContext';


