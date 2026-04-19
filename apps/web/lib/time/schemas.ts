import { z } from "zod";

const timePunchEventTypes = [
  "punch_in",
  "punch_out",
  "break_start",
  "break_end"
] as const;
const timePunchSources = ["web", "mobile", "admin_adjustment"] as const;
const timeLocationCaptureMethods = [
  "gps",
  "network",
  "manual",
  "unknown"
] as const;

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

function optionalNumberField() {
  return z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((value) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }

      const parsed = typeof value === "number" ? value : Number(value);

      return Number.isFinite(parsed) ? parsed : Number.NaN;
    });
}

export const timePunchEventTypeSchema = z.enum(timePunchEventTypes);
export const timePunchSourceSchema = z.enum(timePunchSources);
export const timeLocationCaptureMethodSchema = z.enum(timeLocationCaptureMethods);

export const timePunchEventInputSchema = z.object({
  personId: z.string().trim().uuid("Select a valid workforce person."),
  projectId: optionalUuidField("Select a valid project."),
  jobId: optionalUuidField("Select a valid job."),
  eventType: timePunchEventTypeSchema,
  occurredAt: z.string().datetime({ offset: true }),
  source: timePunchSourceSchema.default("web"),
  latitude: optionalNumberField().refine(
    (value) => value === null || (value >= -90 && value <= 90),
    {
      message: "Latitude must be between -90 and 90."
    }
  ),
  longitude: optionalNumberField().refine(
    (value) => value === null || (value >= -180 && value <= 180),
    {
      message: "Longitude must be between -180 and 180."
    }
  ),
  accuracyMeters: optionalNumberField().refine(
    (value) => value === null || value >= 0,
    {
      message: "Accuracy meters must be zero or greater."
    }
  ),
  locationCaptureMethod: timeLocationCaptureMethodSchema.default("unknown"),
  geofenceSnapshot: z.record(z.string(), z.unknown()).nullable().optional().transform((value) => value ?? null),
  supersedesEventId: optionalUuidField("Select a valid punch event to supersede."),
  notes: optionalTrimmedString(4000)
}).superRefine((value, ctx) => {
  if ((value.latitude === null) !== (value.longitude === null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: value.latitude === null ? ["latitude"] : ["longitude"],
      message: "Latitude and longitude must be provided together."
    });
  }
});

export type TimePunchEventInput = z.infer<typeof timePunchEventInputSchema>;
export const timePunchEventTypesList = timePunchEventTypes;
export const timePunchSourcesList = timePunchSources;
export const timeLocationCaptureMethodsList = timeLocationCaptureMethods;
