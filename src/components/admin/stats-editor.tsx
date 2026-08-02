"use client";

import { useState } from "react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { STAT_ICONS } from "@/lib/cms/stat-icons";
import { MaterialIcon } from "@/components/ui/material-icon";

export type EditableStat = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  icon: string;
};

function SortableStatCard({
  stat,
  onUpdate,
  onRemove,
}: {
  stat: EditableStat;
  onUpdate: (id: string, patch: Partial<EditableStat>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-border/50 bg-white p-4 ${isDragging ? "z-10 shadow-lg opacity-95" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="flex cursor-grab items-center gap-2 text-muted-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <MaterialIcon name="drag_indicator" className="text-xl" />
          <MaterialIcon name={stat.icon} className="text-2xl text-primary" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(stat.id)}
          className="text-xs font-semibold text-destructive"
        >
          Remove
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Heading</span>
          <input
            value={stat.label}
            onChange={(e) => onUpdate(stat.id, { label: e.target.value })}
            className="h-10 w-full rounded-xl border border-input bg-white px-3"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Value</span>
          <input
            type="number"
            value={stat.value}
            onChange={(e) =>
              onUpdate(stat.id, { value: Number(e.target.value || 0) })
            }
            className="h-10 w-full rounded-xl border border-input bg-white px-3"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Suffix</span>
          <input
            value={stat.suffix || ""}
            onChange={(e) => onUpdate(stat.id, { suffix: e.target.value })}
            placeholder="+"
            className="h-10 w-full rounded-xl border border-input bg-white px-3"
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="text-muted-foreground">Icon</span>
          <select
            value={stat.icon}
            onChange={(e) => onUpdate(stat.id, { icon: e.target.value })}
            className="h-10 w-full rounded-xl border border-input bg-white px-3"
          >
            {STAT_ICONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {STAT_ICONS.slice(0, 12).map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => onUpdate(stat.id, { icon })}
            className={`rounded-lg border p-1.5 ${stat.icon === icon ? "border-primary bg-primary/10" : "border-border"}`}
            title={icon}
          >
            <MaterialIcon name={icon} className="text-[18px]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function withIds(
  initial: Omit<EditableStat, "id">[],
): EditableStat[] {
  return initial.map((s, i) => ({
    ...s,
    id: `stat-${i}-${s.label}`,
  }));
}

export function StatsEditor({
  name = "stats_json",
  initial,
}: {
  name?: string;
  initial: Omit<EditableStat, "id">[];
}) {
  const [stats, setStats] = useState<EditableStat[]>(
    withIds(
      initial.length
        ? initial
        : [
            { label: "Members", value: 10000, suffix: "+", icon: "groups" },
            { label: "Events Held", value: 150, suffix: "+", icon: "event" },
          ],
    ),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function update(id: string, patch: Partial<EditableStat>) {
    setStats((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }

  function addStat() {
    setStats((prev) => [
      ...prev,
      {
        id: `stat-${Date.now()}`,
        label: "New metric",
        value: 0,
        suffix: "+",
        icon: "star",
      },
    ]);
  }

  function removeStat(id: string) {
    setStats((prev) => prev.filter((s) => s.id !== id));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setStats((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  const payload = stats.map(({ label, value, suffix, icon }) => ({
    label,
    value,
    suffix,
    icon,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-medium">Homepage stats</h2>
        <button
          type="button"
          onClick={addStat}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
        >
          Add stat
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Drag cards to set the order shown on the homepage. Choose an icon,
        heading, and number for each.
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={stats.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {stats.map((stat) => (
              <SortableStatCard
                key={stat.id}
                stat={stat}
                onUpdate={update}
                onRemove={removeStat}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <input type="hidden" name={name} value={JSON.stringify(payload)} readOnly />
    </div>
  );
}
