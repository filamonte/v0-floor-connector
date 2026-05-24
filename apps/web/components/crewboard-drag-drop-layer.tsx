"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type {
  CrewBoardDropTarget,
  CrewBoardMoveProposalJob
} from "@/lib/schedule/proposed-move";

type CrewBoardDragDropLayerProps = {
  children: ReactNode;
};

type CrewBoardDraggableJobProps = {
  children: ReactNode;
  className?: string;
  job: CrewBoardMoveProposalJob;
  label: string;
};

type CrewBoardDropTargetProps = {
  children: ReactNode;
  className?: string;
  target: CrewBoardDropTarget;
};

type DragData = {
  job?: CrewBoardMoveProposalJob;
};

type DropData = {
  target?: CrewBoardDropTarget;
};

function getIdPart(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value.trim() : "none";
}

function getDropTargetId(target: CrewBoardDropTarget): UniqueIdentifier {
  if (target.kind === "unscheduled") {
    return "crewboard-target-unscheduled";
  }

  if (target.kind === "date") {
    return `crewboard-target-date-${target.date}`;
  }

  return [
    "crewboard-target-time",
    target.date,
    getIdPart(target.startTime),
    getIdPart(target.endTime)
  ].join("-");
}

function buildPreparedMoveSearchParams(
  currentParams: URLSearchParams,
  job: CrewBoardMoveProposalJob,
  target: CrewBoardDropTarget
) {
  const nextParams = new URLSearchParams(currentParams.toString());

  nextParams.set("jobId", job.id);
  nextParams.set("action", "schedule");
  nextParams.delete("moveTarget");
  nextParams.delete("moveDate");
  nextParams.delete("moveStart");
  nextParams.delete("moveEnd");

  if (target.kind === "unscheduled") {
    nextParams.set("moveTarget", "unscheduled");
    return nextParams;
  }

  nextParams.set("moveDate", target.date);

  if (target.kind === "time_bucket") {
    nextParams.set("moveStart", target.startTime);

    if (target.endTime) {
      nextParams.set("moveEnd", target.endTime);
    }
  }

  return nextParams;
}

function focusScheduleAction() {
  window.setTimeout(() => {
    const actionPanel = document.getElementById("schedule-action");

    if (!actionPanel) {
      return;
    }

    if (!actionPanel.hasAttribute("tabindex")) {
      actionPanel.setAttribute("tabindex", "-1");
    }

    actionPanel.focus({ preventScroll: true });
    actionPanel.scrollIntoView({ block: "start", behavior: "smooth" });
  }, 150);
}

export function CrewBoardDragDropLayer({
  children
}: CrewBoardDragDropLayerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeJobLabel, setActiveJobLabel] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Drag is optional. You can also use Move schedule."
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  useEffect(() => {
    const hasPreparedMove =
      searchParams.has("moveTarget") || searchParams.has("moveDate");

    if (searchParams.get("action") === "schedule" && hasPreparedMove) {
      focusScheduleAction();
    }
  }, [searchParams]);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as DragData | undefined;
    const jobId = data?.job?.id;

    setActiveJobLabel(jobId ?? "selected job");
    setStatusMessage("Choose a CrewBoard target, then review before saving.");
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveJobLabel(null);

    const dragData = event.active.data.current as DragData | undefined;
    const dropData = event.over?.data.current as DropData | undefined;
    const job = dragData?.job;
    const target = dropData?.target;

    if (!job || !target) {
      setStatusMessage("Move not prepared. Choose a valid CrewBoard target.");
      return;
    }

    const nextParams = buildPreparedMoveSearchParams(
      new URLSearchParams(searchParams.toString()),
      job,
      target
    );

    setStatusMessage("Move prepared. Review Move schedule before saving.");
    router.push(`${pathname}?${nextParams.toString()}#schedule-action`);
    focusScheduleAction();
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragCancel={() => {
        setActiveJobLabel(null);
        setStatusMessage("Move canceled. You can also use Move schedule.");
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="rounded-[4px] border border-dashed border-[var(--border-warm)] bg-white px-3 py-2 text-xs leading-5 text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">
          Move schedule:
        </span>{" "}
        Drag is optional. You can also use Move schedule.
        <span className="sr-only" aria-live="polite">
          {activeJobLabel ? `Moving ${activeJobLabel}. ` : ""}
          {statusMessage}
        </span>
      </div>
      {children}
    </DndContext>
  );
}

export function CrewBoardDraggableJob({
  children,
  className,
  job,
  label
}: CrewBoardDraggableJobProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `crewboard-job-${job.id}`,
      data: {
        job
      } satisfies DragData
    });
  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        className,
        "touch-manipulation",
        isDragging ? "opacity-70 ring-2 ring-[var(--copper)]" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      {...attributes}
      {...listeners}
      aria-label={`Prepare move for ${label}`}
    >
      {children}
    </div>
  );
}

export function CrewBoardDropTarget({
  children,
  className,
  target
}: CrewBoardDropTargetProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: getDropTargetId(target),
    data: {
      target
    } satisfies DropData
  });

  return (
    <div
      ref={setNodeRef}
      className={[
        className,
        isOver ? "ring-2 ring-[var(--copper)] ring-offset-2" : ""
      ]
        .filter(Boolean)
        .join(" ")}
      data-crewboard-drop-target={target.kind}
      data-crewboard-drop-date={"date" in target ? target.date : undefined}
      data-crewboard-drop-start={
        target.kind === "time_bucket" ? target.startTime : undefined
      }
      data-crewboard-drop-end={
        target.kind === "time_bucket" && target.endTime
          ? target.endTime
          : undefined
      }
      aria-label={`CrewBoard move target ${target.label ?? target.kind}`}
    >
      {children}
    </div>
  );
}
