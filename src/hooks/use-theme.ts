

import { Colors } from '@/constants/theme'; // Colors is a TypeScript type, not a value, so it must be imported with braces.
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return Colors[theme];
}
