"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Menu from "@/components/Menu";
import Testimonials from "@/components/Testimonials";
import Reservation from "@/components/Reservation";
import Stats from "@/components/Stats";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import BasicProvider from "@/utils/BasicProvider";

function useReveal(deps: any[] = []) {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, deps);
}

export default function Home() {
  const { getMethod } = BasicProvider();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
 
  useReveal([faqs, reviews]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        // Fetch settings
        const settingsData = await getMethod("/api/settings");
        if (settingsData && settingsData.success) {
          setSettings(settingsData.settings);
        }

        // Fetch FAQs
        const faqsData = await getMethod("/api/faqs");
        if (faqsData && faqsData.success) {
          setFaqs(faqsData.faqs);
        }

        // Fetch Reviews
        const reviewsData = await getMethod("/api/reviews");
        if (reviewsData && reviewsData.success) {
          setReviews(reviewsData.reviews);
        }
      } catch (err) {
        console.error("Failed to load landing datasets", err);
      }
    };
    fetchLandingData();
  }, []);

  return (
    <>
      <Loader loading={loading} />
      <main id="home">
        <Hero />
        <Categories />
        <Menu />
        <Testimonials reviews={reviews} />
        <Reservation />
        <Stats />
        <Faq faqs={faqs} />
        <Contact settings={settings} />
      </main>
    </>
  );
}
