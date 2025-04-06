import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Coins, TrendingUp } from "lucide-react";
import { coinRates, coinName } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  totalCoins: number;
  averageCoins: number;
}

interface AdminDashboardProps {
  stats: AdminStats;
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  // Calculate estimated total value in EUR
  const totalValue = (stats.totalCoins * coinRates.COIN_VALUE_EUR).toFixed(2);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Users Card */}
      <Card className="crypto-card bg-dark-medium border-blue-900/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
          <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-10 flex items-center justify-center border border-blue-500/20">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gradient">{formatNumber(stats.totalUsers)}</div>
          <p className="text-sm text-light-darker mt-1">Registered accounts</p>
          <div className="w-full h-1 bg-dark mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-full opacity-30"></div>
          </div>
        </CardContent>
      </Card>
      
      {/* Total Coins Card */}
      <Card className="crypto-card bg-dark-medium border-blue-900/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Total {coinName}</CardTitle>
          <div className="w-10 h-10 rounded-full bg-purple-500 bg-opacity-10 flex items-center justify-center border border-purple-500/20">
            <Coins className="h-5 w-5 text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gradient">{formatNumber(stats.totalCoins)}</div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-light-darker mt-1">Mined by all users</p>
            <p className="text-sm font-medium text-green-400">€{totalValue}</p>
          </div>
          <div className="w-full h-1 bg-dark mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 w-full opacity-30"></div>
          </div>
        </CardContent>
      </Card>
      
      {/* Average Coins Card */}
      <Card className="crypto-card bg-dark-medium border-blue-900/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">Average {coinName}</CardTitle>
          <div className="w-10 h-10 rounded-full bg-green-500 bg-opacity-10 flex items-center justify-center border border-green-500/20">
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gradient">{formatNumber(stats.averageCoins)}</div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-light-darker mt-1">Per user</p>
            <p className="text-sm font-medium text-green-400">
              €{(stats.averageCoins * coinRates.COIN_VALUE_EUR).toFixed(2)}
            </p>
          </div>
          <div className="w-full h-1 bg-dark mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-full opacity-30"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
