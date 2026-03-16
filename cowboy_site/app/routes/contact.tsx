import type {Route} from './+types/contact';
import {useState, type FormEvent} from 'react';
import Button from '~/components/ui/Button';
import {buildPageMeta, getOriginFromMatches} from '~/lib/utils/seo';

export const meta: Route.MetaFunction = ({matches}) => {
  const origin = getOriginFromMatches(matches);
  const url = origin ? `${origin}/contact` : '/contact';

  return buildPageMeta({
    title: 'Contact Us',
    description:
      "Get in touch with our team. We're here to help with sizing, orders, and anything else you need.",
    url,
  });
};

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(form: FormData): FormErrors {
    const errs: FormErrors = {};
    const name = (form.get('name') as string)?.trim();
    const email = (form.get('email') as string)?.trim();
    const message = (form.get('message') as string)?.trim();

    if (!name) errs.name = 'Please enter your name.';
    if (!email) {
      errs.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!message) errs.message = 'Please enter a message.';

    return errs;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const errs = validate(form);

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setLoading(true);

    // Placeholder: simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  }

  return (
    <div className="container-content py-16 md:py-24">
      <h1 className="font-heading text-h1 md:text-h2 tracking-tight text-primary mb-4">
        Contact Us
      </h1>
      <p className="font-body text-base md:text-lg text-text/70 mb-12 md:mb-16 max-w-xl">
        We'd love to hear from you. Whether you have a question about sizing,
        an order, or just want to say hello — drop us a line.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
        {/* Contact Form */}
        <div>
          {submitted ? (
            <div className="py-12 text-center md:text-left">
              <h2 className="font-heading text-h3 text-primary mb-4">
                Message Sent
              </h2>
              <p className="font-body text-base text-text leading-relaxed">
                Thank you for reaching out. We'll get back to you within 1–2
                business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="contact-name"
                  className="block font-body text-sm font-medium tracking-wide text-text mb-2"
                >
                  Name <span className="text-[#D40000]">*</span>
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className={`w-full border ${
                    errors.name ? 'border-[#D40000]' : 'border-[#e5e5e5]'
                  } bg-transparent px-4 py-3 font-body text-base text-text placeholder:text-text/40 focus:outline-none focus:border-primary transition-colors duration-fast`}
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="mt-1.5 font-body text-xs text-[#D40000]">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="contact-email"
                  className="block font-body text-sm font-medium tracking-wide text-text mb-2"
                >
                  Email <span className="text-[#D40000]">*</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`w-full border ${
                    errors.email ? 'border-[#D40000]' : 'border-[#e5e5e5]'
                  } bg-transparent px-4 py-3 font-body text-base text-text placeholder:text-text/40 focus:outline-none focus:border-primary transition-colors duration-fast`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="mt-1.5 font-body text-xs text-[#D40000]">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="contact-phone"
                  className="block font-body text-sm font-medium tracking-wide text-text mb-2"
                >
                  Phone
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="w-full border border-[#e5e5e5] bg-transparent px-4 py-3 font-body text-base text-text placeholder:text-text/40 focus:outline-none focus:border-primary transition-colors duration-fast"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="block font-body text-sm font-medium tracking-wide text-text mb-2"
                >
                  Message <span className="text-[#D40000]">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  className={`w-full border ${
                    errors.message ? 'border-[#D40000]' : 'border-[#e5e5e5]'
                  } bg-transparent px-4 py-3 font-body text-base text-text placeholder:text-text/40 focus:outline-none focus:border-primary transition-colors duration-fast resize-vertical`}
                  placeholder="How can we help?"
                />
                {errors.message && (
                  <p className="mt-1.5 font-body text-xs text-[#D40000]">
                    {errors.message}
                  </p>
                )}
              </div>

              <Button type="submit" size="lg" loading={loading}>
                Send Message
              </Button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-10">
          <div>
            <h2 className="font-heading text-h5 text-primary mb-3">
              Give Us a Call
            </h2>
            <a
              href="tel:+18005551234"
              className="font-body text-lg text-primary hover:opacity-70 transition-opacity duration-fast"
            >
              (800) 555-1234
            </a>
          </div>

          <div>
            <h2 className="font-heading text-h5 text-primary mb-3">
              Business Hours
            </h2>
            <ul className="font-body text-base text-text leading-relaxed space-y-1">
              <li>Monday – Friday: 9:00 AM – 6:00 PM CT</li>
              <li>Saturday: 10:00 AM – 4:00 PM CT</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-h5 text-primary mb-3">
              We're Here to Help
            </h2>
            <p className="font-body text-base text-text leading-relaxed">
              Whether you need help finding the right size, tracking an order,
              or just want to chat about western wear — our team is always happy
              to hear from you. We typically respond within one business day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
