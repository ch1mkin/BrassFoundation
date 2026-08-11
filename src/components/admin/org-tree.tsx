"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type Node = {
  id: string;
  parent_id: string | null;
  full_name: string;
  role_title: string;
  avatar_url: string | null;
  sort_order: number;
};

type TreeNode = Node & { children: TreeNode[] };

function buildTree(nodes: Node[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  nodes.forEach((n) => map.set(n.id, { ...n, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortRec = (list: TreeNode[]) => {
    list.sort((a, b) => a.sort_order - b.sort_order);
    list.forEach((c) => sortRec(c.children));
  };
  sortRec(roots);
  return roots;
}

function PersonCard({
  node,
  size = "md",
}: {
  node: TreeNode;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg" ? "size-16" : size === "sm" ? "size-11" : "size-14";
  return (
    <div className="relative z-10 flex w-[7.5rem] flex-col items-center text-center sm:w-32">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={node.avatar_url || "/brand/logo.png"}
        alt={node.full_name}
        className={cn(
          "rounded-full border-2 border-white bg-white object-cover shadow-md",
          dim,
        )}
      />
      <p className="mt-1.5 max-w-full truncate text-[11px] font-semibold leading-tight text-foreground">
        {node.full_name}
      </p>
      <p className="max-w-full truncate text-[10px] leading-tight text-primary">
        {node.role_title}
      </p>
    </div>
  );
}

function TreeBranch({
  node,
  isRoot = false,
}: {
  node: TreeNode;
  isRoot?: boolean;
}) {
  const kids = node.children;
  const hasKids = kids.length > 0;

  return (
    <li
      className={cn(
        "relative flex flex-col items-center px-2",
        !isRoot && "pt-8",
      )}
    >
      {/* Vertical connector from parent horizontal line down to this node */}
      {!isRoot ? (
        <span
          className="absolute top-0 left-1/2 h-8 w-px -translate-x-1/2 bg-primary/40"
          aria-hidden
        />
      ) : null}

      <PersonCard node={node} size={isRoot ? "lg" : "md"} />

      {hasKids ? (
        <>
          {/* Stem down from this node */}
          <span
            className="mt-2 h-6 w-px bg-primary/40"
            aria-hidden
          />
          <ul
            className={cn(
              "relative flex flex-row flex-wrap justify-center",
              kids.length === 1 ? "" : "gap-x-2 sm:gap-x-4",
            )}
          >
            {/* Horizontal bar across siblings */}
            {kids.length > 1 ? (
              <span
                className="absolute top-0 left-[12.5%] right-[12.5%] h-px bg-primary/40 sm:left-[10%] sm:right-[10%]"
                aria-hidden
              />
            ) : null}
            {kids.map((child) => (
              <TreeBranch key={child.id} node={child} />
            ))}
          </ul>
        </>
      ) : null}
    </li>
  );
}

export function OrgTree({ nodes }: { nodes: Node[] }) {
  const tree = useMemo(() => buildTree(nodes), [nodes]);

  return (
    <div
      id="org-family-tree"
      className="overflow-x-auto rounded-2xl bg-surface-low p-6 sm:p-8"
    >
      <p className="mb-6 text-center text-xs text-muted-foreground">
        Organization tree — members connect under BRASS Foundation. Scroll
        horizontally on small screens if needed.
      </p>
      {tree.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Add people to build the family tree.
        </p>
      ) : (
        <ul className="flex min-w-max justify-center gap-8 pb-4">
          {tree.map((node) => (
            <TreeBranch key={node.id} node={node} isRoot />
          ))}
        </ul>
      )}
    </div>
  );
}
