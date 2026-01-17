import { Headphones, FolderOpen, Users, CalendarCheck } from "lucide-react";

const ResourcesSection = () => {
  const services = [
    {
      icon: Headphones,
      title: "Personalized Guidance",
      description: "One-on-one consultations to help you prioritize and work through your action items"
    },
    {
      icon: FolderOpen,
      title: "Document Organization",
      description: "Assistance in gathering, organizing, and securely storing your important documents"
    },
    {
      icon: Users,
      title: "Family Conversations",
      description: "Facilitated discussions to help you communicate your wishes to loved ones"
    },
    {
      icon: CalendarCheck,
      title: "Ongoing Support",
      description: "Regular check-ins to ensure your plans stay current as life changes"
    }
  ];

  return (
    <div className="print:break-inside-avoid">
      <h2 className="font-display text-xl font-bold text-gray-900 mb-2">
        Resources and Support
      </h2>
      <p className="font-body text-gray-600 mb-6">
        Rest Easy is here to support you throughout your planning journey. Our services are designed 
        to meet you where you are, whether you need guidance on getting started, help organizing your 
        existing plans, or comprehensive support in addressing all aspects of your end-of-life preparedness.
      </p>
      
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">
        How Rest Easy Can Help
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {services.map((service, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <service.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-semibold text-gray-900 mb-1">
                {service.title}
              </h4>
              <p className="font-body text-sm text-gray-600">
                {service.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
        <p className="font-body text-gray-700 text-center">
          This report is the beginning of a conversation, not the end. We encourage you to reach out 
          with questions, schedule a consultation to discuss your specific situation, or simply let us 
          know how we can support you in achieving the peace of mind that comes with knowing your 
          affairs are in order.
        </p>
      </div>
    </div>
  );
};

export default ResourcesSection;
