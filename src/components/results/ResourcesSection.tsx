const ResourcesSection = () => {
  return (
    <section className="mb-12 print:break-inside-avoid">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
        Resources and Support
      </h2>
      
      <p className="font-body text-gray-700 leading-relaxed mb-8">
        Rest Easy is here to support you throughout your planning journey. Our services are designed 
        to meet you where you are, whether you need guidance on getting started, help organizing your 
        existing plans, or comprehensive support in addressing all aspects of your end-of-life preparedness.
      </p>
      
      <h3 className="font-display text-xl font-bold text-gray-900 mb-4">
        How Rest Easy Can Help
      </h3>
      
      <ul className="space-y-3 mb-8">
        <li className="font-body text-gray-700">
          <span className="font-semibold">Personalized Guidance:</span> One-on-one consultations to help you prioritize and work through your action items
        </li>
        <li className="font-body text-gray-700">
          <span className="font-semibold">Document Organization:</span> Assistance in gathering, organizing, and securely storing your important documents
        </li>
        <li className="font-body text-gray-700">
          <span className="font-semibold">Family Conversations:</span> Facilitated discussions to help you communicate your wishes to loved ones
        </li>
        <li className="font-body text-gray-700">
          <span className="font-semibold">Ongoing Support:</span> Regular check-ins to ensure your plans stay current as life changes
        </li>
      </ul>
      
      <p className="font-body text-gray-700 leading-relaxed italic">
        This report is the beginning of a conversation, not the end. We encourage you to reach out 
        with questions, schedule a consultation to discuss your specific situation, or simply let us 
        know how we can support you in achieving the peace of mind that comes with knowing your 
        affairs are in order.
      </p>
    </section>
  );
};

export default ResourcesSection;
