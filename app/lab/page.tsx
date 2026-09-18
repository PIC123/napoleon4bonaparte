import type { Metadata } from "next";
import { LabShell } from "@/components/lab/LabShell";

export const metadata: Metadata = {
  title: "The bench · Napoleon Lab",
};

export default function LabPage() {
  return <LabShell />;
}
