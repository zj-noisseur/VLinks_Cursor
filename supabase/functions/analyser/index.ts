import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { filePath, fileType, contentType } = await req.json()
    
    // 1. Setup Clients
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '')
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // 2. Download File from Supabase Storage
    // Note: Ensure bucket names match your React code ('audio_uploads', 'photos_upload', 'text_uploads')
    let bucketName = ''
    if (fileType === 'audio') bucketName = 'audio_uploads'
    else if (fileType === 'photo') bucketName = 'photos_upload'
    else if (fileType === 'text') bucketName = 'text_uploads'

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(filePath)

    if (downloadError) throw downloadError

    // 3. Convert Blob to Base64 for Gemini
    const arrayBuffer = await fileBlob.arrayBuffer()
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    let prompt = ""
    let resultJSON = { title: "", description: "", text_content: "" }

    // 4. Logic per File Type (Matched to your Python Prompts)
    if (fileType === 'audio') {
        prompt = `
        Role: Chief Content Logic Analyst. 
        Task: Transcribe and Analyze this audio.
        Output strictly valid JSON with no markdown formatting:
        {
            "title": "A concise title (max 10 words)",
            "description": "A short summary (max 30 words)",
            "text_content": "The full transcription of the audio, removing filler words."
        }`
    } else if (fileType === 'photo') {
        prompt = `
        Task: Analyze this image.
        Output strictly valid JSON with no markdown formatting:
        {
            "title": "A short, essence-capturing title",
            "description": "A warm, nostalgic description of the photo (approx 40 words) focusing on emotion.",
            "text_content": "" 
        }`
    } else if (fileType === 'text') {
        // For text, we decode the buffer to string first
        const textContent = new TextDecoder().decode(arrayBuffer)
        prompt = `
        Task: Analyze this text: "${textContent.substring(0, 10000)}..."
        Output strictly valid JSON with no markdown formatting:
        {
            "title": "A concise title",
            "description": "A short summary",
            "text_content": "A cleaned up version of the text"
        }`
    }

    // 5. Call Gemini
    const result = await model.generateContent([
      prompt,
      fileType !== 'text' ? {
        inlineData: {
          data: base64Data,
          mimeType: contentType
        }
      } : "" // Text is already in prompt
    ])

    const responseText = result.response.text()
    // Clean code fences if Gemini adds them
    const cleanJson = responseText.replace(/```json|```/g, '').trim()
    resultJSON = JSON.parse(cleanJson)

    return new Response(JSON.stringify(resultJSON), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})