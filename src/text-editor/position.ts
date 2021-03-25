export class Position {
  row = 0;
  col = 0;

  constructor(col: number, row: number) {
    this.row = row;
    this.col = col;
  }
}

export class Coordinates {
  x = 0;
  y = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Interval {
  start = 0;
  end = 0;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }
}
