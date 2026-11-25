import { redirect } from "next/navigation";

/** Old address of the volunteer's applications list. */
export default function MyProjectsPage() {
  redirect("/applications");
}
