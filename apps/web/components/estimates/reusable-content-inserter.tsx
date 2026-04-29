"use client";

import type { EstimateContentBlock } from "@floorconnector/types";

type ReusableContentInserterProps = {
  scopeBlocks: EstimateContentBlock[];
  termsBlocks: EstimateContentBlock[];
  inclusionBlocks: EstimateContentBlock[];
  exclusionBlocks: EstimateContentBlock[];
  workspaceDefaultsApplied: boolean;
  defaultsSource: "organization" | "platform_fallback";
  onApplyScopeBlock: (blockHtml: string) => void;
  onApplyTermsBlock: (blockHtml: string) => void;
  onApplyInclusionBlock: (blockHtml: string) => void;
  onApplyExclusionBlock: (blockHtml: string) => void;
};

type BlockGroup = {
  key: string;
  title: string;
  emptyMessage: string;
  blocks: EstimateContentBlock[];
  onApply: (blockHtml: string) => void;
};

export function ReusableContentInserter({
  scopeBlocks,
  termsBlocks,
  inclusionBlocks,
  exclusionBlocks,
  workspaceDefaultsApplied,
  defaultsSource,
  onApplyScopeBlock,
  onApplyTermsBlock,
  onApplyInclusionBlock,
  onApplyExclusionBlock
}: ReusableContentInserterProps) {
  const defaultsSourceLabel =
    defaultsSource === "organization"
      ? "Organization defaults"
      : "Platform starter fallback";

  const groups: BlockGroup[] = [
    {
      key: "scope",
      title: "Insert Scope / SOW block",
      emptyMessage: "No reusable scope / SOW blocks are saved yet.",
      blocks: scopeBlocks,
      onApply: onApplyScopeBlock
    },
    {
      key: "terms",
      title: "Insert Terms block",
      emptyMessage: "No reusable terms blocks are saved yet.",
      blocks: termsBlocks,
      onApply: onApplyTermsBlock
    },
    {
      key: "inclusions",
      title: "Insert Inclusion block",
      emptyMessage: "No reusable inclusion blocks are saved yet.",
      blocks: inclusionBlocks,
      onApply: onApplyInclusionBlock
    },
    {
      key: "exclusions",
      title: "Insert Exclusion block",
      emptyMessage: "No reusable exclusion blocks are saved yet.",
      blocks: exclusionBlocks,
      onApply: onApplyExclusionBlock
    }
  ];

  return (
    <div className="border-t border-[#e6e9ef] bg-[#fbfcfe] px-4 py-3">
      <div className="rounded-[10px] border border-[#d7deea] bg-white px-3 py-3 text-[12px] leading-5 text-[#6b7c96]">
        <p className="font-semibold text-[#28456f]">Estimate default source</p>
        <p className="mt-1.5">
          Empty-estimate defaults currently resolve from <span className="font-medium text-[#28456f]">{defaultsSourceLabel}</span>.
          {workspaceDefaultsApplied
            ? " This estimate loaded those starter defaults because the reusable-content areas were empty."
            : " This estimate did not auto-apply them on load because reusable-content areas already had estimate text."}
        </p>
        <p className="mt-2">
          Defaults prefill empty estimates only. Reusable blocks append on demand, and estimate
          import copies from one selected prior estimate in the estimating tools area.
        </p>
        <p className="mt-2">
          Exact field-by-field origin and later edits are not stored on the estimate, so this is a
          best-effort default-source summary rather than a guaranteed edit history.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <div key={group.key} className="rounded-[10px] border border-[#d7deea] bg-white p-3">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#607492]">
              {group.title}
            </p>
            {group.blocks.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {group.blocks.map((block) => (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => group.onApply(block.contentHtml)}
                    className="h-8 border border-[#cfd6e0] bg-white px-3 text-[12px] font-medium text-[#28456f]"
                  >
                    {block.title}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[12px] leading-5 text-[#8a97aa]">{group.emptyMessage}</p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 text-[12px] leading-5 text-[#6b7c96]">
        Estimate-import actions now live in the estimating tools area. Project-details import is
        still coming later and is not part of this reusable-content flow.
      </p>
    </div>
  );
}
