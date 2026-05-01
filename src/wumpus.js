export class WumpusWorld {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = [];  
    this.agentStart = [0, 0];
    this._init();
  }

  _init() {
  
    this.grid = Array.from({ length: this.rows }, () =>
      Array.from({ length: this.cols }, () => ({ pit: false, wumpus: false, gold: false }))
    );

    const allCells = [];
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if (!(r === 0 && c === 0)) allCells.push([r, c]); 

    this._shuffle(allCells);

    
    const pitCount = Math.max(1, Math.floor(allCells.length * 0.2));
    for (let i = 0; i < pitCount; i++) {
      const [r, c] = allCells[i];
      this.grid[r][c].pit = true;
    }

  
    const wumpusCandidates = allCells.slice(pitCount);
    const [wr, wc] = wumpusCandidates[0];
    this.grid[wr][wc].wumpus = true;

   
    const goldCandidates = wumpusCandidates.slice(1);
    if (goldCandidates.length > 0) {
      const [gr, gc] = goldCandidates[0];
      this.grid[gr][gc].gold = true;
    }
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  
  getNeighbors(r, c) {
    const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
    return dirs
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols);
  }

  
  getPercepts(r, c) {
    const neighbors = this.getNeighbors(r, c);
    let breeze = false, stench = false, glitter = false;

    for (const [nr, nc] of neighbors) {
      if (this.grid[nr][nc].pit) breeze = true;
      if (this.grid[nr][nc].wumpus) stench = true;
    }
    if (this.grid[r][c].gold) glitter = true;

    return { breeze, stench, glitter };
  }


  isDeath(r, c) {
    return this.grid[r][c].pit || this.grid[r][c].wumpus;
  }

  
  getCell(r, c) {
    return this.grid[r][c];
  }
}