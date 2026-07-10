'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function LandingPage() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) dotRef.current.style.cssText = `left:${mx}px;top:${my}px`;
    };
    document.addEventListener('mousemove', onMove);

    const loop = () => {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      if (ringRef.current) ringRef.current.style.cssText = `left:${rx}px;top:${ry}px`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 70);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.07 }
    );
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, []);

  return (
    <div className="df-landing">
      <div className="cur" ref={dotRef}>
        <div className="cur-dot" />
      </div>
      <div className="cur" ref={ringRef}>
        <div className="cur-ring" />
      </div>

      <nav>
        <Link href="/" className="logo">
          dev<b>folio</b>
          <span className="logo-cur" />
        </Link>
        <div className="nav-r">
          <a href="#how" className="nav-link">How it works</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <Link href="/login" className="nav-link">Log in</Link>
          <Link href="/register" className="nav-btn">Get Started</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-glow" />
        <div className="hero-glow-2" />

        <div className="hero-content">
          <div className="hero-pill">
            <div className="pill-dot" />
            early_access — spots limited
          </div>

          <h1>
            Find freelance
            <br />
            clients.
            <br />
            <span className="accent">On autopilot.</span>
          </h1>

          <p className="hero-sub">
            DevFolio builds your portfolio in 2 minutes — then{' '}
            <strong>works 24/7 to find you clients.</strong> AI monitors job boards, generates
            personalised proposals, and keeps your profile always updated. You just approve and
            send.
          </p>

          <div className="hero-actions">
            <div className="hero-cta-row">
              <Link href="/register" className="btn-primary">Get Started Free →</Link>
              <Link href="/login" className="btn-secondary">Log in</Link>
            </div>
            <p className="hero-meta">{'// free to start · no credit card · launching soon'}</p>
          </div>

          <div className="social-proof">
            <div className="avatars">
              <div className="av">👨‍💻</div>
              <div className="av">👩‍💻</div>
              <div className="av">🧑‍💻</div>
              <div className="av">👨‍💻</div>
            </div>
            <p className="sp-text"><strong>127 developers</strong> already on the waitlist</p>
          </div>
        </div>
      </section>

      <section>
        <div className="label reveal">The Reality</div>
        <h2 className="reveal">
          Most portfolios
          <br />
          <em>don&apos;t convert.</em>
        </h2>
        <p className="sub reveal">
          You spend 40 hours building something generic. It lists your skills. Nobody calls.
          DevFolio flips that completely.
        </p>

        <div className="stats-grid reveal">
          <div className="stat-card">
            <div className="stat-label">Average time wasted</div>
            <div className="stat-num">40h</div>
            <p className="stat-sub">
              Building a portfolio that still ends up generic and doesn&apos;t bring a single
              client.
            </p>
          </div>
          <div className="stat-card">
            <div className="stat-label">Typical result</div>
            <div className="stat-num">0</div>
            <p className="stat-sub">Inquiries. Zero clients. Zero ROI. Just a URL you share once and forget.</p>
          </div>
          <div className="stat-card hl">
            <div className="stat-label">With DevFolio</div>
            <div className="stat-num">2min</div>
            <p className="stat-sub">
              To go live. Then AI finds opportunities, writes proposals, and keeps everything
              updated. Forever.
            </p>
          </div>
          <div className="stat-card">
            <div className="stat-label">Freelancers worldwide</div>
            <div className="stat-num">60M+</div>
            <p className="stat-sub">All need clients. Most hate outreach. That&apos;s exactly the problem DevFolio solves.</p>
          </div>
        </div>
      </section>

      <section id="how">
        <div className="label reveal">How It Works</div>
        <h2 className="reveal">
          Set it up once.
          <br />
          <em>AI does the rest.</em>
        </h2>
        <p className="sub reveal">
          No outreach experience needed. No writing skills. Just let DevFolio run in the
          background while you focus on the actual work.
        </p>

        <div className="flow reveal">
          <div className="flow-step">
            <div className="step-n">STEP_01</div>
            <span className="step-ico">📋</span>
            <h3>Answer 10 questions</h3>
            <p>
              Your stack, experience, target clients, and the type of projects you want. Takes 2
              minutes. This is the last time you&apos;ll have to sell yourself manually.
            </p>
          </div>
          <div className="flow-step">
            <div className="step-n">STEP_02</div>
            <span className="step-ico">⚡</span>
            <h3>Portfolio goes live instantly</h3>
            <p>
              AI generates persuasive copy that sells you as a professional — not just lists your
              skills. Published at yourname.devfolio.io in seconds.
            </p>
          </div>
          <div className="flow-step">
            <div className="step-n">STEP_03</div>
            <span className="step-ico">🤖</span>
            <h3>AI hunts opportunities for you</h3>
            <p>
              DevFolio monitors Upwork, Freelancer, RemoteOK, and other top job boards 24/7. When
              it finds a match, it drafts a personalised proposal ready to send.
            </p>
          </div>
          <div className="flow-step">
            <div className="step-n">STEP_04</div>
            <span className="step-ico">✅</span>
            <h3>You approve. Clients reply.</h3>
            <p>
              Review the proposal, tweak if needed, send with one click. That&apos;s your entire
              outreach workflow. Everything else is automated.
            </p>
          </div>
        </div>
      </section>

      <section id="features">
        <div className="label reveal">What You Get</div>
        <h2 className="reveal">
          A full client
          <br />
          <em>acquisition engine.</em>
        </h2>

        <div className="feat-grid reveal">
          <div className="feat big">
            <div>
              <span className="feat-ico">🤖</span>
              <h3>Automated Outreach</h3>
              <p>
                DevFolio monitors Upwork, Freelancer, RemoteOK, and other top platforms around the
                clock. When it finds a project that matches your profile, it generates a fully
                personalised proposal — referencing the client&apos;s specific needs, your relevant
                experience, and your portfolio. You review and send in seconds.
              </p>
              <span className="feat-tag pro">PRO · Core Feature</span>
            </div>
            <div className="demo-card">
              <div className="demo-label">NEW_OPPORTUNITY_FOUND</div>
              <div className="demo-job">
                <div className="demo-job-title">Senior React Developer — E-commerce Platform</div>
                <div className="demo-job-meta">Upwork · $80–120/hr · 98% match</div>
              </div>
              <div className="demo-proposal">
                <div className="demo-proposal-label">AI_GENERATED_PROPOSAL</div>
                <div className="demo-proposal-text">
                  Hi Sarah, I noticed your team is scaling the checkout flow — I rebuilt a similar
                  system for a fintech client last quarter, reducing load time by 40%...
                </div>
              </div>
              <div className="demo-actions">
                <div className="demo-send">Send →</div>
                <div className="demo-edit">Edit</div>
              </div>
            </div>
          </div>

          <div className="feat">
            <span className="feat-ico">🔄</span>
            <h3>Social Proof Engine</h3>
            <p>
              Your portfolio stays alive automatically. DevFolio monitors your GitHub activity and
              updates your profile with new projects, commits, and real metrics — no manual
              updates ever.
            </p>
            <span className="feat-tag pro">PRO</span>
          </div>

          <div className="feat">
            <span className="feat-ico">⭐</span>
            <h3>Testimonial Generator</h3>
            <p>
              After each project, DevFolio sends your client a short 3-question form. Their
              response is transformed into a polished testimonial and published on your portfolio
              automatically.
            </p>
            <span className="feat-tag pro">PRO</span>
          </div>

          <div className="feat">
            <span className="feat-ico">💰</span>
            <h3>Smart Rate Calculator</h3>
            <p>
              Based on your stack, experience, and live market data, DevFolio suggests your
              optimal hourly rate — and updates it monthly as the market shifts. Stop leaving
              money on the table.
            </p>
            <span className="feat-tag pro">PRO</span>
          </div>

          <div className="feat">
            <span className="feat-ico">✍️</span>
            <h3>AI Portfolio Copy</h3>
            <p>
              Not templates. Persuasive writing trained to convert visitors into enquiries. Reads
              like a top copywriter, not a CV.
            </p>
            <span className="feat-tag">FREE</span>
          </div>

          <div className="feat">
            <span className="feat-ico">📊</span>
            <h3>Visitor Analytics</h3>
            <p>
              Know who&apos;s viewing your portfolio, where they came from, and which projects
              they spent the most time on. Privacy-first, no tracking bloat.
            </p>
            <span className="feat-tag">FREE</span>
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className="label reveal">Pricing</div>
        <h2 className="reveal">
          One client.
          <br />
          <em>Pays for 2 years.</em>
        </h2>
        <p className="sub reveal">
          Start free. When you land your first client with DevFolio — and you will — upgrading is
          a no-brainer.
        </p>

        <div className="pricing-wrap reveal">
          <div className="plan">
            <div className="plan-tier">Free</div>
            <div className="plan-price">$0</div>
            <div className="plan-cycle">{'// forever'}</div>
            <ul className="plan-items">
              <li>AI-generated portfolio</li>
              <li>yourname.devfolio.io subdomain</li>
              <li>Basic visitor analytics</li>
              <li>Contact form</li>
              <li>1 portfolio</li>
            </ul>
            <Link href="/register" className="plan-cta">Get Started</Link>
          </div>

          <div className="plan pro">
            <div className="plan-tag">Most Popular</div>
            <div className="plan-tier">Pro</div>
            <div className="plan-price">$30</div>
            <div className="plan-cycle">{'// per month'}</div>
            <ul className="plan-items">
              <li>Everything in Free</li>
              <li>Automated outreach on Upwork, Freelancer, RemoteOK &amp; more</li>
              <li>AI-generated personalised proposals</li>
              <li>Social proof engine (GitHub sync)</li>
              <li>Testimonial generator</li>
              <li>Smart rate calculator</li>
              <li>Custom domain</li>
              <li>Advanced analytics</li>
              <li>Remove DevFolio branding</li>
            </ul>
            <Link href="/register" className="plan-cta">Get Early Access</Link>
            <p className="plan-note">{'// early access = Pro free for 1 month'}</p>
          </div>
        </div>
      </section>

      <section className="cta-sec" id="waitlist">
        <div className="label reveal">Early Access</div>
        <h2 className="reveal">
          Stop chasing clients.
          <br />
          Let <em>AI do it for you.</em>
        </h2>
        <p className="sub reveal">
          Join 127 developers on the waitlist. Early access members get the first month of Pro
          completely free.
        </p>
        <Link href="/register" className="btn-primary reveal">Claim My Spot →</Link>
      </section>

      <footer>
        <div className="logo">
          dev<b>folio</b>
          <span className="logo-cur" />
        </div>
        <p>Built for developers who want clients on autopilot.</p>
        <p>© 2026 DevFolio</p>
      </footer>
    </div>
  );
}
