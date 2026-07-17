import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isSmall: width < 360,
    isMedium: width >= 360 && width < 600,
    isLarge: width >= 600,
    isTablet: width >= 768,
    columnCount: width >= 768 ? 2 : 1,
    cardPadding: width < 360 ? 12 : 16,
  };
}
