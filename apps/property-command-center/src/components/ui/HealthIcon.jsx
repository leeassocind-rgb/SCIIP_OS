import { Check, TriangleAlert } from "lucide-react";

export default function HealthIcon({ status }) {
  return status === "complete" ? (
    <span className="health-icon complete">
      <Check size={14} />
    </span>
  ) : (
    <span className="health-icon attention">
      <TriangleAlert size={14} />
    </span>
  );
}
