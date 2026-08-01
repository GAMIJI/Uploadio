import { 
  Sparkles, Zap, Shield, Download, Globe, Layers, Upload, Scissors 
} from 'lucide-react';

export const features = [
  { icon: Sparkles, title: 'AI-Powered Precision', desc: 'Neural networks detect edges with 99.9% accuracy, even around hair.', gradient: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Process high-resolution images in under 2 seconds locally in your browser.', gradient: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
  { icon: Shield, title: '100% Secure', desc: 'Your images never leave your device. Complete privacy guaranteed.', gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20' },
  { icon: Download, title: 'HD Quality Export', desc: 'Download your edits in glorious 4K resolution without compression artifacts.', gradient: 'from-orange-400 to-rose-500', shadow: 'shadow-orange-500/20' },
  { icon: Globe, title: 'Global Standards', desc: 'Passport generator auto-adapts to official photo requirements of 150+ countries.', gradient: 'from-indigo-500 to-blue-500', shadow: 'shadow-indigo-500/20' },
  { icon: Layers, title: 'All-in-One Studio', desc: 'Remove backgrounds, resize, compress, and convert formats in one place.', gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/20' },
];

export const steps = [
  { icon: Upload, title: 'Upload', desc: 'Drop any JPG, PNG, or WEBP.' },
  { icon: Sparkles, title: 'AI Magic', desc: 'Our AI processes it instantly.' },
  { icon: Scissors, title: 'Fine-Tune', desc: 'Adjust, crop, and customize.' },
  { icon: Download, title: 'Download', desc: 'Export in stunning HD.' },
];

export const testimonials = [
  { name: 'Sarah Jenkins', role: 'Digital Creator', content: 'The background removal is literal magic. It catches stray hairs perfectly!', rating: 5 },
  { name: 'David Chen', role: 'Visa Consultant', content: 'I use the passport maker daily. It meets embassy standards every single time.', rating: 5 },
  { name: 'Elena Rodriguez', role: 'E-commerce Seller', content: 'Saved me hundreds of hours editing product photos. Highly recommended.', rating: 5 },
];

export const faqs = [
  { q: 'Is Pixora AI completely free?', a: 'Yes! Our core tools are 100% free to use. We process images locally in your browser, which keeps our server costs low and allows us to offer these tools at no cost.' },
  { q: 'What image formats do you support?', a: 'We currently support uploading JPG, JPEG, PNG, and WEBP formats up to 10MB in size.' },
  { q: 'Are my uploaded photos secure and private?', a: 'Absolutely. Because our AI models run directly in your browser, your photos never actually get sent to our servers. Your data stays entirely on your device.' },
  { q: 'Can I use this for official passport photos?', a: 'Yes! Our Passport Photo Maker tool is designed to crop and format photos to the exact millimeter specifications required by most global governments.' },
];

export const stats = [
  { number: '2M+', label: 'Photos Processed' },
  { number: '150+', label: 'Countries Supported' },
  { number: '99.9%', label: 'AI Accuracy' },
  { number: '0 sec', label: 'Wait Time' },
];