import { useState } from "react";
import { User, coinRates, coinName } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { connectWallet, formatAddress } from "@/lib/wallet";
import { Loader2, Wallet } from "lucide-react";

interface WalletSectionProps {
  user: User;
}

export default function WalletSection({ user }: WalletSectionProps) {
  const { updateWalletMutation } = useAuth();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [connecting, setConnecting] = useState(false);
  
  // Formatter per i numeri con lo stile italiano
  const formatter = new Intl.NumberFormat('it-IT', { 
    style: 'decimal',
    maximumFractionDigits: 0
  });
  
  // Calcola il valore stimato in EUR
  const estimatedValue = (user.totalCoins * coinRates.COIN_VALUE_EUR).toFixed(2);
  
  const handleConnect = async () => {
    try {
      setConnecting(true);
      const wallet = await connectWallet();
      setWalletAddress(wallet.address);
    } catch (error: any) {
      console.error("Impossibile collegare il wallet:", error.message);
    } finally {
      setConnecting(false);
    }
  };
  
  const handleSaveWallet = () => {
    if (walletAddress) {
      updateWalletMutation.mutate({ walletAddress });
      setWalletModalOpen(false);
      setWalletAddress("");
    }
  };
  
  return (
    <>
      <Card className="crypto-card p-6 h-fit card-highlight hover-scale">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gradient">Dettagli Wallet</h2>
          <Button 
            variant="outline"
            size="sm"
            className="glass-effect border-blue-800/30 hover:bg-blue-950/30"
            onClick={() => setWalletModalOpen(true)}
          >
            {user.walletAddress ? "Aggiorna" : "Collega"}
          </Button>
        </div>
        
        <div className="glass-effect rounded-xl p-5 mb-5 border border-blue-900/20 hover-scale">
          <div className="flex items-center justify-between mb-2">
            <div className="text-light-darker text-sm">Wallet Collegato</div>
            {user.walletAddress && (
              <div className="text-xs px-3 py-1 bg-blue-950/50 text-blue-400 rounded-full">
                Ethereum
              </div>
            )}
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-500 bg-opacity-15 flex items-center justify-center mr-4 border border-blue-500/20">
              <Wallet className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              {user.walletAddress ? (
                <div className="font-mono text-base overflow-hidden text-ellipsis truncate text-white">
                  {formatAddress(user.walletAddress)}
                </div>
              ) : (
                <div className="font-medium text-light-darker">Non collegato</div>
              )}
              {user.walletAddress && (
                <div className="text-xs text-light-darker mt-1">Ethereum Mainnet</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Valore Wallet */}
        <div className="glass-effect rounded-xl p-5 mb-5 border border-blue-900/20 hover-scale">
          <div className="text-light-darker text-sm mb-2">Valore Stimato</div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-green-500 bg-opacity-15 flex items-center justify-center mr-4 border border-green-500/20">
              <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">€{estimatedValue}</div>
              <div className="text-sm text-light-darker">
                {formatter.format(user.totalCoins)} {coinName} × €{coinRates.COIN_VALUE_EUR}
              </div>
            </div>
          </div>
        </div>
        
        {/* Prossima Distribuzione */}
        <div className="glass-effect rounded-xl p-5 border border-blue-900/20 hover-scale">
          <div className="text-light-darker text-sm mb-2">Prossima Distribuzione</div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-yellow-500 bg-opacity-15 flex items-center justify-center mr-4 border border-yellow-500/20">
              <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-medium text-yellow-400">In Attesa del Lancio Ufficiale</div>
              <div className="text-sm text-light-darker">{coinName} sarà inviato al tuo wallet</div>
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full mt-5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 glow-primary transition-all duration-300"
          onClick={() => setWalletModalOpen(true)}
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {user.walletAddress ? "Aggiorna Wallet" : "Collega Wallet"}
        </Button>
      </Card>
      
      {/* Modale Wallet */}
      <Dialog open={walletModalOpen} onOpenChange={setWalletModalOpen}>
        <DialogContent className="glass-effect border-blue-800/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-gradient">Collega il Tuo Wallet</DialogTitle>
            <DialogDescription className="text-light-darker">
              Collega il tuo wallet per ricevere {coinName} durante la distribuzione ufficiale
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <Button 
              onClick={handleConnect} 
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 hover:shadow-lg hover:shadow-orange-500/20"
              disabled={connecting}
            >
              {connecting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              Collega con MetaMask
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink mx-3 text-light-darker">oppure</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Indirizzo Wallet</label>
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="es. 0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                className="bg-dark border-blue-900/30 text-white font-mono"
              />
            </div>
            
            <div className="flex space-x-3 justify-end pt-4">
              <Button 
                variant="outline"
                onClick={() => setWalletModalOpen(false)}
                className="border-blue-900/30 hover:bg-blue-950/30"
              >
                Annulla
              </Button>
              <Button
                onClick={handleSaveWallet}
                disabled={!walletAddress || updateWalletMutation.isPending}
                className="bg-blue-600 hover:bg-blue-500"
              >
                {updateWalletMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Salva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
