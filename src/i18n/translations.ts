export interface LocaleDictionary {
  nav: {
    home: string;
    features: string;
    howItWorks: string;
    vision: string;
    about: string;
    signIn: string;
    startFree: string;
  };
  hero: {
    badge: string;
    title: string;
    highlight: string;
    subtitle: string;
    bullets: string[];
    ctaPrimary: string;
    ctaSecondary: string;
    socialProof: string;
  };
  features: {
    badge: string;
    heading: string;
    subheading: string;
    salesTitle: string;
    salesDesc: string;
    customerTitle: string;
    customerDesc: string;
    inventoryTitle: string;
    inventoryDesc: string;
    aiTitle: string;
    aiDesc: string;
    reminderTitle: string;
    reminderDesc: string;
    insightsTitle: string;
    insightsDesc: string;
  };
  howItWorks: {
    heading: string;
    subheading: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
  };
  languageDemo: {
    heading: string;
    subtext: string;
  };
  sandboxDemo: {
    heading: string;
    subtext: string;
    badge: string;
    title: string;
    help: string;
    dbView: string;
  };
  vision: {
    badge: string;
    heading: string;
    blockquotePart1: string;
    blockquoteHighlight: string;
    description: string;
    path1Title: string;
    path1Desc: string;
    path2Title: string;
    path2Desc: string;
    path3Title: string;
    path3Desc: string;
    comingSoon: string;
  };
  cta: {
    title: string;
    subtitle: string;
    btnText: string;
    disclaimer: string;
  };
  footer: {
    desc: string;
    prodColTitle: string;
    compColTitle: string;
    helpColTitle: string;
    subscribeColTitle: string;
    features: string;
    pricing: string;
    updates: string;
    integrations: string;
    about: string;
    careers: string;
    blog: string;
    contact: string;
    helpCenter: string;
    privacy: string;
    terms: string;
    refund: string;
    subscribePlaceholder: string;
    copy: string;
  };
}

export const translations: Record<string, LocaleDictionary> = {
  en: {
    nav: {
      home: "Home",
      features: "Features",
      howItWorks: "How It Works",
      vision: "Vision",
      about: "About",
      signIn: "Sign In",
      startFree: "Start Free",
    },
    hero: {
      badge: "AI Business Assistant",
      title: "Run Your Business.",
      highlight: "Simply by speaking.",
      subtitle: "BoloBiz understands your business in your own language and helps you scale operations.",
      bullets: [
        "Speak naturally in Hindi, English, and Hinglish",
        "Keep complete track of your business records",
        "Get instant automated responses from AI",
        "Save time and reduce stress",
      ],
      ctaPrimary: "🎙️ Start Speaking",
      ctaSecondary: "▶ Watch How It Works",
      socialProof: "10,000+ Happy Business Owners",
    },
    features: {
      badge: "All in One Place",
      heading: "Everything for Your Business",
      subheading: "All essential tools on a single platform",
      salesTitle: "Sales & Transactions",
      salesDesc: "Log sales, credits, payments, and expenses simply by talking.",
      customerTitle: "Customer Ledger (Khata)",
      customerDesc: "View outstanding balances and complete transaction histories.",
      inventoryTitle: "Inventory Stock",
      inventoryDesc: "Track stock quantities and get automated low-stock warnings.",
      aiTitle: "AI Voice Assistant",
      aiDesc: "Ask your business questions directly by speaking and get answers.",
      reminderTitle: "Smart Reminders",
      reminderDesc: "Send pending payment reminders and receive alerts.",
      insightsTitle: "Reports & Insights",
      insightsDesc: "Understand your business data with detailed dashboards.",
    },
    howItWorks: {
      heading: "Business Management Made Simple",
      subheading: "BoloBiz wraps complex bookkeeping features in a simple voice loop",
      step1Title: "🎙️ बोलिए (Speak)",
      step1Desc: "Speak or type in your language. E.g. 'Aaj Ramesh ko 500 rupaye udhaar diye.'",
      step2Title: "🧠 BoloBiz Understands",
      step2Desc: "Our AI maps your words to extract the exact transaction amounts and names.",
      step3Title: "⚡ Action Executed",
      step3Desc: "BoloBiz updates your database ledger, stock count, and balances securely.",
      step4Title: "📊 Ask & Learn",
      step4Desc: "Ask 'Ramesh ka kitna balance baki hai?' to get live reports.",
    },
    languageDemo: {
      heading: "BoloBiz understands you, in whatever language you speak.",
      subtext: "Whether you speak in Hindi, write in Hinglish, or command in English, BoloBiz maps everything into the exact same structured database records.",
    },
    sandboxDemo: {
      heading: "Interactive Sandbox Simulator",
      subtext: "Test a simulated BoloBiz interface. Click on any question chip below to see how BoloBiz queries data and updates the visual UI.",
      badge: "Sandbox Environment",
      title: "BoloBiz AI Assistant",
      help: "Click a question chip to view synchronized database reports.",
      dbView: "Client Dashboard Sync View",
    },
    vision: {
      badge: "💡 Core Philosophy",
      heading: "Technology should be easy for you.",
      blockquotePart1: "You don't need to learn technology. ",
      blockquoteHighlight: "Technology should understand you.",
      description: "We believe language and technical skill should never stand in the way of managing a business. BoloBiz is built to empower merchants, store owners, and freelancers to handle bookkeeping using natural everyday voice commands.",
      path1Title: "Micro & Local Shop",
      path1Desc: "Manage ledger entries, credits, sales, and products catalog instantly via voice interface. Ideal for kirana shops, stalls, and freelancers.",
      path2Title: "Growing Business",
      path2Desc: "Get comprehensive reports, invite multiple employees to log entries, and track inventory stock alerts automatically.",
      path3Title: "Multi-Branch Setup",
      path3Desc: "Aggregate metrics from multiple shops, monitor branch-level insights, and assign permissions for decentralized inventory teams.",
      comingSoon: "Coming Later",
    },
    cta: {
      title: "Simplify your business operations",
      subtitle: "Spend less time managing books and more time growing your business.",
      btnText: "🎙️ Start Today — Absolutely Free",
      disclaimer: "No credit card required · 14-day free trial",
    },
    footer: {
      desc: "Your AI business assistant in your own language. Speak and simplify your business.",
      prodColTitle: "Product",
      compColTitle: "Company",
      helpColTitle: "Support",
      subscribeColTitle: "Subscribe",
      features: "Features",
      pricing: "Pricing",
      updates: "Updates",
      integrations: "Integrations",
      about: "About Us",
      careers: "Careers",
      blog: "Blog",
      contact: "Contact",
      helpCenter: "Help Center",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      refund: "Refund Policy",
      subscribePlaceholder: "Your email",
      copy: "BoloBiz. All rights reserved.",
    },
  },
  hi: {
    nav: {
      home: "होम",
      features: "फीचर्स",
      howItWorks: "काम कैसे करता है",
      vision: "विज़न",
      about: "हमारे बारे में",
      signIn: "साइन इन करें",
      startFree: "शुरू करें मुफ्त में",
    },
    hero: {
      badge: "AI बिज़नेस असिस्टेंट",
      title: "Run Your Business.",
      highlight: "बस बोलकर।",
      subtitle: "BoloBiz आपकी अपनी भाषा में आपके बिज़नेस को समझता है और आपकी मदद करता है बढ़ाने में।",
      bullets: [
        "हिंदी, English और Hinglish में बात करें",
        "अपने बिज़नेस का पूरा हिसाब रखें",
        "AI से तुरंत जवाब पाएं",
        "समय बचाएँ, तनाव कम करें",
      ],
      ctaPrimary: "🎙️ बोलकर शुरुआत करें",
      ctaSecondary: "▶ देखें कैसे काम करता है",
      socialProof: "10,000+ खुश बिज़नेस मालिक",
    },
    features: {
      badge: "सब कुछ एक जगह",
      heading: "आपके बिज़नेस के लिए सब कुछ",
      subheading: "एक ही प्लेटफॉर्म पर सभी जरूरी सुविधाएं",
      salesTitle: "बिक्री और लेन-देन",
      salesDesc: "बिक्री, उधार, भुगतान और खर्च को आसानी से बोलकर रिकॉर्ड करें।",
      customerTitle: "ग्राहक प्रबंधन",
      customerDesc: "ग्राहकों का पूरा रिकॉर्ड, बकाया राशि और भुगतान इतिहास देखें।",
      inventoryTitle: "इन्वेंट्री मैनेजमेंट",
      inventoryDesc: "स्टॉक की स्थिति ट्रैक करें और कम स्टॉक होने पर अलर्ट पाएं।",
      aiTitle: "AI से पूछें कुछ भी",
      aiDesc: "अपने बिज़नेस से जुड़े सवाल सीधे बोलकर पूछें और तुरंत जवाब पाएं।",
      reminderTitle: "स्मार्ट रिमाइंडर",
      reminderDesc: "बकाया भुगतान के लिए रिमाइंडर भेजें और महत्वपूर्ण अलर्ट प्राप्त करें।",
      insightsTitle: "रिपोर्ट्स और इनसाइट्स",
      insightsDesc: "डिटेल रिपोर्ट्स और इनसाइट्स से अपने बिज़नेस को बेहतर समझें।",
    },
    howItWorks: {
      heading: "बिज़नेस चलाना अब बेहद आसान",
      subheading: "BoloBiz आपके बिज़नेस के हिसाब-किताब को एक आसान बोलचाल के लूप में बदलता है",
      step1Title: "🎙️ बोलिए",
      step1Desc: "अपनी भाषा में बोलें या लिखें। जैसे: 'आज रमेश को 500 रुपये उधार दिए।'",
      step2Title: "🧠 BoloBiz समझेगा",
      step2Desc: "हमारा AI आपके शब्दों को समझकर राशि और नाम जैसी डिटेल्स निकाल लेता है।",
      step3Title: "⚡ काम हो जाएगा",
      step3Desc: "BoloBiz आपके रिकॉर्ड, स्टॉक संख्या और बकाये को सुरक्षित रूप से अपडेट करता है।",
      step4Title: "📊 पूछिए और जानिए",
      step4Desc: "पूछें 'रमेश का कितना उधार बाकी है?' और तुरंत लाइव रिपोर्ट पाएं।",
    },
    languageDemo: {
      heading: "जिस भाषा में आप बोलते हैं, BoloBiz उसी भाषा में समझता है।",
      subtext: "चाहे आप हिंदी में बोलें, हिंग्लिश में लिखें, या इंग्लिश में कहें, BoloBiz सब कुछ एक समान डेटाबेस रिकॉर्ड में सुरक्षित कर देता है।",
    },
    sandboxDemo: {
      heading: "इंटरैक्टिव सैंडबॉक्स सिम्युलेटर",
      subtext: "BoloBiz इंटरफ़ेस का अनुभव करें। नीचे दिए गए किसी भी प्रश्न पर क्लिक करें और देखें कि BoloBiz डेटा कैसे दिखाता है।",
      badge: "सैंडबॉक्स एनवायरनमेंट",
      title: "BoloBiz AI असिस्टेंट",
      help: "डेटाबेस रिपोर्ट देखने के लिए नीचे दिए गए किसी प्रश्न पर क्लिक करें।",
      dbView: "क्लाइंट डैशबोर्ड सिंक व्यू",
    },
    vision: {
      badge: "💡 मूल सिद्धांत",
      heading: "तकनीक आपके लिए आसान होनी चाहिए।",
      blockquotePart1: "आपको technology सीखने की ज़रूरत नहीं। ",
      blockquoteHighlight: "Technology को आपको समझना चाहिए।",
      description: "हमारा मानना है कि भाषा और तकनीकी कौशल कभी भी बिज़नेस संभालने में बाधा नहीं बनने चाहिए। BoloBiz को स्टोर मालिकों और फ्रीलांसरों को आसान बोलचाल की आवाज़ से बहीखाता मैनेज करने में सक्षम बनाने के लिए बनाया गया है।",
      path1Title: "स्थानीय और छोटे दुकान",
      path1Desc: "बोलकर बहीखाता, उधार, बिक्री और स्टॉक अपडेट करें। किराना दुकानों और फ्रीलांसरों के लिए बेस्ट।",
      path2Title: "बढ़ता हुआ बिज़नेस",
      path2Desc: "डिटेल रिपोर्ट्स प्राप्त करें, कई कर्मचारियों को जोड़ें और लो-स्टॉक अलर्ट आटोमैटिक सेट करें।",
      path3Title: "मल्टी-ब्रांच सिस्टम",
      path3Desc: "अलग-अलग दुकानों के आंकड़े देखें, ब्रांच-वाइज जानकारी पाएं और सेंट्रलाइज्ड स्टॉक ट्रैक करें।",
      comingSoon: "जल्द आ रहा है",
    },
    cta: {
      title: "बोलकर अपने बिज़नेस को आसान बनाएं",
      subtitle: "बहीखाते के झंझट से बचें, अपने बिज़नेस को नई ऊंचाइयों पर ले जाएं।",
      btnText: "🎙️ आज से शुरू करें — बिल्कुल मुफ्त",
      disclaimer: "कोई क्रेडिट कार्ड आवश्यक नहीं · 14-दिन का फ्री ट्रायल",
    },
    footer: {
      desc: "आपकी भाषा में आपका AI बिज़नेस असिस्टेंट। बोलें और बिज़नेस आसान बनाएं।",
      prodColTitle: "प्रोडक्ट",
      compColTitle: "कंपनी",
      helpColTitle: "सहायता",
      subscribeColTitle: "हमारे साथ जुड़ें",
      features: "फीचर्स",
      pricing: "कीमतें",
      updates: "अपडेट्स",
      integrations: "इंटीग्रेशन",
      about: "हमारे बारे में",
      careers: "करियर",
      blog: "ब्लॉग",
      contact: "संपर्क करें",
      helpCenter: "हेल्प सेंटर",
      privacy: "गोपनीयता नीति",
      terms: "नियम और शर्तें",
      refund: "रिफंड नीति",
      subscribePlaceholder: "आपका ईमेल",
      copy: "BoloBiz. सभी अधिकार सुरक्षित।",
    },
  },
};
