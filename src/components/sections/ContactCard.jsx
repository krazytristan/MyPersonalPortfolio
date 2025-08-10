import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GradientText from "../ui/GradientText";

export default function ContactCard() {
  const formRef = useRef(null);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", message: "", website: "" });
  const [errors, setErrors] = useState({});
  const MAX_LEN = 1000;

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Required";
    if (!values.email.trim()) next.email = "Required";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Invalid email";
    if (!values.message.trim()) next.message = "Required";
    else if (values.message.length > MAX_LEN) next.message = `Max ${MAX_LEN} chars`;
    if (values.website) next._spam = "Spam detected";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) { setStatus("Please fix the fields."); return; }
    setSending(true);
    const subject = encodeURIComponent(`Portfolio inquiry from ${values.name}`);
    const body = encodeURIComponent(`${values.message}\n\n— ${values.name} (${values.email})`);
    try {
      window.location.href = `mailto:trstnjorge@gmail.com?subject=${subject}&body=${body}`;
      setStatus("Opening your mail app…");
    } finally {
      setSending(false);
      setValues((v) => ({ ...v, message: "" }));
    }
  };

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(""), 2500);
    return () => clearTimeout(t);
  }, [status]);

  const baseField =
    "peer w-full px-4 py-3 rounded-xl bg-zinc-900/50 text-zinc-100 " +
    "ring-1 ring-white/10 placeholder-transparent " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-400/60 " +
    "transition";

  const errorRing = "ring-red-500/50 focus:ring-red-500/70";

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="relative rounded-2xl p-6 sm:p-7 overflow-hidden"
      aria-label="Contact form"
      noValidate
    >
      {/* gradient border glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none">
        <div className="absolute -inset-px rounded-2xl opacity-60"
             style={{ background: "conic-gradient(from 180deg at 50% 50%, rgba(99,102,241,.35), rgba(168,85,247,.35), rgba(34,211,238,.35), rgba(99,102,241,.35))", filter: "blur(8px)" }} />
      </div>

      {/* card surface */}
      <div className="absolute inset-0 rounded-2xl bg-zinc-900/70 backdrop-blur-md ring-1 ring-white/10" />

      <div className="relative">
        <h3 className="font-semibold mb-5">
          <GradientText small>Message me</GradientText>
        </h3>

        {/* honeypot */}
        <input
          className="hidden"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={onChange}
        />

        <div className="grid gap-4">
          {/* Name */}
          <div className="relative">
            <input
              id="name"
              name="name"
              value={values.name}
              onChange={onChange}
              placeholder="Your name"
              className={`${baseField} ${errors.name ? errorRing : ""}`}
              aria-invalid={!!errors.name}
            />
            <label
              htmlFor="name"
              className="pointer-events-none absolute left-3 top-3.5 px-1 text-sm text-zinc-400 transition
                        bg-zinc-900/70 backdrop-blur peer-placeholder-shown:top-3.5
                        peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs
                        peer-focus:text-indigo-300 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs rounded"
            >
              Your name
            </label>
            {errors.name && <p className="mt-1 text-xs text-red-300">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={onChange}
              placeholder="Your email"
              className={`${baseField} ${errors.email ? errorRing : ""}`}
              aria-invalid={!!errors.email}
            />
            <label
              htmlFor="email"
              className="pointer-events-none absolute left-3 top-3.5 px-1 text-sm text-zinc-400 transition
                        bg-zinc-900/70 backdrop-blur peer-placeholder-shown:top-3.5
                        peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs
                        peer-focus:text-indigo-300 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs rounded"
            >
              Your email
            </label>
            {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email}</p>}
          </div>

          {/* Message */}
          <div className="relative">
            <textarea
              id="message"
              name="message"
              rows={5}
              value={values.message}
              onChange={onChange}
              placeholder="Your message"
              maxLength={MAX_LEN}
              className={`${baseField} ${errors.message ? errorRing : ""} resize-y min-h-[120px]`}
              aria-invalid={!!errors.message}
            />
            <label
              htmlFor="message"
              className="pointer-events-none absolute left-3 top-3.5 px-1 text-sm text-zinc-400 transition
                        bg-zinc-900/70 backdrop-blur peer-placeholder-shown:top-3.5
                        peer-placeholder-shown:text-sm peer-focus:-top-2 peer-focus:text-xs
                        peer-focus:text-indigo-300 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs rounded"
            >
              Your message
            </label>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className={errors.message ? "text-red-300" : "text-zinc-400"}>
                {errors.message ? errors.message : `Max ${MAX_LEN} characters`}
              </span>
              <span className="text-zinc-500">{values.message.length}/{MAX_LEN}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="submit"
            disabled={sending}
            className={`relative inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-white transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300
              ${sending ? "opacity-80 cursor-not-allowed" : "hover:brightness-110"}`}
            style={{
              background:
                "linear-gradient(135deg, rgba(99,102,241,1), rgba(168,85,247,1))",
              boxShadow: "0 8px 24px rgba(99,102,241,.25)",
            }}
          >
            {sending ? "Sending…" : "Send"}
          </button>

          <AnimatePresence>
            {status && (
              <motion.span
                key="status"
                role="status"
                className="text-xs text-zinc-300"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {status}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </form>
  );
}
