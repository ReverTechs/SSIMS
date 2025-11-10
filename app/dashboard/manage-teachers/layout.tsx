import { ReactNode } from "react";
import { ManageTeachersShell } from "./_components/manage-teachers-shell";

export default function ManageTeachersLayout({ children }: { children: ReactNode }) {
  return <ManageTeachersShell>{children}</ManageTeachersShell>;
}




