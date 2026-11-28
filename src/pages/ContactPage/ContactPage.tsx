import React, { useState, useEffect } from 'react';
import { siteConfig } from '../../siteConfig';
import {
  MapPin,
  Route,
  ExternalLink,
  Phone,
  Clock,
  User,
  Mail,
  Calendar,
  MessageSquare,
  ChevronDown,
  Star,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { BotanicalLeaf } from '../../components/common/BotanicalLeaf';
import './ContactPage.css';

export const ContactPage: React.FC = () => {
  const { contactPage } = siteConfig;
  const [siteData, setSiteData] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    fetch('/api/public/site')
      .then((res) => {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then((data) => {
        if (data && data.content) {
          setSiteData(data.content);
        }
      })
      .catch((err) => {
        console.warn('[ContactPage] Using bundled fallback:', err);
      });
  }, []);

  const contactInfo = siteData?.contact || {};
  const footerInfo = siteData?.footer || {};

  const displayPhone = contactInfo.phone || contactPage.info.call.detail;
  const displayTel = contactInfo.phone
    ? `tel:${contactInfo.phone.replace(/\s+/g, '')}`
    : contactPage.info.call.tel;
  const displayHours = footerInfo.opening_hours || contactPage.info.hours.detail;
  const displayAddress = contactInfo.address || 'Gala No 2, Plot 16/1, Karnik Nagar Rd, Sakhar Peth, Solapur – 413006';
  const displayMapsUrl = contactInfo.maps_url || siteConfig.seo.googleMapsUrl;
  const whatsappDigits = (contactInfo.whatsapp || siteConfig.footer.visitUs.phone).replace(/\D/g, '');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: '',
    message: '',
  });

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (submitError) setSubmitError('');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const topicPrefix = formData.type ? `[${formData.type}] ` : '';
      const ratingNote = rating > 0 ? ` (Experience Rating: ${rating}/5)` : '';
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          message: `${topicPrefix}${formData.message.trim()}${ratingNote}`,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const apiErr =
          typeof json?.error === 'string'
            ? json.error
            : typeof json?.error?.message === 'string'
            ? json.error.message
            : typeof json?.message === 'string'
            ? json.message
            : 'Unable to submit your message. Please try again or call us.';
        setSubmitError(apiErr);
        return;
      }
      setIsSubmitted(true);
    } catch {
      setSubmitError('Network error while sending message. Please call +91 72496 64983 or message us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-subpage" id="contact-subpage">
      {/* Botanical Leaf Corner Accents */}
      <BotanicalLeaf position="top-left" width={210} opacity={0.88} />
      <BotanicalLeaf position="bottom-right" width={220} opacity={0.88} />

      {/* Subtle background curved arc */}
      <div className="contact-bg-arc" aria-hidden="true">
        <svg width="400" height="300" viewBox="0 0 400 300" fill="none">
          <path
            d="M 50 0 C 150 120, 280 180, 400 120"
            stroke="rgba(212, 86, 26, 0.22)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="container contact-container">
        {/* Page Header */}
        <header className="contact-page-header">
          <div className="contact-eyebrow-wrap">
            <span className="contact-eyebrow">{contactPage.eyebrow}</span>
            <div className="contact-eyebrow-rule" aria-hidden="true" />
          </div>

          <h1 className="contact-page-title">
            {contactPage.heading.prefix}{' '}
            <span className="text-orange">{contactPage.heading.highlight}</span>
          </h1>

          <p className="contact-page-subtitle">
            Have a question, feedback or a reservation request?
            <br />
            We're here to help.
          </p>
        </header>

        {/* Main Elevated Contact Card */}
        <div className="contact-main-card">
          <div className="contact-card-inner">
            {/* Left Column: Direct Info Tiles */}
            <aside className="contact-info-column" aria-label="Contact Information">
              <div className="contact-info-header">
                <span className="contact-info-eyebrow">DIRECT INFO</span>
                <h2 className="contact-info-title">Reach Us</h2>
              </div>

              {/* Tile 1: Location */}
              <div className="contact-info-item">
                <div className="contact-badge" aria-hidden="true">
                  <MapPin size={22} strokeWidth={1.9} color="#C85A17" />
                </div>
                <div className="contact-text-wrap">
                  <h3 className="contact-item-title">{contactPage.info.location.title}</h3>
                  <p className="contact-item-detail">
                    {displayAddress}
                  </p>
                  <a
                    href={displayMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-directions-link inline-flex items-center gap-1.5 text-orange font-semibold text-xs mt-1.5 hover:underline"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#C85A17', fontWeight: 600, fontSize: '12px', marginTop: '6px', textDecoration: 'none' }}
                  >
                    <Route size={14} />
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Tile 2: Call Us */}
              <div className="contact-info-item">
                <div className="contact-badge" aria-hidden="true">
                  <Phone size={22} strokeWidth={1.9} color="#C85A17" />
                </div>
                <div className="contact-text-wrap">
                  <h3 className="contact-item-title">{contactPage.info.call.title}</h3>
                  <a
                    href={displayTel}
                    className="contact-item-detail contact-phone-link"
                  >
                    {displayPhone}
                  </a>
                </div>
              </div>

              {/* Tile 3: Open Hours */}
              <div className="contact-info-item">
                <div className="contact-badge" aria-hidden="true">
                  <Clock size={22} strokeWidth={1.9} color="#C85A17" />
                </div>
                <div className="contact-text-wrap">
                  <h3 className="contact-item-title">{contactPage.info.hours.title}</h3>
                  <p className="contact-item-detail">{displayHours}</p>
                </div>
              </div>
            </aside>

            {/* Vertical Separator */}
            <div className="contact-vertical-divider" aria-hidden="true" />

            {/* Right Column: Interactive Form */}
            <section className="contact-form-column" aria-label="Send a Message">
              <h2 className="contact-form-heading">
                {contactPage.form.heading.prefix}{' '}
                <span className="text-orange">{contactPage.form.heading.highlight}</span>
              </h2>

              {isSubmitted ? (
                <div className="contact-success-banner" role="alert">
                  <CheckCircle size={32} color="var(--color-accent-orange)" />
                  <div className="success-text-wrap">
                    <h3 className="success-title">Message Received!</h3>
                    <p className="success-desc">
                      Thank you for reaching out to Amol Veg Resto. Our team has logged your inquiry and will reply shortly.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <a
                      href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hello Amol Veg Resto, I am ${formData.name || 'a guest'}: ${formData.message}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="send-another-btn"
                      style={{ textDecoration: 'none', backgroundColor: '#1E7B46', color: '#FFFFFF', borderColor: '#1E7B46' }}
                    >
                      Chat on WhatsApp
                    </a>
                    <button
                      type="button"
                      className="send-another-btn"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          name: '',
                          phone: '',
                          email: '',
                          type: '',
                          message: '',
                        });
                        setRating(0);
                      }}
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit}>
                  {/* Row 1: Name & Phone */}
                  <div className="form-row form-row-split">
                    <div className="form-input-group">
                      <span className="input-icon-wrap" aria-hidden="true">
                        <User size={18} color="#8B776D" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        aria-label="Enter your full name"
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-input-group">
                      <span className="input-icon-wrap" aria-hidden="true">
                        <Phone size={18} color="#8B776D" />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        autoComplete="tel"
                        aria-label="Enter your phone number"
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email */}
                  <div className="form-row">
                    <div className="form-input-group">
                      <span className="input-icon-wrap" aria-hidden="true">
                        <Mail size={18} color="#8B776D" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        autoComplete="email"
                        aria-label="Enter your email address"
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Row 3: Dropdown Topic */}
                  <div className="form-row">
                    <div className="form-input-group select-group">
                      <span className="input-icon-wrap" aria-hidden="true">
                        <Calendar size={18} color="#8B776D" />
                      </span>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="form-input form-select"
                        aria-label="Select an option"
                        required
                      >
                        <option value="" disabled hidden>Select an option</option>
                        <option value="Reservation">Reservation / Table Booking</option>
                        <option value="Inquiry">General Inquiry</option>
                        <option value="Feedback">Feedback / Review</option>
                        <option value="Catering">Event / Catering</option>
                      </select>
                      <span className="select-arrow-wrap" aria-hidden="true">
                        <ChevronDown size={16} color="#8B776D" />
                      </span>
                    </div>
                  </div>

                  {/* Row 4: Message Textarea */}
                  <div className="form-row">
                    <div className="form-input-group textarea-group">
                      <span className="input-icon-wrap textarea-icon-wrap" aria-hidden="true">
                        <MessageSquare size={18} color="#8B776D" />
                      </span>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Enter your message"
                        aria-label="Enter your message"
                        rows={4}
                        required
                        className="form-input form-textarea"
                      />
                    </div>
                  </div>

                  {/* Rating Stars Section */}
                  <div className="rating-section">
                    <span className="rating-label">{contactPage.form.ratingLabel}</span>
                    <div className="star-rating-row" role="radiogroup" aria-label="Rate your experience out of 5 stars">
                      {[1, 2, 3, 4, 5].map((starValue) => {
                        const isFilled = (hoverRating || rating) >= starValue;
                        return (
                          <button
                            key={starValue}
                            type="button"
                            className={`star-btn ${isFilled ? 'filled' : ''}`}
                            onClick={() => setRating(starValue)}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                            aria-label={`${starValue} Star${starValue > 1 ? 's' : ''}`}
                            role="radio"
                            aria-checked={rating === starValue}
                          >
                            <Star
                              size={26}
                              strokeWidth={1.8}
                              stroke="#C85A17"
                              fill={isFilled ? '#FD8006' : 'transparent'}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {submitError && (
                    <div
                      role="alert"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '12px',
                        backgroundColor: '#FEF2F2',
                        border: '0.5px solid #FECACA',
                        color: '#B91C1C',
                        fontSize: '13.5px',
                        marginBottom: '16px',
                      }}
                    >
                      {submitError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
                    <span>{isSubmitting ? 'Sending Message...' : contactPage.form.buttonText}</span>
                    <ArrowRight size={18} strokeWidth={2.4} />
                  </button>
                </form>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

