import {useState} from 'react';

const FOOTER_LINKS = {
  'Customer Service': [
    {label: 'Contact Us', href: '/contact'},
    {label: 'FAQ', href: '/faq'},
    {label: 'Shipping & Returns', href: '#'},
    {label: 'Size Guide', href: '#'},
  ],
  About: [
    {label: 'Our Story', href: '/brand'},
    {label: 'Craftsmanship', href: '#'},
    {label: 'Sustainability', href: '#'},
  ],
  Company: [
    {label: 'Careers', href: '#'},
    {label: 'Privacy Policy', href: '#'},
    {label: 'Terms of Service', href: '#'},
  ],
  'Follow Us': [
    {label: 'Instagram', href: '#'},
    {label: 'Facebook', href: '#'},
    {label: 'TikTok', href: '#'},
    {label: 'Pinterest', href: '#'},
  ],
};

export function Footer() {
  return (
    <footer className="bg-primary text-bg mt-auto">
      {/* Newsletter Section */}
      <div className="container-content py-16 md:py-20 border-b border-bg/10">
        <div className="max-w-md mx-auto text-center md:max-w-lg">
          <h3 className="font-heading text-2xl md:text-3xl text-bg tracking-tight mb-3">
            Stay in the Loop
          </h3>
          <p className="font-body text-sm text-bg/70 mb-6">
            Sign up for exclusive access to new collections, events, and brand
            stories.
          </p>
          <NewsletterForm />
        </div>
      </div>

      {/* Links Section */}
      <div className="container-content py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-body text-xs font-medium tracking-widest uppercase text-bg/50 mb-4 md:mb-6">
                {category}
              </h4>
              <ul className="list-none p-0 m-0 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-body text-sm text-bg/60 no-underline transition-colors duration-fast hover:text-bg hover:no-underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container-content py-6 border-t border-bg/10">
        <p className="font-body text-xs text-bg/50 text-center">
          &copy; {new Date().getFullYear()} Brand. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email) {
      console.log('Newsletter signup:', email);
      setSubmitted(true);
      setEmail('');
    }
  }

  if (submitted) {
    return (
      <p className="font-body text-sm text-bg/90">
        Thank you for subscribing.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-0">
      <label htmlFor="footer-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-email"
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 h-12 px-4 bg-transparent border border-bg/30 text-bg font-body text-sm placeholder:text-bg/40 focus:outline-none focus:border-bg/60 transition-colors duration-fast"
      />
      <button
        type="submit"
        className="flex items-center justify-center w-12 h-12 bg-transparent border border-bg/30 text-bg cursor-pointer transition-colors duration-fast hover:bg-bg/10"
        aria-label="Subscribe to newsletter"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
    </form>
  );
}
