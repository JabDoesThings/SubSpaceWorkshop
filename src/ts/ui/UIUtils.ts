export const removeAllChildren = (element: HTMLElement) => {
  const count = element.childElementCount;
  if (count === 0) {
    return;
  }
  const children: Element[] = [];
  for (let index = 0; index < element.childElementCount; index++) {
    children.push(element.children.item(index));
  }
  for (let index = 0; index < children.length; index++) {
    element.removeChild(children[index]);
  }
};
