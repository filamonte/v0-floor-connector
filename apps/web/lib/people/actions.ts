"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPerson, updatePerson } from "./data";
import { personInputSchema } from "./schemas";

function getFieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getCheckboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
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

function parsePersonInput(formData: FormData) {
  return personInputSchema.safeParse({
    membershipUserId: getFieldValue(formData, "membershipUserId"),
    vendorId: getFieldValue(formData, "vendorId"),
    personType: getFieldValue(formData, "personType"),
    displayName: getFieldValue(formData, "displayName"),
    firstName: getFieldValue(formData, "firstName"),
    lastName: getFieldValue(formData, "lastName"),
    email: getFieldValue(formData, "email"),
    phone: getFieldValue(formData, "phone"),
    jobTitle: getFieldValue(formData, "jobTitle"),
    trade: getFieldValue(formData, "trade"),
    classification: getFieldValue(formData, "classification"),
    isAssignable: getCheckboxValue(formData, "isAssignable"),
    isActive: getCheckboxValue(formData, "isActive"),
    notes: getFieldValue(formData, "notes")
  });
}

export async function createPersonAction(formData: FormData) {
  const result = parsePersonInput(formData);

  if (!result.success) {
    redirect(
      buildRedirect("/people", {
        error: result.error.issues[0]?.message ?? "Unable to create workforce record."
      })
    );
  }

  let person;

  try {
    person = await createPerson(result.data);
  } catch (error) {
    redirect(
      buildRedirect("/people", {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create workforce record."
      })
    );
  }

  revalidatePath("/people");
  revalidatePath(`/people/${person.id}`);
  revalidatePath("/vendors");

  redirect(
    buildRedirect("/people", {
      message: `${person.displayName} was created successfully.`
    })
  );
}

export async function updatePersonAction(formData: FormData) {
  const personId = getFieldValue(formData, "personId");
  const result = parsePersonInput(formData);

  if (!personId) {
    redirect(
      buildRedirect("/people", {
        error: "Person id is required for updates."
      })
    );
  }

  if (!result.success) {
    redirect(
      buildRedirect(`/people/${personId}`, {
        error: result.error.issues[0]?.message ?? "Unable to update workforce record."
      })
    );
  }

  let person;

  try {
    person = await updatePerson(personId, result.data);
  } catch (error) {
    redirect(
      buildRedirect(`/people/${personId}`, {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update workforce record."
      })
    );
  }

  revalidatePath("/people");
  revalidatePath(`/people/${person.id}`);
  revalidatePath("/vendors");

  redirect(
    buildRedirect(`/people/${person.id}`, {
      message: `${person.displayName} was updated successfully.`
    })
  );
}
