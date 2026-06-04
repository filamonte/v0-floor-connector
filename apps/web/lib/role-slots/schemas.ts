import { z } from "zod";

const uuidOrEmptySchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .pipe(z.string().uuid().nullable());

export const opportunityRoleSlotsInputSchema = z.object({
  opportunityId: z.string().uuid(),
  onsiteRepPersonId: uuidOrEmptySchema,
  relationshipOwnerPersonId: uuidOrEmptySchema,
  returnTo: z.string().min(1).default("/leads")
});

export const projectRoleSlotsInputSchema = z.object({
  projectId: z.string().uuid(),
  onsiteRepPersonId: uuidOrEmptySchema,
  relationshipOwnerPersonId: uuidOrEmptySchema,
  followUpOwnerPersonId: uuidOrEmptySchema,
  salesCreditOwnerPersonId: uuidOrEmptySchema,
  returnTo: z.string().min(1).default("/projects")
});

export const estimateRoleSlotsInputSchema = z.object({
  estimateId: z.string().uuid(),
  estimateWriterPersonId: uuidOrEmptySchema,
  returnTo: z.string().min(1).default("/estimates")
});

export type OpportunityRoleSlotsInput = z.infer<
  typeof opportunityRoleSlotsInputSchema
>;
export type ProjectRoleSlotsInput = z.infer<typeof projectRoleSlotsInputSchema>;
export type EstimateRoleSlotsInput = z.infer<
  typeof estimateRoleSlotsInputSchema
>;
