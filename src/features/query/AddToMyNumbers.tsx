import { BookmarkCheck, BookmarkPlus } from "lucide-react";

interface AddToMyNumbersProps {
  isAdded: boolean;
  canAdd: boolean;
  onAdd: () => void;
}

export function AddToMyNumbers({ isAdded, canAdd, onAdd }: AddToMyNumbersProps) {
  const Icon = isAdded ? BookmarkCheck : BookmarkPlus;

  return (
    <div className="saved-number-bar">
      <div className="saved-number-bar__copy">
        <strong>{isAdded ? "这组号码已在“我的”中" : "留住这组号码"}</strong>
        <span>在“我的”中自动回看，也可继续命名和编辑。</span>
      </div>
      <div className="saved-number-bar__actions">
        <button className="saved-number-bar__save" disabled={!canAdd || isAdded} onClick={onAdd} type="button">
          <Icon size={15} />
          {isAdded ? "已添加到我的号码" : "添加到我的号码"}
        </button>
      </div>
    </div>
  );
}
