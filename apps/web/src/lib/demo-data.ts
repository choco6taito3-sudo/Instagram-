import { subDays, format } from "date-fns";

export function generateDemoInsights(days = 30) {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - i - 1);
    const reach = Math.floor(800 + Math.random() * 1200);
    const impressions = Math.floor(reach * (1.2 + Math.random() * 0.5));
    const accountsEngaged = Math.floor(reach * (0.03 + Math.random() * 0.05));
    return {
      date: format(date, "yyyy-MM-dd"),
      reach,
      impressions,
      accountsEngaged,
      engagementRate: reach > 0 ? (accountsEngaged / reach) * 100 : 0,
      followerCount: 1250 + i * 3,
    };
  });
}

export const demoDemographics = {
  age: [
    { value: "18-24", count: 320, percentage: 25.6 },
    { value: "25-34", count: 450, percentage: 36.0 },
    { value: "35-44", count: 280, percentage: 22.4 },
    { value: "45-54", count: 120, percentage: 9.6 },
    { value: "55+", count: 80, percentage: 6.4 },
  ],
  gender: [
    { value: "男性", count: 520, percentage: 41.6 },
    { value: "女性", count: 680, percentage: 54.4 },
    { value: "その他", count: 50, percentage: 4.0 },
  ],
  city: [
    { value: "東京", count: 380, percentage: 30.4 },
    { value: "大阪", count: 150, percentage: 12.0 },
    { value: "名古屋", count: 90, percentage: 7.2 },
    { value: "福岡", count: 75, percentage: 6.0 },
    { value: "札幌", count: 60, percentage: 4.8 },
  ],
  country: [
    { value: "日本", count: 1100, percentage: 88.0 },
    { value: "アメリカ", count: 80, percentage: 6.4 },
    { value: "韓国", count: 40, percentage: 3.2 },
    { value: "その他", count: 30, percentage: 2.4 },
  ],
};

export function generateDemoOnline() {
  const data: { dayOfWeek: number; hour: number; count: number }[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const base = hour >= 19 && hour <= 23 ? 80 : hour >= 12 && hour <= 14 ? 50 : 20;
      const weekendBoost = day === 0 || day === 6 ? 1.3 : 1;
      data.push({
        dayOfWeek: day,
        hour,
        count: Math.floor(base * weekendBoost * (0.8 + Math.random() * 0.4)),
      });
    }
  }
  return data;
}
