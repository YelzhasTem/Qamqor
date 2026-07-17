import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type PublicProfile = Database["public"]["Views"]["public_profiles"]["Row"];
export type PublicVolunteerProfile = Database["public"]["Views"]["public_volunteer_profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectApplication = Database["public"]["Tables"]["project_applications"]["Row"];
export type VolunteerHours = Database["public"]["Tables"]["volunteer_hours"]["Row"];
export type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
export type Certificate = Database["public"]["Tables"]["certificates"]["Row"];

export type ProjectWithMeta = Project & {
  coordinator?: PublicProfile | null;
  participantCount?: number;
  availablePlaces?: number;
};
