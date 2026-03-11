// App-wide color palette for RepairPro
export const Colors = {
  primary: '#008080',
  primaryDark: '#006666',
  primaryLight: '#CCEEEE',
  background: '#F0FAFA',
  surface: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  border: '#B2D8D8',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  purple: '#7C3AED',
  purpleLight: '#EDE9FE',
  gray: '#64748B',
  grayLight: '#F0FAFA',
};

// Status colors for job badges
export const StatusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: Colors.primaryLight, text: Colors.primary },
  in_progress: { bg: Colors.purpleLight, text: Colors.purple },
  awaiting_parts: { bg: Colors.warningLight, text: Colors.warning },
  done: { bg: Colors.successLight, text: Colors.success },
  invoiced: { bg: '#F1F5F9', text: Colors.gray },
};
