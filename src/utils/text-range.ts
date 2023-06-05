/**
 * @description: 通过 range 插入文本
 *  @param {text}  插入的文本
 *  @param {targetRange}  插入位置的 range 对象
 */
export function insertTextByRange(text: string, targetRange: Range) {
  const selection = getSelection()!;
  const range = document.createRange();
  const { startContainer, startOffset, endContainer, endOffset } = targetRange;

  // 创建 text dom
  const wrapDom = document.createElement("div");
  wrapDom.innerHTML = text;
  const { firstChild: atDom, lastChild: emptyDom } = wrapDom;

  // 插入 text dom
  const frag = document.createDocumentFragment();
  frag.appendChild(atDom!);
  frag.appendChild(emptyDom!);
  range.setStart(startContainer, startOffset);
  range.setEnd(endContainer, endOffset);
  range.insertNode(frag);

  // 移动光标到 emptyDom 后
  range.setStart(emptyDom!, 0);
  range.setEnd(emptyDom!, 0);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * @description: 通过 range 对象删除文本
 *  @param {startRange}  起始删除的 range 对象
 *  @param {endRange}  结束删除的 range 对象
 */
export function deleteByRange(startRange: Range, endRange: Range) {
  const range = document.createRange();

  const { startContainer, startOffset } = startRange;
  const { endContainer, endOffset } = endRange;
  range.setStart(startContainer, startOffset - 1);
  range.setEnd(endContainer, endOffset);
  range.deleteContents();
}

/**
 * @description: 通过 range 获取文本
 *  @param {startRange}  获取文本的起始 range 对象
 *  @param {endRange}  获取文本的末尾 range 对象
 * @return {*}
 */
export function getRangeWord(startRange: Range, endRange: Range) {
  const range = document.createRange();
  const selection = getSelection()!;

  const { startContainer, startOffset } = startRange;
  const { endContainer, endOffset } = endRange;
  range.setStart(startContainer, startOffset);
  range.setEnd(endContainer, endOffset);
  selection.removeAllRanges();
  selection.addRange(range);
  const keyWord = selection.toString();

  // 恢复光标定位
  range.setStart(endContainer, endOffset);
  range.setEnd(endContainer, endOffset);
  selection.removeAllRanges();
  selection.addRange(range);

  return keyWord;
}
