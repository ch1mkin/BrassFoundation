"use client";

/**
 * Translate writing content (headings + paragraphs/lists) in parallel batches
 * so the page updates as one complete pass after the loader.
 */

const CONTENT_SELECTOR = [
  "main h1",
  "main h2",
  "main h3",
  "main h4",
  "main h5",
  "main h6",
  "main p",
  "main li",
  "main blockquote",
  "main figcaption",
  "[data-i18n='content']",
].join(",");

const BATCH_SIZE = 12;

function shouldSkip(el: Element) {
  if (
    el.closest(
      ".notranslate, [translate='no'], .material-symbols-outlined, script, style, code, pre, kbd, samp, svg, input, textarea, select, [data-no-i18n], [data-icon]",
    )
  ) {
    return true;
  }
  if (el.closest("header, footer, nav, .notranslate, [translate='no']")) {
    if (el.getAttribute("data-i18n") === "content") return false;
    if (el.closest("header, footer, nav")) return true;
  }
  if (el.classList.contains("material-symbols-outlined")) return true;
  if (el.getAttribute("translate") === "no") return true;
  if (el.classList.contains("notranslate")) return true;
  return false;
}

function isIconLigature(text: string) {
  return /^[a-z0-9_]+$/.test(text) && text.includes("_");
}

function isMostlyCodeOrId(text: string) {
  if (!text) return true;
  if (isIconLigature(text)) return true;
  if (/^https?:\/\//i.test(text)) return true;
  if (/^[\d+\s.,₹$%+-]+$/.test(text)) return true;
  if (/^\d+(\.\d+)?\s*(mb|kb|gb)$/i.test(text)) return true;
  if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+$/i.test(text)) return true;
  if (
    /^(mic|event|school|groups|download|lock|mail|send|menu|home|star)$/i.test(
      text,
    )
  ) {
    return true;
  }
  return false;
}

async function translateText(
  text: string,
  target: "pa" | "hi",
): Promise<string> {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=` +
    encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) throw new Error("translate failed");
  const data = (await res.json()) as Array<Array<[string]>>;
  return (data?.[0] || []).map((part) => part[0]).join("");
}

const cache = new Map<string, string>();

async function cachedTranslate(text: string, target: "pa" | "hi") {
  const key = `${target}::${text.trim()}`;
  if (cache.has(key)) return cache.get(key)!;
  const translated = await translateText(text.trim(), target);
  cache.set(key, translated);
  return translated;
}

function collectTargets(root: ParentNode = document) {
  const nodes = Array.from(root.querySelectorAll(CONTENT_SELECTOR));
  return nodes.filter((el) => {
    if (shouldSkip(el)) return false;
    const text = (el.textContent || "").trim();
    if (text.length < 2) return false;
    if (isMostlyCodeOrId(text)) return false;
    if (el.querySelector(".material-symbols-outlined, [data-icon], svg.lucide"))
      return false;
    return true;
  }) as HTMLElement[];
}

/**
 * Translate every content node, then apply all DOM updates together so the
 * page flips language in one step (while a loader covers the interim).
 */
export async function translateWritingContent(target: "pa" | "hi" = "pa") {
  const targets = collectTargets();
  const jobs: Array<{ el: HTMLElement; original: string }> = [];

  for (const el of targets) {
    const original =
      el.getAttribute("data-i18n-en") || (el.textContent || "").trim();
    if (!original || isMostlyCodeOrId(original)) continue;
    if (!el.getAttribute("data-i18n-en")) {
      el.setAttribute("data-i18n-en", original);
    }
    jobs.push({ el, original });
  }

  const results: Array<{ el: HTMLElement; text: string }> = [];

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    const translated = await Promise.all(
      batch.map(async ({ el, original }) => {
        try {
          const text = await cachedTranslate(original, target);
          return { el, text: text?.trim() || original };
        } catch {
          return { el, text: original };
        }
      }),
    );
    results.push(...translated);
  }

  // Apply all at once after fetches complete
  for (const { el, text } of results) {
    el.textContent = text;
    el.setAttribute("lang", target);
  }
}

export function restoreWritingContent() {
  document.querySelectorAll("[data-i18n-en]").forEach((el) => {
    const original = el.getAttribute("data-i18n-en");
    if (original != null) {
      el.textContent = original;
      el.removeAttribute("lang");
    }
  });
}

/** Lock icons / UI chrome so nothing mangles ligature names. */
export function lockNonContentFromTranslate(root: ParentNode = document) {
  const selectors = [
    ".material-symbols-outlined",
    ".material-symbols-rounded",
    ".material-symbols-sharp",
    "header",
    "footer",
    "nav",
    "[data-icon]",
    "button .material-symbols-outlined",
    "a .material-symbols-outlined",
  ];
  root.querySelectorAll(selectors.join(",")).forEach((el) => {
    el.classList.add("notranslate");
    el.setAttribute("translate", "no");
  });
}
