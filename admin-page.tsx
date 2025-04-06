import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import AdminDashboard from "@/components/admin/admin-dashboard";
import UserTable from "@/components/admin/user-table";
import { Loader2, Download, Shield, Menu, Users } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Query for admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalUsers: number;
    totalCoins: number;
    averageCoins: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });
  
  // Query for all users
  const { data: users, isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });
  
  if (!user || !user.isAdmin) return null;
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark text-light">
      {/* Mobile Navigation Bar */}
      <div className="md:hidden bg-dark-medium p-4 flex justify-between items-center border-b border-blue-900/20 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-10 flex items-center justify-center border border-blue-500/20">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-gradient font-bold text-lg">CoinMiner Admin</div>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 rounded-full bg-dark flex items-center justify-center border border-blue-900/20"
        >
          <Menu className="h-5 w-5 text-light-darker" />
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
      <div className="flex-1 overflow-auto bg-crypto-gradient">
        <div className="p-5 md:p-8 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 bg-dark-medium rounded-xl p-6 border border-blue-900/20 crypto-card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center">
                  <Shield className="h-6 w-6 mr-3 text-blue-400" />
                  <h1 className="text-2xl md:text-3xl font-bold text-gradient">Admin Dashboard</h1>
                </div>
                <p className="text-light-darker mt-2">
                  Manage users, track coin distribution, and monitor platform activity
                </p>
              </div>
              <a 
                href="/api/admin/export" 
                target="_blank" 
                className="md:self-start"
              >
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export User Data
                </Button>
              </a>
            </div>
          </div>
          
          {/* Admin Dashboard Stats */}
          {statsLoading ? (
            <div className="flex justify-center py-12 bg-dark-medium rounded-xl border border-blue-900/20">
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-400 mb-3" />
                <div className="text-light-darker">Loading statistics...</div>
              </div>
            </div>
          ) : (
            <AdminDashboard stats={stats as any} />
          )}
          
          {/* Users Table */}
          <div className="mt-8">
            <div className="flex items-center mb-5">
              <Users className="h-5 w-5 mr-2 text-blue-400" />
              <h2 className="text-xl font-bold text-gradient">Registered Users</h2>
            </div>
            
            {usersLoading ? (
              <div className="flex justify-center py-16 bg-dark-medium rounded-xl border border-blue-900/20">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-400 mb-3" />
                  <div className="text-light-darker">Loading user data...</div>
                </div>
              </div>
            ) : (
              <UserTable users={users || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
