import { ListNode } from './list-node';

type EqualityFunction<T> = (element1: T, element2: T) => boolean;
type MapFunction<Tin, Tout> = (element: Tin, index: number, list: LinkedList<Tin>) => Tout;

export class LinkedList<T> implements Iterable<T> {
  protected head: ListNode<T> | null = null;
  private _tail: ListNode<T> | null = null;

  protected get tail(): ListNode<T> | null {
    return this._tail;
  }
  protected set tail(value: ListNode<T> | null) {
    this._tail = value;
  }
  protected _length = 0;

  get length(): number {
    return this._length;
  }

  get first(): ListNode<T> | null {
    return this.head;
  }

  get last(): ListNode<T> | null {
    return this.tail;
  }

  constructor(protected equals: EqualityFunction<T> = LinkedList.equals) {}

  protected static equals<T>(element1: T, element2: T) {
    return element1 === element2;
  }

  *[Symbol.iterator](): IterableIterator<T> {
    let node = this.head;
    while (node !== null) {
      yield node.value;
      node = node.next;
    }
  }

  *nodes(): IterableIterator<ListNode<T>> {
    let node = this.head;
    while (node !== null) {
      yield node;
      node = node.next;
    }
  }

  protected nodeSearch(mapFn: MapFunction<T, boolean>): ListNode<T> | null {
    let node: ListNode<T> | null = this.head;
    let i = 0;
    while (node !== null) {
      if (mapFn(node.value, i, this)) {
        return node;
      }
      node = node.next;
      i++;
    }
    return null;
  }

  append(element: T): ListNode<T> {
    const node = new ListNode(element);
    this.appendNode(node);
    return node;
  }

  appendNode(node: ListNode<T>) {
    if (this.head === null) {
      this.head = node;
    }

    if (this.tail !== null) {
      this.tail.next = node;
      node.prev = this.tail;
    }

    this.tail = node;
    this._length++;
  }

  prepend(element: T): ListNode<T> {
    const node = new ListNode(element);
    this.prependNode(node);
    return node;
  }

  prependNode(node: ListNode<T>) {
    if (this.head !== null) {
      node.next = this.head;
      this.head.prev = node;
    }
    this.head = node;

    if (this.tail === null) {
      this.tail = node;
    }
    this._length++;
  }

  insertAt(element: T, index: number) {
    if (index <= 0) {
      this.prepend(element);
      return;
    }

    if (index >= this.length) {
      this.append(element);
      return;
    }

    const node = this.getElementAt(index);
    if (node) {
      this.insertBefore(node, element);
    }
  }

  removeAt(index: number) {
    const node = this.getElementAt(index);
    if (node === null) return;
    this.remove(node);
  }

  remove(node: ListNode<T>) {
    if (node.prev !== null) {
      node.prev.next = node.next;
    }
    if (node.next !== null) {
      node.next.prev = node.prev;
    }
    if (node == this.head) {
      this.head = node.next;
    }
    if (node == this.tail) {
      this.tail = node.prev;
    }
    this._length--;
  }

  removeAllAfter(node: ListNode<T>): number {
    let temp = node.next;
    let count = 0;
    while (temp !== null) {
      count++;
      temp = temp.next;
    }
    this._length -= count;
    if (node.next !== null) {
      node.next.prev = null;
    }
    node.next = null;
    this.tail = node;
    return count;
  }

  splitAfter(node: ListNode<T>): LinkedList<T> {
    let newList = new LinkedList<T>();
    newList.tail = this.tail;
    newList.head = node.next;
    newList._length = this.removeAllAfter(node);
    return newList;
  }

  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  getElementAt(index: number): ListNode<T> | null {
    if (index < 0 || index >= this.length) {
      return null;
    }
    let node: ListNode<T>;
    if (index < this.length / 2) {
      node = this.head!;
      for (let i = 0; i < index; i++) {
        node = node.next!;
      }
    } else {
      node = this.tail!;
      for (let i = this.length - 1; i >= index; i--) {
        node = node.prev!;
      }
    }
    return node;
  }
  /* eslint-enable @typescript-eslint/no-non-null-assertion */

  findNode(value: T): ListNode<T> | null {
    return this.nodeSearch((x) => this.equals(x, value));
  }

  insertAfter(node: ListNode<T>, element: T): ListNode<T> {
    const newNode = new ListNode(element);
    this.insertNodeAfter(node, newNode);
    return newNode;
  }

  insertNodeAfter(node: ListNode<T>, newNode: ListNode<T>) {
    if (node.next === null) {
      this.tail = newNode;
    } else {
      node.next.prev = newNode;
    }
    newNode.prev = node;
    newNode.next = node.next;
    node.next = newNode;
    this._length++;
  }

  insertManyAfter(node: ListNode<T>, elements: Iterable<T>) {
    let curNode = node;
    for (let element of elements) {
      curNode = this.insertAfter(curNode, element);
    }
  }

  insertBefore(node: ListNode<T>, element: T): ListNode<T> {
    const newNode = new ListNode(element);
    this.insertNodeBefore(node, newNode);
    return newNode;
  }

  insertNodeBefore(node: ListNode<T>, newNode: ListNode<T>) {
    newNode.prev = node.prev;
    newNode.next = node;
    if (node.prev === null) {
      this.head = newNode;
    } else {
      node.prev.next = newNode;
    }
    node.prev = newNode;
    this._length++;
  }

  forEach<Tout>(callbackFn: MapFunction<T, Tout>) {
    if (this.head === null) return;
    let node: ListNode<T> | null = this.head;
    let i = 0;
    while (node !== null) {
      callbackFn(node.value, i, this);
      node = node.next;
      i++;
    }
  }

  find(mapFn: MapFunction<T, boolean>): T | null {
    return this.nodeSearch(mapFn)?.value ?? null;
  }

  appendList(list: LinkedList<T>) {
    if (list.head === null) return;

    if (this.tail === null) {
      this.head = list.head;
      this.tail = list.tail;
    } else {
      this.tail.next = list.head;
      list.head.prev = this.tail;
    }
    this._length += list.length;
  }
}
