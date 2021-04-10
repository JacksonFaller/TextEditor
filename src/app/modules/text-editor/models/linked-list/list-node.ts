export class ListNode<T> {
  constructor(
    public value: T,
    public prev: ListNode<T> | null = null,
    public next: ListNode<T> | null = null,
  ) {}
}
