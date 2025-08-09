import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-navy text-foreground flex items-center justify-center px-4">
      <Card className="w-full max-w-md glass-effect border-glass-border">
        <CardContent className="pt-6 text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-4" data-testid="app-title">
              Gooners
            </h1>
            <p className="text-muted-foreground text-lg" data-testid="app-subtitle">
              Connect with your gooning partners
            </p>
          </div>
          
          <div className="mb-8 space-y-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-3 h-3 bg-neon-green rounded-full"></div>
              <span className="text-sm">Share photos and videos</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-3 h-3 bg-purple-neon rounded-full"></div>
              <span className="text-sm">24-hour status stories</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-3 h-3 bg-neon-pink rounded-full"></div>
              <span className="text-sm">Private & group chats</span>
            </div>
            <div className="flex items-center space-x-3 text-left">
              <div className="w-3 h-3 bg-neon-green rounded-full"></div>
              <span className="text-sm">Global chat community</span>
            </div>
          </div>

          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="w-full floating-btn hover-glow text-lg py-6"
            data-testid="button-login"
          >
            Get Started
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Full freedom of expression • No restrictions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
