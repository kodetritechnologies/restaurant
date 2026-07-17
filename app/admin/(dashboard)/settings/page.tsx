"use client";

import { useState, useEffect, useRef } from "react";
import { Info, Lock, Phone, Mail, MapPin, Clock, MessageSquare, Truck, QrCode, Download } from "lucide-react";
import { QRCodeCanvas } from 'qrcode.react';
import BasicProvider from "@/utils/BasicProvider";
import toast from "react-hot-toast";

export default function SettingsManager() {
  const [bannerText, setBannerText] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [restaurantLogo, setRestaurantLogo] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Operational details state
  const [shopPhone, setShopPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [shopEmail, setShopEmail] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [shortHours, setShortHours] = useState("");
  const [openHoursTueFri, setOpenHoursTueFri] = useState("");
  const [openHoursSatSun, setOpenHoursSatSun] = useState("");
  const [openHoursMon, setOpenHoursMon] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [facebookUsername, setFacebookUsername] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [deliveryFee, setDeliveryFee] = useState<number | string>(0);
  const [isDeliveryFeeActive, setIsDeliveryFeeActive] = useState(false);
  const [tableCount, setTableCount] = useState<number | string>(10);
  const [cancellationTimeLimit, setCancellationTimeLimit] = useState<number | string>(5);
  
  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // QR Code State
  const [qrTableNumber, setQrTableNumber] = useState<number | "">("");
  const qrRef = useRef<HTMLCanvasElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { getMethod, postMethod } = BasicProvider();

  const fetchSettings = async () => {
    try {
      const data = await getMethod("/api/settings");
      if (data && data.success) {
        const s = data.settings;
        setBannerText(s.bannerText || "");
        setShowBanner(!!s.showBanner);
        setRestaurantLogo(s.restaurantLogo || "");
        setShopPhone(s.shopPhone || "");
        setWhatsappNumber(s.whatsappNumber || "");
        setShopEmail(s.shopEmail || "");
        setShopAddress(s.shopAddress || "");
        setShopDescription(s.shopDescription || "");
        setShortHours(s.shortHours || "");
        setOpenHoursTueFri(s.openHoursTueFri || "");
        setOpenHoursSatSun(s.openHoursSatSun || "");
        setOpenHoursMon(s.openHoursMon || "");
        setInstagramUsername(s.instagramUsername || "");
        setFacebookUsername(s.facebookUsername || "");
        setTwitterUsername(s.twitterUsername || "");
        setDeliveryFee(s.deliveryFee || 0);
        setIsDeliveryFeeActive(!!s.isDeliveryFeeActive);
        setTableCount(s.tableCount || 10);
        setCancellationTimeLimit(s.cancellationTimeLimit ?? 5);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveDeliveryFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await postMethod("/api/settings", {
        deliveryFee: Number(deliveryFee) || 0,
        isDeliveryFeeActive
      });
      if (data && data.success) {
        toast.success("Delivery fee settings saved successfully.");
      } else {
        toast.error(data.message || "Failed to update delivery fee settings.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showBanner && !bannerText.trim()) {
      toast.error("Please enter banner announcement text.");
      return;
    }
    
    try {
      const data = await postMethod("/api/settings", {
        showBanner,
        bannerText
      });
      if (data && data.success) {
        toast.success("Banner settings saved successfully.");
      } else {
        toast.error(data.message || "Failed to update banner settings.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    }
  };

  const handleSaveStorePolicies = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await postMethod("/api/settings", {
        tableCount: Number(tableCount) || 10,
        cancellationTimeLimit: Number(cancellationTimeLimit) || 5,
      });
      if (data && data.success) {
        toast.success("Store policies saved successfully.");
      } else {
        toast.error(data.message || "Failed to update store policies.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    }
  };

  const handleSaveOperational = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!shopPhone.trim()) {
      newErrors.shopPhone = "Phone number is required";
    } else if (!/^\d{10}$/.test(shopPhone.trim())) {
      newErrors.shopPhone = "Phone number must be exactly 10 digits";
    }

    // WhatsApp validation (exactly 10 digits)
    if (!whatsappNumber.trim()) {
      newErrors.whatsappNumber = "WhatsApp number is required";
    } else if (!/^\d{10}$/.test(whatsappNumber.trim())) {
      newErrors.whatsappNumber = "WhatsApp number must be exactly 10 digits";
    }

    // Email validation (regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!shopEmail.trim()) {
      newErrors.shopEmail = "Email address is required";
    } else if (!emailRegex.test(shopEmail.trim())) {
      newErrors.shopEmail = "Please enter a valid email address";
    }

    if (!shopAddress.trim()) newErrors.shopAddress = "Physical address is required";
    if (!shopDescription.trim()) newErrors.shopDescription = "Shop description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const data = await postMethod("/api/settings", {
        shopPhone,
        whatsappNumber,
        shopEmail,
        shopAddress,
        shopDescription,
        shortHours,
        openHoursTueFri,
        openHoursSatSun,
        openHoursMon,
        instagramUsername,
        facebookUsername,
        twitterUsername,
        restaurantLogo,
      });
      if (data && data.success) {
        toast.success("Operational settings saved successfully.");
      } else {
        toast.error(data.message || "Failed to update operational settings.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64File = reader.result as string;
        const res = await postMethod("/api/upload", { file: base64File });
        if (res && res.success) {
          setRestaurantLogo(res.url);
          toast.success("Logo uploaded temporarily. Click Save below to apply.");
        } else {
          toast.error(res?.message || "Logo upload failed.");
        }
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error(err.message || "An error occurred during upload.");
      setUploadingLogo(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      const data = await postMethod("/api/auth/change-password", {
        oldPassword,
        newPassword
      });

      if (data && data.success) {
        toast.success("Password changed successfully.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Failed to change password.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current;
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.download = `table-${qrTableNumber}-qr.png`;
    downloadLink.href = pngUrl;
    downloadLink.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-foreground">
        <p className="text-sm font-semibold tracking-widest text-gold uppercase animate-pulse">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-extrabold text-gradient-gold leading-none">
          Console Settings
        </h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
          Manage system properties and security controls
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Dynamic Operational & Social Details Form */}
        <form noValidate onSubmit={handleSaveOperational} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6 lg:col-span-2">
          <h3 className="font-serif text-lg font-bold text-foreground border-b border-foreground/5 pb-2.5">
            Operational, Contact & Social Details
          </h3>

          {/* Logo Upload */}
          <div className="space-y-4 pb-4 border-b border-foreground/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold/80">Restaurant Logo</h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {restaurantLogo ? (
                <div className="relative group">
                  <img src={restaurantLogo} alt="Restaurant Logo" className="h-20 w-auto rounded object-contain bg-background/50 border border-foreground/10 p-2" />
                  <button type="button" onClick={() => setRestaurantLogo("")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 w-32 rounded bg-background/50 border border-dashed border-foreground/20 text-xs text-muted-foreground">
                  No Logo
                </div>
              )}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  id="logo-upload"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold text-gold transition-colors hover:bg-gold/20"
                >
                  {uploadingLogo ? "Uploading..." : "Upload New Logo"}
                </label>
                <p className="text-[10px] text-muted-foreground">Recommended: Transparent PNG, max 2MB.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold/80">Contact Details</h4>
              
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={shopPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setShopPhone(val);
                      if (errors.shopPhone) setErrors({ ...errors, shopPhone: "" });
                    }}
                    className={`w-full bg-background/50 border pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground outline-none transition-colors ${
                      errors.shopPhone ? "border-red-500/50 focus:border-red-500" : "border-foreground/10 focus:border-gold"
                    }`}
                  />
                </div>
                {errors.shopPhone && <span className="text-[10px] text-red-400 mt-1 block">{errors.shopPhone}</span>}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setWhatsappNumber(val);
                      if (errors.whatsappNumber) setErrors({ ...errors, whatsappNumber: "" });
                    }}
                    className={`w-full bg-background/50 border pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground outline-none transition-colors ${
                      errors.whatsappNumber ? "border-red-500/50 focus:border-red-500" : "border-foreground/10 focus:border-gold"
                    }`}
                  />
                </div>
                {errors.whatsappNumber && <span className="text-[10px] text-red-400 mt-1 block">{errors.whatsappNumber}</span>}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="email"
                    value={shopEmail}
                    onChange={(e) => {
                      setShopEmail(e.target.value);
                      if (errors.shopEmail) setErrors({ ...errors, shopEmail: "" });
                    }}
                    className={`w-full bg-background/50 border pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground outline-none transition-colors ${
                      errors.shopEmail ? "border-red-500/50 focus:border-red-500" : "border-foreground/10 focus:border-gold"
                    }`}
                  />
                </div>
                {errors.shopEmail && <span className="text-[10px] text-red-400 mt-1 block">{errors.shopEmail}</span>}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Physical Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={(e) => {
                      setShopAddress(e.target.value);
                      if (errors.shopAddress) setErrors({ ...errors, shopAddress: "" });
                    }}
                    className={`w-full bg-background/50 border pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground outline-none transition-colors ${
                      errors.shopAddress ? "border-red-500/50 focus:border-red-500" : "border-foreground/10 focus:border-gold"
                    }`}
                  />
                </div>
                {errors.shopAddress && <span className="text-[10px] text-red-400 mt-1 block">{errors.shopAddress}</span>}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Shop Description (Footer)
                </label>
                <textarea
                  value={shopDescription}
                  onChange={(e) => {
                    setShopDescription(e.target.value);
                    if (errors.shopDescription) setErrors({ ...errors, shopDescription: "" });
                  }}
                  placeholder="A modern sanctuary of fine dining. Since 2012."
                  rows={2}
                  className={`w-full bg-background/50 border px-4 py-2.5 rounded-xl text-xs text-foreground outline-none transition-colors ${
                    errors.shopDescription ? "border-red-500/50 focus:border-red-500" : "border-foreground/10 focus:border-gold"
                  }`}
                />
                {errors.shopDescription && <span className="text-[10px] text-red-400 mt-1 block">{errors.shopDescription}</span>}
              </div>



            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold/80">Opening Hours</h4>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Short Hours Description (e.g. for Map)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={shortHours}
                    onChange={(e) => setShortHours(e.target.value)}
                    placeholder="Mon–Sun · 10:00 – 23:30"
                    className="w-full bg-background/50 border border-foreground/10 pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Weekday Hours (Tue - Fri)
                </label>
                <input
                  type="text"
                  value={openHoursTueFri}
                  onChange={(e) => setOpenHoursTueFri(e.target.value)}
                  placeholder="Monday – Friday · 10:00 – 23:30"
                  className="w-full bg-background/50 border border-foreground/10 px-3 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Weekend Hours (Sat - Sun)
                </label>
                <input
                  type="text"
                  value={openHoursSatSun}
                  onChange={(e) => setOpenHoursSatSun(e.target.value)}
                  placeholder="Saturday – Sunday · 10:00 – 23:30"
                  className="w-full bg-background/50 border border-foreground/10 px-3 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Closed Day (e.g. Monday)
                </label>
                <input
                  type="text"
                  value={openHoursMon}
                  onChange={(e) => setOpenHoursMon(e.target.value)}
                  placeholder="Monday · Closed"
                  className="w-full bg-background/50 border border-foreground/10 px-3 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Socials Username/Handles */}
          <div className="space-y-4 pt-4 border-t border-foreground/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold/80">Social Media Handles</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Instagram Handle/URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={instagramUsername}
                    onChange={(e) => setInstagramUsername(e.target.value)}
                    placeholder="aurea.dining"
                    className="w-full bg-background/50 border border-foreground/10 pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Facebook Handle/URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={facebookUsername}
                    onChange={(e) => setFacebookUsername(e.target.value)}
                    placeholder="aurea.dining"
                    className="w-full bg-background/50 border border-foreground/10 pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Twitter Handle/URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={twitterUsername}
                    onChange={(e) => setTwitterUsername(e.target.value)}
                    placeholder="aurea.dining"
                    className="w-full bg-background/50 border border-foreground/10 pl-9 pr-4 py-2.5 rounded-xl text-xs text-foreground outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gradient-gold px-6 py-3.5 text-xs font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.01]"
          >
            Save Restaurant details
          </button>
        </form>

        {/* Right Column Layout containing Banner & Password Config */}
        <div className="space-y-6 flex flex-col">
          {/* Banner Announcement Config */}
          <form onSubmit={handleSaveBanner} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6">
            <h3 className="font-serif text-lg font-bold text-foreground border-b border-foreground/5 pb-2.5">
              Promo Announcement Banner
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-gold">
                  Show Announcement Banner
                </label>
                <button
                  type="button"
                  onClick={() => setShowBanner(!showBanner)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showBanner ? "bg-gold" : "bg-foreground/10"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow ring-0 transition duration-200 ease-in-out ${
                      showBanner ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                  Banner Message Text
                </label>
                <div className="relative">
                  <span className="absolute top-3.5 left-3.5 flex items-start pointer-events-none text-muted-foreground">
                    <Info className="h-4 w-4" />
                  </span>
                  <textarea
                    id="bannerText"
                    rows={3}
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    placeholder="Complimentary Chef's Special with reservation..."
                    disabled={!showBanner}
                    className="w-full bg-background/50 border border-foreground/10 pl-10 pr-4 py-2.5 rounded-2xl text-xs text-foreground outline-none transition-colors focus:border-gold disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-gold px-6 py-3 text-xs font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.01]"
            >
              Save Banner Settings
            </button>
          </form>

          <form onSubmit={handleSaveStorePolicies} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6">
            <h3 className="font-serif text-lg font-bold text-foreground border-b border-foreground/5 pb-2.5 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-gold" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              Store Policies
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                  Number of Tables
                </label>
                <div className="relative">
                  <span className="absolute top-2.5 left-3.5 flex items-start pointer-events-none text-muted-foreground">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={tableCount}
                    onChange={(e) => setTableCount(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-background/50 border border-foreground/10 pl-10 pr-4 py-2.5 rounded-full text-xs text-foreground outline-none transition-colors focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                  Order Cancellation Time Limit (minutes)
                </label>
                <div className="relative">
                  <span className="absolute top-2.5 left-3.5 flex items-start pointer-events-none text-muted-foreground">
                    <Clock className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={cancellationTimeLimit}
                    onChange={(e) => setCancellationTimeLimit(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-background/50 border border-foreground/10 pl-10 pr-4 py-2.5 rounded-full text-xs text-foreground outline-none transition-colors focus:border-gold"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Set to 0 to disable order cancellations.</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-gold px-6 py-3 text-xs font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.01]"
            >
              Save Store Policies
            </button>
          </form>

          <form onSubmit={handleSaveDeliveryFee} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6">
            <h3 className="font-serif text-lg font-bold text-foreground border-b border-foreground/5 pb-2.5 flex items-center gap-2">
              <Truck className="h-5 w-5 text-gold" />
              Delivery Fee
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-gold">
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => setIsDeliveryFeeActive(!isDeliveryFeeActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isDeliveryFeeActive ? "bg-gold" : "bg-foreground/10"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary-foreground shadow ring-0 transition duration-200 ease-in-out ${
                      isDeliveryFeeActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                  Fee Amount
                </label>
                <div className="relative">
                  <span className="absolute top-2.5 left-3.5 flex items-start pointer-events-none text-muted-foreground">
                    <Truck className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value === "" ? "" : Number(e.target.value))}
                    disabled={!isDeliveryFeeActive}
                    className="w-full bg-background/50 border border-foreground/10 pl-10 pr-4 py-2.5 rounded-full text-xs text-foreground outline-none transition-colors focus:border-gold disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-gradient-gold px-6 py-3 text-xs font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.01]"
            >
              Save Delivery Fee
            </button>
          </form>

          <form onSubmit={handleChangePassword} className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6">
            <h3 className="font-serif text-lg font-bold text-foreground border-b border-foreground/5 pb-2.5">
              Update Admin Password
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                  Current Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-background/50 border border-foreground/10 pl-10 pr-4 py-2.5 rounded-full text-xs text-foreground outline-none transition-colors focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-background/50 border border-foreground/10 pl-10 pr-4 py-2.5 rounded-full text-xs text-foreground outline-none transition-colors focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-background/50 border border-foreground/10 pl-10 pr-4 py-2.5 rounded-full text-xs text-foreground outline-none transition-colors focus:border-gold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full rounded-full bg-gradient-gold px-6 py-3 text-xs font-semibold text-primary-foreground shadow-gold transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {passwordLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving password...</span>
                </>
              ) : (
                <span>Save New Password</span>
              )}
            </button>
          </form>
          
          <div className="glass p-6 sm:p-8 rounded-3xl shadow-elegant space-y-6">
            <h3 className="font-serif text-lg font-bold text-foreground border-b border-foreground/5 pb-2.5 flex items-center gap-2">
              <QrCode className="h-5 w-5 text-gold" />
              Table QR Generator
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gold">
                  Generate for Table Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <QrCode className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={tableCount || 100}
                    value={qrTableNumber}
                    onChange={(e) => setQrTableNumber(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 5"
                    className="w-full bg-background/50 border border-foreground/10 pl-10 pr-4 py-2.5 rounded-full text-xs text-foreground outline-none transition-colors focus:border-gold"
                  />
                </div>
              </div>

              {qrTableNumber !== "" && (
                <div className="flex flex-col items-center justify-center pt-4 space-y-4">
                  <div className="p-4 bg-white rounded-xl border border-foreground/10">
                    <QRCodeCanvas
                      id="qr-code"
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/scan?table=${qrTableNumber}`}
                      size={180}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"H"}
                      includeMargin={false}
                      ref={qrRef}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-full bg-foreground/5 border border-foreground/10 hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-colors text-foreground"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
