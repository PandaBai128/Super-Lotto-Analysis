import { useEffect, useMemo, useState } from "react";
import { Eraser } from "lucide-react";
import { DrawMatchList } from "../../components/DrawMatchList";
import { DrawMatchLegend } from "../../components/MatchingNumberBalls";
import { SectionHeader } from "../../components/SectionHeader";
import { PrizeRuleSelector } from "../../components/PrizeRuleSelector";
import { getPrizeLevelsForDraws, type PrizeLevel, type PrizeRuleMode } from "../../domain/rules";
import { formatNums, uniqueSorted } from "../../domain/numbers";
import type { DltDraw } from "../../types/dlt";
import { NumberPickPanel } from "./NumberPickPanel";
import { PrizeLevelFilter } from "./PrizeLevelFilter";
import { calcPrizeHits, filterPrizeHits, summarizePrizeHits } from "./prizeStats";
import { sameNumberSelection, type NumberSelection } from "./savedNumbers";
import { AddToMyNumbers } from "./AddToMyNumbers";
import { QueryDrawRow } from "./QueryDrawRow";
import { createTicket } from "../my/ticketStore";
import { useMyTickets } from "../my/useMyTickets";

export function QueryPage({ draws, initialSelection, ruleMode, onRuleMode }: {
  draws: DltDraw[];
  initialSelection?: NumberSelection;
  ruleMode: PrizeRuleMode;
  onRuleMode: (mode: PrizeRuleMode) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const { tickets, error, commit } = useMyTickets();
  const [frontText, setFrontText] = useState(() => formatNums(initialSelection?.front ?? []));
  const [backText, setBackText] = useState(() => formatNums(initialSelection?.back ?? []));
  const [visibleLevels, setVisibleLevels] = useState<PrizeLevel[]>(["一等奖", "二等奖", "三等奖"]);
  const [saveMessage, setSaveMessage] = useState("");
  const parsedFront = frontText.split(/[,\s，、|]+/).filter(Boolean).map(Number);
  const parsedBack = backText.split(/[,\s，、|]+/).filter(Boolean).map(Number);
  const selectedFront = uniqueSorted(parsedFront.filter((num) => Number.isInteger(num) && num >= 1 && num <= 35));
  const selectedBack = uniqueSorted(parsedBack.filter((num) => Number.isInteger(num) && num >= 1 && num <= 12));
  const hasInvalidNumber = parsedFront.some((num) => !Number.isInteger(num) || num < 1 || num > 35) || parsedBack.some((num) => !Number.isInteger(num) || num < 1 || num > 12);
  const canAdd = selectedFront.length >= 5 && selectedBack.length >= 2 && !hasInvalidNumber;
  const isAdded = canAdd && tickets.some((ticket) => !ticket.targetIssue && sameNumberSelection(ticket, { front: selectedFront, back: selectedBack }));

  const rows = useMemo(() => {
    const kw = keyword.trim();
    return [...draws].reverse().filter((draw) => {
      if (!kw) return true;
      return draw.issue.includes(kw) || draw.date.includes(kw) || [...draw.front, ...draw.back].some((num) => String(num).padStart(2, "0") === kw);
    }).slice(0, 120);
  }, [draws, keyword]);

  const availableLevels = useMemo(() => getPrizeLevelsForDraws(draws, ruleMode), [draws, ruleMode]);
  const prizeRows = useMemo(() => calcPrizeHits(draws, selectedFront, selectedBack, ruleMode), [draws, selectedBack, selectedFront, ruleMode]);
  const prizeSummary = useMemo(() => summarizePrizeHits(prizeRows, availableLevels), [prizeRows, availableLevels]);
  const visiblePrizeRows = useMemo(() => filterPrizeHits(prizeRows, visibleLevels), [prizeRows, visibleLevels]);
  useEffect(() => {
    setVisibleLevels((previous) => {
      const next = previous.filter((level) => availableLevels.includes(level));
      return next.length || !previous.length ? next : availableLevels.slice(0, 3);
    });
  }, [availableLevels]);

  function updateFront(value: string) {
    setFrontText(value);
    setSaveMessage("");
  }

  function updateBack(value: string) {
    setBackText(value);
    setSaveMessage("");
  }

  function clearSelection() {
    setFrontText("");
    setBackText("");
    setSaveMessage("");
  }

  function handleAdd() {
    if (!canAdd || isAdded) return;
    try {
      const ticket = createTicket({ name: `查询添加的号码 ${tickets.length + 1}`, front: selectedFront, back: selectedBack, targetIssue: "" });
      commit([...tickets, ticket]);
      setSaveMessage("已添加，可在左侧“我的”中查看和编辑。");
    } catch (cause) {
      setSaveMessage(cause instanceof Error ? cause.message : "添加失败，请重试。");
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader title="查询与中奖检查" desc="按期号、日期、号码检索，也可以检查一组号码历史命中情况。" />
      <PrizeRuleSelector mode={ruleMode} onChange={onRuleMode} />
      <div className="query-grid">
        <section className="panel">
          <div className="query-history-heading"><h3>历史开奖</h3><DrawMatchLegend /></div>
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="输入期号、日期或号码，如 26051 / 2026-05 / 08" />
          <div className="draw-list">
            {rows.map((draw) => <QueryDrawRow key={draw.issue} draw={draw} front={selectedFront} back={selectedBack} />)}
          </div>
        </section>
        <section className="panel">
          <div className="query-history-heading">
            <h3>我选的号码是否中过奖</h3>
            <button className="query-clear-selection" type="button" disabled={!frontText && !backText} onClick={clearSelection} title="清空本次选号，保留我的号码"><Eraser size={14} />清空选号</button>
          </div>
          <div className="form-row"><label htmlFor="query-front">前区</label><input id="query-front" placeholder="例如 01 06 14 15 17" value={frontText} onChange={(e) => updateFront(e.target.value)} /></div>
          <div className="form-row"><label htmlFor="query-back">后区</label><input id="query-back" placeholder="例如 02 03" value={backText} onChange={(e) => updateBack(e.target.value)} /></div>
          <AddToMyNumbers isAdded={isAdded} canAdd={canAdd && !error} onAdd={handleAdd} />
          {(saveMessage || error) && <p role="status" className="card-note saved-number-message">{error || saveMessage}</p>}
          {hasInvalidNumber && <p className="card-note error-text">请输入整数号码：前区 01–35，后区 01–12。</p>}
          <NumberPickPanel front={selectedFront} back={selectedBack} onFront={updateFront} onBack={updateBack} />
          {selectedFront.length >= 5 && selectedBack.length >= 2 ? (
            <>
              <PrizeSummary rows={prizeSummary} />
              <PrizeLevelFilter selected={visibleLevels} onChange={setVisibleLevels} levels={availableLevels} />
              <p className="card-note">按复式票最高奖级统计：共命中 {prizeRows.length} 次，当前筛选显示 {visiblePrizeRows.length} 次；完整覆盖开奖号码 {prizeRows.filter((row) => row.complete).length} 次。</p>
              <div className="query-prize-list"><DrawMatchList selection={{ front: selectedFront, back: selectedBack }} rows={visiblePrizeRows.slice(0, 80)} /></div>
              {!visiblePrizeRows.length && <p className="card-note">当前奖级筛选下暂无中奖记录。</p>}
            </>
          ) : (
            <p className="card-note">请至少选择 5 个前区号码和 2 个后区号码，系统会统计历史命中奖级。</p>
          )}
        </section>
      </div>
    </div>
  );
}

function PrizeSummary({ rows }: { rows: Array<{ level: PrizeLevel; count: number }> }) {
  return (
    <div className="prize-summary">
      {rows.map((item) => (
        <span key={item.level}>
          {item.level}
          <b>{item.count}</b>
        </span>
      ))}
    </div>
  );
}
