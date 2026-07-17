// GDGT-2456: proper global styling of the metabase/ui Alert lives there. Until
// then, these migrated call sites keep the deprecated Alert's look.

export const DEPRECATED_ALERT_STYLES = {
  root: { borderRadius: "8px", padding: "20px 16px" },
  message: {
    fontSize: "0.875rem",
    lineHeight: "1.4rem",
    color: "var(--mb-color-text-primary)",
  },
};

export const DEPRECATED_ALERT_WITH_ICON_STYLES = {
  ...DEPRECATED_ALERT_STYLES,
  root: {
    ...DEPRECATED_ALERT_STYLES,
    padding: "20px 16px 20px 24px",
  },
  icon: {
    width: "24px",
    height: "24px",
    marginInlineEnd: "16px",
    marginTop: 0,
  },
};

const INFO_ROOT_STYLES = {
  backgroundColor: "var(--mb-color-background_page-secondary)",
  border: "1px solid var(--mb-color-background_page-tertiary)",
};

export const DEPRECATED_INFO_ALERT_STYLES = {
  ...DEPRECATED_ALERT_STYLES,
  root: {
    ...DEPRECATED_ALERT_STYLES.root,
    ...INFO_ROOT_STYLES,
  },
};

export const DEPRECATED_INFO_ALERT_WITH_ICON_STYLES = {
  ...DEPRECATED_ALERT_WITH_ICON_STYLES,
  root: {
    ...DEPRECATED_ALERT_WITH_ICON_STYLES.root,
    ...INFO_ROOT_STYLES,
  },
};
