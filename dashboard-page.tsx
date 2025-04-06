import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Activity, coinRates } from "@shared/schema";
import Sidebar from "@/components/sidebar";
import StatsGrid from "@/components/stats-grid";
import MiningSection from "@/components/mining-section";
import WalletSection from "@/components/wallet-section";
import CoinValueSection from "@/components/coin-value-section";
import ActivityHistory from "@/components/activity-history";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nextRewardTime, setNextRewardTime] = useState<Date | null>(null);
  const [timerString, setTimerString] = useState("00:00");
  
  // Define passive data interface
  interface PassiveData {
    nextRewardTime: string;
    reward: boolean;
  }
  
  // Query for passive mining status
  const { data: passiveData, refetch: checkPassiveReward } = useQuery<PassiveData>({
    queryKey: ["/api/mining/passive"],
    refetchInterval: 60000, // Check every minute
  });
  
  // Query for user activities
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/mining/activities"],
  });
  
  // Reset daily stats if needed
  const resetDayMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/mining/reset-day");
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.reset) {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      }
    },
  });
  
  // Click mining mutation
  const clickMiningMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/mining/click");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mining/activities"] });
    },
  });
  
  // Update next reward time and timer
  useEffect(() => {
    if (passiveData?.nextRewardTime) {
      setNextRewardTime(new Date(passiveData.nextRewardTime));
    }
    
    // Check daily reset on load
    resetDayMutation.mutate();
  }, [passiveData]);
  
  // Update timer every second
  useEffect(() => {
    if (!nextRewardTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = nextRewardTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimerString("00:00");
        checkPassiveReward();
        clearInterval(interval);
        return;
      }
      
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimerString(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, [nextRewardTime]);
  
  // Handle claim button click
  const handleClaimClick = () => {
    if (!user || user.clicksToday >= coinRates.MAX_CLICKS_PER_DAY) return;
    clickMiningMutation.mutate();
  };
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark text-light">
      {/* Mobile Navigation Bar */}
      <div className="md:hidden bg-dark-lighter p-3 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-bold text-lg text-white">CoinMiner</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-light p-2"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-lighter w-full absolute z-50">
          <Sidebar user={user} mobile={true} onClose={() => setMobileMenuOpen(false)} />
        </div>
      )}
      
      {/* Sidebar (Desktop) */}
      <div className="hidden md:block">
        <Sidebar user={user} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <div className="mt-4 md:mt-0 flex items-center bg-dark-lighter px-4 py-2 rounded-lg">
              <div className="mr-4 flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                <span className="text-sm text-light-darker">Next reward in</span>
              </div>
              <div className="text-white font-mono">{timerString}</div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <StatsGrid user={user} />
          
          {/* Mining and Wallet Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <MiningSection 
                user={user} 
                onClaimClick={handleClaimClick} 
                isPending={clickMiningMutation.isPending}
              />
            </div>
            <div id="wallet-section">
              <WalletSection user={user} />
            </div>
          </div>
          
          {/* Coin Value Section */}
          <div id="coin-value-section" className="mb-8">
            <CoinValueSection />
          </div>
          
          {/* Activity History */}
          <div id="activities-section">
            <ActivityHistory activities={activities || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
