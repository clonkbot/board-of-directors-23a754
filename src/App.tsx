import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { Id } from "../convex/_generated/dataModel";

// Auth Screen
function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", flow);
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-6">
            <span className="text-3xl font-light text-neutral-950">B</span>
          </div>
          <h1 className="text-2xl font-light text-white tracking-tight mb-2">Board of Directors</h1>
          <p className="text-neutral-500 text-sm">Your AI coaching team, in your pocket</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
            required
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-neutral-950 rounded-xl font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : flow === "signIn" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <button
          onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          className="w-full mt-4 py-3 text-neutral-500 text-sm hover:text-white transition-colors"
        >
          {flow === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>

        <button
          onClick={() => signIn("anonymous")}
          className="w-full mt-2 py-3 text-neutral-600 text-sm hover:text-neutral-400 transition-colors"
        >
          Continue as guest
        </button>
      </div>
    </div>
  );
}

// Onboarding Screen
function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const createProfile = useMutation(api.profiles.create);
  const generatePlan = useMutation(api.plans.generate);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await createProfile({ name, bio, primaryGoal: goal });
    await generatePlan({});
    setLoading(false);
    onComplete();
  };

  const steps = [
    {
      title: "What should we call you?",
      subtitle: "Your coaches will use this name",
      input: (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-lg placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
          autoFocus
        />
      ),
      valid: name.length >= 2,
    },
    {
      title: "Tell us about yourself",
      subtitle: "A brief bio helps your coaches understand you",
      input: (
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="I'm a software engineer exploring entrepreneurship..."
          rows={4}
          className="w-full px-4 py-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
          autoFocus
        />
      ),
      valid: bio.length >= 10,
    },
    {
      title: "What's your #1 goal?",
      subtitle: "Be specific. Your coaches will build a plan around this.",
      input: (
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Reach 10k MRR in 6 months"
          className="w-full px-4 py-4 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-lg placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
          autoFocus
        />
      ),
      valid: goal.length >= 5,
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-neutral-900">
        <div
          className="h-full bg-white transition-all duration-500"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 animate-fadeIn">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-2">{currentStep.title}</h2>
            <p className="text-neutral-500">{currentStep.subtitle}</p>
          </div>

          <div className="mb-8 animate-slideUp">
            {currentStep.input}
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3.5 border border-neutral-800 text-neutral-400 rounded-xl hover:border-neutral-600 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step < steps.length - 1) {
                  setStep(step + 1);
                } else {
                  handleSubmit();
                }
              }}
              disabled={!currentStep.valid || loading}
              className="flex-1 py-3.5 bg-white text-neutral-950 rounded-xl font-medium hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? "Creating your plan..." : step < steps.length - 1 ? "Continue" : "Generate My Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Plan Reveal Screen
function PlanRevealScreen({ onReveal }: { onReveal: () => void }) {
  const profile = useQuery(api.profiles.get);
  const plan = useQuery(api.plans.get);
  const revealPlan = useMutation(api.profiles.revealPlan);
  const [revealing, setRevealing] = useState(false);

  const handleReveal = async () => {
    setRevealing(true);
    await revealPlan({});
    setTimeout(onReveal, 500);
  };

  if (!profile || !plan) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 mb-6">
            <span className="text-4xl">🎯</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-light text-white mb-3">
            Your plan is ready, {profile.name}
          </h2>
          <p className="text-neutral-500">
            Your Board of Directors has crafted a personalized roadmap to help you achieve:
          </p>
          <p className="text-white mt-4 text-lg font-medium">"{profile.primaryGoal}"</p>
        </div>

        {/* Blurred preview */}
        <div className="relative mb-8 animate-slideUp">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 blur-sm">
            <div className="space-y-4">
              {plan.milestones.slice(0, 3).map((_m: { title: string; description: string; completed: boolean }, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-neutral-800 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-neutral-800 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🔒</span>
              <span className="text-sm text-neutral-400">5 milestones inside</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleReveal}
          disabled={revealing}
          className="w-full py-4 bg-white text-neutral-950 rounded-xl font-medium hover:bg-neutral-200 transition-all transform hover:scale-[1.02] disabled:opacity-50"
        >
          {revealing ? "Revealing..." : "Reveal My Plan →"}
        </button>
      </div>
    </div>
  );
}

// Main Dashboard
function Dashboard() {
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profiles.get);
  const plan = useQuery(api.plans.get);
  const coaches = useQuery(api.coaches.list);
  const conversations = useQuery(api.messages.listConversations);
  const seedCoaches = useMutation(api.coaches.seedCoaches);
  const toggleMilestone = useMutation(api.plans.toggleMilestone);

  const [activeTab, setActiveTab] = useState<"plan" | "coaches" | "chat">("plan");
  const [selectedCoach, setSelectedCoach] = useState<Id<"coaches"> | null>(null);

  // Seed coaches on first load
  useEffect(() => {
    if (coaches !== undefined && coaches.length === 0) {
      seedCoaches({});
    }
  }, [coaches, seedCoaches]);

  if (!profile || !plan || !coaches) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedCoach) {
    return <ChatScreen coachId={selectedCoach} onBack={() => setSelectedCoach(null)} />;
  }

  const completedCount = plan.milestones.filter((m: { completed: boolean }) => m.completed).length;

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-900 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm">Welcome back,</p>
            <h1 className="text-white font-medium">{profile.name}</h1>
          </div>
          <button
            onClick={() => signOut()}
            className="text-neutral-500 text-sm hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-neutral-900 px-4">
        <div className="max-w-lg mx-auto flex">
          {[
            { id: "plan", label: "Plan" },
            { id: "coaches", label: "Coaches" },
            { id: "chat", label: "Chats" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-white border-white"
                  : "text-neutral-500 border-transparent hover:text-neutral-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto p-4">
          {activeTab === "plan" && (
            <div className="animate-fadeIn">
              {/* Goal Card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-6">
                <p className="text-neutral-500 text-sm mb-1">Your Goal</p>
                <p className="text-white text-lg">{profile.primaryGoal}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${(completedCount / plan.milestones.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-neutral-500 text-sm">
                    {completedCount}/{plan.milestones.length}
                  </span>
                </div>
              </div>

              {/* Milestones */}
              <h3 className="text-neutral-500 text-sm uppercase tracking-wider mb-4">Milestones</h3>
              <div className="space-y-3">
                {plan.milestones.map((milestone: { title: string; description: string; completed: boolean }, index: number) => (
                  <button
                    key={index}
                    onClick={() => toggleMilestone({ milestoneIndex: index })}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      milestone.completed
                        ? "bg-neutral-900/50 border-neutral-800"
                        : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                        milestone.completed
                          ? "bg-white border-white"
                          : "border-neutral-600"
                      }`}>
                        {milestone.completed && (
                          <svg className="w-3 h-3 text-neutral-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${milestone.completed ? "text-neutral-500 line-through" : "text-white"}`}>
                          {milestone.title}
                        </p>
                        <p className="text-neutral-500 text-sm mt-1">{milestone.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "coaches" && (
            <div className="animate-fadeIn">
              <h3 className="text-neutral-500 text-sm uppercase tracking-wider mb-4">Your Board</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coaches.map((coach: { _id: Id<"coaches">; name: string; avatar: string; bio: string; specialty: string }) => (
                  <button
                    key={coach._id}
                    onClick={() => setSelectedCoach(coach._id)}
                    className="text-left p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-light text-neutral-950">{coach.avatar}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">{coach.name}</p>
                        <p className="text-neutral-600 text-xs mb-1">{coach.specialty}</p>
                        <p className="text-neutral-500 text-sm line-clamp-2">{coach.bio}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-neutral-600 group-hover:text-neutral-400 transition-colors">
                      Start conversation →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="animate-fadeIn">
              {conversations && conversations.length > 0 ? (
                <div className="space-y-2">
                  {conversations.map((conv: { _id: Id<"conversations">; coachId: Id<"coaches">; lastMessageAt: number; coach?: { avatar: string; name: string } | null; lastMessage?: { role: string; content: string } | null }) => (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedCoach(conv.coachId)}
                      className="w-full text-left p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-light text-neutral-950">{conv.coach?.avatar}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-white font-medium truncate">{conv.coach?.name}</p>
                            <span className="text-neutral-600 text-xs flex-shrink-0">
                              {new Date(conv.lastMessageAt).toLocaleDateString()}
                            </span>
                          </div>
                          {conv.lastMessage && (
                            <p className="text-neutral-500 text-sm truncate">
                              {conv.lastMessage.role === "user" ? "You: " : ""}
                              {conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-neutral-500 mb-4">No conversations yet</p>
                  <button
                    onClick={() => setActiveTab("coaches")}
                    className="text-white hover:underline"
                  >
                    Start chatting with a coach →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-neutral-700 text-xs">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

// Chat Screen
function ChatScreen({ coachId, onBack }: { coachId: Id<"coaches">; onBack: () => void }) {
  const profile = useQuery(api.profiles.get);
  const coach = useQuery(api.coaches.get, { id: coachId });
  const getOrCreateConversation = useMutation(api.messages.getOrCreateConversation);
  const sendMessage = useMutation(api.messages.sendMessage);
  const addCoachResponse = useMutation(api.messages.addCoachResponse);

  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  const messages = useQuery(
    api.messages.listMessages,
    conversationId ? { conversationId } : "skip"
  );

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const id = await getOrCreateConversation({ coachId });
      setConversationId(id);
    };
    init();
  }, [coachId, getOrCreateConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateResponse = async (userMessage: string) => {
    if (!coach || !profile || !conversationId) return;

    setIsTyping(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    // Generate contextual response based on coach personality
    const responses = getCoachResponses(coach.name, userMessage, profile.primaryGoal);
    const response = responses[Math.floor(Math.random() * responses.length)];

    await addCoachResponse({
      conversationId,
      coachId,
      content: response,
    });

    setIsTyping(false);
  };

  const getCoachResponses = (coachName: string, message: string, goal: string): string[] => {
    const lowMessage = message.toLowerCase();

    if (coachName === "Simon") {
      if (lowMessage.includes("stuck") || lowMessage.includes("lost")) {
        return [
          `Let's step back. Why did you start pursuing "${goal}" in the first place? What's the deeper motivation?`,
          "People don't buy what you do, they buy why you do it. Have you clearly articulated your 'why'?",
          "Feeling stuck often means you've lost sight of your purpose. Let's reconnect with that.",
        ];
      }
      return [
        "Start with why. What's the core purpose behind this goal?",
        "The goal isn't just the destination—it's who you become along the way. How is this journey shaping you?",
        "Interesting. Tell me more about why this matters to you specifically.",
      ];
    }

    if (coachName === "James") {
      if (lowMessage.includes("habit") || lowMessage.includes("routine")) {
        return [
          "Focus on the system, not the goal. What's one 2-minute habit you can start today?",
          "Habit stacking works. What existing habit can you attach your new behavior to?",
          "The key is to make it obvious, attractive, easy, and satisfying. Which part are you struggling with?",
        ];
      }
      return [
        "You don't rise to the level of your goals. You fall to the level of your systems. What system supports this?",
        "1% better every day. What's the smallest improvement you can make right now?",
        "Every action is a vote for the type of person you wish to become. What vote are you casting today?",
      ];
    }

    if (coachName === "Alex") {
      if (lowMessage.includes("revenue") || lowMessage.includes("money") || lowMessage.includes("sales")) {
        return [
          "The offer is everything. What's your Grand Slam Offer? Make it so good they feel stupid saying no.",
          "Price is a function of value, not cost. How can you 10x the perceived value?",
          "Stop competing on price. Compete on value. What unique outcome can you guarantee?",
        ];
      }
      return [
        "Let me be direct: are you spending time on $10/hour tasks or $10,000/hour tasks?",
        "The best marketing is a great product. Is your product actually solving a painful problem?",
        "What would you need to do to 10x this? That thinking often reveals the real answer.",
      ];
    }

    if (coachName === "Maya") {
      if (lowMessage.includes("fear") || lowMessage.includes("afraid") || lowMessage.includes("anxious")) {
        return [
          "Fear often points to what matters most. What if this fear is actually a compass?",
          "Let's reframe: what's the worst that could happen? And could you handle it?",
          "Your comfort zone is a beautiful place, but nothing ever grows there. What's one small step outside it?",
        ];
      }
      return [
        "I hear you. What would you tell a friend in this exact situation?",
        "Sometimes our biggest obstacle is the story we tell ourselves. What story are you telling?",
        "Growth is uncomfortable by nature. That discomfort you feel? It's progress.",
      ];
    }

    return [
      "That's a great point. Tell me more about what's on your mind.",
      "I appreciate you sharing that. How does this connect to your main goal?",
      "Interesting perspective. What feels like the next right step?",
    ];
  };

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;

    const message = input.trim();
    setInput("");

    await sendMessage({ conversationId, content: message });
    await generateResponse(message);
  };

  if (!coach || !profile) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Chat Header */}
      <header className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-sm border-b border-neutral-900 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <span className="text-lg font-light text-neutral-950">{coach.avatar}</span>
          </div>
          <div>
            <p className="text-white font-medium">{coach.name}</p>
            <p className="text-neutral-500 text-xs">{coach.specialty}</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Coach intro message */}
          {(!messages || messages.length === 0) && !isTyping && (
            <div className="animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-light text-neutral-950">{coach.avatar}</span>
                </div>
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                  <p className="text-white text-sm leading-relaxed">
                    Hey {profile.name}! I'm {coach.name}, your {coach.specialty.toLowerCase()} coach.
                    I see you're working towards "{profile.primaryGoal}". How can I help you today?
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages?.map((msg: { _id: Id<"messages">; role: "user" | "assistant"; content: string }) => (
            <div
              key={msg._id}
              className={`flex items-start gap-3 animate-fadeIn ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-light text-neutral-950">{coach.avatar}</span>
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-white text-neutral-950 rounded-tr-md"
                    : "bg-neutral-900 border border-neutral-800 text-white rounded-tl-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-light text-neutral-950">{coach.avatar}</span>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="sticky bottom-0 bg-neutral-950 border-t border-neutral-900 p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Message..."
            className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="px-5 py-3 bg-white text-neutral-950 rounded-xl font-medium hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <footer className="mt-4 text-center">
          <p className="text-neutral-700 text-xs">
            Requested by @web-user · Built by @clonkbot
          </p>
        </footer>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(api.profiles.get);
  const [forceRefresh, setForceRefresh] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Loading profile
  if (profile === undefined) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No profile yet - show onboarding
  if (!profile) {
    return <OnboardingScreen onComplete={() => setForceRefresh(f => f + 1)} />;
  }

  // Profile exists but plan not revealed
  if (!profile.planRevealed) {
    return <PlanRevealScreen onReveal={() => setForceRefresh(f => f + 1)} />;
  }

  // Main dashboard
  return <Dashboard key={forceRefresh} />;
}
