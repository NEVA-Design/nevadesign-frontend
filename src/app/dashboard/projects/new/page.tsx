import type { Metadata } from "next";
import NewProjectWizard from "./NewProjectWizard";

export const metadata: Metadata = {
  title: "Nouveau projet — Neva Design",
};

export default function NewProjectPage() {
  return <NewProjectWizard />;
}
