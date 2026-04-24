const ALLOWED_TAGS = new Set([
  "a",
  "article",
  "b",
  "blockquote",
  "br",
  "div",
  "em",
  "font",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "li",
  "ol",
  "p",
  "section",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul"
]);

const URI_SAFE_PREFIXES = ["http://", "https://", "mailto:", "tel:", "#", "/"];
const SAFE_ALIGNMENT_VALUES = new Set(["left", "center", "right", "justify"]);

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeHref(value: string) {
  const trimmed = value.trim();
  const lowered = trimmed.toLowerCase();

  if (URI_SAFE_PREFIXES.some((prefix) => lowered.startsWith(prefix))) {
    return trimmed;
  }

  return null;
}

function sanitizeTextAlign(value: string) {
  const trimmed = value.trim().toLowerCase();

  return SAFE_ALIGNMENT_VALUES.has(trimmed) ? trimmed : null;
}

function sanitizeStyle(value: string) {
  const safeDeclarations: string[] = [];

  for (const declaration of value.split(";")) {
    const [rawProperty, rawValue] = declaration.split(":");

    if (!rawProperty || !rawValue) {
      continue;
    }

    const property = rawProperty.trim().toLowerCase();
    const propertyValue = rawValue.trim();

    if (!propertyValue) {
      continue;
    }

    if (property === "text-align") {
      const safeAlignment = sanitizeTextAlign(propertyValue);

      if (safeAlignment) {
        safeDeclarations.push(`text-align:${safeAlignment}`);
      }
      continue;
    }

    if (property === "font-family") {
      const safeValue = propertyValue.replace(/[^a-z0-9,\- "'"]/gi, "").trim();

      if (safeValue) {
        safeDeclarations.push(`font-family:${safeValue}`);
      }
      continue;
    }

    if (property === "font-size") {
      const safeValue = propertyValue.replace(/[^0-9.%a-z-]/gi, "").trim();

      if (safeValue) {
        safeDeclarations.push(`font-size:${safeValue}`);
      }
      continue;
    }

    if (property === "text-decoration") {
      const safeValue = propertyValue.replace(/[^a-z\s-]/gi, "").trim().toLowerCase();

      if (safeValue === "underline") {
        safeDeclarations.push("text-decoration:underline");
      }
    }
  }

  return safeDeclarations.length > 0 ? safeDeclarations.join(";") : null;
}

function sanitizeTagAttributes(tagName: string, rawAttributes: string) {
  const attributes: string[] = [];
  const styleDeclarations: string[] = [];
  const attributePattern =
    /([a-zA-Z0-9:-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attributePattern.exec(rawAttributes)) !== null) {
    const name = match[1]?.toLowerCase();
    const value = match[3] ?? match[4] ?? match[5] ?? "";

    if (!name || name.startsWith("on")) {
      continue;
    }

    if (name === "href" && tagName === "a") {
      const safeHref = sanitizeHref(value);

      if (safeHref) {
        attributes.push(`href="${escapeHtml(safeHref)}"`);
      }
      continue;
    }

    if (name === "target" && tagName === "a") {
      const safeTarget = value === "_blank" ? "_blank" : "_self";
      attributes.push(`target="${safeTarget}"`);
      if (safeTarget === "_blank") {
        attributes.push('rel="noopener noreferrer"');
      }
      continue;
    }

    if (name === "rel" && tagName === "a") {
      continue;
    }

    if (name === "style") {
      const safeStyle = sanitizeStyle(value);

      if (safeStyle) {
        styleDeclarations.push(safeStyle);
      }
      continue;
    }

    if (name === "align") {
      const safeAlign = sanitizeTextAlign(value);

      if (safeAlign) {
        styleDeclarations.push(`text-align:${safeAlign}`);
      }
      continue;
    }

    if (tagName === "font" && name === "face") {
      const safeFace = value.replace(/[^a-z0-9,\- "'"]/gi, "").trim();

      if (safeFace) {
        attributes.push(`face="${escapeHtml(safeFace)}"`);
      }
      continue;
    }

    if (tagName === "font" && name === "size") {
      const safeSize = value.replace(/[^0-9+-]/g, "").trim();

      if (safeSize) {
        attributes.push(`size="${escapeHtml(safeSize)}"`);
      }
    }
  }

  if (styleDeclarations.length > 0) {
    attributes.push(`style="${escapeHtml(styleDeclarations.join(";"))}"`);
  }

  return attributes.length > 0 ? ` ${attributes.join(" ")}` : "";
}

export function sanitizeHtml(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<(iframe|object|embed|meta|link|base)[^>]*?>/gi, "")
    .replace(/<\s*\/?\s*([a-zA-Z0-9]+)([^>]*)>/g, (match, rawTagName: string, rawAttributes: string) => {
      const tagName = rawTagName.toLowerCase();
      const isClosingTag = /^<\s*\//.test(match);

      if (!ALLOWED_TAGS.has(tagName)) {
        return "";
      }

      if (isClosingTag) {
        return `</${tagName}>`;
      }

      const safeAttributes = sanitizeTagAttributes(tagName, rawAttributes ?? "");
      const selfClosing = /\/\s*>$/.test(match) || tagName === "br" || tagName === "hr";

      return selfClosing
        ? `<${tagName}${safeAttributes}>`
        : `<${tagName}${safeAttributes}>`;
    });
}

export function hasMeaningfulSanitizedHtml(value: string | null | undefined) {
  const sanitized = sanitizeHtml(value);
  const plain = sanitized
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plain.length > 0;
}

export function escapeHtmlText(value: string) {
  return escapeHtml(value);
}
