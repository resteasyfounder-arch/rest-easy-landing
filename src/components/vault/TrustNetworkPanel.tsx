import { useState, useCallback } from "react";
import { Mail, MessageCircle, Copy, UserPlus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTrustedContacts } from "@/hooks/useTrustedContacts";
import AddContactDialog from "./AddContactDialog";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function getReferralUrl() {
  return `${window.location.origin}?ref=invite`;
}

const TrustNetworkPanel = () => {
  const { contacts, add, remove } = useTrustedContacts();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAdd = useCallback(
    (params: { name: string; email: string }) => {
      add.mutate(params, { onSuccess: () => setDialogOpen(false) });
    },
    [add]
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getReferralUrl());
      toast({ title: "Link copied", description: "Referral link copied to clipboard." });
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
  }, [toast]);

  const handleEmail = useCallback(() => {
    const url = getReferralUrl();
    const subject = encodeURIComponent("Join me on Rest Easy");
    const body = encodeURIComponent(
      `I'm using Rest Easy to organize important documents and I think you'd find it valuable. Check it out: ${url}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  }, []);

  const handleWhatsApp = useCallback(() => {
    const url = getReferralUrl();
    const text = encodeURIComponent(
      `I'm using Rest Easy to organize important documents. Join me: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }, []);


  return (
    <>
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
            <div className="space-y-2">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(c.contact_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.contact_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{c.contact_email}</p>
                  </div>
                  <button
                    onClick={() => remove.mutate(c.id)}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-full hover:bg-destructive/10 transition-all"
                    aria-label={`Remove ${c.contact_name}`}
                  >
                    <X className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setDialogOpen(true)}
                className="h-10 w-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary/50 transition-colors"
              >
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </button>
              {contacts.length === 0 && (
                <p className="text-xs text-muted-foreground">Add people you trust</p>
              )}
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
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleEmail}>
                <Mail className="h-3.5 w-3.5" /> Email
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleWhatsApp}>
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleCopyLink}>
                <Copy className="h-3.5 w-3.5" /> Copy Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdd={handleAdd}
        isPending={add.isPending}
      />
    </>
  );
};

export default TrustNetworkPanel;
