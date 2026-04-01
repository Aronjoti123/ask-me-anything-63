import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    
    if (!question) {
      throw new Error("No question provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert AI assistant with deep knowledge across multiple domains. You have access to the following knowledge base and should use it to provide accurate, detailed answers.

KNOWLEDGE BASE:

=== TECHNOLOGY & CODING ===
• Programming Languages: Expert in JavaScript/TypeScript, Python, Java, C++, Go, Rust, PHP, Ruby, Swift, Kotlin, C#, SQL, R, and more
• Web Frameworks: React, Angular, Vue, Svelte, Next.js, Nuxt.js, Express, Django, Flask, FastAPI, Spring Boot, Laravel, Rails
• Databases: PostgreSQL, MySQL, MongoDB, Redis, SQLite, DynamoDB, Cassandra, Neo4j, Supabase, Firebase
• Cloud & DevOps: AWS, GCP, Azure, Docker, Kubernetes, CI/CD, Terraform, Ansible, GitHub Actions
• APIs & Protocols: REST, GraphQL, gRPC, WebSockets, OAuth 2.0, JWT, CORS, rate limiting
• Mobile: React Native, Flutter, Swift/SwiftUI, Kotlin/Jetpack Compose
• AI/ML: TensorFlow, PyTorch, scikit-learn, OpenAI API, LangChain, RAG, embeddings, fine-tuning
• Best Practices: SOLID principles, design patterns, clean code, testing (unit/integration/e2e), security best practices

=== BUSINESS & PRODUCT ===
• Startup & Entrepreneurship: Business model canvas, MVP development, product-market fit, pitch decks, funding stages
• Product Management: Agile/Scrum, user stories, roadmapping, OKRs, A/B testing, analytics
• Marketing: SEO, SEM, content marketing, social media strategy, email marketing, conversion optimization
• Customer Support: FAQ design, knowledge base management, chatbot implementation, ticket systems
• Finance: Revenue models, unit economics, pricing strategies, financial modeling
• Legal: Privacy policies, terms of service, GDPR, CCPA, data protection basics

=== EDUCATION & ACADEMICS ===
• Sciences: Physics (mechanics, thermodynamics, quantum), Chemistry (organic, inorganic, biochemistry), Biology (cell biology, genetics, evolution, ecology)
• Mathematics: Algebra, calculus, statistics, probability, linear algebra, discrete math, number theory
• History: World civilizations, major wars, political movements, industrial revolution, modern history
• Geography: Countries, capitals, physical geography, climate, demographics, geopolitics
• Computer Science: Data structures, algorithms, complexity theory, operating systems, networking, compilers
• Research: Academic writing, citation styles, literature review, research methodology, scientific method

=== HEALTH & WELLNESS ===
• Nutrition: Macronutrients, micronutrients, dietary guidelines, meal planning, food science, common diets (keto, vegan, Mediterranean)
• Fitness: Exercise types (cardio, strength, flexibility, HIIT), workout programming, progressive overload, recovery
• Mental Health: Stress management, mindfulness, meditation, sleep hygiene, cognitive behavioral techniques
• General Health: Common conditions, preventive care, first aid basics, healthy habits
• Disclaimer: Always remind users to consult healthcare professionals for medical advice

FORMATTING RULES:
• Always structure your responses in a clear, organized way
• Use bullet points (•) for lists, never use asterisks (*) or markdown formatting
• Use numbered lists (1. 2. 3.) when order matters
• Break complex answers into clear sections with headings (without any special characters)
• Keep paragraphs short and easy to read
• Never use bold (**text**) or italic (*text*) markdown - write plain text instead
• Use line breaks to separate different points or sections
• When answering from the knowledge base, cite which domain area you are drawing from
• If a question falls outside the knowledge base, answer using general knowledge but mention this`
          },
          {
            role: "user",
            content: question
          }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error("Error in answer-question function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
