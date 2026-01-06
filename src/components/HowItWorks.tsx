import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Camera, CheckCircle2, ArrowRight, FolderLock } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/hooks/useScrollAnimation";
const steps = [{
  number: "01",
  icon: Sparkles,
  title: "Capture without commitment",
  description: "Effortlessly gather essential information at your own pace. Our intuitive platform provides helpful prompts, ensuring a low-pressure start."
}, {
  number: "02",
  icon: Camera,
  title: "Instant snapshot",
  description: "Receive an immediate, high-level overview of your information across key domains, offering quick insights into your current preparedness."
}, {
  number: "03",
  icon: CheckCircle2,
  title: "Neutral reality check",
  description: "Gain an objective understanding of your readiness across legal, financial, and personal domains — presented as straightforward status."
}, {
  number: "04",
  icon: ArrowRight,
  title: "One clear next step",
  description: "Identify the single most impactful action to take next. We cut through complexity, providing just one actionable step at a time."
}, {
  number: "05",
  icon: FolderLock,
  title: "A place to store, never get lost",
  description: "Safely store all your critical information in one accessible location. Your data is preserved and easily retrievable when needed."
}];
const HowItWorks = () => {
  return;
};
export default HowItWorks;