"use client";

import { ArrowRight, ArrowRightIcon, FileCode2, Github, Moon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { cn } from "@/lib/utils";
import { Terminal } from "@/components/magicui/terminal";
import { AnimatedSpan } from "@/components/magicui/terminal";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { addToWaitlist } from "@/lib/supabase";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { motion } from "motion/react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { TypingAnimation } from "@/components/magicui/typing-animation";
import { SparklesText } from "@/components/magicui/sparkles-text";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error message
    setErrorMsg("");
    
    // Validate email
    if (!email) {
      setErrorMsg("Email address is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting email:", email);
      const result = await addToWaitlist(email);
      console.log("Waitlist submission result:", result);
      
      if (result.success) {
        if (result.message === 'Email already registered') {
          toast.info("This email is already on our waitlist!");
        } else {
          toast.success("You've been added to the waitlist!");
        }
        setEmail("");
      } else {
        // Use custom message if available
        const errorMessage = result.message || "Failed to join waitlist. Please try again.";
        toast.error(errorMessage);
        console.error("Waitlist error details:", result.error);
      }
    } catch (error) {
      console.error("Error submitting to waitlist:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative">
      <BackgroundLines 
        className="absolute inset-0 w-full h-full z-0 bg-black" 
        svgOptions={{ duration: 15 }}
      >
        <div className="hidden" />
      </BackgroundLines>
      
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between mb-0 relative z-10">
        <div className="flex items-center space-x-2">
          <FileCode2 className="w-6 h-6 text-yellow-500" />
          <span className="font-semibold text-lg">HelloREADME</span>
        </div>
        <div className="flex items-center space-x-4 ">
          <a href="#about" className="text-gray-400 hover:text-white transition">About</a>
          {/* <div className="flex items-center space-x-2 bg-zinc-900/50 rounded-full px-4 py-1.5">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm">35</span>
            <span className="text-sm text-gray-400">on GitHub</span>
          </div> */}
          {/* <Moon className="w-5 h-5 text-gray-400" /> */}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-32 text-center mt-0 relative z-10">
        {/* <a
          href="#watch"
          className="inline-flex items-center px-4 py-1.5 mb-8 bg-zinc-800/40 rounded-full text-sm text-yellow-500 hover:bg-zinc-800 transition"
        >
          <span>Watch Tutorial</span>
        </a> */}

        <div className="z-10 flex min-h-64 items-center justify-center ">
      <div
        className={cn(
          "group rounded-full border border-black/5 bg-neutral-900 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-800 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800",
        )}
      >
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition text-gray-300 ease-out hover:text-neutral-200 hover:duration-300 hover:dark:text-neutral-400">
          <span>✨ Coming Soon!</span>
          <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
        </AnimatedShinyText>
      </div>
    </div>

        <h1 className="text-5xl mt-5 sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600">
          Repository to README
        </h1>

        <p className="max-w-2xl mx-auto text-gray-400 text-base mb-8">
        Your code tells a story — we help you tell it well.
        Powered by AI, our tool reads your GitHub project and instantly creates a high-quality README that captures what matters.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col gap-y-2 mb-0">
          <div className="flex gap-x-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              aria-label="Email address"
            />
            <Button type="submit" className="bg-gray-300 text-black hover:bg-gray-400" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-t-transparent border-gray-700 rounded-full animate-spin mr-2"></div>
                  <span>Joining...</span>
                </div>
              ) : (
                <>
                  Join Waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          {errorMsg && (
            <p className="text-sm text-red-500 mt-1">{errorMsg}</p>
          )}
        </form>

        {/* <div className="mt-8 text-sm text-gray-500">
          <span className="inline-flex items-center">
            <span className="mr-2">⚡️</span>
            <span>2/2 remaining today.</span>
            <a href="#signup" className="ml-1 text-yellow-500 hover:text-yellow-400">
              Sign in to get 15/day free →
            </a>
          </span>
        </div> */}

      </div>

      {/* Features Preview */}
      <div className="max-w-5xl mx-auto px-4 pb-24 mt-0 mb-0 relative z-10">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <div className="flex gap-4 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="font-mono text-sm text-gray-400">
            <p>$ gitreadme analyze https://github.com/owner/repo</p>
            <p className="text-gray-500 mt-2">Analyzing repository structure...</p>
            <p className="text-gray-500">Generating comprehensive README...</p>
            <p className="text-emerald-400 mt-2">✓ README.md generated successfully!</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mt-1 mx-auto px-4 py-8 text-center text-sm text-gray-500 relative z-10">
        <p>Designed & built by Aaditya aman :)</p>
      </footer>
    </main>
  );
}