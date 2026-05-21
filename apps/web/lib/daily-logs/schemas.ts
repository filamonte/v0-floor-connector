import { z } from "zod";

const dailyLogStatuses = ["draft", "finalized"] as const;

function optionalTrimmedString(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .transform((value) => value ?? null);
}

function optionalUuidField(message: string) {
  return z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null))
    .nullable()
    .optional()
    .refine((value) => value === null || z.string().uuid().safeParse(value).success, {
      message
    })
    .transform((value) => value ?? null);
}

function optionalIntegerField() {
  return z
    .union([z.number().int(), z.string()])
    .optional()
    .nullable()
    .transform((value) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }

      const parsed = typeof value === "number" ? value : Number(value);

      if (!Number.isInteger(parsed)) {
        return Number.NaN;
      }

      return parsed;
    });
}

export const dailyLogStatusSchema = z.enum(dailyLogStatuses);

export const dailyLogInputSchema = z
  .object({
    projectId: z.string().trim().uuid("Select a valid project."),
    jobId: optionalUuidField("Select a valid job."),
    logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid log date."),
    status: dailyLogStatusSchema.default("draft"),
    summary: optionalTrimmedString(1000),
    workCompleted: optionalTrimmedString(6000),
    workPlannedNext: optionalTrimmedString(4000),
    delaysOrBlockers: optionalTrimmedString(4000),
    safetyNotes: optionalTrimmedString(2000),
    weatherSummary: optionalTrimmedString(240),
    weatherConditions: optionalTrimmedString(120),
    temperatureHighF: optionalIntegerField().refine(
      (value) => value === null || (value >= -100 && value <= 180),
      {
        message: "High temperature must be between -100F and 180F."
      }
    ),
    temperatureLowF: optionalIntegerField().refine(
      (value) => value === null || (value >= -100 && value <= 180),
      {
        message: "Low temperature must be between -100F and 180F."
      }
    )
  })
  .superRefine((value, ctx) => {
    if (
      value.temperatureHighF !== null &&
      value.temperatureLowF !== null &&
      value.temperatureLowF > value.temperatureHighF
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["temperatureLowF"],
        message: "Low temperature cannot be higher than the high temperature."
      });
    }
  });

export type DailyLogInput = z.infer<typeof dailyLogInputSchema>;
export const dailyLogQuickCreateInputSchema = z.object({
  projectId: z.string().trim().uuid("Select a valid project."),
  jobId: optionalUuidField("Select a valid job."),
  logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid log date.")
});

export type DailyLogQuickCreateInput = z.infer<typeof dailyLogQuickCreateInputSchema>;
export const dailyLogStatusesList = dailyLogStatuses;
