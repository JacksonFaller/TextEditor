export class Cursor {
  position = [0, 0];
  coord = [0, 0];
  visibility = false;
  interval: NodeJS.Timeout | undefined;

  moveCursor(x: number, y: number, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const rowInd = this.findRowIndexByAttribute(element);
    if (Number.isNaN(rowInd)) {
      return;
    }
    const colInd = this.findColumnIndex(x - rect.left);
    this.position = [colInd, rowInd];
    this.coord = this.getCoord(colInd, rowInd);
    console.error(this.position);
  }

  moveToRow(rowInd: number, colInd: number) {
    this.position = [colInd, rowInd];
    this.coord = this.getCoord(colInd, rowInd);
  }

  getCoord(colInd: number, rowInd: number): Array<number> {
    return [colInd * 8, rowInd * 17];
  }

  animate() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      this.visibility = !this.visibility;
    }, 550);
  }

  hide() {
    if (!this.interval) {
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

  /// TODO: rewrite this shit to actually calculate column index by creating an element with text and measuring its width
  findColumnIndex(x: number): number {
    return Math.round(x / 8);
  }
}
