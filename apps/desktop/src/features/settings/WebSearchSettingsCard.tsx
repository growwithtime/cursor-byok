import type { WebSearchSettings, WebSearchSettingsInput } from "../../shared/api";
import { Button } from "../../shared/ui/Button";
import { SecretTextInput } from "../../shared/ui/FormControls";
import { Switch } from "../../shared/ui/Switch";
import { TitledCard } from "../../shared/ui/TitledCard";
import styles from "./WebSearchSettingsCard.module.scss";

export function WebSearchSettingsCard({ settings, draft, editing, saving, onDraftChange, onEdit, onCancel, onSave }: {
  settings: WebSearchSettings | null;
  draft: WebSearchSettingsInput;
  editing: boolean;
  saving: boolean;
  onDraftChange: (draft: WebSearchSettingsInput) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const action = editing ? (
    <div className={styles.actions}>
      <Button size="small" disabled={saving} onClick={onCancel}>{t("取消")}</Button>
      <Button size="small" variant="primary" disabled={saving} onClick={onSave}>
        {saving ? t("保存中…") : t("保存")}
      </Button>
    </div>
  ) : (
    <button type="button" className={styles.textButton} disabled={!settings} onClick={onEdit}>{t("编辑")}</button>
  );

  return <TitledCard title={t("BYOK 网页搜索")} action={action}>
    <div className={styles.content}>
      <p className={styles.description}>{t("仅影响 BYOK 和插件模型；Cursor 官方模型继续使用 Cursor 的网页搜索。")}</p>
      <div className={styles.row}>
        <div><strong>{t("启用 WebSearch")}</strong><small>{t("关闭后 BYOK 模型不再获得网页搜索工具。")}</small></div>
        {editing
          ? <Switch checked={draft.enabled} disabled={saving} label={t("启用 WebSearch")} onChange={(enabled) => onDraftChange({ ...draft, enabled })} />
          : <span className={styles.value}>{settings ? (settings.enabled ? t("已启用") : t("未启用")) : t("加载中…")}</span>}
      </div>
      <div className={styles.row}>
        <div><strong>{t("搜索前需要确认")}</strong><small>{t("关闭确认后，Agent 会直接把搜索词发送给 Exa。")}</small></div>
        {editing
          ? <Switch checked={draft.require_confirmation} disabled={saving || !draft.enabled} label={t("搜索前需要确认")} onChange={(require_confirmation) => onDraftChange({ ...draft, require_confirmation })} />
          : <span className={styles.value}>{settings ? (settings.require_confirmation ? t("需要确认") : t("自动发送")) : t("加载中…")}</span>}
      </div>
      <div className={styles.row}><strong>{t("搜索服务")}</strong><span className={styles.value}>Exa</span></div>
      <div className={styles.row}>
        <div><strong>{t("Exa API 密钥")}</strong><small>{t("密钥只保存在本机，不会回传到设置页面。")}</small></div>
        {editing ? <div className={styles.keyEditor}>
          <SecretTextInput
            value={draft.api_key ?? ""}
            disabled={saving}
            autoComplete="new-password"
            placeholder={settings?.has_api_key && !draft.clear_api_key ? t("留空表示保留当前密钥") : ""}
            onChange={(event) => onDraftChange({ ...draft, api_key: event.target.value, clear_api_key: false })}
          />
          {settings?.has_api_key && <Button
            size="small"
            disabled={saving || draft.clear_api_key}
            onClick={() => onDraftChange({ ...draft, api_key: "", clear_api_key: true })}
          >{draft.clear_api_key ? t("保存后清除") : t("清除密钥")}</Button>}
        </div> : <span className={styles.value}>{settings ? (settings.has_api_key ? t("已配置") : t("未配置")) : t("加载中…")}</span>}
      </div>
    </div>
  </TitledCard>;
}
