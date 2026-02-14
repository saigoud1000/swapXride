import { useTheme } from '@/components/theme-provider';

export function useColorScheme() {
    const { colorScheme } = useTheme();
    return colorScheme;
}

