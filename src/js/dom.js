export function el(tagName, props = {}, ...children) {
  const node = document.createElement(tagName);
  applyProps(node, props ?? {});
  append(node, children);
  return node;
}

export function append(parent, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) {
      continue;
    }

    if (Array.isArray(child)) {
      append(parent, child);
      continue;
    }

    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function clear(node) {
  node.replaceChildren();
}

function applyProps(node, props) {
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) {
      continue;
    }

    if (key === 'className') {
      node.className = value;
      continue;
    }

    if (key === 'text') {
      node.textContent = String(value);
      continue;
    }

    if (key === 'html') {
      node.innerHTML = value;
      continue;
    }

    if (key === 'dataset') {
      Object.assign(node.dataset, value);
      continue;
    }

    if (key === 'style') {
      if (typeof value === 'string') {
        node.style.cssText = value;
      } else {
        Object.assign(node.style, value);
      }
      continue;
    }

    if (key === 'attrs') {
      for (const [attribute, attributeValue] of Object.entries(value)) {
        if (attributeValue !== null && attributeValue !== undefined && attributeValue !== false) {
          node.setAttribute(attribute, String(attributeValue));
        }
      }
      continue;
    }

    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
      continue;
    }

    if (key in node) {
      node[key] = value;
      continue;
    }

    node.setAttribute(key, value === true ? '' : String(value));
  }
}
