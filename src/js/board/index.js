import Functor from '../functor';
import { BOARD_ELEMENTS } from '../constants';

export default class Board {
  constructor(unsolved) {
    this.rows = [...BOARD_ELEMENTS.rows];
    this.cols = [...BOARD_ELEMENTS.columns];
    this.rs = BOARD_ELEMENTS.row_squares;
    this.cs = BOARD_ELEMENTS.column_squares;
    this.boxes = [];
    this.row_units = [];
    this.column_units = [];
    this.square_units = [];
    this.unit_list = [];
    this.grid = {};
    this.unsolved = unsolved;
    this.units = {};
    this.peers = {};
    this.eliminateCount = 0;
    this.finish = false;
  }

  cross(a, b) {
    return a.reduce(
      (x, y) => (b.map(
        z => x.push(y + z)), x), []); //?
  }

  eliminate(grid) {
    const gridObj = new Functor(grid);
    const solved = gridObj.filter((x, y) => y.length === 1);
    const unsolved = gridObj.filter((x, y) => y.length !== 1);
    const peers = new Functor(this.peers);
    solved.map((key, val) => {
      grid = peers.value(key).filter(
        peer => unsolved.containsKey(peer)).reduce(
        (obj, box) => ({...obj, [box]: obj[box].filter(h => h !== val[0])}),
      grid);
    });
    return grid;
  }

  validate(grid) {
    const compare = f => ([a, ...ra]) => ([b, ...rb]) => ((!a && !b) || f(a, b) && compare(f)(ra)(rb));
    return this.unit_list.filter(
      x => !compare((a, b) => a === b)(this.cols)(x.map(y => grid[y]).sort())).length === 0;
  }

  print(grid) {
    const ele = document.querySelector('.boards');
    const arr = Object.values(grid).reduce(
      (a, b, i, arr, c) => (c = ~~(i/9), (a[c] = a[c] || []).push(b.length === 1 ? b[0] : b.map(
        x => `<div class="dg">${x}</div>`).join('')), a), []);
    ele.innerHTML += `
      <div class="grid">
        ${arr.map(row => `
          <div class="row">
            ${row.map(cell => `
              <div class="cell">
                ${cell}
              </div>`).join('')}
          </div>`).join('')}
      </div>`;
  }

  only_choice(grid) {
    this.unit_list.forEach(unit => {
      new Functor(this.cols.reduce(
        (ac, val) => ({...ac, [val]: unit.filter(
          su => grid[su].includes(val))
        }),
      {})).filter(
        (key, un) => un.length === 1).map(
          (key, un) => grid[un[0]] = key);
    });
    return grid;
  }

  solved_values(grid, limit = 1) {
    return Object.keys(grid).filter(
      x => grid[x].length === limit);
  }

  reduce_puzzle(grid) {
    let stalled = false;

    while (!stalled) {

      // Check how many boxes have a determined value
      let solved_grid_before = this.solved_values(grid).length;

      // Use the Eliminate Strategy
      grid = this.eliminate(grid);

      // Use the Only Choice Strategy
      grid = this.only_choice(grid);

      // Check how many boxes have a determined value, to compare
      let solved_grid_after = this.solved_values(grid).length;

      // If no new values were added, stop the loop.
      stalled = solved_grid_before === solved_grid_after;

      // Sanity check, return False if there is a box with zero available values:
      if (this.solved_values(grid, 0).length > 0) {
        return false; // Failed earlier
      }
    }

    return grid;
  }

  search(grid) {

    if (!this.finish) {

      let values = this.reduce_puzzle(grid);

      if (!values) {
        return;
      }

      const gridObj = new Functor(values);

      const unfilled = gridObj.filter(
        (x, y) => y.length !== 1).map(
          (x, y) => y.length
      ).toObject();

      if ( Object.keys(unfilled).length !== 0) {
        const s = Object.keys(unfilled).reduce(
          (a, b) => unfilled[a] < unfilled[b] ? a : b);

        values[s].forEach(val => {
          const newSudoku = {...values};
          newSudoku[s] = val;
          let attempt = this.search(newSudoku);
          if (attempt) {
            return attempt;
          }
        });
      } else {
        if (this.validate(values)) {
          this.print(values);
          this.finish = true;
          return null;
        }
      }
    }
  }

  build() {
    // Build boxes
    this.boxes = this.cross(this.rows, this.cols);

    // Build row units
    this.row_units = this.boxes.reduce(
      (a, b, i, arr, c) => (c = ~~(i/9), (a[c] = a[c] || []).push(b), a), []);

    // Build column units
    this.column_units = this.boxes.reduce(
      (a, b, i, arr, c) => (c = ~~(i%9), (a[c] = a[c] || []).push(b), a), []);

    // Build square_units
    this.square_units = this.rs.reduce(
      (x, y) => (this.cs.map(
        z => x.push(this.cross([...y], [...z]))), x) ,[]);

    // Build unit list
    this.unit_list = this.row_units.concat(
      this.column_units, this.square_units);

    // Build units
    this.units = this.boxes.reduce(
      (x, y) => (this.unit_list.map(
        z => z.includes(y) ? (x[y] = x[y] || []).push(z) : ''), x), []);

    // Build peers
    this.peers = Object.keys(this.units).reduce(
      (a, b) => ({...a, [b]: [...new Set([].concat(...this.units[b]).filter(x => x !== b))]}) , {});

    // Build grid
    this.grid = this.boxes.reduce(
      (res, e, i, a, c) => (c = this.unsolved[i], {...res, [e]: c === '.' ? this.cols : [c]}), {});

    this.print(this.grid);

    // Reduce puzzle
    this.grid = this.reduce_puzzle(this.grid);

    // Apply constraint propagation
    this.grid = this.search(this.grid);

    return this.grid;
  }
}
