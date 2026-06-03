import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const labels: Record<string, string> = {
  pending: "等待分析",
  analyzing: "分析中",
  ready: "已完成",
  failed: "分析失败",
};

const styles: Record<string, string> = {
  pending: "border-amber-400/30 bg-amber-500/15 text-amber-200",
  analyzing: "border-sky-400/30 bg-sky-500/15 text-sky-200",
  ready: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
  failed: "border-rose-400/30 bg-rose-500/15 text-rose-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn(styles[status] ?? "")}>{labels[status] ?? status}</Badge>
  );
}
