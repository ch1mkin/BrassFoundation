"use client";

import { useMemo } from "react";

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

function TreeBranch({ node }: { node: TreeNode }) {
  return (
    <li className="relative flex flex-col items-center">
      <div className="flex w-28 flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={node.avatar_url || "/brand/logo.png"}
          alt={node.full_name}
          className="size-14 rounded-full border-2 border-white object-cover shadow-md bg-white"
        />
        <p className="mt-1 max-w-full truncate text-[10px] font-semibold leading-tight text-foreground">
          {node.full_name}
        </p>
        <p className="max-w-full truncate text-[9px] leading-tight text-primary">
          {node.role_title}
        </p>
      </div>
      {node.children.length > 0 ? (
        <ul className="mt-6 flex flex-wrap justify-center gap-6 border-t border-border/60 pt-6">
          {node.children.map((child) => (
            <TreeBranch key={child.id} node={child} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function OrgTree({ nodes }: { nodes: Node[] }) {
  const tree = useMemo(() => buildTree(nodes), [nodes]);

  return (
    <div
      id="org-family-tree"
      className="overflow-x-auto rounded-2xl bg-surface-low p-8"
    >
      <p className="mb-6 text-center text-xs text-muted-foreground">
        Tip: zoom out or use your OS screenshot tool on this panel.
      </p>
      {tree.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Add people to build the family tree.
        </p>
      ) : (
        <ul className="flex flex-wrap justify-center gap-10">
          {tree.map((node) => (
            <TreeBranch key={node.id} node={node} />
          ))}
        </ul>
      )}
    </div>
  );
}
