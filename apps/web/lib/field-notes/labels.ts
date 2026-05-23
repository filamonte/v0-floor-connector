export function getFieldNoteTypeLabel(value: string) {
  switch (value) {
    case "general":
      return "Job Note";
    case "blocker":
      return "Blocker";
    case "issue":
      return "Issue";
    case "punch_list":
      return "Punch list note";
    case "labor":
      return "Labor note";
    case "material":
      return "Material note";
    case "equipment":
      return "Equipment note";
    default:
      return value.replaceAll("_", " ");
  }
}

export function getFieldNoteTypeHelper(value: string) {
  switch (value) {
    case "general":
      return "Use for everyday job context that belongs with this Daily Job Log.";
    case "blocker":
      return "Use when work is slowed or stopped and the team needs follow-up.";
    case "issue":
      return "Use for a field issue that should stay visible until reviewed.";
    case "punch_list":
      return "Use for closeout-ready observations that may become durable punchlist work later.";
    case "labor":
      return "Use for crew or time-card context tied to this project day.";
    case "material":
      return "Use for material delivery, shortage, or usage context.";
    case "equipment":
      return "Use for equipment context tied to this job day.";
    default:
      return "Use this shared Job Note type inside the Daily Job Log.";
  }
}
