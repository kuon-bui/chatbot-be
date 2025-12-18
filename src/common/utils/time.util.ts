/**
 * Chuyển đổi chuỗi thời gian sang số giây
 * 
 * @param timeString - Chuỗi thời gian với định dạng: số + đơn vị (s, m, h, d)
 * @returns Số giây
 * 
 * @example
 * parseTimeToSeconds('3600s') // 3600
 * parseTimeToSeconds('60m') // 3600
 * parseTimeToSeconds('1h') // 3600
 * parseTimeToSeconds('1d') // 86400
 */
export function parseTimeToSeconds(timeString: string): number {
  const regex = /^(\d+)(s|m|h|d)$/;
  const match = timeString.match(regex);

  if (!match) {
    throw new Error(`Invalid time format: ${timeString}. Expected format: number + unit (s|m|h|d)`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1,        // giây
    m: 60,       // phút
    h: 3600,     // giờ
    d: 86400,    // ngày
  };

  return value * multipliers[unit] * 1000;
}
