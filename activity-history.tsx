import { format } from "date-fns";
import { Activity, coinName } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { History, Clock, MousePointerClick, Wallet, HelpCircle } from "lucide-react";

interface ActivityHistoryProps {
  activities: Activity[];
}

export default function ActivityHistory({ activities }: ActivityHistoryProps) {
  // Formatter per i numeri con lo stile italiano
  const formatter = new Intl.NumberFormat('it-IT', { 
    style: 'decimal',
    maximumFractionDigits: 0
  });
  // Funzione per renderizzare l'icona dell'attività in base al tipo
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case "PASSIVE":
        return (
          <div className="w-12 h-12 mr-4 rounded-full bg-blue-500 bg-opacity-15 flex items-center justify-center shadow-md shadow-blue-500/10 border border-blue-500/20">
            <Clock className="h-6 w-6 text-blue-400" />
          </div>
        );
      case "CLICK":
        return (
          <div className="w-12 h-12 mr-4 rounded-full bg-purple-500 bg-opacity-15 flex items-center justify-center shadow-md shadow-purple-500/10 border border-purple-500/20">
            <MousePointerClick className="h-6 w-6 text-purple-400" />
          </div>
        );
      case "WALLET_CONNECTED":
        return (
          <div className="w-12 h-12 mr-4 rounded-full bg-green-500 bg-opacity-15 flex items-center justify-center shadow-md shadow-green-500/10 border border-green-500/20">
            <Wallet className="h-6 w-6 text-green-400" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 mr-4 rounded-full bg-gray-500 bg-opacity-15 flex items-center justify-center shadow-md shadow-gray-500/10 border border-gray-500/20">
            <HelpCircle className="h-6 w-6 text-gray-400" />
          </div>
        );
    }
  };
  
  // Funzione per ottenere la descrizione dell'attività
  const getActivityDescription = (type: string) => {
    switch (type) {
      case "PASSIVE":
        return "Ricompensa Mining Orario";
      case "CLICK":
        return "Ricompensa Mining Click";
      case "WALLET_CONNECTED":
        return "Wallet Collegato";
      default:
        return "Attività Sconosciuta";
    }
  };
  
  // Funzione per formattare il tempo relativo
  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "Appena adesso";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minut${minutes !== 1 ? 'i' : 'o'} fa`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} or${hours !== 1 ? 'e' : 'a'} fa`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} giorn${days !== 1 ? 'i' : 'o'} fa`;
    }
  };
  
  // Funzione per determinare il colore per il tipo di attività
  const getActivityColor = (type: string) => {
    switch (type) {
      case "PASSIVE": return "text-blue-400";
      case "CLICK": return "text-purple-400";
      case "WALLET_CONNECTED": return "text-green-400";
      default: return "text-gray-400";
    }
  };
  
  return (
    <Card className="crypto-card p-6 mb-8 card-highlight hover-scale">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <History className="h-6 w-6 mr-2 text-blue-400" />
          <h2 className="text-xl font-bold text-gradient">Attività Recenti</h2>
        </div>
        
        <div className="text-sm text-light-darker glass-effect px-4 py-1.5 rounded-full">
          {activities.length} Record
        </div>
      </div>
      
      <ScrollArea className="h-80 rounded-xl overflow-hidden">
        <div className="glass-effect rounded-xl border border-blue-900/20 overflow-hidden">
          {activities.length > 0 ? (
            <div className="divide-y divide-blue-900/20">
              {activities.map((activity) => (
                <div key={activity.id} className="p-5 hover:bg-dark/60 transition-colors">
                  <div className="flex items-start">
                    {renderActivityIcon(activity.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${getActivityColor(activity.type)}`}>
                          {getActivityDescription(activity.type)}
                        </span>
                        <span className="text-light-darker text-sm">
                          {formatRelativeTime(activity.createdAt)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-light-darker">
                          {format(new Date(activity.createdAt), "d MMM yyyy • HH:mm")}
                        </span>
                        {activity.amount ? (
                          <span className="text-green-400 font-medium">
                            +{formatter.format(activity.amount)} {coinName}
                          </span>
                        ) : (
                          <span className="text-light-darker">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <History className="h-12 w-12 text-light-darker mb-4" />
              <p className="text-light-darker text-center mb-2">
                Nessuna attività ancora
              </p>
              <p className="text-light-darker text-sm text-center mb-6">
                Inizia a minare per vedere le tue attività qui!
              </p>
              <Button variant="outline" className="border-blue-900/30 hover:bg-blue-950/30">
                <MousePointerClick className="h-4 w-4 mr-2" />
                Inizia Mining
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {activities.length > 5 && (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" size="sm" className="border-blue-900/30 hover:bg-blue-950/30 glass-effect">
            <History className="h-4 w-4 mr-2" />
            Visualizza Cronologia Completa
          </Button>
        </div>
      )}
    </Card>
  );
}
