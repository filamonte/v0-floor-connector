"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createProject, updateProject } from "./data";
import { projectInputSchema } from "./schemas";
import type { ProjectInput } from "./schemas";
import { createCustomer } from "@/lib/customers/data";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function buildRedirect(
  pathname: string,
  params: Record<string, string | undefined>
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();

  return query ? `${pathname}?${query}` : pathname;
}

function parseProjectInput(formData: FormData) {
  return projectInputSchema.safeParse({
    name: getFieldValue(formData, "name"),
    customerId: getFieldValue(formData, "customerId"),
    status: getFieldValue(formData, "status"),
    financingStatus: getFieldValue(formData, "financingStatus"),
    description: getFieldValue(formData, "description"),
    addressLine1: getFieldValue(formData, "addressLine1"),
    addressLine2: getFieldValue(formData, "addressLine2"),
    city: getFieldValue(formData, "city"),
    stateRegion: getFieldValue(formData, "stateRegion"),
    postalCode: getFieldValue(formData, "postalCode"),
    countryCode: getFieldValue(formData, "countryCode")
  });
}

const newCustomerSchema = z.object({
  name: z.string().trim().min(1, "New customer name is required.").max(120),
  companyName: z.string().trim().max(120).transform((value) => (value ? value : null)),
  email: z
    .string()
    .trim()
    .max(255)
    .transform((value) => (value ? value : null))
    .refine((value) => value === null || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address for the new customer."
    }),
  phone: z.string().trim().max(40).transform((value) => (value ? value : null))
});

type NewCustomerInput = z.infer<typeof newCustomerSchema>;
type BaseProjectInput = Omit<ProjectInput, "customerId">;
type CreateProjectSubmissionResult =
  | {
      success: false;
      message: string;
    }
  | {
      success: true;
      baseProjectInput: BaseProjectInput;
      selectedCustomerId: string | null;
      newCustomerInput: NewCustomerInput | null;
    };

function parseCreateProjectSubmission(formData: FormData): CreateProjectSubmissionResult {
  const baseProjectResult = projectInputSchema.omit({ customerId: true }).safeParse({
    name: getFieldValue(formData, "name"),
    status: getFieldValue(formData, "status"),
    financingStatus: getFieldValue(formData, "financingStatus"),
    description: getFieldValue(formData, "description"),
    addressLine1: getFieldValue(formData, "addressLine1"),
    addressLine2: getFieldValue(formData, "addressLine2"),
    city: getFieldValue(formData, "city"),
    stateRegion: getFieldValue(formData, "stateRegion"),
    postalCode: getFieldValue(formData, "postalCode"),
    countryCode: getFieldValue(formData, "countryCode")
  });

  if (!baseProjectResult.success) {
    return {
      success: false as const,
      message: baseProjectResult.error.issues[0]?.message ?? "Unable to create project."
    };
  }

  const selectedCustomerId = getFieldValue(formData, "customerId").trim();

  if (selectedCustomerId) {
    const customerIdResult = z
      .string()
      .uuid("Select a valid customer.")
      .safeParse(selectedCustomerId);

    if (!customerIdResult.success) {
      return {
        success: false as const,
        message: customerIdResult.error.issues[0]?.message ?? "Select a valid customer."
      };
    }

    return {
      success: true,
      baseProjectInput: baseProjectResult.data,
      selectedCustomerId: customerIdResult.data,
      newCustomerInput: null
    };
  }

  const newCustomerName = getFieldValue(formData, "newCustomerName").trim();

  if (!newCustomerName) {
    return {
      success: false as const,
      message: "Select an existing customer or create a new one."
    };
  }

  const newCustomerResult = newCustomerSchema.safeParse({
    name: newCustomerName,
    companyName: getFieldValue(formData, "newCustomerCompanyName"),
    email: getFieldValue(formData, "newCustomerEmail"),
    phone: getFieldValue(formData, "newCustomerPhone")
  });

  if (!newCustomerResult.success) {
    return {
      success: false as const,
      message:
        newCustomerResult.error.issues[0]?.message ?? "Unable to create the new customer."
    };
  }

  return {
    success: true,
    baseProjectInput: baseProjectResult.data,
    selectedCustomerId: null,
    newCustomerInput: newCustomerResult.data
  };
}

export async function createProjectAction(formData: FormData) {
  const result = parseCreateProjectSubmission(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/projects", {
        error: result.message
      })
    );
  }

  let project;

  try {
    let customerId = result.selectedCustomerId;

    if (!customerId && result.newCustomerInput) {
      const customer = await createCustomer({
        name: result.newCustomerInput.name,
        companyName: result.newCustomerInput.companyName,
        phone: result.newCustomerInput.phone,
        email: result.newCustomerInput.email,
        addressLine1: null,
        addressLine2: null,
        city: null,
        stateRegion: null,
        postalCode: null,
        countryCode: null,
        isTaxExempt: false,
        taxExemptionReason: null,
        taxExemptionReference: null,
        taxExemptionExpiresOn: null,
        retainagePercentageDefault: "0.00",
        notes: null
      });

      customerId = customer.id;
    }

    if (!customerId) {
      throw new Error("Select an existing customer or create a new one.");
    }

    project = await createProject({
      ...result.baseProjectInput,
      customerId
    });
  } catch (error) {
    redirect(
      buildRedirect("/projects", {
        error:
          error instanceof Error ? error.message : "Unable to create project."
      })
    );
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${project.id}`);
  revalidatePath("/customers");

  redirect(
    buildRedirect("/projects", {
      message: `${project.name} was created successfully.`
    })
  );
}

export async function updateProjectAction(formData: FormData) {
  const projectId = getFieldValue(formData, "projectId");
  const result = parseProjectInput(formData);

  if (!projectId) {
    redirect(
      buildRedirect("/projects", {
        error: "Project id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/projects/${projectId}`, {
        error: result.error.issues[0]?.message ?? "Unable to update project."
      })
    );
  }

  let project;

  try {
    project = await updateProject(projectId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/projects/${projectId}`, {
        error:
          error instanceof Error ? error.message : "Unable to update project."
      })
    );
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${project.id}`);

  redirect(
    buildRedirect(`/projects/${project.id}`, {
      message: `${project.name} was updated successfully.`
    })
  );
}
