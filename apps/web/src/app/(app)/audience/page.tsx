import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DemographicsDonutChart,
  DemographicsBarChart,
} from "@/components/charts/demographics-chart";
import { OnlineHeatmap } from "@/components/charts/online-heatmap";
import { getActiveAccount } from "@/lib/account";
import { prisma } from "@/lib/prisma";
import { demoDemographics, generateDemoOnline } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";

async function getAudienceData() {
  try {
    const account = await getActiveAccount();
    if (!account) return null;

    const demographics = await prisma.audienceDemographic.findMany({
      where: { accountId: account.id },
      orderBy: { count: "desc" },
    });

    const online = await prisma.audienceOnline.findMany({
      where: { accountId: account.id },
    });

    const grouped: Record<string, typeof demographics> = {};
    for (const d of demographics) {
      if (!grouped[d.type]) grouped[d.type] = [];
      grouped[d.type].push(d);
    }

    return { account, demographics: grouped, online };
  } catch {
    return null;
  }
}

export default async function AudiencePage() {
  const data = await getAudienceData();
  const isDemo = !data;

  const age = data?.demographics.age?.map((d) => ({
    value: d.value,
    count: d.count,
    percentage: d.percentage,
  })) || demoDemographics.age;

  const gender = data?.demographics.gender?.map((d) => ({
    value: d.value === "M" ? "男性" : d.value === "F" ? "女性" : d.value,
    count: d.count,
    percentage: d.percentage,
  })) || demoDemographics.gender;

  const city = (data?.demographics.city || demoDemographics.city).slice(0, 10);
  const country = (data?.demographics.country || demoDemographics.country).slice(0, 10);
  const online = data?.online.length ? data.online : generateDemoOnline();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">フォロワー属性</h1>
        <p className="text-zinc-500">
          年齢・性別・地域・アクティブ時間帯
          {isDemo && <Badge variant="warning" className="ml-2">デモデータ</Badge>}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>年齢分布</CardTitle>
          </CardHeader>
          <DemographicsDonutChart data={age} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>性別分布</CardTitle>
          </CardHeader>
          <DemographicsDonutChart data={gender} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>上位都市</CardTitle>
          </CardHeader>
          <DemographicsBarChart data={city} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>上位国</CardTitle>
          </CardHeader>
          <DemographicsBarChart data={country} />
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>アクティブ時間帯</CardTitle>
          <CardDescription>フォロワーが最もアクティブな曜日・時間帯（ヒートマップ）</CardDescription>
        </CardHeader>
        <OnlineHeatmap data={online} />
      </Card>
    </div>
  );
}
