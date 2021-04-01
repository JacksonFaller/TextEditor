import { Coordinates, Position } from './position';

export class Cursor {
  position = new Position(0, 0);
  coord = new Coordinates(0, 0);
  visibility = false;
  interval?: NodeJS.Timeout;

  // TODO: Calculate these values
  private symbolWidth = 8;
  private symbolHeight = 17;

  moveCursor(x: number, y: number, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const rowInd = this.findRowIndexByAttribute(element);
    if (Number.isNaN(rowInd)) {
      return;
    }
    const colInd = this.findColumnIndex(x - rect.left);
    this.position = new Position(colInd, rowInd);
    this.coord = this.getCoord(colInd, rowInd);
    console.error(this.position);
  }

  moveToRow(rowInd: number, colInd: number) {
    this.position = new Position(colInd, rowInd);
    this.coord = this.getCoord(colInd, rowInd);
  }

  getCoord(colInd: number, rowInd: number): Coordinates {
    return new Coordinates(colInd * this.symbolWidth, rowInd * this.symbolHeight);
  }

  animate() {
    if (this.interval) return;
    this.visibility = true;
    this.interval = setInterval(() => {
      this.visibility = !this.visibility;
    }, 550);
  }

  hide() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    this.visibility = false;
  }

  findRowIndexByAttribute(element: HTMLElement | null): number {
    let ind: string | null = null;
    while (element) {
      ind = element.getAttribute('ind');
      if (ind != null) {
        break;
      }
      element = element.parentElement;
    }
    return ind != null ? Number.parseInt(ind) : NaN;
  }

  findColumnIndex(x: number): number {
    return Math.round(x / this.symbolWidth);
  }
}
