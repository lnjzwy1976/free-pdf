import { Dimensions, PixelRatio } from 'react-native';

// 基准尺寸 (通常基于 iPhone 11 / Pro 或设计师给出的稿子，如 375x812)
const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * 宽度适配：根据屏幕宽度比例缩放
 * 适用于：width, marginLeft, marginRight, paddingHorizontal, fontSize(部分)
 * @param size 设计稿上的尺寸
 */
export const scale = (size: number) => (SCREEN_WIDTH / GUIDELINE_BASE_WIDTH) * size;

/**
 * 高度适配：根据屏幕高度比例缩放
 * 适用于：height, marginTop, marginBottom, paddingVertical
 * @param size 设计稿上的尺寸
 */
export const verticalScale = (size: number) => (SCREEN_HEIGHT / GUIDELINE_BASE_HEIGHT) * size;

/**
 * 适度缩放：用于字体大小或圆角等不希望完全线性缩放的属性
 * factor: 0.5 表示 50% 的线性缩放能力（比如屏幕宽了2倍，它只大1.5倍），避免在大屏上字体过大
 * @param size 设计稿上的尺寸
 * @param factor 缩放因子，默认 0.5
 */
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

/**
 * 百分比宽度转像素
 * @param widthPercent '50%' -> number
 */
export const widthPercentage = (widthPercent: string | number) => {
  const elemWidth = typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel(SCREEN_WIDTH * elemWidth / 100);
};

/**
 * 百分比高度转像素
 * @param heightPercent '20%' -> number
 */
export const heightPercentage = (heightPercent: string | number) => {
  const elemHeight = typeof heightPercent === "number" ? heightPercent : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel(SCREEN_HEIGHT * elemHeight / 100);
};

