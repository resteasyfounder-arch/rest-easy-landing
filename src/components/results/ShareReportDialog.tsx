import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Share2, Loader2, Mail, CheckCircle, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ReadinessReport } from "@/types/report";

interface ShareReportDialogProps {
  report: ReadinessReport;
  assessmentId: string | null;
}

interface Recipient {
  email: string;
  name: string;
}

export function ShareReportDialog({ report, assessmentId }: ShareReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([
    { email: "", name: "" },
  ]);
  const [personalMessage, setPersonalMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const addRecipient = () => {
    if (recipients.length < 5) {
      setRecipients([...recipients, { email: "", name: "" }]);
    }
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (
    index: number,
    field: "email" | "name",
    value: string
  ) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };

  const handleSend = async () => {
    const validRecipients = recipients.filter(
      (r) => r.email.trim() && r.name.trim()
    );

    if (validRecipients.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please enter at least one recipient's name and email.",
        variant: "destructive",
      });
      return;
    }

    if (!assessmentId) {
      toast({
        title: "Unable to Share",
        description: "We couldn't verify the assessment for this report.",
        variant: "destructive",
      });
      return;
    }

    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = validRecipients.filter(
      (r) => !emailRegex.test(r.email)
    );
    if (invalidEmails.length > 0) {
      toast({
        title: "Invalid Email",
        description: "Please enter valid email addresses.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const reportSummary = {
        overallScore: report.overallScore,
        tier: report.tier,
        userName: report.userName,
        generatedAt: report.generatedAt,
        executiveSummary: report.executive_summary,
        immediateActions: report.immediate_actions.map((a) => ({
          title: a.title,
          description: a.description,
        })),
        strengths: report.strengths.map((s) => ({ title: s.title })),
        areasRequiringAttention: report.areas_requiring_attention.map((a) => ({
          title: a.title,
        })),
      };

      // Send to all recipients
      const results = await Promise.all(
        validRecipients.map((recipient) =>
          supabase.functions.invoke("send-report-email", {
            body: {
              assessmentId,
              recipientEmail: recipient.email,
              recipientName: recipient.name,
              senderName: report.userName,
              reportSummary,
              personalMessage: personalMessage.trim() || undefined,
            },
          })
        )
      );

      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        throw new Error("Some emails failed to send");
      }

      setSent(true);
      toast({
        title: "Report Shared!",
        description: `Your report has been sent to ${validRecipients.length} recipient(s).`,
      });

      // Reset after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setRecipients([{ email: "", name: "" }]);
        setPersonalMessage("");
      }, 2000);
    } catch (error: unknown) {
      console.error("Error sending report:", error);
      const message = error instanceof Error ? error.message : "There was an error sending the report. Please try again.";
      toast({
        title: "Failed to Send",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {sent ? (
          <div className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Report Sent Successfully!
            </h3>
            <p className="text-muted-foreground">
              Your recipients will receive the report summary shortly.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Share Your Report
              </DialogTitle>
              <DialogDescription>
                Send a summary of your Life Readiness Report to family members
                or trusted advisors. They'll receive key insights and action
                items.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Recipients</Label>
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Name (e.g., Sarah Smith)"
                        value={recipient.name}
                        onChange={(e) =>
                          updateRecipient(index, "name", e.target.value)
                        }
                      />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={recipient.email}
                        onChange={(e) =>
                          updateRecipient(index, "email", e.target.value)
                        }
                      />
                    </div>
                    {recipients.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecipient(index)}
                        className="shrink-0 mt-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {recipients.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRecipient}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Another Recipient
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal note to accompany your report..."
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {personalMessage.length}/500
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium text-foreground">
                  What's included in the email:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your overall readiness score and tier</li>
                  <li>• Executive summary of your preparedness</li>
                  <li>• Top strengths and areas needing attention</li>
                  <li>• Priority action items</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={sending}
              >
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={sending} className="gap-2">
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
