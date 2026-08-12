"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/material-icon";
import { cdnMediaUrl } from "@/lib/media/cdn";
import type { FamilyTreePerson } from "@/lib/content/family-tree-data";
import { cn } from "@/lib/utils";

type LaidOut = FamilyTreePerson & {
  children: LaidOut[];
  x: number;
  y: number;
  subtreeWidth: number;
};

const NODE_W = 148;
const NODE_H = 118;
const GAP_X = 28;
const GAP_Y = 56;

function buildForest(people: FamilyTreePerson[]): LaidOut[] {
  const map = new Map<string, LaidOut>();
  people.forEach((p) =>
    map.set(p.id, { ...p, children: [], x: 0, y: 0, subtreeWidth: NODE_W }),
  );
  const roots: LaidOut[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId) && node.parentId !== node.id) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function measure(node: LaidOut) {
  node.children.forEach(measure);
  if (!node.children.length) {
    node.subtreeWidth = NODE_W;
    return;
  }
  const kids =
    node.children.reduce((sum, c) => sum + c.subtreeWidth, 0) +
    GAP_X * (node.children.length - 1);
  node.subtreeWidth = Math.max(NODE_W, kids);
}

function place(node: LaidOut, left: number, y: number) {
  node.y = y;
  if (!node.children.length) {
    node.x = left + node.subtreeWidth / 2;
    return;
  }
  let cursor = left + (node.subtreeWidth - childrenWidth(node)) / 2;
  for (const child of node.children) {
    place(child, cursor, y + NODE_H + GAP_Y);
    cursor += child.subtreeWidth + GAP_X;
  }
  const first = node.children[0]!;
  const last = node.children[node.children.length - 1]!;
  node.x = (first.x + last.x) / 2;
}

function childrenWidth(node: LaidOut) {
  if (!node.children.length) return NODE_W;
  return (
    node.children.reduce((sum, c) => sum + c.subtreeWidth, 0) +
    GAP_X * (node.children.length - 1)
  );
}

function flatten(nodes: LaidOut[], out: LaidOut[] = []) {
  for (const n of nodes) {
    out.push(n);
    flatten(n.children, out);
  }
  return out;
}

function PersonCard({ node }: { node: LaidOut }) {
  return (
    <div
      className="absolute flex w-[132px] -translate-x-1/2 flex-col items-center text-center"
      style={{ left: node.x, top: node.y }}
    >
      <div className="relative">
        <div
          className={cn(
            "flex size-14 items-center justify-center overflow-hidden rounded-full border-2 bg-white shadow-md",
            node.kind === "org"
              ? "border-primary"
              : node.kind === "referral"
                ? "border-secondary"
                : "border-white",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cdnMediaUrl(node.avatarUrl) || "/brand/logo.png"}
            alt=""
            className="size-full object-cover"
          />
        </div>
        {node.familyCount > 0 ? (
          <span
            className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full border-2 border-white bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-md"
            title={`${node.familyCount} family member${node.familyCount === 1 ? "" : "s"}`}
          >
            <MaterialIcon name="groups" className="text-[12px]" />
            {node.familyCount}
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 max-w-full truncate text-[11px] font-semibold leading-tight">
        {node.name}
      </p>
      <p className="max-w-full truncate text-[10px] leading-tight text-primary">
        {node.role}
      </p>
    </div>
  );
}

export function FamilyTreeViewport({ people }: { people: FamilyTreePerson[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.72);
  const [pan, setPan] = useState({ x: 0, y: 24 });
  const drag = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);

  const { nodes, width, height, lines } = useMemo(() => {
    const roots = buildForest(people);
    roots.forEach(measure);
    let left = 40;
    for (const root of roots) {
      place(root, left, 32);
      left += root.subtreeWidth + 80;
    }
    const all = flatten(roots);
    const maxX = all.reduce((m, n) => Math.max(m, n.x), 0);
    const maxY = all.reduce((m, n) => Math.max(m, n.y), 0);
    const connectors: Array<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }> = [];
    for (const n of all) {
      for (const c of n.children) {
        connectors.push({
          x1: n.x,
          y1: n.y + 78,
          x2: c.x,
          y2: c.y,
        });
      }
    }
    return {
      nodes: all,
      width: Math.max(maxX + 120, 640),
      height: Math.max(maxY + NODE_H + 80, 420),
      lines: connectors,
    };
  }, [people]);

  function clampScale(next: number) {
    return Math.min(2.4, Math.max(0.18, next));
  }

  function zoomBy(delta: number) {
    setScale((s) => clampScale(s + delta));
  }

  function fit() {
    const box = viewportRef.current;
    if (!box) return;
    const sx = (box.clientWidth - 32) / width;
    const sy = (box.clientHeight - 32) / height;
    setScale(clampScale(Math.min(sx, sy, 1)));
    setPan({ x: 0, y: 16 });
  }

  useEffect(() => {
    fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const dir = e.deltaY > 0 ? -0.08 : 0.08;
      setScale((s) => clampScale(s + dir));
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setPan({
      x: drag.current.panX + (e.clientX - drag.current.x),
      y: drag.current.panY + (e.clientY - drag.current.y),
    });
  }

  function onPointerUp() {
    drag.current = null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface-low shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-semibold">Family tree</p>
          <p className="text-xs text-muted-foreground">
            Referrals branch from their referrer · family size shown on profile ·
            drag to pan · scroll to zoom
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => zoomBy(-0.12)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-white text-lg font-semibold"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="w-12 text-center text-xs font-semibold">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => zoomBy(0.12)}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-white text-lg font-semibold"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={fit}
            className="h-9 rounded-lg border border-border bg-white px-3 text-xs font-semibold"
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() => {
              setScale(1);
              setPan({ x: 0, y: 24 });
            }}
            className="h-9 rounded-lg border border-border bg-white px-3 text-xs font-semibold"
          >
            100%
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
      className="relative h-[min(78vh,820px)] cursor-grab overflow-hidden select-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute left-1/2 top-0 origin-top"
          style={{
            width,
            height,
            transform: `translate(calc(-50% + ${pan.x}px), ${pan.y}px) scale(${scale})`,
          }}
        >
          <svg
            className="pointer-events-none absolute inset-0"
            width={width}
            height={height}
            aria-hidden
          >
            {lines.map((line, i) => {
              const midY = (line.y1 + line.y2) / 2;
              return (
                <path
                  key={i}
                  d={`M ${line.x1} ${line.y1} V ${midY} H ${line.x2} V ${line.y2}`}
                  fill="none"
                  stroke="rgba(0,104,117,0.35)"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
          {nodes.map((node) => (
            <PersonCard key={node.id} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
}
