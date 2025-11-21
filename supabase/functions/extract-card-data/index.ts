import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, backImageUrl, ocrText } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
      throw new Error("No API key configured (GEMINI_API_KEY or OPENAI_API_KEY)");
    }

    console.log('Extracting business card data from image:', imageUrl);
    if (backImageUrl) {
      console.log('Also processing back image:', backImageUrl);
    }
    if (ocrText) {
      console.log('OCR text provided, enhancing with AI');
    }

    // Build content array with images and optional OCR text
    const content: any[] = [];
    
    // Add OCR text if provided (from client-side Tesseract processing)
    if (ocrText) {
      content.push({
        type: "text",
        text: `OCR extracted text from the business card:\n\n${ocrText}\n\nPlease extract structured information from this OCR text. If the OCR text is incomplete or unclear, also analyze the images provided.`
      });
    } else {
      content.push({
        type: "text",
        text: "Extract all information from this business card image. Identify the person's full name, company, designation/title, email, phone number, website, and address if visible."
      });
    }
    
    // Add front image
    content.push({
      type: "image_url",
      image_url: {
        url: imageUrl
      }
    });
    
    // Add back image if provided
    if (backImageUrl) {
      content.push({
        type: "image_url",
        image_url: {
          url: backImageUrl
        }
      });
    }

    const apiKey = GEMINI_API_KEY || OPENAI_API_KEY;
    const apiUrl = GEMINI_API_KEY 
      ? "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision:generateContent"
      : "https://api.openai.com/v1/chat/completions";
    const model = GEMINI_API_KEY 
      ? "gemini-1.5-pro-vision"
      : "gpt-4o-mini";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: content
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_business_card",
              description: "Extract structured data from a business card",
              parameters: {
                type: "object",
                properties: {
                  full_name: { type: "string", description: "Full name of the person" },
                  company: { type: "string", description: "Company name" },
                  designation: { type: "string", description: "Job title or designation" },
                  email: { type: "string", description: "Email address" },
                  phone: { type: "string", description: "Phone number" },
                  website: { type: "string", description: "Website URL" },
                  address: { type: "string", description: "Physical address" }
                },
                required: [],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_business_card" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    console.log('Extracted data:', extractedData);

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
