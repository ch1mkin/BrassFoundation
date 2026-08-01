"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useTransition } from "react";
import {
  reorderGalleryMediaAction,
  updateGalleryMediaTargetAction,
} from "@/lib/content/gallery-org-actions";
import { deleteGalleryMediaAction as deleteLegacy } from "@/lib/content/actions";

type MediaItem = {
  id: string;
  title: string | null;
  media_url: string;
  display_target: string;
  sort_order: number;
};

function SortableCard({
  item,
  onTarget,
}: {
  item: MediaItem;
  onTarget: (id: string, target: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-card overflow-hidden rounded-xl"
    >
      <div
        className="cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.media_url}
          alt={item.title || "Gallery"}
          className="h-28 w-full object-cover"
        />
      </div>
      <div className="space-y-2 p-3">
        <p className="truncate text-xs font-medium">
          {item.title || "Untitled"}
        </p>
        <select
          className="h-8 w-full rounded-lg border border-input bg-white px-2 text-xs"
          value={item.display_target}
          onChange={(e) => onTarget(item.id, e.target.value)}
        >
          <option value="grid">Grid</option>
          <option value="slider">Slider</option>
        </select>
        <form action={deleteLegacy}>
          <input type="hidden" name="id" value={item.id} />
          <button type="submit" className="text-xs font-semibold text-destructive">
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}

export function GallerySortableGrid({
  albumId,
  initialItems,
}: {
  albumId: string;
  initialItems: MediaItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      startTransition(async () => {
        await reorderGalleryMediaAction(
          albumId,
          next.map((i) => i.id),
        );
      });
      return next;
    });
  }

  function onTarget(id: string, target: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, display_target: target } : i)),
    );
    const fd = new FormData();
    fd.set("id", id);
    fd.set("display_target", target);
    startTransition(async () => {
      await updateGalleryMediaTargetAction(fd);
    });
  }

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Drag to rearrange. Order matches the public gallery.
        {pending ? " Saving…" : ""}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => (
              <SortableCard key={item.id} item={item} onTarget={onTarget} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
