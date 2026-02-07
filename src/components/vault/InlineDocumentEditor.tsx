import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";

interface InlineDocumentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTypeId: string;
  documentName: string;
  existingContent?: string | null;
  onSave: (content: string) => void;
  isSaving: boolean;
}

// --- Form renderers per document type ---

interface SocialMediaEntry {
  platform: string;
  action: string;
  transferTo?: string;
}

function SocialMediaForm({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const entries: SocialMediaEntry[] = value?.entries ?? [];
  const additionalNotes: string = value?.additionalNotes ?? "";

  const updateEntry = (i: number, patch: Partial<SocialMediaEntry>) => {
    const next = [...entries];
    next[i] = { ...next[i], ...patch };
    onChange({ entries: next, additionalNotes });
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Social Media Accounts</Label>
      {entries.map((entry, i) => (
        <div key={i} className="flex items-start gap-2">
          <Input placeholder="Platform" value={entry.platform} onChange={(e) => updateEntry(i, { platform: e.target.value })} className="flex-1" />
          <Select value={entry.action} onValueChange={(v) => updateEntry(i, { action: v })}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="memorialize">Memorialize</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          {entry.action === "transfer" && (
            <Input placeholder="Transfer to…" value={entry.transferTo ?? ""} onChange={(e) => updateEntry(i, { transferTo: e.target.value })} className="w-36" />
          )}
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => onChange({ entries: entries.filter((_, j) => j !== i), additionalNotes })}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onChange({ entries: [...entries, { platform: "", action: "delete" }], additionalNotes })}>
        <Plus className="h-3.5 w-3.5" /> Add Platform
      </Button>
      <div>
        <Label className="text-sm">Additional Instructions</Label>
        <Textarea value={additionalNotes} onChange={(e) => onChange({ entries, additionalNotes: e.target.value })} placeholder="Any other instructions…" rows={3} className="mt-1" />
      </div>
    </div>
  );
}

function EmailAccessForm({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const entries: { provider: string; email: string; recovery: string }[] = value?.entries ?? [];
  const instructions: string = value?.instructions ?? "";

  const updateEntry = (i: number, patch: any) => {
    const next = [...entries];
    next[i] = { ...next[i], ...patch };
    onChange({ entries: next, instructions });
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Email Accounts</Label>
      {entries.map((entry, i) => (
        <div key={i} className="space-y-2 p-3 border border-border rounded-md">
          <div className="flex gap-2">
            <Input placeholder="Provider (Gmail, Outlook…)" value={entry.provider} onChange={(e) => updateEntry(i, { provider: e.target.value })} />
            <Input placeholder="Email address" value={entry.email} onChange={(e) => updateEntry(i, { email: e.target.value })} />
            <Button variant="ghost" size="icon" onClick={() => onChange({ entries: entries.filter((_, j) => j !== i), instructions })}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <Input placeholder="Recovery method / backup codes" value={entry.recovery} onChange={(e) => updateEntry(i, { recovery: e.target.value })} />
        </div>
      ))}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onChange({ entries: [...entries, { provider: "", email: "", recovery: "" }], instructions })}>
        <Plus className="h-3.5 w-3.5" /> Add Email Account
      </Button>
      <div>
        <Label className="text-sm">Additional Instructions</Label>
        <Textarea value={instructions} onChange={(e) => onChange({ entries, instructions: e.target.value })} placeholder="How to access, backup codes location…" rows={3} className="mt-1" />
      </div>
    </div>
  );
}

function DigitalAccountForm({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const entries: { service: string; username: string; notes: string }[] = value?.entries ?? [];
  const context: string = value?.context ?? "";

  const updateEntry = (i: number, patch: any) => {
    const next = [...entries];
    next[i] = { ...next[i], ...patch };
    onChange({ entries: next, context });
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Digital Accounts</Label>
      {entries.map((entry, i) => (
        <div key={i} className="flex items-start gap-2">
          <Input placeholder="Service" value={entry.service} onChange={(e) => updateEntry(i, { service: e.target.value })} className="flex-1" />
          <Input placeholder="Username / email" value={entry.username} onChange={(e) => updateEntry(i, { username: e.target.value })} className="flex-1" />
          <Input placeholder="Notes" value={entry.notes} onChange={(e) => updateEntry(i, { notes: e.target.value })} className="flex-1" />
          <Button variant="ghost" size="icon" onClick={() => onChange({ entries: entries.filter((_, j) => j !== i), context })}>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onChange({ entries: [...entries, { service: "", username: "", notes: "" }], context })}>
        <Plus className="h-3.5 w-3.5" /> Add Account
      </Button>
      <div>
        <Label className="text-sm">Additional Context</Label>
        <Textarea value={context} onChange={(e) => onChange({ entries, context: e.target.value })} placeholder="Password manager details, other notes…" rows={3} className="mt-1" />
      </div>
    </div>
  );
}

function OrganDonorForm({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const status: string = value?.status ?? "";
  const wishes: string = value?.wishes ?? "";

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Donor Status</Label>
        <Select value={status} onValueChange={(v) => onChange({ status: v, wishes })}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes — I am a registered donor</SelectItem>
            <SelectItem value="no">No — I do not wish to donate</SelectItem>
            <SelectItem value="undecided">Undecided</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm">Specific Wishes or Restrictions</Label>
        <Textarea value={wishes} onChange={(e) => onChange({ status, wishes: e.target.value })} placeholder="Any specific organs, tissue types, or restrictions…" rows={4} className="mt-1" />
      </div>
    </div>
  );
}

function LetterOfIntentForm({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const content: string = value?.content ?? "";

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Your Personal Letter</Label>
        <p className="text-xs text-muted-foreground mb-2">
          Share your values, wishes, and messages for your loved ones. This letter is not legally binding but can guide those you leave behind.
        </p>
        <Textarea
          value={content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Dear family and friends…"
          rows={12}
          className="mt-1"
        />
      </div>
    </div>
  );
}

// --- Main editor ---

const formMap: Record<string, React.FC<{ value: any; onChange: (v: any) => void }>> = {
  "social-media-wishes": SocialMediaForm,
  "email-access": EmailAccessForm,
  "digital-account-inventory": DigitalAccountForm,
  "organ-donor-info": OrganDonorForm,
  "letter-of-intent": LetterOfIntentForm,
};

const InlineDocumentEditor = ({
  open,
  onOpenChange,
  documentTypeId,
  documentName,
  existingContent,
  onSave,
  isSaving,
}: InlineDocumentEditorProps) => {
  const [formValue, setFormValue] = useState<any>({});

  useEffect(() => {
    if (existingContent) {
      try {
        setFormValue(JSON.parse(existingContent));
      } catch {
        setFormValue({});
      }
    } else {
      setFormValue({});
    }
  }, [existingContent, open]);

  const FormComponent = formMap[documentTypeId];

  const handleSave = () => {
    onSave(JSON.stringify(formValue));
  };

  if (!FormComponent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existingContent ? "Edit" : "Create"} {documentName}</DialogTitle>
        </DialogHeader>

        <FormComponent value={formValue} onChange={setFormValue} />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-1.5">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InlineDocumentEditor;
