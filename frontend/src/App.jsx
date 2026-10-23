
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import "./App.css";

const fallbackEvents = [
  {
    id: 1,
    name: "Python Workshop",
    category: "TECHNOLOGY",
    date: "15 NOV 2026",
    venue: "Computer Lab",
    seats: 30,
    capacity: 30,
    color: "pink",
    icon: "⌘",
    description: "Decode the language powering the future.",
  },
  {
    id: 2,
    name: "Web Development Seminar",
    category: "DESIGN & CODE",
    date: "20 NOV 2026",
    venue: "College Auditorium",
    seats: 50,
    capacity: 50,
    color: "cyan",
    icon: "◈",
    description: "Build the digital experiences of tomorrow.",
  },
  {
    id: 3,
    name: "AI and Data Science Meetup",
    category: "FUTURE TECH",
    date: "25 NOV 2026",
    venue: "Seminar Hall",
    seats: 40,
    capacity: 40,
    color: "violet",
    icon: "✳",
    description: "Explore intelligence beyond the ordinary.",
  },
];

function VideoBackground({ scene = "home" }) {
  return (
    <div className={`cinema-background cinema-${scene}`} aria-hidden="true">
      <video
        className="cinema-video"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster=""
      >
        <source
          src="https://videos.pexels.com/video-files/3130284/3130284-hd_1920_1080_30fps.mp4"
          type="video/mp4"
        />
      </video>
      <div className="cinema-tint" />
      <div className="cinema-grid" />
      <div className="cinema-orb cinema-orb-pink" />
      <div className="cinema-orb cinema-orb-cyan" />
      <div className="cinema-scanlines" />
    </div>
  );
}

function TransitionCurtain() {
  return (
    <motion.div
      className="portal-transition"
      initial={{ scaleY: 0, transformOrigin: "bottom" }}
      animate={{ scaleY: 0 }}
      exit={{
        scaleY: 1,
        transformOrigin: "bottom",
        transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] },
      }}
    >
      <div className="portal-ring" />
      <span>EVENTRA<span className="title-neon">_</span></span>
      <small>INITIALIZING NEXT DIMENSION</small>
    </motion.div>
  );
}

function Navbar() {
  return (
    <header className="navbar">
      <Link className="brand" to="/">
        <span className="brand-mark">E<span>.</span></span>
        <span className="brand-name">EVENTRA<span>_</span></span>
      </Link>

      <nav className="nav-links">
        <Link to="/">DISCOVER</Link>
        <Link to="/#events">MISSIONS</Link>
      </nav>

      <Link className="nav-cta" to="/#events">
        EXPLORE EVENTS <b>↗</b>
      </Link>
    </header>
  );
}

function AppContent() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [events, setEvents] = useState(fallbackEvents);
  const [connected, setConnected] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedEvent =
    events.find((item) => String(item.id) === String(eventId)) ?? null;

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) throw new Error("Could not load events.");

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid event response.");

        const liveEvents = data.map((event, index) => ({
          ...(fallbackEvents.find((item) => item.id === event.id) ??
            fallbackEvents[index] ??
            fallbackEvents[0]),
          ...event,
          name: event.name,
          title: event.name,
          date: event.date
            ? new Date(`${event.date}T12:00:00`).toLocaleDateString(
                "en-GB",
                { day: "2-digit", month: "short", year: "numeric" }
              ).toUpperCase()
            : "DATE TO BE ANNOUNCED",
        }));

        if (!cancelled) {
          setEvents(liveEvents);
          setConnected(true);
        }
      } catch (error) {
        console.error("Event loading failed:", error);
        if (!cancelled) setConnected(false);
      } finally {
        if (!cancelled) setLoadingEvents(false);
      }
    }

    loadEvents();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setNotice("");
    setNoticeType("");
    setSuccess(false);
  }, [location.pathname]);

  async function refreshEvents() {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Refresh failed.");
      const data = await response.json();

      setEvents((previous) =>
        data.map((event, index) => ({
          ...(previous.find((item) => item.id === event.id) ??
            fallbackEvents[index] ??
            fallbackEvents[0]),
          ...event,
          name: event.name,
          title: event.name,
          date: event.date
            ? new Date(`${event.date}T12:00:00`).toLocaleDateString(
                "en-GB",
                { day: "2-digit", month: "short", year: "numeric" }
              ).toUpperCase()
            : "DATE TO BE ANNOUNCED",
        }))
      );
      setConnected(true);
    } catch (error) {
      console.error("Could not refresh availability:", error);
      setConnected(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    if (!selectedEvent || !name.trim() || !email.trim()) {
      setNotice("COMPLETE ALL REQUIRED FIELDS");
      setNoticeType("error");
      return;
    }

    if (!connected) {
      setNotice("SERVER OFFLINE — START THE FLASK SERVER");
      setNoticeType("error");
      return;
    }

    setSubmitting(true);
    setNotice("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          event_id: selectedEvent.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setNotice(result.message || "REGISTRATION REJECTED");
        setNoticeType("error");
        await refreshEvents();
        return;
      }

      setNotice(result.message || "REGISTRATION CONFIRMED");
      setNoticeType("success");
      setSuccess(true);
      setName("");
      setEmail("");
      await refreshEvents();
    } catch (error) {
      console.error("Registration failed:", error);
      setNotice("NETWORK ERROR — CHECK YOUR FLASK SERVER");
      setNoticeType("error");
    } finally {
      setSubmitting(false);
    }
  }

  const enterRegistration = (item) => {
    navigate(`/register/${item.id}`);
  };

  return (
    <div className={`site-shell page-${eventId ? "register" : "home"}`}>
      <VideoBackground scene={eventId ? "register" : "home"} />
      <motion.div
        className="scroll-progress"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2 }}
      />
      <Navbar />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className="cinema-page"
          initial={reducedMotion ? false : {
            opacity: 0, y: 35, scale: 0.985, filter: "blur(12px)"
          }}
          animate={{
            opacity: 1, y: 0, scale: 1, filter: "blur(0px)"
          }}
          exit={reducedMotion ? {} : {
            opacity: 0, scale: 1.025, filter: "blur(12px)"
          }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          {!eventId ? (
            <>
              <section className="hero" id="home">
                <motion.div
                  className="hero-copy"
                  initial={reducedMotion ? false : { opacity: 0, x: -45 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="eyebrow">
                    <span className="status-pulse" />
                    NETWORK STATUS: {connected ? "ONLINE" : "CONNECTING"}
                    <span> / EARTH // 2026</span>
                  </div>

                  <h1 className="hero-title">
                    <span className="title-line" data-text="BREAK">BREAK</span>
                    <span className="title-line title-outline" data-text="THE">THE</span>
                    <span className="title-line title-neon" data-text="ORDINARY.">
                      ORDINARY<span>.</span>
                    </span>
                  </h1>

                  <p className="hero-description">
                    Enter a new dimension of ideas. Meet people, discover
                    experiences and build the future together.
                  </p>

                  <div className="hero-actions">
                    <a className="cyber-button primary-button" href="#events">
                      EXPLORE MISSIONS <b>↘</b>
                    </a>
                  </div>

                  <div className="hero-metrics">
                    <div><span className="metric-number">{String(events.length).padStart(2, "0")}</span><span className="metric-label">LIVE MISSIONS</span></div>
                    <div><span className="metric-number">∞</span><span className="metric-label">POSSIBILITIES</span></div>
                  </div>
                </motion.div>

                <motion.div
                  className="hero-visual"
                  animate={reducedMotion ? {} : { y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  <div className="radar radar-outer" />
                  <div className="radar radar-middle" />
                  <div className="radar radar-inner" />
                  <motion.div
                    className="core-object"
                    animate={reducedMotion ? {} : { rotate: 360 }}
                    transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="core-diamond"><span>EV</span></div>
                    <div className="core-ring ring-one" />
                    <div className="core-ring ring-two" />
                  </motion.div>
                  <div className="floating-data data-top">
                    <span className="data-label">SYSTEM_01</span>
                    <strong>IDEAS ONLINE</strong>
                  </div>
                  <div className="floating-data data-bottom">
                    <span className="data-label">NEXT EVENT</span>
                    <strong>YOUR STORY</strong>
                  </div>
                </motion.div>
              </section>

              <section className="ticker">
                <div className="ticker-track">
                  {[0, 1].map((copy) => (
                    <div className="ticker-group" key={copy}>
                      <span>THINK DIFFERENT</span><i>✳</i>
                      <span>BUILD THE FUTURE</span><i>✳</i>
                      <span>CONNECT MINDS</span><i>✳</i>
                    </div>
                  ))}
                </div>
              </section>

              <section className="events-section section-pad" id="events">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow">✳ SELECT YOUR DESTINATION</div>
                    <h2 className="section-title">
                      THE <span className="title-neon">MISSIONS</span>.
                    </h2>
                    <p className="section-description">
                      Choose your event. Your next chapter starts here.
                    </p>
                  </div>
                  <div className="section-counter">
                    <span>EVENT DATABASE</span>
                    <strong>{String(events.length).padStart(2, "0")} MISSIONS</strong>
                  </div>
                </div>

                {!connected && (
                  <div className="connection-banner" role="status">
                    {loadingEvents
                      ? "CONNECTING TO EVENT NETWORK..."
                      : "BACKEND OFFLINE — START FLASK TO LOAD LIVE EVENTS."}
                  </div>
                )}

                <div className="event-grid">
                  {events.map((item, index) => (
                    <motion.article
                      key={item.id}
                      className={`event-card ${item.color}`}
                      initial={reducedMotion ? false : { opacity: 0, y: 35 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.12 }}
                      whileHover={reducedMotion ? {} : {
                        y: -10, rotateX: 3, scale: 1.015
                      }}
                    >
                      <div className="card-scan" />
                      <div className="event-card-top">
                        <span className="event-category">{item.category}</span>
                        <span className="event-index">/{String(index + 1).padStart(2, "0")}</span>
                      </div>

                      <div className="event-icon-wrap">
                        <motion.span
                          className="event-icon"
                          animate={reducedMotion ? {} : { rotate: [0, 8, -8, 0] }}
                          transition={{ duration: 4, repeat: Infinity, delay: index * 0.2 }}
                        >
                          {item.icon}
                        </motion.span>
                        <span className="icon-orbit" />
                      </div>

                      <div className="event-date">DATE // {item.date}</div>
                      <h3>{item.title ?? item.name}</h3>
                      <p className="event-description">{item.description}</p>
                      <p className="event-venue">⌖ {item.venue}</p>

                      <div className="seat-meter">
                        <div className="seat-meter-top">
                          <span>AVAILABLE SEATS</span>
                          <span>{item.seats} LEFT</span>
                        </div>
                        <div className="seat-track">
                          <motion.div
                            className="seat-fill"
                            initial={{ width: 0 }}
                            whileInView={{
                              width: `${Math.max(0, Math.min(100, (item.seats / Math.max(1, item.capacity ?? item.seats)) * 100))}%`
                            }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>

                      <button
                        className="card-action"
                        type="button"
                        disabled={loadingEvents || item.seats <= 0}
                        onClick={() => enterRegistration(item)}
                      >
                        <span>{item.seats <= 0 ? "MISSION FULL" : "ENTER REGISTRATION"}</span>
                        <span>↗</span>
                      </button>
                    </motion.article>
                  ))}
                </div>
              </section>

              <section className="manifesto section-pad" id="about">
                <div className="manifesto-inner">
                  <span className="manifesto-tag">// OUR PRIME DIRECTIVE</span>
                  <h2>
                    DON'T WATCH<br />
                    <span className="title-outline">THE FUTURE.</span><br />
                    <span className="title-neon">BUILD IT.</span>
                  </h2>
                  <p>The next breakthrough could begin with one conversation.</p>
                  <a className="cyber-button primary-button" href="#events">
                    FIND YOUR EVENT ↗
                  </a>
                </div>
              </section>
            </>
          ) : (
            <section className="register-section section-pad cinematic-register">
              <div className="register-copy">
                <div className="eyebrow">
                  <span className="status-pulse" /> SECURE ACCESS TERMINAL
                </div>
                <h1 className="section-title">
                  CLAIM YOUR<br />
                  <span className="title-neon">PLACE IN HISTORY.</span>
                </h1>

                {selectedEvent ? (
                  <div className={`event-card ${selectedEvent.color} selected-event-panel`}>
                    <div className="event-category">{selectedEvent.category}</div>
                    <div className="event-icon-wrap"><span className="event-icon">{selectedEvent.icon}</span></div>
                    <h2>{selectedEvent.title ?? selectedEvent.name}</h2>
                    <p className="event-description">{selectedEvent.description}</p>
                    <p className="event-venue">⌖ {selectedEvent.venue}</p>
                    <p className="event-date">{selectedEvent.date}</p>
                    <p className="event-date">AVAILABLE SEATS // {selectedEvent.seats}</p>
                  </div>
                ) : (
                  <p className="section-description">
                    {loadingEvents ? "LOADING EVENT DATA..." : "EVENT NOT FOUND"}
                  </p>
                )}

                <p className="section-description">
                  Your next opportunity is waiting. Reserve your spot and enter the grid.
                </p>
                <Link className="cyber-button secondary-button" to="/#events">
                  ← BACK TO EVENTS
                </Link>
              </div>

              {success ? (
                <motion.div
                  className="register-form success-panel"
                  initial={{ opacity: 0, scale: 0.75, rotateX: 20 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  transition={{ duration: 0.65 }}
                >
                  <motion.div
                    className="success-symbol"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 160, damping: 12 }}
                  >
                    ✓
                  </motion.div>
                  <h2>ACCESS GRANTED</h2>
                  <p>{notice || "REGISTRATION CONFIRMED"}</p>
                  <p>Your registration has been sent to the EVENTRA network.</p>
                  <Link className="submit-button" to="/#events">
                    RETURN TO EVENTS ↗
                  </Link>
                </motion.div>
              ) : (
                <motion.form
                  className="register-form"
                  onSubmit={handleRegister}
                  initial={reducedMotion ? false : { opacity: 0, x: 40, rotateY: -5 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ duration: 0.75, delay: 0.15 }}
                >
                  <div className="form-topline">
                    <span>EVENTRA // REGISTRATION TERMINAL</span>
                    <span className="form-step">SECURE / 01</span>
                  </div>

                  <div className="form-title">
                    <span className="form-title-icon">✳</span>
                    <div><h3>Join the network.</h3><p>Enter your credentials below.</p></div>
                  </div>

                  <label htmlFor="name">01 / YOUR IDENTIFIER</label>
                  <input
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder="ENTER YOUR FULL NAME"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={100}
                    required
                  />

                  <label htmlFor="email">02 / DIGITAL ADDRESS</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="YOU@EXAMPLE.COM"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    maxLength={254}
                    required
                  />

                  <button
                    className="submit-button"
                    type="submit"
                    disabled={
                      submitting || loadingEvents || !connected ||
                      !selectedEvent || selectedEvent.seats <= 0
                    }
                  >
                    <span>{submitting ? "TRANSMITTING DATA..." : "CONFIRM REGISTRATION"}</span>
                    <span className="submit-arrow">{submitting ? "◌" : "↗"}</span>
                  </button>

                  {notice && (
                    <motion.p
                      className={`form-notice ${noticeType}`}
                      role="status"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {noticeType === "success" ? "✓ " : "! "}{notice}
                    </motion.p>
                  )}

                  <div className="form-footer">
                    <span>◈ DATA TRANSMISSION ACTIVE</span>
                    <span>EVENTRA OS v1.0</span>
                  </div>
                </motion.form>
              )}
            </section>
          )}
        </motion.main>
      </AnimatePresence>

      <footer className="footer">
        <Link className="brand" to="/">
          <span className="brand-mark">E<span>.</span></span>
          <span className="brand-name">EVENTRA<span>_</span></span>
        </Link>
        <p>DESIGNED FOR THE UNEXPECTED. BUILT FOR THE NEXT.</p>
        <Link to="/">BACK TO HOME ↑</Link>
      </footer>
    </div>
  );
}

function RoutedApp() {
  return (
    <Routes>
      <Route path="/" element={<AppContent />} />
      <Route path="/register/:eventId" element={<AppContent />} />
      <Route path="*" element={<AppContent />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  );
}
