import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pages = {
  about: {
    title: 'About Cloth Couture',
    intro: 'Cloth Couture creates handmade clothing with careful fabrics, thoughtful fits, and small-batch craftsmanship.',
    sections: [
      {
        heading: 'Our Craft',
        body: 'Each piece is designed for everyday comfort and finished with attention to stitching, fabric feel, and lasting wear.',
      },
      {
        heading: 'What We Make',
        body: 'Explore dresses, shirts, pants, outerwear, and accessories built around timeless silhouettes and seasonal colors.',
      },
    ],
  },
  contact: {
    title: 'Contact Us',
    intro: 'Need help with sizing, an order, returns, or a custom request? Reach out and we will help you choose the right next step.',
    contact: true,
    sections: [
      {
        heading: 'Customer Support',
        body: 'We usually respond within 24 hours on business days.',
      },
    ],
  },
  faq: {
    title: 'FAQ',
    intro: 'Answers to common questions about Cloth Couture orders.',
    sections: [
      {
        heading: 'How long does shipping take?',
        body: 'Ready pieces usually ship in 3-5 business days. Handmade or customized items can take 7-10 business days before dispatch.',
      },
      {
        heading: 'Can I change my size after ordering?',
        body: 'Contact us as soon as possible. If the order has not been packed or customized, we will try to update it.',
      },
      {
        heading: 'Do you support exchanges?',
        body: 'Eligible unused items can be exchanged based on stock availability. Customized items may not be eligible.',
      },
    ],
  },
  shipping: {
    title: 'Shipping Information',
    intro: 'We ship across India with tracked delivery where available.',
    sections: [
      {
        heading: 'Delivery Time',
        body: 'Most orders are delivered within 5-10 business days after dispatch, depending on your city and courier coverage.',
      },
      {
        heading: 'Shipping Charges',
        body: 'Shipping is free on orders above INR 1500. Smaller orders include a shipping charge shown at checkout.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: 'By using Cloth Couture, you agree to place accurate orders, provide correct shipping details, and use the store lawfully.',
    sections: [
      {
        heading: 'Orders',
        body: 'Orders are accepted subject to product availability, payment confirmation, and successful verification of checkout details.',
      },
      {
        heading: 'Pricing',
        body: 'Prices can change without prior notice. The final payable amount is displayed before payment.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'We collect only the information needed to process orders, manage accounts, provide support, and improve the shopping experience.',
    sections: [
      {
        heading: 'Information We Use',
        body: 'This can include name, email, phone number, shipping address, account details, cart data, and order history.',
      },
      {
        heading: 'Data Protection',
        body: 'Payment processing is handled through secure payment providers. We do not store complete card details.',
      },
    ],
  },
  returns: {
    title: 'Return Policy',
    intro: 'If something is not right, request a return or replacement from My Orders within 7 days of delivery.',
    sections: [
      {
        heading: 'Return Window',
        body: 'Eligible unused items can be requested for return or replacement within 7 days of delivery.',
      },
      {
        heading: 'Condition',
        body: 'Items should be unused, unworn, unwashed, and returned with original tags or packaging where applicable.',
      },
      {
        heading: 'Exceptions',
        body: 'Customized, altered, final-sale, or hygiene-sensitive items may not be returnable unless they arrive damaged or incorrect.',
      },
    ],
  },
};

const InfoPage = ({ page }) => {
  const content = pages[page] || pages.about;

  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Cloth Couture</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">{content.title}</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{content.intro}</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {content.contact && (
          <div className="grid gap-4 sm:grid-cols-3 mb-10">
            <a href="mailto:support@clothcouture.com" className="rounded-lg border border-border p-5 hover:border-primary transition-colors">
              <Mail className="h-5 w-5 text-primary mb-3" />
              <p className="text-sm font-semibold">support@clothcouture.com</p>
            </a>
            <a href="tel:+919876543210" className="rounded-lg border border-border p-5 hover:border-primary transition-colors">
              <Phone className="h-5 w-5 text-primary mb-3" />
              <p className="text-sm font-semibold">+91 98765 43210</p>
            </a>
            <div className="rounded-lg border border-border p-5">
              <MapPin className="h-5 w-5 text-primary mb-3" />
              <p className="text-sm font-semibold">Mumbai, India</p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {content.sections.map((section) => (
            <article key={section.heading}>
              <h2 className="text-2xl font-serif font-bold mb-3">{section.heading}</h2>
              <p className="text-muted-foreground leading-7">{section.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild className="bg-primary hover:bg-primary-dark text-white">
            <Link to="/products">Shop Collection</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default InfoPage;
