

export class KnowledgeBase {
  constructor() {
    this.clauses = new Set(); 
    this.clauseList = [];   
    this.inferenceSteps = 0;
  }

  reset() {
    this.clauses = new Set();
    this.clauseList = [];
    this.inferenceSteps = 0;
  }

  addClause(clause) {
    const key = [...clause].sort().join("|");
    if (!this.clauses.has(key)) {
      this.clauses.add(key);
      this.clauseList.push([...clause]);
    }
  }
  tell(r, c, percepts, neighbors) {
    const { breeze, stench } = percepts;

    if (breeze) {
     
      const pitClause = neighbors.map(([nr, nc]) => `P_${nr}_${nc}`);
      this.addClause(pitClause);
     
    } else {
 
      for (const [nr, nc] of neighbors) {
        this.addClause([`~P_${nr}_${nc}`]);
      }
    }

    if (stench) {
      const wumpusClause = neighbors.map(([nr, nc]) => `W_${nr}_${nc}`);
      this.addClause(wumpusClause);
    } else {
      for (const [nr, nc] of neighbors) {
        this.addClause([`~W_${nr}_${nc}`]);
      }
    }

   
    this.addClause([`~P_${r}_${c}`]);
    this.addClause([`~W_${r}_${c}`]);
  }


  ask(literal) {
  
    const negated = this._negate(literal);
    const testClauses = [...this.clauseList.map(c => [...c]), [negated]];
    return this._resolve(testClauses);
  }

  
  _resolve(clauses) {
    let workingSet = clauses.map(c => [...c]);
    const seen = new Set(workingSet.map(c => [...c].sort().join("|")));

    while (true) {
      const newClauses = [];
      const n = workingSet.length;

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          this.inferenceSteps++;
          const resolvents = this._resolveClauses(workingSet[i], workingSet[j]);

          for (const r of resolvents) {
            if (r.length === 0) return true;

            const key = [...r].sort().join("|");
            if (!seen.has(key)) {
              seen.add(key);
              newClauses.push(r);
            }
          }
        }
      }

      if (newClauses.length === 0) return false; 
      workingSet = [...workingSet, ...newClauses];
    }
  }

 
  _resolveClauses(c1, c2) {
    const results = [];
    for (const lit of c1) {
      const neg = this._negate(lit);
      if (c2.includes(neg)) {
        const resolvent = [
          ...c1.filter(l => l !== lit),
          ...c2.filter(l => l !== neg),
        ];
     
        const deduped = [...new Set(resolvent)];
        
        if (!this._isTautology(deduped)) {
          results.push(deduped);
        }
      }
    }
    return results;
  }

  _negate(lit) {
    return lit.startsWith("~") ? lit.slice(1) : `~${lit}`;
  }

  _isTautology(clause) {
    for (const lit of clause) {
      if (clause.includes(this._negate(lit))) return true;
    }
    return false;
  }


  isSafe(r, c) {
    const noPit = this.ask(`~P_${r}_${c}`);
    const noWumpus = this.ask(`~W_${r}_${c}`);
    return noPit && noWumpus;
  }

  
  isDangerous(r, c) {
    const hasPit = this.ask(`P_${r}_${c}`);
    const hasWumpus = this.ask(`W_${r}_${c}`);
    return hasPit || hasWumpus;
  }
}