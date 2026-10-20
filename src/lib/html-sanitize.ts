const ALLOWED_TAGS = new Set([
  'B', 'I', 'U', 'S', 'EM', 'STRONG', 'BR', 'P', 'DIV', 'SPAN',
  'UL', 'OL', 'LI', 'TABLE', 'TR', 'TD', 'TH', 'TBODY', 'THEAD',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HR', 'BLOCKQUOTE',
  'CODE', 'PRE', 'SUB', 'SUP', 'SMALL', 'MARK',
]);

const ALLOWED_ATTRS = new Set(['class', 'style', 'id', 'colspan', 'rowspan', 'align', 'valign']);

const ALLOWED_STYLE_PROPS = new Set([
  'color', 'background-color', 'font-weight', 'font-style', 'text-decoration',
  'text-align', 'font-size', 'margin', 'padding', 'border',
]);

function sanitizeStyle(style: string): string {
  return style
    .split(';')
    .map(prop => prop.trim())
    .filter(prop => {
      if (!prop) return false;
      const key = prop.split(':')[0]?.trim().toLowerCase();
      return key ? ALLOWED_STYLE_PROPS.has(key) : false;
    })
    .filter(prop => {
      const val = prop.split(':')[1]?.trim() ?? '';
      if (val.toLowerCase().includes('javascript:') || val.toLowerCase().includes('expression(')) {
        return false;
      }
      return true;
    })
    .join('; ');
}

export function sanitizeAnkiHtml(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  cleanNode(doc.body);
  return doc.body.innerHTML;
}

function cleanNode(node: Node): void {
  const children = Array.from(node.childNodes);
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tag = el.tagName.toUpperCase();

      if (!ALLOWED_TAGS.has(tag)) {
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'META' || tag === 'OBJECT' || tag === 'EMBED') {
          node.removeChild(child);
          continue;
        }
        const parent = node;
        while (el.firstChild) {
          parent.insertBefore(el.firstChild, el);
        }
        parent.removeChild(el);
        continue;
      }

      const attrs = Array.from(el.attributes);
      for (const attr of attrs) {
        if (!ALLOWED_ATTRS.has(attr.name.toLowerCase())) {
          el.removeAttribute(attr.name);
        } else if (attr.name.toLowerCase() === 'style') {
          const cleaned = sanitizeStyle(attr.value);
          if (cleaned) {
            el.setAttribute('style', cleaned);
          } else {
            el.removeAttribute('style');
          }
        } else if (attr.name.toLowerCase() === 'id') {
          const val = attr.value.toLowerCase();
          if (val.startsWith('on') || val.includes('javascript:')) {
            el.removeAttribute(attr.name);
          }
        }
      }

      for (const eventAttr of ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onmouseenter', 'onmouseleave', 'onchange', 'oninput', 'onsubmit', 'onfocus', 'onblur']) {
        el.removeAttribute(eventAttr);
      }

      cleanNode(el);
    } else if (child.nodeType === Node.TEXT_NODE) {
      // text nodes are safe
    } else {
      node.removeChild(child);
    }
  }
}

export function stripHtml(html: string): string {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent?.trim() ?? '';
}
