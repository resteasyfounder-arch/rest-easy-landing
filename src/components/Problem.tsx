import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileQuestion, MapPin, Zap, AlertCircle } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/hooks/useScrollAnimation";
const stats = [{
  value: "76%",
  label: "Americans without any estate planning documents"
}, {
  value: "212+",
  label: "Hours lost settling affairs per death by families"
}, {
  value: "30M",
  label: "Boomers projected to pass in the next 10-15 years"
}];
const challenges = [{
  icon: FileQuestion,
  title: "Exploding Digital Footprint",
  description: "The sheer volume of digital accounts, passwords, and fragmented information has led to unprecedented cognitive overload."
}, {
  icon: MapPin,
  title: "Increased Family Distribution",
  description: "Modern families are geographically dispersed, intensifying the challenge of coordinating affairs across diverse households."
}, {
  icon: Zap,
  title: "Rapid Pace of Change",
  description: "Constant technological and regulatory changes make it difficult to maintain a current view of one's life affairs."
}];
const Problem = () => {
  return;
};
export default Problem;