"use client";

import { useMemo, useState } from "react";
import type { EstimateContentBlock } from "@floorconnector/types";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

type ContentBlockManagerProps = {
  returnTo: string;
  blocks: EstimateContentBlock[];
  saveAction: (formData: FormData) => void | Promise<void>;
};

type DrawerState = {
  block: EstimateContentBlock | null;
  blockType: EstimateContentBlock["blockType"];
};

function createEmptyBlock(
  blockType: EstimateContentBlock["blockType"]
): EstimateContentBlock {
  return {
    id: "",
    organizationId: "",
    blockType,
    title: "",
    contentHtml: "",
    status: "active",
    sortOrder: 0,
    createdAt: "",
    updatedAt: ""
  };
}

export function ContentBlockManager({
  returnTo,
  blocks,
  saveAction
}: ContentBlockManagerProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | EstimateContentBlock["blockType"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");
  const [drawerState, setDrawerState] = useState<DrawerState | null>(null);
  const [contentHtml, setContentHtml] = useState("");
  const filteredBlocks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return blocks.filter((block) => {
      if (typeFilter !== "all" && block.blockType !== typeFilter) {
        return false;
      }

      if (statusFilter !== "all" && block.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [block.title, block.contentHtml, block.blockType]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [blocks, search, statusFilter, typeFilter]);

  function openDrawer(block: EstimateContentBlock | null, blockType?: EstimateContentBlock["blockType"]) {
    const nextBlock = block ?? createEmptyBlock(blockType ?? "scope");

    setDrawerState({
      block,
      blockType: nextBlock.blockType
    });
    setContentHtml(nextBlock.contentHtml);
  }

  function closeDrawer() {
    setDrawerState(null);
    setContentHtml("");
  }

  return (
    <section className="space-y-4 rounded-[22px] border border-[#d8e0eb] bg-white p-5 shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607492]">
            Reusable Content Blocks
          </p>
          <h3 className="mt-2 text-[1.5rem] font-semibold tracking-tight text-[#17243b]">
            Scope, inclusions, and exclusions
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f7190]">
            Keep estimate language reusable without building a second template system. These blocks feed estimate terms, scope, inclusions, and exclusions directly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openDrawer(null, "terms")}
            className="rounded-full border border-[#d7deea] bg-white px-4 py-2 text-sm font-medium text-[#28456f]"
          >
            New Terms Block
          </button>
          <button
            type="button"
            onClick={() => openDrawer(null, "scope")}
            className="rounded-full bg-[#1f5fd6] px-4 py-2 text-sm font-medium text-white"
          >
            New Scope Block
          </button>
          <button
            type="button"
            onClick={() => openDrawer(null, "inclusion")}
            className="rounded-full border border-[#d7deea] bg-white px-4 py-2 text-sm font-medium text-[#28456f]"
          >
            New Inclusion
          </button>
          <button
            type="button"
            onClick={() => openDrawer(null, "exclusion")}
            className="rounded-full border border-[#d7deea] bg-white px-4 py-2 text-sm font-medium text-[#28456f]"
          >
            New Exclusion
          </button>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px]">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search content blocks"
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
        />
        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as "all" | EstimateContentBlock["blockType"])
          }
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
        >
          <option value="all">All types</option>
          <option value="terms">Terms</option>
          <option value="scope">Scope</option>
          <option value="inclusion">Inclusion</option>
          <option value="exclusion">Exclusion</option>
        </select>
        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "all" | "active" | "archived")
          }
          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-[#d8e0eb]">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#f6f8fc] text-left text-[11px] uppercase tracking-[0.12em] text-[#7c8ba3]">
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Title</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Preview</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlocks.map((block) => (
              <tr key={block.id} className="border-t border-[#edf1f6] text-sm text-[#334a70]">
                <td className="px-3 py-3 capitalize">{block.blockType}</td>
                <td className="px-3 py-3 font-medium">{block.title}</td>
                <td className="px-3 py-3 capitalize">{block.status}</td>
                <td className="px-3 py-3 text-[#6f8098]">
                  <div
                    className="line-clamp-2 max-w-[420px]"
                    dangerouslySetInnerHTML={{ __html: block.contentHtml }}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openDrawer(block)}
                      className="rounded-full border border-[#d7deea] bg-white px-3 py-2 text-xs font-medium text-[#28456f]"
                    >
                      Edit
                    </button>
                    <form action={saveAction}>
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <input type="hidden" name="blockId" value={block.id} />
                      <input type="hidden" name="blockType" value={block.blockType} />
                      <input type="hidden" name="title" value={block.title} />
                      <input type="hidden" name="contentHtml" value={block.contentHtml} />
                      <input
                        type="hidden"
                        name="status"
                        value={block.status === "active" ? "archived" : "active"}
                      />
                      <input type="hidden" name="sortOrder" value={block.sortOrder} />
                      <button
                        type="submit"
                        className="rounded-full border border-[#d7deea] bg-white px-3 py-2 text-xs font-medium text-[#28456f]"
                      >
                        {block.status === "active" ? "Archive" : "Reactivate"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {drawerState ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#122033]/55">
          <button
            type="button"
            onClick={closeDrawer}
            className="absolute inset-0"
            aria-label="Close content block drawer"
          />
          <aside className="relative z-10 flex h-full w-full max-w-[860px] flex-col overflow-y-auto border-l border-[#d6dce6] bg-[#f8fbff] shadow-[-32px_0_80px_-48px_rgba(15,23,42,0.6)]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#dde5ef] bg-white px-6 py-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#486180]">
                  Content Block
                </p>
                <h3 className="mt-2 text-[1.85rem] font-semibold tracking-[-0.02em] text-[#183153]">
                  {drawerState.block ? `Edit ${drawerState.block.title}` : "Create reusable content"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#d7e0ea] bg-white text-[13px] font-medium text-[#4b5d75]"
              >
                X
              </button>
            </div>

            <form action={saveAction} className="space-y-4 p-5">
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="blockId" value={drawerState.block?.id ?? ""} />
              <input type="hidden" name="contentHtml" value={contentHtml} />
              <input
                type="hidden"
                name="sortOrder"
                value={drawerState.block?.sortOrder ?? 0}
              />

              <div className="rounded-[22px] border border-[#dde5ef] bg-white p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">Type</span>
                    <select
                      name="blockType"
                      defaultValue={drawerState.block?.blockType ?? drawerState.blockType}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                      <option value="terms">Terms</option>
                      <option value="scope">Scope</option>
                      <option value="inclusion">Inclusion</option>
                      <option value="exclusion">Exclusion</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-800">Status</span>
                    <select
                      name="status"
                      defaultValue={drawerState.block?.status ?? "active"}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-800">Title</span>
                    <input
                      name="title"
                      defaultValue={drawerState.block?.title ?? ""}
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#dde5ef] bg-white p-5">
                <p className="mb-3 text-sm font-medium text-slate-800">Shared editor</p>
                <RichTextEditor
                  label="Content"
                  value={contentHtml}
                  onChange={setContentHtml}
                  mode="document"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="rounded-full border border-[#d7deea] bg-white px-4 py-2 text-sm font-medium text-[#28456f]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#1f5fd6] px-4 py-2 text-sm font-medium text-white"
                >
                  Save Block
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
