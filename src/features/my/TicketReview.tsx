import { CircleHelp } from "lucide-react";
import { analyzeTicket, type TicketContext } from "./ticketAnalysis";
import type { MyTicket } from "./ticketTypes";

export function TicketReview({ ticket, context }: { ticket: MyTicket; context: TicketContext }) {
  const analysis = analyzeTicket(ticket, context);
  const heatHelp = "沿用冷热号码卡片：前区出现次数前 8 为热号、后 8 为冷号；后区前 5 为热号、后 5 为冷号，其余为温号。同频沿用号码排序。";
  return (
    <details className="my-analysis my-review-details" aria-label={`${ticket.name}的简要分析`}>
      <summary>号码小评 <span>展开看冷热与结构 · {context.count} 期</span></summary>
      <p className="my-analysis-verdict">{analysis.title}；{analysis.heatText}。</p>
      <div className="my-shape-tags">
        <span>{analysis.shapeText}</span>
        <span title="低区 01–12，中区 13–24，高区 25–35">{analysis.zonesText}</span>
        <span>和值 {analysis.shape.sum} · 跨度 {analysis.shape.span}</span>
      </div>
      {context.count > 0 && <div className="my-heat-row">
        <HeatMix label="前区" mix={analysis.frontHeat} />
        <HeatMix label="后区" mix={analysis.backHeat} />
        <span className="my-help" tabIndex={0} aria-label={heatHelp} title={heatHelp}><CircleHelp size={14} /><span role="tooltip">{heatHelp}</span></span>
      </div>}
      <p className="my-analysis-note">{analysis.omissionText}</p>
      <p className="my-analysis-note">前区{analysis.textureText}{ticket.front.length > 5 || ticket.back.length > 2 ? "；按整组候选号描述。" : "。"}</p>
    </details>
  );
}

function HeatMix({ label, mix }: { label: string; mix: { hot: number; warm: number; cold: number } }) {
  return <span className="my-heat-mix"><b>{label}</b><span className="heat-hot">热 {mix.hot}</span><span>温 {mix.warm}</span><span className="heat-cold">冷 {mix.cold}</span></span>;
}
