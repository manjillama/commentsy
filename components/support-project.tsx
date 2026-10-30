import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import styles from "./support-project.module.css";

export default function SupportProject() {
  return (
    <aside aria-label="Support Commentsy" className={styles.support}>
      <div className={styles.invitation}>
        <div className={styles.illustration} aria-hidden="true">
          <svg viewBox="0 0 96 96" fill="none">
            <path d="M37 29c-5-7 5-9 1-16M49 29c-5-7 5-9 1-16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="44" cy="75" rx="29" ry="5" fill="currentColor" opacity=".08" />
            <path d="M64 41h5a10 10 0 0 1 0 20h-7" stroke="currentColor" strokeWidth="2.5" />
            <path d="M24 38h40v19a20 20 0 0 1-40 0V38Z" fill="#fffdf8" stroke="currentColor" strokeWidth="2.5" />
            <path d="M32 46h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".25" />
            <path d="m41 54 8 4-8 4v-8Z" fill="currentColor" />
          </svg>
        </div>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>INDEPENDENTLY BUILT. COMMUNITY SUPPORTED.</span>
          <h2 className={styles.title}>Good conversations start with a coffee.</h2>
          <p className={styles.description}>If Commentsy has found a place on your site, help keep the ideas brewing.</p>
        </div>
        <div className={styles.action}>
          <div className={styles.options}>
          <a href="https://buymeacoffee.com/xmarman" target="_blank" rel="noopener noreferrer" className={styles.button}>Buy me a coffee <ArrowTopRightIcon aria-hidden="true" /></a>
          <a href="https://patreon.com/xmarman" target="_blank" rel="noopener noreferrer" className={styles.button}>Support on Patreon <ArrowTopRightIcon aria-hidden="true" /></a>
          </div>
          <span>Always optional. Always appreciated.</span>
        </div>
      </div>
      <p className={styles.note}>Your support helps maintain Commentsy and bring future projects to life. Every contribution means a lot. Thank you for being part of it.</p>
    </aside>
  );
}
