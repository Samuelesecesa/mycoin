import { useState } from "react";
import { User, coinRates, coinName } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatAddress } from "@/lib/wallet";
import { Search, UserCheck, Settings, Download, CheckCircle2, XCircle } from "lucide-react";

interface UserTableProps {
  users: User[];
}

export default function UserTable({ users }: UserTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<'username' | 'coins'>('coins');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    (user.walletAddress && user.walletAddress.toLowerCase().includes(search.toLowerCase()))
  );
  
  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'username') {
      return sortOrder === 'asc' 
        ? a.username.localeCompare(b.username)
        : b.username.localeCompare(a.username);
    } else {
      return sortOrder === 'asc' 
        ? a.totalCoins - b.totalCoins
        : b.totalCoins - a.totalCoins;
    }
  });
  
  // Toggle sort
  const toggleSort = (field: 'username' | 'coins') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  // Calculate estimated value in EUR
  const calculateValue = (coins: number) => {
    return (coins * coinRates.COIN_VALUE_EUR).toFixed(2);
  };
  
  // Get time since last activity
  const getLastActivity = (user: User) => {
    const lastTime = user.lastClickTime || user.lastHourlyReward;
    if (!lastTime) return "Never";
    
    const now = new Date();
    const lastDate = new Date(lastTime);
    const diffInHours = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "< 1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const days = Math.floor(diffInHours / 24);
    return `${days} days ago`;
  };
  
  // Wallet status indicator
  const WalletStatus = ({ hasWallet }: { hasWallet: boolean }) => (
    hasWallet ? (
      <div className="flex items-center">
        <CheckCircle2 className="h-4 w-4 text-green-400 mr-1" />
        <span className="text-green-400">Connected</span>
      </div>
    ) : (
      <div className="flex items-center">
        <XCircle className="h-4 w-4 text-red-400 mr-1" />
        <span className="text-red-400">Not connected</span>
      </div>
    )
  );
  
  return (
    <Card className="crypto-card bg-dark-medium border-blue-900/20 p-5">
      <div className="flex flex-col md:flex-row justify-between mb-5 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-light-darker" />
          <Input
            placeholder="Search by username, email or wallet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-dark pl-9 border-blue-900/30 text-white"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-dark border-blue-900/30 hover:bg-blue-950/30"
            onClick={() => toggleSort('username')}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Sort by Name
            {sortBy === 'username' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-dark border-blue-900/30 hover:bg-blue-950/30"
            onClick={() => toggleSort('coins')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Sort by {coinName}
            {sortBy === 'coins' && (
              <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            )}
          </Button>
        </div>
      </div>
      
      <div className="bg-dark rounded-xl border border-blue-900/20 overflow-hidden">
        <ScrollArea className="h-[500px]">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-medium border-b border-blue-900/20">
                <th className="text-left p-4 text-light-darker font-medium">User</th>
                <th className="text-left p-4 text-light-darker font-medium hidden md:table-cell">Email</th>
                <th className="text-left p-4 text-light-darker font-medium hidden lg:table-cell">Wallet Status</th>
                <th className="text-left p-4 text-light-darker font-medium hidden md:table-cell">Last Active</th>
                <th className="text-right p-4 text-light-darker font-medium">{coinName}</th>
                <th className="text-right p-4 text-light-darker font-medium">Value (EUR)</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.length > 0 ? (
                sortedUsers.map((user) => (
                  <tr key={user.id} className="border-t border-blue-900/10 hover:bg-dark-medium transition-colors">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium mr-3 shadow-md shadow-blue-500/10">
                          <span>{user.username.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.username}</div>
                          <div className="text-xs text-light-darker md:hidden">{user.email}</div>
                          {user.isAdmin && (
                            <Badge className="mt-1 bg-blue-600 hover:bg-blue-500">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-light-darker hidden md:table-cell">
                      {user.email}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <WalletStatus hasWallet={!!user.walletAddress} />
                      {user.walletAddress && (
                        <div className="text-xs font-mono text-light-darker mt-1 truncate max-w-[180px]">
                          {formatAddress(user.walletAddress)}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-light-darker hidden md:table-cell">
                      {getLastActivity(user)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-medium text-gradient">
                        {formatNumber(user.totalCoins)}
                      </div>
                      <div className="text-xs text-light-darker">
                        Today: {formatNumber(user.todayCoins)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-medium text-green-400">
                        €{calculateValue(user.totalCoins)}
                      </div>
                      <div className="text-xs text-light-darker">
                        Est. value
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-light-darker">
                    <div className="flex flex-col items-center">
                      <Search className="h-10 w-10 text-light-darker mb-2" />
                      <div>No users found matching "{search}"</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>
      
      <div className="mt-5 flex flex-col md:flex-row justify-between items-center">
        <div className="text-light-darker text-sm mb-4 md:mb-0">
          Showing {filteredUsers.length} of {users.length} users
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400">
          <Download className="h-4 w-4 mr-2" />
          Export User Data
        </Button>
      </div>
    </Card>
  );
}
