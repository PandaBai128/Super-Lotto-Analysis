import type { summarizeTickets } from "./ticketStats";

export function MyOverview({ overview, count, historical = false }: { overview: ReturnType<typeof summarizeTickets>; count: number; historical?: boolean }) {
  const prizes = overview.summary.filter((row) => row.count > 0);
  return <section className="my-overview-section" aria-label="我的号码概览">
    <div className="my-overview">
      <div><span>已保存</span><strong>{overview.total}<small> 组号码</small></strong></div>
      <div><span>所选 {count} 期命中</span><strong>{overview.hits}<small> 次 · {overview.winningGroups} 组</small></strong></div>
      <div><span>区间最高奖级</span><strong>{overview.best}</strong></div>
    </div>
    <div className="my-overview-prizes">
      <span>奖级分布</span>
      {prizes.length ? prizes.map((row) => <span className="my-prize-count" key={row.level}>{row.level}<b>{row.count}<small> 次</small></b></span>) : <span className="my-muted">所选区间内暂无中奖回看记录</span>}
    </div>
    <p className="my-overview-note">同一期两组都中，计 2 次；每组每期仅计最高奖级。{historical && "同名奖级的命中条件随版本不同。"}</p>
  </section>;
}
