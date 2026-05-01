export class Agent {
  constructor(world, kb) {
    this.world = world;
    this.kb = kb;
    this.pos = [0, 0];
    this.visited = new Set();
    this.safeQueue = [];   
    this.cellStatus = {};
    this.path = [];        
    this.alive = true;
    this.won = false;
    this.log = [];         

    this._visit(0, 0);
  }

  _key(r, c) { return `${r},${c}`; }

  _visit(r, c) {
    this.pos = [r, c];
    const key = this._key(r, c);
    this.visited.add(key);
    this.path.push([r, c]);
    this.cellStatus[key] = 'safe';

    const percepts = this.world.getPercepts(r, c);
    const neighbors = this.world.getNeighbors(r, c);

   
    this.kb.tell(r, c, percepts, neighbors);
    this.log.push({ type: 'tell', r, c, percepts });

   
    for (const [nr, nc] of neighbors) {
      const nkey = this._key(nr, nc);
      if (!this.visited.has(nkey)) {
        this._inferCell(nr, nc);
      }
    }

    return percepts;
  }

  _inferCell(r, c) {
    const key = this._key(r, c);

    const safe = this.kb.isSafe(r, c);
    if (safe) {
      this.cellStatus[key] = 'safe';
      if (!this.safeQueue.find(([sr, sc]) => sr === r && sc === c)) {
        this.safeQueue.push([r, c]);
      }
      this.log.push({ type: 'infer', r, c, result: 'SAFE' });
      return;
    }

    const danger = this.kb.isDangerous(r, c);
    if (danger) {
      this.cellStatus[key] = 'danger';
      this.log.push({ type: 'infer', r, c, result: 'DANGER' });
      return;
    }

    if (!this.cellStatus[key]) {
      this.cellStatus[key] = 'unknown';
    }
  }

 
  step() {
    if (!this.alive || this.won) return { moved: false, done: true };

    const [r, c] = this.pos;


    if (this.world.getCell(r, c).gold) {
      this.won = true;
      this.log.push({ type: 'event', msg: '🏆 Gold found! Agent wins.' });
      return { moved: false, done: true, percepts: this.world.getPercepts(r, c) };
    }

   
    while (this.safeQueue.length > 0) {
      const [nr, nc] = this.safeQueue.shift();
      const nkey = this._key(nr, nc);
      if (!this.visited.has(nkey)) {
        this.log.push({ type: 'move', from: [r, c], to: [nr, nc] });
        const percepts = this._visit(nr, nc);

  
        if (this.world.isDeath(nr, nc)) {
          this.alive = false;
          this.log.push({ type: 'event', msg: '💀 Agent died! KB inference failed.' });
          return { moved: true, done: true, percepts };
        }

        return { moved: true, done: false, percepts };
      }
    }

   
    const neighbors = this.world.getNeighbors(r, c);
    const unknown = neighbors.filter(([nr, nc]) => {
      const k = this._key(nr, nc);
      return !this.visited.has(k) && this.cellStatus[k] !== 'danger';
    });

    if (unknown.length > 0) {
      const [nr, nc] = unknown[Math.floor(Math.random() * unknown.length)];
      this.log.push({ type: 'move', from: [r, c], to: [nr, nc], risky: true });
      const percepts = this._visit(nr, nc);

      if (this.world.isDeath(nr, nc)) {
        this.alive = false;
        this.log.push({ type: 'event', msg: '💀 Agent died on risky move.' });
        return { moved: true, done: true, percepts };
      }

      return { moved: true, done: false, percepts };
    }

    
    this.log.push({ type: 'event', msg: '🔒 Agent is stuck. No safe moves remain.' });
    return { moved: false, done: true };
  }

  getCellStatus(r, c) {
    const key = this._key(r, c);
    if (r === this.pos[0] && c === this.pos[1]) return 'agent';
    if (this.visited.has(key)) return 'visited';
    return this.cellStatus[key] || 'unknown';
  }
}