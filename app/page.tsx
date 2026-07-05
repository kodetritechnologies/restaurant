"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import Menu from "@/components/Menu";
import About from "@/components/About";
import Features from "@/components/Features";
import Chefs from "@/components/Chefs";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Reservation from "@/components/Reservation";
import Stats from "@/components/Stats";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

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

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [chefs, setChefs] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useReveal([gallery, chefs, faqs, reviews]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        // Fetch settings
        const settingsRes = await fetch("/api/settings");
        const settingsData = await settingsRes.json();
        if (settingsData && settingsData.success) {
          setSettings(settingsData.settings);
        }

        // Fetch gallery items
        const galleryRes = await fetch("/api/gallery");
        const galleryData = await galleryRes.json();
        if (galleryData && galleryData.success) {
          setGallery(galleryData.items);
        }

        // Fetch chefs profiles
        const chefsRes = await fetch("/api/chefs");
        const chefsData = await chefsRes.json();
        if (chefsData && chefsData.success) {
          setChefs(chefsData.chefs);
        }

        // Fetch FAQs
        const faqsRes = await fetch("/api/faqs");
        const faqsData = await faqsRes.json();
        if (faqsData && faqsData.success) {
          setFaqs(faqsData.faqs);
        }

        // Fetch Reviews
        const reviewsRes = await fetch("/api/reviews");
        const reviewsData = await reviewsRes.json();
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
      <Header />
      <main id="home">
        <Hero />
        <Categories />
        <Menu />
        <About />
        <Features />
        <Chefs chefs={chefs} />
        <Gallery gallery={gallery} />
        <Testimonials reviews={reviews} />
        <Reservation />
        <Stats />
        <Faq faqs={faqs} />
        <Contact settings={settings} />
        <Footer settings={settings} />
      </main>
      <FloatingButtons settings={settings} />
    </>
  );
}
