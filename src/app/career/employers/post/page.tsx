import type { Metadata } from "next";
import { PostJobForm } from "./post-form";

export const metadata: Metadata = {
  title: "Post a J-1 Waiver Physician Position — USCEHub",
  description:
    "Submit your J-1 waiver or H-1B physician position. We verify and publish within 24 hours. Reach physicians actively searching for waiver-eligible opportunities.",
  alternates: {
    canonical: "https://uscehub.com/career/employers/post",
  },
};

export default function PostJobPage() {
  return <PostJobForm />;
}
