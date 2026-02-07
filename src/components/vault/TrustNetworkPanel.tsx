import { Mail, MessageCircle, Share2, Copy, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const TrustNetworkPanel = () => {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Trust Network</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Trusted Contacts */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Your Trusted Contacts
          </h4>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </button>
            <p className="text-xs text-muted-foreground">Add people you trust</p>
          </div>
        </div>

        <Separator />

        {/* Who Trusts You */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Who Trusts You
          </h4>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-muted">
              <AvatarFallback className="text-xs bg-muted text-muted-foreground">?</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">No one yet — invite your network</p>
          </div>
        </div>

        <Separator />

        {/* Invite Network */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Invite Your Network
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Mail className="h-3.5 w-3.5" /> Email
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Copy className="h-3.5 w-3.5" /> Copy Link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrustNetworkPanel;
