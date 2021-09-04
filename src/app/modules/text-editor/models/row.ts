import { LinkedList } from './linked-list/linked-list';
import { ListNode } from './linked-list/list-node';
import { TextSymbol } from './symbol/text-symbol';

export class Row extends LinkedList<TextSymbol> {
  private _lineEnd: ListNode<TextSymbol> = new ListNode(TextSymbol.lineEnd);

  get lineEnd(): ListNode<TextSymbol> {
    return this._lineEnd;
  }

  static fromList(list: LinkedList<TextSymbol>): Row {
    let row = new Row();
    row._length = list.length;
    row.head = list.first;
    row.tail = list.last;
    return row;
  }

  insertSymbol(
    symbol: TextSymbol,
    toNode: ListNode<TextSymbol>,
    index: number,
  ): { newNode: ListNode<TextSymbol>; after: ListNode<TextSymbol> } {
    const split = toNode.value.split(index);
    const after = new ListNode(split.after, null, toNode.next);
    const newNode = new ListNode(symbol, toNode, after);
    after.prev = newNode;
    if (toNode.next !== null) {
      toNode.next.prev = after;
    } else {
      this.tail = after;
    }
    toNode.next = newNode;
    toNode.value = split.before;
    this._length += 2;
    return { newNode, after };
  }
}
